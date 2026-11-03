import { TestBed } from '@angular/core/testing';
import { User, UserManager } from 'oidc-client-ts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IdentityRequestError, IdentitySession, OIDC_MANAGER } from './identity-session';

describe('Sessao de identidade', () => {
  const tenant = 'f14e1824-8a39-43d1-b7f4-43f4ff4a8252';
  const context = { tenantId: tenant, tenantName: 'Clinica Central', role: 'RECEPTION', unitIds: [] };
  const token = 'token-de-teste-nao-registrar';
  const manager = {
    getUser: vi.fn(),
    removeUser: vi.fn(),
    signinRedirect: vi.fn(),
    signinRedirectCallback: vi.fn(),
    signoutRedirect: vi.fn(),
    signoutRedirectCallback: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.CLINORA_PUBLIC_CONFIG = {
      oidcIssuer: 'http://127.0.0.1:44282/realms/clinora',
      apiOrigin: 'http://127.0.0.1:44220',
    };
    manager.getUser.mockResolvedValue({ expired: false, access_token: token } as User);
    manager.removeUser.mockResolvedValue(undefined);
    manager.signinRedirect.mockResolvedValue(undefined);
    manager.signoutRedirect.mockResolvedValue(undefined);
    manager.signoutRedirectCallback.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [{ provide: OIDC_MANAGER, useValue: manager as unknown as UserManager }],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.CLINORA_PUBLIC_CONFIG;
  });

  it('falha fechada sem configuracao publica', () => {
    delete window.CLINORA_PUBLIC_CONFIG;
    expect(() => TestBed.inject(IdentitySession)).toThrow('Configuracao publica');
  });

  it('falha fechada com origem HTTP externa', () => {
    window.CLINORA_PUBLIC_CONFIG = {
      oidcIssuer: 'http://example.test/realms/clinora',
      apiOrigin: 'http://127.0.0.1:44220',
    };
    expect(() => TestBed.inject(IdentitySession)).toThrow('insegura');
  });

  it('remove sessao expirada antes de consultar a API', async () => {
    manager.getUser.mockResolvedValue({ expired: true, access_token: token } as User);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const service = TestBed.inject(IdentitySession);

    await expect(service.contexts()).rejects.toMatchObject({ status: 401 });
    expect(manager.removeUser).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('consulta vinculos sem cache, cookies ou dados sensiveis na URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([context]), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const contexts = await TestBed.inject(IdentitySession).contexts();

    expect(contexts).toEqual([context]);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:44220/api/v1/identity/contexts',
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', credentials: 'omit' },
    );
  });

  it('envia tenant selecionado por cabecalho e rejeita resposta de outro tenant', async () => {
    const fetchMock = vi.fn().mockImplementation(async () =>
      new Response(JSON.stringify(context), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const service = TestBed.inject(IdentitySession);

    expect(await service.select(tenant)).toEqual(context);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:44220/api/v1/identity/context',
      { headers: { Authorization: `Bearer ${token}`, 'X-Clinora-Tenant': tenant },
        cache: 'no-store', credentials: 'omit' },
    );
    await expect(service.select('af893b4c-9ddd-4096-a2bf-ff686df5de18'))
      .rejects.toMatchObject({ status: 502 });
  });

  it('falha fechada em resposta invalida ou acesso negado', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ tenantId: tenant, role: 'ROOT' }]), { status: 200 }))
      .mockResolvedValueOnce(new Response('', { status: 403 }));
    vi.stubGlobal('fetch', fetchMock);
    const service = TestBed.inject(IdentitySession);

    await expect(service.contexts()).rejects.toBeInstanceOf(IdentityRequestError);
    await expect(service.select(tenant)).rejects.toMatchObject({ status: 403 });
  });

  it('solicita nivel de autenticacao 2 e limpa a sessao no callback de logout', async () => {
    const service = TestBed.inject(IdentitySession);

    await service.stepUp();
    expect(manager.signinRedirect).toHaveBeenCalledWith({ acr_values: '2', prompt: 'login' });
    await service.completeLogout();
    expect(manager.signoutRedirectCallback).toHaveBeenCalledOnce();
    expect(manager.removeUser).toHaveBeenCalledOnce();
  });
});
