import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const ports = new Map([
  ['web', 44210],
  ['docs', 44211],
  ['core-api', 44220],
  ['payment-api', 44221],
  ['notification-api', 44222],
  ['integration-api', 44223],
  ['scheduler-worker', 44224],
]);

function loadConfig(overrides = {}) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith('CLINORA_') && key.endsWith('_PORT')) delete env[key];
  }
  Object.assign(env, overrides);
  const result = spawnSync('docker', ['compose', 'config', '--format', 'json'], {
    cwd: new URL('..', import.meta.url),
    env,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  return JSON.parse(result.stdout);
}

test('isola os sete servicos e publica somente portas reservadas em loopback', () => {
  const config = loadConfig();
  assert.equal(config.name, 'clinora-local');
  assert.equal(config.networks.clinora.name, 'clinora-local-network');
  assert.deepEqual(Object.keys(config.services).sort(), [...ports.keys()].sort());
  for (const [name, port] of ports) {
    const service = config.services[name];
    assert.equal(service.ports.length, 1);
    assert.equal(service.ports[0].host_ip, '127.0.0.1');
    assert.equal(Number(service.ports[0].published), port);
    assert.equal(service.ports[0].target, 8080);
    assert.equal(service.read_only, true);
    assert.equal(service.healthcheck.test.at(-1).includes('127.0.0.1:8080'), true);
    assert.equal(service.privileged, undefined);
    assert.equal(service.security_opt.includes('no-new-privileges:true'), true);
    assert.equal(service.volumes.every((volume) => volume.read_only), true);
  }
});

test('mantem os processos Java sem root e verifica readiness real', () => {
  const config = loadConfig();
  for (const name of [...ports.keys()].filter((service) => !['web', 'docs'].includes(service))) {
    const service = config.services[name];
    assert.equal(service.user, '10001:10001');
    assert.equal(service.environment.CLINORA_BIND_ADDRESS, '0.0.0.0');
    assert.equal(service.healthcheck.test.at(-1).endsWith('/actuator/health/readiness'), true);
    assert.equal(service.volumes[0].target, '/app.jar');
  }
});

test('honra override explicito de porta sem alterar os outros servicos', () => {
  const config = loadConfig({ CLINORA_WEB_PORT: '44299' });
  assert.equal(config.services.web.ports[0].published, '44299');
  assert.equal(config.services.docs.ports[0].published, '44211');
});
