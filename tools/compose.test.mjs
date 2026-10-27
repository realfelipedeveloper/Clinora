import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
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
const databasePasswords = [
  'CLINORA_CORE_DB_PASSWORD',
  'CLINORA_PAYMENTS_DB_PASSWORD',
  'CLINORA_NOTIFICATIONS_DB_PASSWORD',
  'CLINORA_INTEGRATIONS_DB_PASSWORD',
];
const redisUsers = ['core', 'payments', 'notifications', 'integrations', 'scheduler'];

function loadConfig(overrides = {}) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith('CLINORA_')) delete env[key];
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
  assert.deepEqual(
    Object.keys(config.services).sort(),
    [...ports.keys(), 'postgres', 'redis', 'rabbitmq'].sort(),
  );
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
    assert.equal(
      service.volumes.every((volume) => volume.read_only),
      true,
    );
  }
});

test('RabbitMQ local isola portas, usuario e topologia de teste com DLQ', () => {
  const config = loadConfig();
  const rabbit = config.services.rabbitmq;
  assert.equal(rabbit.image, 'rabbitmq:4.2.9-management-alpine');
  assert.deepEqual(
    rabbit.ports.map(({ host_ip, target, published }) => [host_ip, target, Number(published)]),
    [
      ['127.0.0.1', 5672, 44250],
      ['127.0.0.1', 15672, 44251],
    ],
  );
  assert.equal(rabbit.security_opt.includes('no-new-privileges:true'), true);
  assert.equal(rabbit.privileged, undefined);
  assert.equal(rabbit.volumes[0].type, 'volume');
  assert.equal(rabbit.volumes[1].target, '/etc/rabbitmq/rabbitmq.conf');
  assert.equal(rabbit.volumes[2].target, '/etc/rabbitmq/definitions.json');
  assert.equal(rabbit.volumes[1].read_only, true);
  assert.equal(rabbit.volumes[2].read_only, true);
  assert.match(rabbit.healthcheck.test.at(-1), /rabbitmq-diagnostics -q ping/);

  const settings = readFileSync(
    new URL('../infra/docker/rabbitmq/rabbitmq.conf', import.meta.url),
    'utf8',
  );
  assert.match(settings, /definitions\.import_backend = local_filesystem/);
  assert.match(settings, /definitions\.local\.path = \/etc\/rabbitmq\/definitions\.json/);
  const definitions = JSON.parse(
    readFileSync(new URL('../infra/docker/rabbitmq/definitions.json', import.meta.url), 'utf8'),
  );
  assert.deepEqual(definitions.vhosts.map(({ name }) => name), ['clinora_local']);
  assert.deepEqual(definitions.users.map(({ name }) => name), ['clinora_local']);
  assert.equal(definitions.users[0].hashing_algorithm, 'rabbit_password_hashing_sha256');
  const passwordHash = Buffer.from(definitions.users[0].password_hash, 'base64');
  assert.equal(passwordHash.length, 36);
  assert.deepEqual(
    passwordHash.subarray(4),
    createHash('sha256')
      .update(Buffer.concat([passwordHash.subarray(0, 4), Buffer.from('clinora_rabbit_local_only_2026')]))
      .digest(),
  );
  assert.equal(definitions.permissions.length, 1);
  assert.equal(definitions.permissions[0].vhost, 'clinora_local');
  assert.deepEqual(definitions.exchanges.map(({ name }) => name).sort(), [
    'clinora.smoke.dlx',
    'clinora.smoke.events',
  ]);
  assert.deepEqual(definitions.queues.map(({ name }) => name).sort(), [
    'clinora.smoke',
    'clinora.smoke.dlq',
  ]);
  const main = definitions.queues.find(({ name }) => name === 'clinora.smoke');
  assert.equal(main.arguments['x-dead-letter-exchange'], 'clinora.smoke.dlx');
  assert.equal(main.arguments['x-dead-letter-routing-key'], 'failed');
  assert.deepEqual(
    definitions.bindings.map(({ source, destination, routing_key }) => [
      source,
      destination,
      routing_key,
    ]),
    [
      ['clinora.smoke.events', 'clinora.smoke', 'test'],
      ['clinora.smoke.dlx', 'clinora.smoke.dlq', 'failed'],
    ],
  );
});

test('smoke RabbitMQ publica por POST antes de validar a DLQ', () => {
  const smoke = readFileSync(new URL('./compose-smoke.mjs', import.meta.url), 'utf8');
  assert.match(
    smoke,
    /rabbitRequest\('\/exchanges\/clinora_local\/clinora\.smoke\.events\/publish', \{\s*method: 'POST'/,
  );
});

test('isola Redis efemero com ACL, memoria limitada e porta em loopback', () => {
  const redis = loadConfig().services.redis;
  assert.equal(redis.image, 'redis:8.10.2-alpine3.23');
  assert.equal(redis.ports[0].host_ip, '127.0.0.1');
  assert.equal(Number(redis.ports[0].published), 44240);
  assert.equal(redis.ports[0].target, 6379);
  assert.equal(redis.user, '10001:10001');
  assert.equal(redis.read_only, true);
  assert.equal(redis.tmpfs.includes('/tmp'), true);
  assert.equal(redis.volumes[0].read_only, true);
  assert.equal(redis.volumes[0].target, '/usr/local/bin/redis-start.sh');
  assert.equal(redis.security_opt.includes('no-new-privileges:true'), true);
  assert.deepEqual(redis.cap_drop, ['ALL']);
  assert.equal(redis.healthcheck.test[1].includes('redis-cli --user clinora_core ping'), true);
  assert.equal(
    new Set(
      redisUsers.map((name) => redis.environment[`CLINORA_${name.toUpperCase()}_REDIS_PASSWORD`]),
    ).size,
    5,
  );
  assert.equal(
    redis.volumes.some((volume) => volume.type === 'volume'),
    false,
  );
});

test('ACL Redis desativa usuario anonimo e comandos globais', () => {
  const script = readFileSync(new URL('../infra/docker/redis/start.sh', import.meta.url), 'utf8');
  assert.match(script, /user default off/);
  assert.match(script, /--save ['"]{2}/);
  assert.match(script, /--appendonly no/);
  assert.match(script, /--maxmemory-policy noeviction/);
  assert.match(script, /\$\{#password\}.*-lt 16/);
  assert.match(script, /\[!A-Za-z0-9\._-\]/);
  assert.match(script, /user clinora_%s on >%s ~clinora:%s:\*/);
  assert.doesNotMatch(script, /\+@all|\+flushall|\+flushdb/);
  for (const name of redisUsers) {
    assert.ok(script.includes(`add_user ${name} `));
    assert.ok(script.includes(`CLINORA_${name.toUpperCase()}_REDIS_PASSWORD`));
  }
});

test('cria quatro bancos sem expor senhas em argumentos e revoga acesso publico', () => {
  const script = readFileSync(
    new URL('../infra/docker/postgres/10-databases.sh', import.meta.url),
    'utf8',
  );
  for (const [database, role, password] of [
    ['clinora_core', 'clinora_core_user', 'CLINORA_CORE_DB_PASSWORD'],
    ['clinora_payments', 'clinora_payments_user', 'CLINORA_PAYMENTS_DB_PASSWORD'],
    ['clinora_notifications', 'clinora_notifications_user', 'CLINORA_NOTIFICATIONS_DB_PASSWORD'],
    ['clinora_integrations', 'clinora_integrations_user', 'CLINORA_INTEGRATIONS_DB_PASSWORD'],
  ]) {
    assert.match(script, new RegExp(`\\\\getenv \\w+ ${password}`));
    assert.ok(script.includes(`'${role}'`));
    assert.ok(script.includes(`CREATE DATABASE ${database} OWNER ${role};`));
    assert.ok(script.includes(`REVOKE ALL ON DATABASE ${database} FROM PUBLIC;`));
  }
  assert.doesNotMatch(script, /-v \w+_password=/);
});

test('isola PostgreSQL em volume proprio e publica somente na porta reservada', () => {
  const config = loadConfig();
  const postgres = config.services.postgres;
  assert.equal(postgres.image, 'postgres:17.11-alpine3.23');
  assert.equal(postgres.ports[0].host_ip, '127.0.0.1');
  assert.equal(Number(postgres.ports[0].published), 44230);
  assert.equal(postgres.ports[0].target, 5432);
  assert.equal(postgres.volumes[0].type, 'volume');
  assert.equal(postgres.volumes[0].target, '/var/lib/postgresql/data');
  assert.equal(postgres.volumes[1].read_only, true);
  assert.equal(postgres.volumes[1].target, '/docker-entrypoint-initdb.d/10-databases.sh');
  assert.equal(postgres.environment.POSTGRES_INITDB_ARGS, '--auth-host=scram-sha-256');
  assert.equal(postgres.healthcheck.test[0], 'CMD-SHELL');
  assert.equal(postgres.healthcheck.test[1].includes('SELECT 1'), true);
  assert.equal(postgres.security_opt.includes('no-new-privileges:true'), true);
  assert.equal(new Set(databasePasswords.map((key) => postgres.environment[key])).size, 4);
  assert.equal(
    databasePasswords.some(
      (key) => postgres.environment[key] === postgres.environment.POSTGRES_PASSWORD,
    ),
    false,
  );
  for (const name of ports.keys()) {
    assert.equal(
      Object.keys(config.services[name].environment ?? {}).some((key) =>
        key.includes('DB_PASSWORD'),
      ),
      false,
    );
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
  const config = loadConfig({
    CLINORA_WEB_PORT: '44299',
    CLINORA_POSTGRES_PORT: '44298',
    CLINORA_REDIS_PORT: '44297',
    CLINORA_RABBIT_AMQP_PORT: '44296',
    CLINORA_RABBIT_UI_PORT: '44295',
  });
  assert.equal(config.services.web.ports[0].published, '44299');
  assert.equal(config.services.docs.ports[0].published, '44211');
  assert.equal(config.services.postgres.ports[0].published, '44298');
  assert.equal(config.services.redis.ports[0].published, '44297');
  assert.equal(config.services.rabbitmq.ports[0].published, '44296');
  assert.equal(config.services.rabbitmq.ports[1].published, '44295');
});
