import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { marked } from 'marked';
import { catchError, map, of, switchMap } from 'rxjs';
import { DocumentEntry, findDocument } from './documents';

type PageState =
  | { kind: 'idle' | 'missing' }
  | { kind: 'loading' | 'error'; document: DocumentEntry }
  | { kind: 'ready'; document: DocumentEntry; html: string };

@Component({
  selector: 'app-doc-page',
  imports: [RouterLink],
  template: `
    @if (state().kind === 'ready') {
      <div class="document-meta">{{ currentTitle() }}</div>
      <article class="document" [innerHTML]="currentHtml()"></article>
    } @else if (state().kind === 'missing') {
      <div class="document-message">
        <p class="document-meta">Documento não encontrado</p>
        <h1>Esta página não está no catálogo.</h1>
        <a routerLink="/constituicao">Voltar à documentação</a>
      </div>
    } @else if (state().kind === 'error') {
      <div class="document-message" role="alert">
        <p class="document-meta">Falha de leitura</p>
        <h1>Não foi possível carregar o documento.</h1>
        <p>Tente novamente mais tarde.</p>
      </div>
    } @else {
      <p class="document-loading" role="status">Carregando documento...</p>
    }
  `,
})
export class DocPage {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  protected readonly state = signal<PageState>({ kind: 'idle' });

  protected currentTitle(): string {
    const state = this.state();
    return state.kind === 'ready' ? state.document.group : '';
  }

  protected currentHtml(): string {
    const state = this.state();
    return state.kind === 'ready' ? state.html : '';
  }

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const document = findDocument(params.get('slug') ?? '');
          if (!document) return of({ kind: 'missing' } as PageState);
          this.state.set({ kind: 'loading', document });
          return this.http.get(document.url, { responseType: 'text' }).pipe(
            map((markdown): PageState => ({
              kind: 'ready',
              document,
              html: marked.parse(markdown, { async: false }),
            })),
            catchError(() => of({ kind: 'error', document } as PageState)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.state.set(state));
  }
}
