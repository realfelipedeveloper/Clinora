export type DocumentGroup = 'Fundamentos' | 'Operação' | 'Implementação' | 'Especificações';

export interface DocumentEntry {
  slug: string;
  title: string;
  group: DocumentGroup;
  url: string;
}

export const documentGroups: DocumentGroup[] = [
  'Fundamentos',
  'Operação',
  'Implementação',
  'Especificações',
];

export const documents: DocumentEntry[] = [
  {
    slug: 'constituicao',
    title: 'Constituição',
    group: 'Fundamentos',
    url: '/content/01-project-constitution.md',
  },
  {
    slug: 'agentes',
    title: 'Agentes e skills',
    group: 'Fundamentos',
    url: '/content/02-agents-and-skills.md',
  },
  {
    slug: 'arquitetura',
    title: 'Arquitetura do sistema',
    group: 'Fundamentos',
    url: '/content/03-system-architecture.md',
  },
  {
    slug: 'agendamento',
    title: 'Domínio de agendamento',
    group: 'Fundamentos',
    url: '/content/04-scheduling-domain.md',
  },
  {
    slug: 'privacidade',
    title: 'Privacidade e segurança',
    group: 'Fundamentos',
    url: '/content/05-data-privacy-security.md',
  },
  {
    slug: 'ciclo',
    title: 'Ciclo de engenharia',
    group: 'Fundamentos',
    url: '/content/06-engineering-loop.md',
  },
  {
    slug: 'qualidade',
    title: 'Qualidade e segurança',
    group: 'Operação',
    url: '/content/07-quality-security-gates.md',
  },
  { slug: 'mcp', title: 'Catálogo MCP', group: 'Operação', url: '/content/08-mcp-catalog.md' },
  { slug: 'roadmap', title: 'Roadmap', group: 'Operação', url: '/content/09-roadmap.md' },
  {
    slug: 'configuracao',
    title: 'Configuração padrão',
    group: 'Operação',
    url: '/content/10-default-config.md',
  },
  {
    slug: 'desenvolvimento-local',
    title: 'Desenvolvimento local',
    group: 'Operação',
    url: '/content/11-local-development.md',
  },
  { slug: 'git-flow', title: 'Git Flow', group: 'Operação', url: '/content/12-git-flow.md' },
  { slug: 'java', title: 'Build Java', group: 'Implementação', url: '/content/13-java-build.md' },
  {
    slug: 'frontend',
    title: 'Workspace frontend',
    group: 'Implementação',
    url: '/content/14-frontend-workspace.md',
  },
  {
    slug: 'scripts',
    title: 'Scripts globais',
    group: 'Implementação',
    url: '/content/15-global-scripts.md',
  },
  {
    slug: 'observabilidade',
    title: 'Observabilidade',
    group: 'Implementação',
    url: '/content/16-observability.md',
  },
  {
    slug: 'regressao',
    title: 'Testes de regressão',
    group: 'Implementação',
    url: '/content/17-regression-tests.md',
  },
  {
    slug: 'spec-001',
    title: 'SPEC-001: fundação',
    group: 'Especificações',
    url: '/specs/001-platform-foundation/spec.md',
  },
];

export function findDocument(slug: string): DocumentEntry | undefined {
  return documents.find((document) => document.slug === slug);
}

export function filterDocuments(query: string): DocumentEntry[] {
  const normalized = normalize(query.trim());
  if (!normalized) return documents;
  return documents.filter((document) =>
    normalize(`${document.title} ${document.group}`).includes(normalized),
  );
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}
