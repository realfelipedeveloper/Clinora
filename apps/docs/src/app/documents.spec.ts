import { documents, filterDocuments, findDocument } from './documents';

describe('Catálogo de documentos', () => {
  it('inclui os guias e a spec aprovada sem URLs externas', () => {
    expect(documents).toHaveLength(18);
    expect(documents.every((document) => document.url.startsWith('/'))).toBe(true);
    expect(documents.some((document) => document.slug === 'spec-001')).toBe(true);
  });

  it('busca títulos sem depender de acentos ou caixa', () => {
    expect(filterDocuments('PRIVACIDADE').map((document) => document.slug)).toEqual([
      'privacidade',
    ]);
    expect(filterDocuments('  configuracao  ').map((document) => document.slug)).toEqual([
      'configuracao',
    ]);
    expect(filterDocuments('nada parecido')).toEqual([]);
  });

  it('aceita apenas slugs catalogados para impedir leitura de caminho arbitrário', () => {
    expect(findDocument('arquitetura')?.url).toBe('/content/03-system-architecture.md');
    expect(findDocument('../AGENTS.md')).toBeUndefined();
    expect(findDocument('https://example.com')).toBeUndefined();
  });
});
