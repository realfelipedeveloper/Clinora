import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { marked } from 'marked';

const specsRoot = new URL('../specs/', import.meta.url);
const index = readFileSync(new URL('README.md', specsRoot), 'utf8');
const roadmap = readFileSync(new URL('../docs/09-roadmap.md', import.meta.url), 'utf8');
const entries = [
  ['001', 'platform-foundation', 'APPROVED'],
  ['002', 'identity-tenancy', 'DRAFT'],
  ['003', 'clinical-catalog', 'DRAFT'],
  ['004', 'availability-timezone', 'DRAFT'],
  ['005', 'appointments-holds', 'DRAFT'],
  ['006', 'waiting-checkin', 'DRAFT'],
  ['007', 'fake-payments', 'DRAFT'],
  ['008', 'notifications', 'DRAFT'],
  ['009', 'saas-billing', 'DRAFT'],
  ['010', 'fake-integrations', 'DRAFT'],
  ['011', 'hardening-lgpd', 'DRAFT'],
];

function rows(markdown) {
  const table = marked.lexer(markdown).find((token) => token.type === 'table');
  assert.ok(table, 'Indice de specs sem tabela');
  return table.rows.map(([release, spec, theme, status]) => ({
    release: release.text,
    link: spec.tokens.find((token) => token.type === 'link'),
    theme: theme.text,
    status: status.text,
  }));
}

function indexIssues(markdown) {
  const indexed = rows(markdown);
  const issues = [];
  if (indexed.length !== entries.length) issues.push('Quantidade de releases divergente');
  for (const [index, [id, directory, status]] of entries.entries()) {
    const row = indexed[index];
    const path = `${id}-${directory}/spec.md`;
    if (row?.release !== String(Number(id) - 1)) issues.push(`Release ${id} ausente`);
    if (row?.link?.text !== `SPEC-${id}` || row?.link?.href !== path) {
      issues.push(`Link da SPEC-${id} incorreto`);
    }
    if (row?.status !== status) issues.push(`Status da SPEC-${id} incorreto`);
    if (!row?.theme) issues.push(`Tema da SPEC-${id} ausente`);
    if (!roadmap.includes(`Release ${Number(id) - 1}:`)) issues.push(`Roadmap sem Release ${id}`);
    if (!existsSync(new URL(path, specsRoot))) issues.push(`Arquivo da SPEC-${id} ausente`);
  }
  return issues;
}

test('indexa exatamente as releases do roadmap em arquivos existentes', () => {
  assert.deepEqual(indexIssues(index), []);
});

test('mantem somente a SPEC-001 aprovada e tarefas propostas inativas', () => {
  for (const [id, directory, status] of entries) {
    const spec = readFileSync(new URL(`${id}-${directory}/spec.md`, specsRoot), 'utf8');
    const tasks = readFileSync(new URL(`${id}-${directory}/tasks.md`, specsRoot), 'utf8');
    assert.match(spec, new RegExp(`^Status: ${status}`, 'm'));
    assert.match(spec, new RegExp(`^# SPEC-${id} `, 'm'));
    if (status === 'DRAFT') {
      assert.match(spec, /aprovação necessária antes de implementar/);
      assert.match(spec, new RegExp(`^Release: ${Number(id) - 1}\\.`, 'm'));
      assert.match(tasks, /^Status: DRAFT/m);
      assert.match(spec, /## Aceite e regressão obrigatória/);
    }
  }
});

test('detecta link adulterado e promoção prematura no índice', () => {
  const brokenLink = index.replace('002-identity-tenancy/spec.md', '002-missing/spec.md');
  assert.match(indexIssues(brokenLink).join(' '), /Link da SPEC-002 incorreto/);
  const premature = index.replace(
    '| Identidade e tenants | DRAFT |',
    '| Identidade e tenants | APPROVED |',
  );
  assert.match(indexIssues(premature).join(' '), /Status da SPEC-002 incorreto/);
});
