import { createServer } from 'node:net';

export function portsFromCompose(config, extra = {}) {
  const result = [];
  const used = new Map();

  function add(service, port, host) {
    if (host !== '127.0.0.1') throw new Error(`${service}: publicacao fora do loopback`);
    const number = Number(port);
    if (!Number.isInteger(number) || number < 1 || number > 65535) {
      throw new Error(`${service}: porta invalida`);
    }
    if (used.has(number)) throw new Error(`${service}: colisao com ${used.get(number)} na porta ${number}`);
    used.set(number, service);
    result.push({ service, port: number });
  }

  for (const [service, settings] of Object.entries(config.services ?? {})) {
    for (const published of settings.ports ?? []) {
      add(service, published.published, published.host_ip);
    }
  }
  for (const [service, port] of Object.entries(extra)) add(service, port, '127.0.0.1');
  return result.sort((a, b) => a.port - b.port);
}

export async function checkPorts(ports) {
  const results = [];
  for (const { service, port } of ports) {
    const server = createServer();
    try {
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen({ host: '127.0.0.1', port, exclusive: true }, resolve);
      });
      results.push({ service, port, available: true });
    } catch (error) {
      results.push({ service, port, available: false, code: error.code ?? 'UNKNOWN' });
    } finally {
      if (server.listening) await new Promise((resolve) => server.close(resolve));
    }
  }
  return results;
}
