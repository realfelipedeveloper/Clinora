import { Component, InjectionToken, OnInit, inject, signal } from '@angular/core';
import { IdentityRequestError, IdentitySession, TenantContext } from './identity-session';

type Phase = 'loading' | 'signed-out' | 'contexts' | 'selected' | 'error';

export const PORTAL_NAVIGATION = new InjectionToken<{
  path: string;
  replace: (url: string) => void;
  cleanCallback: () => void;
}>(
  'Navegacao de identidade', {
    providedIn: 'root',
    factory: () => ({
      get path() { return window.location.pathname; },
      replace: (url: string) => window.location.replace(url),
      cleanCallback: () => window.history.replaceState({}, '', '/app'),
    }),
  },
);

@Component({
  selector: 'app-auth-portal',
  templateUrl: './auth-portal.html',
  styleUrl: './auth-portal.css',
})
export class AuthPortal implements OnInit {
  private readonly identity = inject(IdentitySession);
  private readonly navigation = inject(PORTAL_NAVIGATION);

  readonly phase = signal<Phase>('loading');
  readonly contexts = signal<TenantContext[]>([]);
  readonly selected = signal<TenantContext | null>(null);
  readonly notice = signal('');
  readonly person = signal('');
  readonly busy = signal(false);

  readonly roleName: Record<TenantContext['role'], string> = {
    OWNER: 'Proprietário',
    ADMIN: 'Administrador',
    RECEPTION: 'Recepção',
    PROFESSIONAL: 'Profissional',
    PATIENT: 'Paciente',
  };

  async ngOnInit(): Promise<void> {
    try {
      if (this.navigation.path === '/auth/callback') {
        await this.identity.completeLogin();
        this.navigation.replace('/app');
        return;
      }
      if (this.navigation.path === '/auth/logout') {
        await this.identity.completeLogout();
        this.navigation.replace('/app');
        return;
      }
      const user = await this.identity.user();
      if (!user) {
        this.phase.set('signed-out');
        return;
      }
      this.person.set(String(user.profile['preferred_username'] ?? user.profile.name ?? 'Conta conectada'));
      await this.loadContexts();
    } catch {
      if (this.navigation.path.startsWith('/auth/')) {
        this.navigation.cleanCallback();
      }
      this.notice.set('Não foi possível concluir a autenticação. Tente novamente.');
      this.phase.set('error');
    }
  }

  async login(): Promise<void> {
    await this.redirect(() => this.identity.login());
  }

  async stepUp(): Promise<void> {
    await this.redirect(() => this.identity.stepUp());
  }

  async logout(): Promise<void> {
    await this.redirect(() => this.identity.logout());
  }

  async reload(): Promise<void> {
    this.notice.set('');
    this.phase.set('loading');
    try {
      await this.loadContexts();
    } catch {
      this.notice.set('Não foi possível consultar os contextos agora.');
      this.phase.set('error');
    }
  }

  async select(context: TenantContext): Promise<void> {
    this.notice.set('');
    this.busy.set(true);
    try {
      this.selected.set(await this.identity.select(context.tenantId));
      this.phase.set('selected');
    } catch (error) {
      if (error instanceof IdentityRequestError && error.status === 401) {
        this.contexts.set([]);
        this.selected.set(null);
        this.phase.set('signed-out');
        this.notice.set('Sua sessão expirou. Entre novamente.');
      } else if (error instanceof IdentityRequestError && error.status === 403) {
        this.notice.set('Acesso negado. O vínculo pode ter mudado ou exigir verificação adicional.');
        await this.loadContexts();
      } else {
        this.notice.set('Não foi possível validar o contexto agora.');
      }
    } finally {
      this.busy.set(false);
    }
  }

  back(): void {
    this.selected.set(null);
    this.phase.set('contexts');
  }

  private async loadContexts(): Promise<void> {
    this.contexts.set(await this.identity.contexts());
    this.phase.set('contexts');
  }

  private async redirect(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.notice.set('');
    try {
      await action();
    } catch {
      this.notice.set('Não foi possível conectar ao provedor de identidade.');
      this.busy.set(false);
    }
  }
}
