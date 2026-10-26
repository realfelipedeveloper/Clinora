const BASE_BRANCHES = new Set(['development', 'homologation', 'main']);
const CONTEXT = 'clinora/qualidade';
const PENDING_STATUSES = new Set(['queued', 'in_progress', 'waiting', 'pending', 'requested']);

class PendingQualityRunError extends Error {}

export async function loadQualityRun(runId, { repository, token, request = fetch }) {
  if (!/^[1-9][0-9]{0,15}$/.test(runId ?? '')) {
    throw new Error('ID de run invalido');
  }
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !token) {
    throw new Error('Repositorio ou credencial de workflow ausente');
  }

  const response = await request(
    `https://api.github.com/repos/${repository}/actions/runs/${runId}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Falha ao consultar run: HTTP ${response.status}`);
  }
  const run = await response.json();
  if (
    run.name !== 'Qualidade Clinora' ||
    run.path !== '.github/workflows/quality.yml' ||
    run.repository?.full_name !== repository
  ) {
    throw new Error('Run nao e resultado concluido da workflow oficial');
  }
  if (PENDING_STATUSES.has(run.status) && !run.conclusion) {
    throw new PendingQualityRunError('Run nao e resultado concluido da workflow oficial');
  }
  if (run.status !== 'completed' || !run.conclusion) {
    throw new Error('Run nao e resultado concluido da workflow oficial');
  }
  return run;
}

export async function waitForQualityRun(
  runId,
  { attempts = 20, delay = () => new Promise((resolve) => setTimeout(resolve, 3000)), ...options },
) {
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 60) {
    throw new Error('Numero de tentativas invalido');
  }
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await loadQualityRun(runId, options);
    } catch (error) {
      if (!(error instanceof PendingQualityRunError)) {
        throw error;
      }
      if (attempt === attempts - 1) {
        break;
      }
      await delay();
    }
  }
  throw new Error('Run nao concluiu no prazo');
}

export async function publishQualityStatus(run, { repository, token, request = fetch }) {
  if (
    !run ||
    !['pull_request', 'workflow_dispatch'].includes(run.event) ||
    run.repository?.full_name !== repository ||
    run.head_repository?.full_name !== repository ||
    !/^[a-f0-9]{40}$/.test(run.head_sha ?? '') ||
    !run.head_branch ||
    run.conclusion === 'action_required' ||
    (run.event === 'workflow_dispatch' && !run.head_branch.startsWith('promotion/'))
  ) {
    return 'ignored';
  }

  if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !token) {
    throw new Error('Repositorio ou credencial de workflow ausente');
  }

  const state = run.conclusion === 'success' ? 'success' : 'failure';
  const targetUrl = `https://github.com/${repository}/actions/runs/`;
  if (!run.html_url?.startsWith(targetUrl)) {
    throw new Error('URL do run fora do repositorio oficial');
  }

  const api = `https://api.github.com/repos/${repository}`;
  const owner = repository.split('/')[0];
  const pullsUrl = new URL(`${api}/pulls`);
  pullsUrl.searchParams.set('state', 'open');
  pullsUrl.searchParams.set('head', `${owner}:${run.head_branch}`);
  pullsUrl.searchParams.set('per_page', '100');
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const pullsResponse = await request(pullsUrl.toString(), { headers });
  if (!pullsResponse.ok) {
    throw new Error(`Falha ao consultar PRs: HTTP ${pullsResponse.status}`);
  }
  const pulls = await pullsResponse.json();
  if (!Array.isArray(pulls)) {
    throw new Error('Resposta invalida na consulta de PRs');
  }

  const matches = pulls.filter(
    (pull) =>
      pull.head?.ref === run.head_branch &&
      pull.head?.sha === run.head_sha &&
      pull.head?.repo?.full_name === repository &&
      BASE_BRANCHES.has(pull.base?.ref),
  );
  if (matches.length !== 1) {
    return 'ignored';
  }

  const response = await request(`${api}/statuses/${run.head_sha}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state,
      context: CONTEXT,
      description:
        state === 'success' ? 'Regressao automatizada aprovada' : 'Regressao automatizada falhou',
      target_url: run.html_url,
    }),
  });
  if (!response.ok) {
    throw new Error(`Falha ao publicar status: HTTP ${response.status}`);
  }
  return 'published';
}
