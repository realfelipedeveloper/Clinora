import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { marked } from 'marked';

const specsRoot = new URL('../specs/', import.meta.url);
const index = readFileSync(new URL('README.md', specsRoot), 'utf8');
const roadmap = readFileSync(new URL('../docs/09-roadmap.md', import.meta.url), 'utf8');

test('emenda aprovada da SPEC-001 usa Garage local em vez de MinIO arquivado', () => {
  const spec = readFileSync(new URL('./001-platform-foundation/spec.md', specsRoot), 'utf8');
  const tasks = readFileSync(new URL('./001-platform-foundation/tasks.md', specsRoot), 'utf8');
  assert.match(spec, /Garage/);
  assert.match(spec, /CLINORA_GARAGE_S3_PORT=44270/);
  assert.match(spec, /CLINORA_GARAGE_ADMIN_PORT=44271/);
  assert.match(tasks, /TASK-024 Garage/);
  assert.doesNotMatch(spec.split('## Escopo')[1].split('## Apps')[0], /MinIO/);
  assert.doesNotMatch(spec, /CLINORA_MINIO/);
  assert.doesNotMatch(tasks, /MinIO/);
});
const entries = [
  ['001', 'platform-foundation', 'APPROVED'],
  ['002', 'identity-tenancy', 'APPROVED'],
  ['003', 'clinical-catalog', 'APPROVED'],
  ['004', 'availability-timezone', 'APPROVED'],
  ['005', 'appointments-holds', 'APPROVED'],
  ['006', 'waiting-checkin', 'APPROVED'],
  ['007', 'fake-payments', 'APPROVED'],
  ['008', 'notifications', 'APPROVED'],
  ['009', 'saas-billing', 'APPROVED'],
  ['010', 'fake-integrations', 'APPROVED'],
  ['011', 'hardening-lgpd', 'APPROVED'],
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

test('mantem specs aprovadas e somente a SPEC-001 ativa ate concluir a fundacao', () => {
  const active = JSON.parse(readFileSync(new URL('../.agents/active-feature.json', import.meta.url)));
  assert.equal(active.id, 'SPEC-001');
  for (const [id, directory, status] of entries) {
    const spec = readFileSync(new URL(`${id}-${directory}/spec.md`, specsRoot), 'utf8');
    const tasks = readFileSync(new URL(`${id}-${directory}/tasks.md`, specsRoot), 'utf8');
    assert.match(spec, new RegExp(`^Status: ${status}`, 'm'));
    assert.match(spec, new RegExp(`^# SPEC-${id} `, 'm'));
    if (id !== '001') {
      assert.match(spec, new RegExp(`^Release: ${Number(id) - 1}\\.`, 'm'));
      assert.match(tasks, /^Status: APPROVED/m);
      assert.match(spec, /## Aceite e regressão obrigatória/);
    }
  }
});

test('detecta link adulterado e status divergente no índice', () => {
  const brokenLink = index.replace('002-identity-tenancy/spec.md', '002-missing/spec.md');
  assert.match(indexIssues(brokenLink).join(' '), /Link da SPEC-002 incorreto/);
  const divergent = index.replace(
    '| Identidade e tenants | APPROVED |',
    '| Identidade e tenants | DRAFT |',
  );
  assert.match(indexIssues(divergent).join(' '), /Status da SPEC-002 incorreto/);
});
