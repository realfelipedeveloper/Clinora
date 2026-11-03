import { Injectable, InjectionToken, inject } from '@angular/core';
import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';

interface PublicIdentityConfig {
  oidcIssuer: string;
  apiOrigin: string;
}

declare global {
  interface Window {
    CLINORA_PUBLIC_CONFIG?: PublicIdentityConfig;
  }
}

function publicConfig(): PublicIdentityConfig {
  const config = window.CLINORA_PUBLIC_CONFIG;
  if (!config) {
    throw new Error('Configuracao publica de identidade ausente');
  }
  for (const value of [config.oidcIssuer, config.apiOrigin]) {
    const url = new URL(value);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === '127.0.0.1')) {
      throw new Error('Origem de identidade insegura');
    }
    if (url.username || url.password || url.search || url.hash) {
      throw new Error('Configuracao publica de identidade invalida');
    }
  }
  if (new URL(config.apiOrigin).origin !== config.apiOrigin) {
    throw new Error('Origem da API invalida');
  }
  return config;
}

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  role: 'OWNER' | 'ADMIN' | 'RECEPTION' | 'PROFESSIONAL' | 'PATIENT';
  unitIds: string[];
}

export class IdentityRequestError extends Error {
  constructor(readonly status: number) {
    super('Nao foi possivel validar o contexto.');
  }
}

export const OIDC_MANAGER = new InjectionToken<UserManager>('Clinora OIDC manager', {
  providedIn: 'root',
  factory: () => new UserManager({
    authority: publicConfig().oidcIssuer,
    client_id: 'clinora-web',
    redirect_uri: `${window.location.origin}/auth/callback`,
    post_logout_redirect_uri: `${window.location.origin}/auth/logout`,
    response_type: 'code',
    scope: 'openid profile clinora',
    loadUserInfo: false,
    automaticSilentRenew: false,
    monitorSession: false,
    revokeTokensOnSignout: true,
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  }),
});

@Injectable({ providedIn: 'root' })
export class IdentitySession {
  private readonly api = publicConfig().apiOrigin;
  private readonly manager = inject(OIDC_MANAGER);

  async user(): Promise<User | null> {
    const user = await this.manager.getUser();
    if (user?.expired) {
      await this.manager.removeUser();
      return null;
    }
    return user;
  }

  login(): Promise<void> {
    return this.manager.signinRedirect();
  }

  stepUp(): Promise<void> {
    return this.manager.signinRedirect({ acr_values: '2', prompt: 'login' });
  }

  completeLogin(): Promise<User> {
    return this.manager.signinRedirectCallback();
  }

  logout(): Promise<void> {
    return this.manager.signoutRedirect();
  }

  async completeLogout(): Promise<void> {
    await this.manager.signoutRedirectCallback();
    await this.manager.removeUser();
  }

  async contexts(): Promise<TenantContext[]> {
    const response = await this.request('/api/v1/identity/contexts');
    const body: unknown = await response.json();
    if (!Array.isArray(body) || !body.every(isTenantContext)) {
      throw new IdentityRequestError(502);
    }
    return body;
  }

  async select(tenantId: string): Promise<TenantContext> {
    const response = await this.request('/api/v1/identity/context', tenantId);
    const body: unknown = await response.json();
    if (!isTenantContext(body) || body.tenantId !== tenantId) {
      throw new IdentityRequestError(502);
    }
    return body;
  }

  private async request(path: string, tenantId?: string): Promise<Response> {
    const user = await this.user();
    if (!user) {
      throw new IdentityRequestError(401);
    }
    const headers: Record<string, string> = { Authorization: `Bearer ${user.access_token}` };
    if (tenantId) {
      headers['X-Clinora-Tenant'] = tenantId;
    }
    const response = await fetch(`${this.api}${path}`, {
      headers,
      cache: 'no-store',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new IdentityRequestError(response.status);
    }
    return response;
  }
}

function isTenantContext(value: unknown): value is TenantContext {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const context = value as Record<string, unknown>;
  return typeof context['tenantId'] === 'string' &&
    typeof context['tenantName'] === 'string' &&
    ['OWNER', 'ADMIN', 'RECEPTION', 'PROFESSIONAL', 'PATIENT'].includes(String(context['role'])) &&
    Array.isArray(context['unitIds']) && context['unitIds'].every((unit) => typeof unit === 'string');
}
