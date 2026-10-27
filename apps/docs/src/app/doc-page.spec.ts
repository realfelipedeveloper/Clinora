import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { DocPage } from './doc-page';

describe('Leitura de documentos', () => {
  let params: Subject<ParamMap>;
  let http: HttpTestingController;

  beforeEach(async () => {
    params = new Subject<ParamMap>();
    await TestBed.configureTestingModule({
      imports: [DocPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: params.asObservable() } },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renderiza Markdown local e sanitiza HTML perigoso', () => {
    const fixture = TestBed.createComponent(DocPage);
    params.next(convertToParamMap({ slug: 'constituicao' }));
    http
      .expectOne('/content/01-project-constitution.md')
      .flush(
        '# Constituição\n\n**Texto seguro**\n\n<script>alert(1)</script>\n\n<a href="javascript:alert(1)" onclick="alert(1)">Link</a>',
      );
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toBe('Constituição');
    expect(root.querySelector('strong')?.textContent).toBe('Texto seguro');
    expect(root.querySelector('script')).toBeNull();
    expect(root.querySelector('a')?.getAttribute('href')).not.toMatch(/^javascript:/);
    expect(root.querySelector('a')?.hasAttribute('onclick')).toBe(false);
  });

  it('recusa slug desconhecido sem fazer requisição', () => {
    const fixture = TestBed.createComponent(DocPage);
    params.next(convertToParamMap({ slug: '../AGENTS.md' }));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('não está no catálogo');
    http.expectNone(() => true);
  });

  it('mostra falha de leitura sem expor detalhes de rede', () => {
    const fixture = TestBed.createComponent(DocPage);
    params.next(convertToParamMap({ slug: 'arquitetura' }));
    http.expectOne('/content/03-system-architecture.md').flush('erro interno', {
      status: 500,
      statusText: 'Falha',
    });
    fixture.detectChanges();
    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Não foi possível carregar');
    expect(alert?.textContent).not.toContain('erro interno');
  });

  it('cancela a leitura anterior ao trocar de página rapidamente', () => {
    const fixture = TestBed.createComponent(DocPage);
    params.next(convertToParamMap({ slug: 'constituicao' }));
    const first = http.expectOne('/content/01-project-constitution.md');
    params.next(convertToParamMap({ slug: 'arquitetura' }));
    expect(first.cancelled).toBe(true);
    http.expectOne('/content/03-system-architecture.md').flush('# Arquitetura atual');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toBe(
      'Arquitetura atual',
    );
  });
});
