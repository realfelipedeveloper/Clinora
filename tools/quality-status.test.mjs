import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { loadQualityRun, publishQualityStatus } from './quality-status.mjs';

const repository = 'realfelipedeveloper/Clinora';
const sha = 'a'.repeat(40);

test('workflow manual nao depende do payload workflow_run', () => {
  const workflow = readFileSync('.github/workflows/quality-status.yml', 'utf8');
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /quality_run_id:/);
  assert.doesNotMatch(workflow, /github\.event\.workflow_run/);
});

function run(overrides = {}) {
  return {
    event: 'pull_request',
    conclusion: 'success',
    head_branch: 'feature/spec-001-task-036',
    head_sha: sha,
    head_repository: { full_name: repository },
    repository: { full_name: repository },
    html_url: 'https://github.com/realfelipedeveloper/Clinora/actions/runs/123',
    ...overrides,
  };
}

function pull(overrides = {}) {
  return {
    number: 123,
    head: {
      ref: 'feature/spec-001-task-036',
      sha,
      repo: { full_name: repository },
    },
    base: { ref: 'development' },
    ...overrides,
  };
}

function requestWith(pulls) {
  const calls = [];
  async function request(url, options = {}) {
    calls.push({ url: String(url), options });
    if (options.method === 'POST') {
      return { ok: true, status: 201 };
    }
    return { ok: true, status: 200, json: async () => pulls };
  }
  return { request, calls };
}

const options = { repository, token: 'token-de-teste' };

test('publica sucesso para PR aberto no mesmo SHA', async () => {
  const { request, calls } = requestWith([pull()]);
  const result = await publishQualityStatus(run(), { ...options, request });
  assert.equal(result, 'published');
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /head=realfelipedeveloper%3Afeature%2Fspec-001-task-036/);
  assert.equal(calls[1].url, `https://api.github.com/repos/${repository}/statuses/${sha}`);
  assert.deepEqual(JSON.parse(calls[1].options.body), {
    state: 'success',
    context: 'clinora/qualidade',
    description: 'Regressao automatizada aprovada',
    target_url: run().html_url,
  });
});

test('publica falha quando o gate falha', async () => {
  const { request, calls } = requestWith([pull()]);
  await publishQualityStatus(run({ conclusion: 'failure' }), { ...options, request });
  assert.equal(JSON.parse(calls[1].options.body).state, 'failure');
});

test('nao aprova commit novo com resultado de SHA antigo', async () => {
  const stale = pull({ head: { ...pull().head, sha: 'b'.repeat(40) } });
  const { request, calls } = requestWith([stale]);
  const result = await publishQualityStatus(run(), { ...options, request });
  assert.equal(result, 'ignored');
  assert.equal(calls.length, 1);
});

test('ignora run sem aprovacao de PR automatico', async () => {
  const { request, calls } = requestWith([pull()]);
  const result = await publishQualityStatus(run({ conclusion: 'action_required' }), {
    ...options,
    request,
  });
  assert.equal(result, 'ignored');
  assert.equal(calls.length, 0);
});

test('publica dispatch apenas para branch de promocao', async () => {
  const promotion = 'promotion/development-para-homologation';
  const promotionPull = pull({
    head: { ...pull().head, ref: promotion },
    base: { ref: 'homologation' },
  });
  const { request, calls } = requestWith([promotionPull]);
  const result = await publishQualityStatus(
    run({ event: 'workflow_dispatch', head_branch: promotion }),
    { ...options, request },
  );
  assert.equal(result, 'published');
  assert.equal(calls.length, 2);
});

test('ignora dispatch fora de promocao', async () => {
  const { request, calls } = requestWith([pull()]);
  const result = await publishQualityStatus(run({ event: 'workflow_dispatch' }), {
    ...options,
    request,
  });
  assert.equal(result, 'ignored');
  assert.equal(calls.length, 0);
});

test('ignora fork e PR de outro repositorio', async () => {
  const { request, calls } = requestWith([pull()]);
  const result = await publishQualityStatus(
    run({ head_repository: { full_name: 'outro/Clinora' } }),
    { ...options, request },
  );
  assert.equal(result, 'ignored');
  assert.equal(calls.length, 0);
});

test('ignora PR com repositorio de origem divergente', async () => {
  const external = pull({ head: { ...pull().head, repo: { full_name: 'outro/Clinora' } } });
  const { request, calls } = requestWith([external]);
  const result = await publishQualityStatus(run(), { ...options, request });
  assert.equal(result, 'ignored');
  assert.equal(calls.length, 1);
});

test('ignora PR direcionado a branch fora do Git Flow', async () => {
  const outside = pull({ base: { ref: 'outro-destino' } });
  const { request, calls } = requestWith([outside]);
  const result = await publishQualityStatus(run(), { ...options, request });
  assert.equal(result, 'ignored');
  assert.equal(calls.length, 1);
});

test('falha sem publicar sucesso quando a API de PRs falha', async () => {
  const request = async () => ({ ok: false, status: 503 });
  await assert.rejects(
    publishQualityStatus(run(), { ...options, request }),
    /Falha ao consultar PRs: HTTP 503/,
  );
});

test('rejeita URL de resultado fora do repositorio', async () => {
  const { request, calls } = requestWith([pull()]);
  await assert.rejects(
    publishQualityStatus(run({ html_url: 'https://example.com/falso' }), {
      ...options,
      request,
    }),
    /URL do run fora do repositorio oficial/,
  );
  assert.equal(calls.length, 0);
});

test('carrega apenas run concluido da workflow oficial', async () => {
  const calls = [];
  const request = async (url) => {
    calls.push(url);
    return {
      ok: true,
      json: async () => ({
        ...run(),
        status: 'completed',
        name: 'Qualidade Clinora',
        path: '.github/workflows/quality.yml',
      }),
    };
  };
  const loaded = await loadQualityRun('123', { ...options, request });
  assert.equal(loaded.head_sha, sha);
  assert.deepEqual(calls, [`https://api.github.com/repos/${repository}/actions/runs/123`]);
});

test('rejeita ID de run invalido sem chamar API', async () => {
  const request = () => assert.fail('Nao deve consultar a API');
  await assert.rejects(loadQualityRun('../123', { ...options, request }), /ID de run invalido/);
});

test('rejeita run ainda em andamento', async () => {
  const request = async () => ({
    ok: true,
    json: async () => ({
      ...run(),
      status: 'in_progress',
      name: 'Qualidade Clinora',
      path: '.github/workflows/quality.yml',
    }),
  });
  await assert.rejects(
    loadQualityRun('123', { ...options, request }),
    /Run nao e resultado concluido/,
  );
});

test('rejeita run de outra workflow', async () => {
  const request = async () => ({
    ok: true,
    json: async () => ({
      ...run(),
      status: 'completed',
      name: 'Outra workflow',
      path: '.github/workflows/outra.yml',
    }),
  });
  await assert.rejects(
    loadQualityRun('123', { ...options, request }),
    /Run nao e resultado concluido/,
  );
});

test('falha fechado se a API do run estiver indisponivel', async () => {
  const request = async () => ({ ok: false, status: 503 });
  await assert.rejects(
    loadQualityRun('123', { ...options, request }),
    /Falha ao consultar run: HTTP 503/,
  );
});
