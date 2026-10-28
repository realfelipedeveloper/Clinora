import { spawnSync } from 'node:child_process';
import { portsFromCompose, checkPorts } from './ports.mjs';

const compose = spawnSync('docker', ['compose', 'config', '--format', 'json'], {
  cwd: new URL('..', import.meta.url),
  encoding: 'utf8',
  maxBuffer: 1024 * 1024,
});
if (compose.status !== 0) {
  console.error(compose.stderr || compose.error?.message || 'docker compose config falhou');
  process.exitCode = 1;
} else {
  try {
    const ports = portsFromCompose(JSON.parse(compose.stdout), {
      storybook: 44212,
      's3-api-reservada': 44270,
      's3-console-reservada': 44271,
    });
    const results = await checkPorts(ports);
    for (const { service, port, available, code } of results) {
      console.log(`${service} ${port}: ${available ? 'LIVRE' : `INDISPONIVEL (${code})`}`);
    }
    if (results.some(({ available }) => !available)) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
