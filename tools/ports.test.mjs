import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkPorts, portsFromCompose } from './ports.mjs';

test('extrai portas efetivas do Compose e inclui reservas adicionais', () => {
  const config = { services: {
    web: { ports: [{ host_ip: '127.0.0.1', published: '44999' }] },
    docs: { ports: [{ host_ip: '127.0.0.1', published: 44998 }] },
  } };
  assert.deepEqual(portsFromCompose(config, { storybook: 44212 }), [
    { service: 'storybook', port: 44212 },
    { service: 'docs', port: 44998 },
    { service: 'web', port: 44999 },
  ]);
});

test('rejeita exposicao externa, porta invalida e colisao na configuracao', () => {
  assert.throws(() => portsFromCompose({ services: { web: { ports: [{ host_ip: '0.0.0.0', published: 44210 }] } } }), /loopback/);
  assert.throws(() => portsFromCompose({ services: { web: { ports: [{ published: 44210 }] } } }), /loopback/);
  assert.throws(() => portsFromCompose({ services: { web: { ports: [{ host_ip: '127.0.0.1', published: 0 }] } } }), /porta invalida/);
  assert.throws(() => portsFromCompose({ services: { web: { ports: [{ host_ip: '127.0.0.1', published: 44210 }] } } }, { docs: 44210 }), /colisao/);
});

test('detecta porta ocupada sem encerrar processo alheio', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  try {
    assert.deepEqual(await checkPorts([{ service: 'teste', port }]), [
      { service: 'teste', port, available: false, code: 'EADDRINUSE' },
    ]);
    assert.equal(server.listening, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
  assert.deepEqual(await checkPorts([{ service: 'teste', port }]), [
    { service: 'teste', port, available: true },
  ]);
});

test('CLI respeita override do Compose e falha sem encerrar listener ocupado', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  try {
    const run = spawnSync(process.execPath, [fileURLToPath(new URL('./check-ports.mjs', import.meta.url))], {
      cwd: new URL('..', import.meta.url),
      env: { ...process.env, CLINORA_WEB_PORT: String(port) },
      encoding: 'utf8',
    });
    assert.equal(run.status, 1, run.stderr);
    assert.match(run.stdout, new RegExp(`web ${port}: INDISPONIVEL \\(EADDRINUSE\\)`));
    assert.equal(server.listening, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
