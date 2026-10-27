import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:net';

if (process.env.CI !== 'true') {
  throw new Error('O smoke de containers e exclusivo do runner isolado de CI.');
}

const endpoints = [
  ['web', 44210, '/'],
  ['docs', 44211, '/content/01-project-constitution.md'],
  ['core-api', 44220, '/actuator/health/readiness'],
  ['payment-api', 44221, '/actuator/health/readiness'],
  ['notification-api', 44222, '/actuator/health/readiness'],
  ['integration-api', 44223, '/actuator/health/readiness'],
  ['scheduler-worker', 44224, '/actuator/health/readiness'],
];
const databases = [
  ['clinora_core', 'clinora_core_user', 'CLINORA_CORE_DB_PASSWORD'],
  ['clinora_payments', 'clinora_payments_user', 'CLINORA_PAYMENTS_DB_PASSWORD'],
  ['clinora_notifications', 'clinora_notifications_user', 'CLINORA_NOTIFICATIONS_DB_PASSWORD'],
  ['clinora_integrations', 'clinora_integrations_user', 'CLINORA_INTEGRATIONS_DB_PASSWORD'],
];
const redisUsers = [
  ['core', 'CLINORA_CORE_REDIS_PASSWORD'],
  ['payments', 'CLINORA_PAYMENTS_REDIS_PASSWORD'],
  ['notifications', 'CLINORA_NOTIFICATIONS_REDIS_PASSWORD'],
  ['integrations', 'CLINORA_INTEGRATIONS_REDIS_PASSWORD'],
  ['scheduler', 'CLINORA_SCHEDULER_REDIS_PASSWORD'],
];
const rabbitAuthorization = `Basic ${Buffer.from('clinora_local:clinora_rabbit_local_only_2026').toString('base64')}`;

async function rabbitRequest(path, { method = 'GET', body, authorization = rabbitAuthorization } = {}) {
  const headers = { Accept: 'application/json' };
  if (authorization) headers.Authorization = authorization;
  if (body) headers['Content-Type'] = 'application/json';
  return fetch(`http://127.0.0.1:44251/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(5_000),
  });
}

async function rabbitMessages(queue, ackmode) {
  const response = await rabbitRequest(`/queues/clinora_local/${queue}/get`, {
    method: 'POST',
    body: { count: 1, ackmode, encoding: 'auto', truncate: 1000 },
  });
  assert.equal(response.status, 200, `${queue}: HTTP ${response.status}`);
  return response.json();
}

function compose(args) {
  const result = spawnSync('docker', ['compose', ...args], {
    stdio: 'inherit',
    timeout: 600_000,
  });
  assert.equal(result.status, 0, `docker compose ${args.join(' ')} falhou`);
}

function postgresQuery(database, user, passwordVariable) {
  const command = `PGPASSWORD="$${passwordVariable}" psql -h 127.0.0.1 -U ${user} -d ${database} -tAc 'SELECT current_database()'`;
  return spawnSync('docker', ['compose', 'exec', '-T', 'postgres', 'sh', '-c', command], {
    encoding: 'utf8',
    timeout: 15_000,
  });
}

function redisQuery(user, passwordVariable, args) {
  const command = `REDISCLI_AUTH="$${passwordVariable}" redis-cli --user clinora_${user} ${args.join(' ')}`;
  return spawnSync('docker', ['compose', 'exec', '-T', 'redis', 'sh', '-c', command], {
    encoding: 'utf8',
    timeout: 15_000,
  });
}

function assertRedisPasswordRejected(password, reason) {
  const result = spawnSync(
    'docker',
    [
      'compose',
      'run',
      '--rm',
      '-T',
      '--no-deps',
      '-e',
      `CLINORA_CORE_REDIS_PASSWORD=${password}`,
      'redis',
    ],
    { encoding: 'utf8', timeout: 30_000 },
  );
  const output = `${result.stdout}${result.stderr}`;
  assert.notEqual(result.status, 0, 'Senha Redis invalida foi aceita');
  assert.match(output, reason);
  assert.equal(output.includes(password), false, 'Senha Redis apareceu no log');
}

async function assertPortFree(port) {
  const server = createServer();
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', resolve);
    });
  } finally {
    if (server.listening) {
      await new Promise((resolve) => server.close(resolve));
    }
  }
}

for (const [, port] of endpoints) await assertPortFree(port);
await assertPortFree(44230);
await assertPortFree(44240);
await assertPortFree(44250);
await assertPortFree(44251);

try {
  compose(['up', '-d', '--wait', '--wait-timeout', '180']);
  for (const [name, port, path] of endpoints) {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      signal: AbortSignal.timeout(5_000),
    });
    assert.equal(response.status, 200, `${name}: HTTP ${response.status}`);
    if (name === 'docs') {
      assert.match(await response.text(), /Constituição do Clinora/);
    } else if (name !== 'web') {
      assert.equal((await response.json()).status, 'UP', name);
    }
  }
  for (let index = 0; index < databases.length; index++) {
    const [database, user, passwordVariable] = databases[index];
    const own = postgresQuery(database, user, passwordVariable);
    assert.equal(own.status, 0, `${user}: ${own.stderr}`);
    assert.equal(own.stdout.trim(), database);

    const otherDatabase = databases[(index + 1) % databases.length][0];
    const crossTenant = postgresQuery(otherDatabase, user, passwordVariable);
    assert.notEqual(crossTenant.status, 0, `${user} acessou ${otherDatabase}`);
    assert.match(crossTenant.stderr, /permission denied for database/i);
  }
  const anonymous = spawnSync('docker', ['compose', 'exec', '-T', 'redis', 'redis-cli', 'ping'], {
    encoding: 'utf8',
    timeout: 15_000,
  });
  assert.match(`${anonymous.stdout}${anonymous.stderr}`, /NOAUTH/i);

  for (let index = 0; index < redisUsers.length; index++) {
    const [user, passwordVariable] = redisUsers[index];
    const key = `clinora:${user}:smoke`;
    const ownWrite = redisQuery(user, passwordVariable, ['SET', key, 'ok', 'EX', '30']);
    assert.equal(ownWrite.status, 0, `${user}: ${ownWrite.stderr}`);
    assert.equal(ownWrite.stdout.trim(), 'OK');
    const ownRead = redisQuery(user, passwordVariable, ['GET', key]);
    assert.equal(ownRead.status, 0, `${user}: ${ownRead.stderr}`);
    assert.equal(ownRead.stdout.trim(), 'ok');

    const other = redisUsers[(index + 1) % redisUsers.length][0];
    const crossService = redisQuery(user, passwordVariable, [
      'SET',
      `clinora:${other}:smoke`,
      'bad',
    ]);
    assert.match(`${crossService.stdout}${crossService.stderr}`, /NOPERM/i);
    const globalDelete = redisQuery(user, passwordVariable, ['FLUSHALL']);
    assert.match(`${globalDelete.stdout}${globalDelete.stderr}`, /NOPERM/i);
  }
  assertRedisPasswordRejected('short', /pelo menos 16 caracteres/);
  assertRedisPasswordRejected('invalid$password$123', /apenas letras, numeros/);

  assert.equal((await rabbitRequest('/overview', { authorization: null })).status, 401);
  assert.equal(
    (await rabbitRequest('/overview', {
      authorization: `Basic ${Buffer.from('guest:guest').toString('base64')}`,
    })).status,
    401,
  );
  assert.equal((await rabbitRequest('/overview')).status, 200);
  const vhosts = await (await rabbitRequest('/vhosts')).json();
  assert.deepEqual(vhosts.map(({ name }) => name), ['clinora_local']);
  const users = await (await rabbitRequest('/users')).json();
  assert.deepEqual(users.map(({ name }) => name), ['clinora_local']);
  const mainQueue = await (await rabbitRequest('/queues/clinora_local/clinora.smoke')).json();
  assert.equal(mainQueue.arguments['x-dead-letter-exchange'], 'clinora.smoke.dlx');
  assert.equal(mainQueue.arguments['x-dead-letter-routing-key'], 'failed');
  const binding = await (
    await rabbitRequest('/bindings/clinora_local/e/clinora.smoke.dlx/q/clinora.smoke.dlq')
  ).json();
  assert.equal(binding.some(({ routing_key }) => routing_key === 'failed'), true);

  const published = await rabbitRequest('/exchanges/clinora_local/clinora.smoke.events/publish', {
    method: 'POST',
    body: {
      properties: { delivery_mode: 2 },
      routing_key: 'test',
      payload: 'clinora-dlq-smoke',
      payload_encoding: 'string',
    },
  });
  assert.equal(published.status, 200);
  assert.equal((await published.json()).routed, true);
  const rejected = await rabbitMessages('clinora.smoke', 'reject_requeue_false');
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].payload, 'clinora-dlq-smoke');
  let deadLetters = [];
  for (let attempt = 0; attempt < 10 && deadLetters.length === 0; attempt += 1) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 500));
    deadLetters = await rabbitMessages('clinora.smoke.dlq', 'ack_requeue_false');
  }
  assert.equal(deadLetters.length, 1, 'Mensagem rejeitada nao chegou a DLQ');
  assert.equal(deadLetters[0].payload, 'clinora-dlq-smoke');
  assert.equal(deadLetters[0].properties.headers['x-death'][0].reason, 'rejected');
  console.log('Clinora Compose smoke OK');
} finally {
  compose(['down', '--remove-orphans']);
}
