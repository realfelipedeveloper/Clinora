import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { AuthPortal, PORTAL_NAVIGATION } from './auth-portal';
import { IdentityRequestError, IdentitySession } from './identity-session';

describe('Area autenticada', () => {
  const context = {
    tenantId: 'f14e1824-8a39-43d1-b7f4-43f4ff4a8252',
    tenantName: 'Clinica Central',
    role: 'RECEPTION' as const,
    unitIds: [],
  };
  const identity = {
    user: vi.fn(), contexts: vi.fn(), select: vi.fn(),
    login: vi.fn(), stepUp: vi.fn(), logout: vi.fn(),
    completeLogin: vi.fn(), completeLogout: vi.fn(),
  };
  const navigation = { path: '/app', replace: vi.fn(), cleanCallback: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    navigation.path = '/app';
    identity.user.mockResolvedValue({ profile: { preferred_username: 'Pessoa' } });
    identity.contexts.mockResolvedValue([context]);
    identity.select.mockResolvedValue(context);
    identity.login.mockResolvedValue(undefined);
    identity.stepUp.mockResolvedValue(undefined);
    identity.logout.mockResolvedValue(undefined);
    identity.completeLogin.mockResolvedValue(undefined);
    identity.completeLogout.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: IdentitySession, useValue: identity },
        { provide: PORTAL_NAVIGATION, useValue: navigation },
      ],
    });
  });

  function portal(): AuthPortal {
    return TestBed.runInInjectionContext(() => new AuthPortal());
  }

  it('oferece entrada quando nao existe sessao', async () => {
    identity.user.mockResolvedValue(null);
    const component = portal();

    await component.ngOnInit();
    expect(component.phase()).toBe('signed-out');
    await component.login();
    expect(identity.login).toHaveBeenCalledOnce();
    expect(component.busy()).toBe(true);
  });

  it('nao depende de nome opcional no perfil OIDC', async () => {
    identity.user.mockResolvedValue({ profile: {} });
    const component = portal();

    await component.ngOnInit();
    expect(component.person()).toBe('Conta conectada');
    expect(component.phase()).toBe('contexts');
  });

  it('finaliza callback de login e de logout sem expor token na URL local', async () => {
    navigation.path = '/auth/callback';
    await portal().ngOnInit();
    expect(identity.completeLogin).toHaveBeenCalledOnce();
    expect(navigation.replace).toHaveBeenCalledWith('/app');

    navigation.path = '/auth/logout';
    await portal().ngOnInit();
    expect(identity.completeLogout).toHaveBeenCalledOnce();
    expect(navigation.replace).toHaveBeenCalledTimes(2);
  });

  it('remove parametros do callback quando o IdP falha', async () => {
    navigation.path = '/auth/callback';
    identity.completeLogin.mockRejectedValue(new Error('codigo sensivel'));
    const component = portal();

    await component.ngOnInit();
    expect(navigation.cleanCallback).toHaveBeenCalledOnce();
    expect(component.phase()).toBe('error');
    expect(component.notice()).not.toContain('codigo sensivel');
  });

  it('lista, valida, troca contexto e solicita verificacao adicional', async () => {
    const component = portal();
    await component.ngOnInit();
    expect(component.phase()).toBe('contexts');
    expect(component.person()).toBe('Pessoa');
    expect(component.contexts()).toEqual([context]);

    await component.select(context);
    expect(identity.select).toHaveBeenCalledWith(context.tenantId);
    expect(component.selected()).toEqual(context);
    expect(component.phase()).toBe('selected');
    expect(component.busy()).toBe(false);

    component.back();
    expect(component.selected()).toBeNull();
    expect(component.phase()).toBe('contexts');
    await component.stepUp();
    expect(identity.stepUp).toHaveBeenCalledOnce();
    await component.logout();
    expect(identity.logout).toHaveBeenCalledOnce();
  });

  it('refaz consulta apos negativa e nao conserva contexto antigo', async () => {
    identity.select.mockRejectedValue(new IdentityRequestError(403));
    identity.contexts.mockResolvedValueOnce([context]).mockResolvedValueOnce([]);
    const component = portal();
    await component.ngOnInit();

    await component.select(context);
    expect(component.phase()).toBe('contexts');
    expect(component.contexts()).toEqual([]);
    expect(component.selected()).toBeNull();
    expect(component.notice()).toContain('Acesso negado');
  });

  it('expira sessao e falha fechada em erro de rede', async () => {
    const component = portal();
    await component.ngOnInit();
    identity.select.mockRejectedValueOnce(new IdentityRequestError(401));

    await component.select(context);
    expect(component.phase()).toBe('signed-out');
    expect(component.contexts()).toEqual([]);
    expect(component.notice()).toContain('expirou');

    identity.select.mockRejectedValueOnce(new IdentityRequestError(503));
    await component.select(context);
    expect(component.selected()).toBeNull();
    expect(component.notice()).toContain('validar');
  });

  it('mostra erro recuperavel na consulta inicial e na atualizacao', async () => {
    identity.contexts.mockRejectedValue(new Error('sem banco'));
    const component = portal();
    await component.ngOnInit();
    expect(component.phase()).toBe('error');

    await component.reload();
    expect(component.phase()).toBe('error');
    expect(component.notice()).toContain('consultar');
  });

  it('trata falha do provedor sem registrar segredo', async () => {
    identity.login.mockRejectedValue(new Error('segredo-nao-exibir'));
    const component = portal();
    await component.login();
    expect(component.notice()).toContain('Não foi possível conectar');
    expect(component.notice()).not.toContain('segredo');
    expect(component.busy()).toBe(false);
  });
});
