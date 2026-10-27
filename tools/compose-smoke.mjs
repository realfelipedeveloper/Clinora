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

function compose(args) {
  const result = spawnSync('docker', ['compose', ...args], {
    stdio: 'inherit',
    timeout: 600_000,
  });
  assert.equal(result.status, 0, `docker compose ${args.join(' ')} falhou`);
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
  console.log('Clinora Compose smoke OK');
} finally {
  compose(['down', '--remove-orphans']);
}
