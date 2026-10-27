import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the Clinora identity in Portuguese', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Clinora');
    expect(compiled.querySelector('h1')?.classList.contains('text-ink')).toBe(true);
    expect(compiled.querySelector('main')?.textContent).toContain(
      'Mais clareza para organizar o cuidado',
    );
    expect(compiled.querySelector('.eyebrow')?.textContent).toContain('em desenvolvimento');
  });

  it('should connect the landing navigation to real sections', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    for (const id of ['visao', 'andamento']) {
      expect(compiled.querySelector(`#${id}`)).not.toBeNull();
      expect(compiled.querySelector(`nav a[href="#${id}"]`)).not.toBeNull();
    }
    expect(compiled.querySelector('.primary-link')?.getAttribute('href')).toBe('#visao');
  });

  it('should mark external project links safe for new tabs', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const projectLinks = compiled.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]');
    expect(projectLinks.length).toBe(2);
    for (const link of projectLinks) {
      expect(link.href).toBe('https://github.com/realfelipedeveloper/Clinora');
      expect(link.rel).toContain('noopener');
      expect(link.rel).toContain('noreferrer');
    }
  });
});
