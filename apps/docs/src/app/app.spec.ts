import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('Portal de documentação', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('mostra a identidade Clinora e a navegação de documentos', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.brand')?.textContent).toContain('Clinora');
    expect(root.querySelectorAll('nav a')).toHaveLength(18);
    expect(root.querySelector('a[target="_blank"]')?.getAttribute('rel')).toContain('noopener');
  });

  it('filtra a navegação e informa quando não há resultados', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const search = root.querySelector<HTMLInputElement>('#busca-documentos')!;
    search.value = 'privacidade';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(root.querySelectorAll('nav a')).toHaveLength(1);
    expect(root.querySelector('nav a')?.textContent).toContain('Privacidade');
    search.value = 'sem resultado';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(root.querySelector('.empty-search')?.textContent).toContain('Nenhum documento');
  });
});
