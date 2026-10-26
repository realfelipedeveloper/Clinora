import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const script = fileURLToPath(new URL('./clinora.mjs', import.meta.url));
const expected = 'https://github.com/realfelipedeveloper/Clinora.git';

function withRepository(run) {
  const dir = mkdtempSync(join(tmpdir(), 'clinora-remote-test-'));
  try {
    const init = spawnSync('git', ['init', '-q'], { cwd: dir, encoding: 'utf8' });
    assert.equal(init.status, 0, init.stderr);
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function git(dir, args) {
  const result = spawnSync('git', args, { cwd: dir, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}

function check(dir) {
  return spawnSync(process.execPath, [script, 'git:remote'], {
    cwd: dir,
    encoding: 'utf8',
  });
}

test('aceita somente o remote oficial para fetch e push', () => {
  withRepository((dir) => {
    git(dir, ['remote', 'add', 'origin', expected]);
    const result = check(dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Git remote OK/);
  });
});

test('aceita a URL oficial sem sufixo git usada pelo checkout do CI', () => {
  withRepository((dir) => {
    git(dir, ['remote', 'add', 'origin', 'https://github.com/realfelipedeveloper/Clinora']);
    const result = check(dir);
    assert.equal(result.status, 0, result.stderr);
  });
});

test('rejeita fetch para outro repositorio', () => {
  withRepository((dir) => {
    git(dir, ['remote', 'add', 'origin', 'https://github.com/outro/Clinora.git']);
    const result = check(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /origin must point only to/);
  });
});

test('rejeita push para outro repositorio mesmo com fetch correto', () => {
  withRepository((dir) => {
    git(dir, ['remote', 'add', 'origin', expected]);
    git(dir, ['remote', 'set-url', '--push', 'origin', 'https://github.com/outro/Clinora.git']);
    const result = check(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /origin must point only to/);
  });
});

test('rejeita repositorio sem origin', () => {
  withRepository((dir) => {
    const result = check(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Command failed: git/);
  });
});
