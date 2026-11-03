import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { marked } from 'marked';

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

function missingSections(markdown, required) {
  const sections = new Set(
    marked
      .lexer(markdown)
      .filter((token) => token.type === 'heading' && token.depth === 2)
      .map((token) => token.text),
  );
  return required.filter((section) => !sections.has(section));
}

test('template ADR exige decisao, alternativas e riscos de privacidade', () => {
  const template = read('templates/adr.md');
  const required = [
    'Contexto',
    'Decisão',
    'Alternativas',
    'Consequências',
    'Segurança e privacidade',
    'Riscos',
    'Referências',
  ];
  assert.deepEqual(missingSections(template, required), []);
  assert.match(template, /^Status: Proposed \| Accepted \| Superseded \| Rejected$/m);
  assert.deepEqual(missingSections(template.replace('## Segurança e privacidade', ''), required), [
    'Segurança e privacidade',
  ]);
});

test('memoria persistente e modelo de relatorio permanecem disponiveis', () => {
  for (const path of [
    '.agents/constraints.md',
    '.agents/known-regressions.md',
    '.agents/lessons-learned.md',
    '.agents/active-feature.json',
    '.agents/completion-reports/SPEC-001-TASK-034.md',
  ]) {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `${path} ausente`);
    assert.ok(read(path).trim(), `${path} vazio`);
  }

  const required = [
    'Tarefa',
    'Objetivo',
    'Arquivos alterados',
    'Decisões',
    'Testes',
    'Segurança e privacidade',
    'Riscos residuais',
    'Rollback',
    'Documentação e memória',
    'Status final',
  ];
  assert.deepEqual(missingSections(read('templates/completion-report.md'), required), []);
});

test('catalogo de portas acompanha a SPEC-001 sem colisao', () => {
  const runbook = read('docs/11-local-development.md');
  const spec = read('specs/001-platform-foundation/spec.md');
  const table = marked
    .lexer(runbook)
    .find((token) => token.type === 'table' && token.header[0].text === 'Servico');
  assert.ok(table, 'catalogo de portas ausente');

  const listed = table.rows.map((row) => Number(row[1].text));
  const specified = [...spec.matchAll(/^CLINORA_[A-Z0-9_]+_PORT=(\d+)$/gm)].map((match) =>
    Number(match[1]),
  );
  assert.equal(new Set(listed).size, listed.length, 'portas duplicadas no runbook');
  assert.deepEqual(
    listed.sort((a, b) => a - b),
    specified.sort((a, b) => a - b),
  );
  assert.match(runbook, /corepack pnpm run ports:check/);
  assert.match(runbook, /docker compose up -d --wait/);
});
