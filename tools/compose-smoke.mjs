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
  console.log('Clinora Compose smoke OK');
} finally {
  compose(['down', '--remove-orphans']);
}
