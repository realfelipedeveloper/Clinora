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
    [...ports.keys(), 'postgres', 'redis', 'rabbitmq', 'mailpit', 'prometheus', 'grafana', 'garage'].sort(),
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

test('Mailpit local captura email efemero com UI protegida', () => {
  const mailpit = loadConfig().services.mailpit;
  assert.equal(mailpit.image, 'axllent/mailpit:v1.32.0');
  assert.deepEqual(
    mailpit.ports.map(({ host_ip, target, published }) => [host_ip, target, Number(published)]),
    [
      ['127.0.0.1', 1025, 44260],
      ['127.0.0.1', 8025, 44261],
    ],
  );
  assert.equal(mailpit.user, '10001:10001');
  assert.equal(mailpit.read_only, true);
  assert.equal(mailpit.tmpfs.includes('/tmp'), true);
  assert.equal(mailpit.volumes, undefined);
  assert.deepEqual(mailpit.cap_drop, ['ALL']);
  assert.equal(mailpit.security_opt.includes('no-new-privileges:true'), true);
  assert.deepEqual(mailpit.healthcheck.test, ['CMD', '/mailpit', 'readyz']);
  assert.equal(mailpit.environment.MP_DATABASE, '/tmp/mailpit.db');
  assert.equal(mailpit.environment.MP_UI_AUTH, 'clinora_local:clinora_mail_local_only_2026');
  assert.equal(mailpit.environment.MP_ALLOWED_HOSTS, 'mailpit,127.0.0.1:44261');
  assert.equal(mailpit.environment.MP_MAX_MESSAGES, '100');
  assert.equal(mailpit.environment.MP_MAX_AGE, '1d');
  assert.equal(mailpit.environment.MP_MAX_MESSAGE_SIZE, '1');
  assert.equal(mailpit.environment.MP_DISABLE_VERSION_CHECK, 'true');
  assert.equal(mailpit.environment.MP_BLOCK_REMOTE_CSS_AND_FONTS, 'true');
  assert.equal(mailpit.environment.MP_SMTP_ALLOWED_RECIPIENTS, '@example[.]test\\z');
  assert.equal(mailpit.environment.MP_SMTP_RELAY_ALL, undefined);
  assert.equal(mailpit.environment.MP_SMTP_FORWARD_CONFIG, undefined);
});

test('Prometheus e Grafana locais isolam portas, metricas e autenticacao', () => {
  const config = loadConfig();
  const prometheus = config.services.prometheus;
  const grafana = config.services.grafana;
  assert.equal(prometheus.image, 'prom/prometheus:v3.15.1');
  assert.deepEqual(prometheus.ports.map(({ host_ip, target, published }) => [host_ip, target, Number(published)]), [['127.0.0.1', 9090, 44281]]);
  assert.equal(prometheus.read_only, true);
  assert.equal(prometheus.security_opt.includes('no-new-privileges:true'), true);
  assert.equal(prometheus.volumes.some(({ target, read_only }) => target === '/etc/prometheus/prometheus.yml' && read_only), true);
  assert.equal(grafana.image, 'grafana/grafana:13.3.0');
  assert.deepEqual(grafana.ports.map(({ host_ip, target, published }) => [host_ip, target, Number(published)]), [['127.0.0.1', 3000, 44280]]);
  assert.equal(grafana.security_opt.includes('no-new-privileges:true'), true);
  assert.equal(grafana.environment.GF_SECURITY_ADMIN_USER, 'clinora_local');
  assert.equal(grafana.environment.GF_SECURITY_ADMIN_PASSWORD, 'clinora_grafana_local_only_2026');
  assert.equal(grafana.environment.GF_AUTH_ANONYMOUS_ENABLED, 'false');
  assert.equal(grafana.environment.GF_USERS_ALLOW_SIGN_UP, 'false');
  assert.equal(grafana.volumes.some(({ target, read_only }) => target === '/etc/grafana/provisioning/datasources/clinora.yml' && read_only), true);
  for (const name of ['core-api', 'payment-api', 'notification-api', 'integration-api', 'scheduler-worker']) {
    assert.equal(config.services[name].environment.SPRING_PROFILES_ACTIVE, 'observability');
  }
  const scrape = readFileSync(new URL('../infra/observability/prometheus.yml', import.meta.url), 'utf8');
  for (const name of ['core-api', 'payment-api', 'notification-api', 'integration-api', 'scheduler-worker']) {
    assert.ok(scrape.includes(`${name}:8080`));
  }
  assert.match(scrape, /\/actuator\/prometheus/);
  const datasource = readFileSync(new URL('../infra/observability/grafana-datasource.yml', import.meta.url), 'utf8');
  assert.match(datasource, /http:\/\/prometheus:9090/);
});

test('Garage local isola API S3 e administracao com bucket exclusivo de teste', () => {
  const config = loadConfig();
  const garage = config.services.garage;
  assert.equal(garage.image, 'dxflrs/garage:v2.5.0');
  assert.deepEqual(garage.command, ['/garage', 'server', '--single-node', '--default-bucket']);
  assert.deepEqual(garage.ports.map(({ host_ip, target, published }) => [host_ip, target, Number(published)]), [
    ['127.0.0.1', 3900, 44270],
    ['127.0.0.1', 3903, 44271],
  ]);
  assert.equal(garage.read_only, true);
  assert.deepEqual(garage.cap_drop, ['ALL']);
  assert.equal(garage.security_opt.includes('no-new-privileges:true'), true);
  assert.equal(garage.volumes.some(({ type, target }) => type === 'volume' && target === '/data'), true);
  assert.equal(garage.volumes.some(({ read_only, target }) => read_only && target === '/etc/garage.toml'), true);
  assert.equal(garage.environment.GARAGE_DEFAULT_BUCKET, 'clinora-smoke');
  assert.match(garage.environment.GARAGE_DEFAULT_ACCESS_KEY, /^GK[0-9a-f]{32}$/);
  assert.match(garage.environment.GARAGE_DEFAULT_SECRET_KEY, /^[0-9a-f]{64}$/);
  assert.equal(garage.healthcheck.test.join(' '), 'CMD /garage status');
  for (const name of ['core-api', 'payment-api', 'notification-api', 'integration-api', 'scheduler-worker']) {
    assert.equal(Object.keys(config.services[name].environment).some((key) => key.startsWith('GARAGE_')), false);
  }
  const settings = readFileSync(new URL('../infra/docker/garage/garage.toml', import.meta.url), 'utf8');
  assert.match(settings, /replication_factor = 1/);
  assert.match(settings, /admin_token = "clinora_garage_admin_local_only_2026"/);
  assert.match(settings, /metrics_token = /);
});

test('smoke Garage exige autenticacao e exercita objeto S3 com SDK', () => {
  const smoke = readFileSync(new URL('./compose-smoke.mjs', import.meta.url), 'utf8');
  assert.match(smoke, /garageAdminRequest\(\)\)\.status, 403/);
  assert.match(smoke, /garageAdminRequest\('token_invalido'\)\)\.status, 403/);
  assert.match(smoke, /garageAdminRequest\(garageAdminToken\)\)\.status, 200/);
  assert.match(smoke, /wrongClient\.send\(new PutObjectCommand/);
  assert.match(smoke, /client\.send\(new PutObjectCommand/);
  assert.match(smoke, /client\.send\(new GetObjectCommand/);
  assert.match(smoke, /client\.send\(new DeleteObjectCommand/);
});

test('smoke Mailpit envia Host malicioso pelo cliente HTTP de baixo nivel', () => {
  const smoke = readFileSync(new URL('./compose-smoke.mjs', import.meta.url), 'utf8');
  assert.match(smoke, /request as httpRequest.*from 'node:http'/);
  assert.match(smoke, /httpRequest\(/);
  assert.match(smoke, /headers: \{ Host: 'evil\.example'/);
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
    CLINORA_MAIL_SMTP_PORT: '44294',
    CLINORA_MAIL_UI_PORT: '44293',
    CLINORA_MAIL_UI_AUTH: 'other_local:other_password_local_only',
    CLINORA_GRAFANA_PORT: '44292',
    CLINORA_PROMETHEUS_PORT: '44291',
    CLINORA_GRAFANA_ADMIN_PASSWORD: 'other_password_local_only',
    CLINORA_GARAGE_S3_PORT: '44290',
    CLINORA_GARAGE_ADMIN_PORT: '44289',
  });
  assert.equal(config.services.web.ports[0].published, '44299');
  assert.equal(config.services.docs.ports[0].published, '44211');
  assert.equal(config.services.postgres.ports[0].published, '44298');
  assert.equal(config.services.redis.ports[0].published, '44297');
  assert.equal(config.services.rabbitmq.ports[0].published, '44296');
  assert.equal(config.services.rabbitmq.ports[1].published, '44295');
  assert.equal(config.services.mailpit.ports[0].published, '44294');
  assert.equal(config.services.mailpit.ports[1].published, '44293');
  assert.equal(config.services.mailpit.environment.MP_UI_AUTH, 'other_local:other_password_local_only');
  assert.equal(config.services.mailpit.environment.MP_ALLOWED_HOSTS, 'mailpit,127.0.0.1:44293');
  assert.equal(config.services.grafana.ports[0].published, '44292');
  assert.equal(config.services.prometheus.ports[0].published, '44291');
  assert.equal(config.services.grafana.environment.GF_SECURITY_ADMIN_PASSWORD, 'other_password_local_only');
  assert.equal(config.services.garage.ports[0].published, '44290');
  assert.equal(config.services.garage.ports[1].published, '44289');
});
