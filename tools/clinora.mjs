#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const EXPECTED_REMOTE = 'https://github.com/realfelipedeveloper/Clinora.git';
const EXPECTED_NODE = '24.15.0';
const EXPECTED_PNPM = '11.20.0';
const EXPECTED_ANGULAR_PACKAGE_MANAGER = 'pnpm';

const root = process.cwd();

const commands = {
  doctor,
  verify,
  'java:verify': javaVerify,
  'frontend:check': frontendCheck,
  'git:remote': gitRemote,
};

async function main() {
  const command = process.argv[2] ?? 'help';
  if (command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  const handler = commands[command];
  if (!handler) {
    fail(`Unknown command: ${command}`);
  }

  await handler();
}

function printHelp() {
  console.log(`Clinora scripts

Usage:
  node tools/clinora.mjs <command>

Commands:
  doctor          Validate local toolchain and repository wiring.
  verify          Run doctor, Java verify and frontend checks.
  java:verify     Run Maven verify through the wrapper.
  frontend:check  Run pnpm frozen install, peer check and Angular workspace checks.
  git:remote      Validate that origin points to realfelipedeveloper/Clinora.
`);
}

async function verify() {
  await doctor();
  await javaVerify();
  await frontendCheck();
}

async function doctor() {
  checkFile('pom.xml');
  checkFile('mvnw.cmd');
  checkFile('mvnw');
  checkFile('angular.json');
  checkFile('pnpm-workspace.yaml');

  checkNode();
  checkPnpm();
  gitRemote();
  checkAngularWorkspace();
  checkJava();

  console.log('Clinora doctor OK');
}

function javaVerify() {
  const javaHome = resolveJavaHome();
  const command = process.platform === 'win32' ? 'cmd.exe' : './mvnw';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', '.\\mvnw.cmd', 'verify'] : ['verify'];
  run(command, args, {
    env: {
      ...process.env,
      JAVA_HOME: javaHome,
    },
  });
}

function frontendCheck() {
  runCorepackPnpm(['install', '--frozen-lockfile']);
  runCorepackPnpm(['peers', 'check']);
  runCorepackPnpm(['frontend:workspace']);
  runCorepackPnpm(['frontend:version']);
}

function gitRemote() {
  const fetchUrl = runText(executable('git'), ['remote', 'get-url', 'origin']);
  const pushUrl = runText(executable('git'), ['remote', 'get-url', '--push', 'origin']);

  if (fetchUrl !== EXPECTED_REMOTE || pushUrl !== EXPECTED_REMOTE) {
    fail(
      `origin must point only to ${EXPECTED_REMOTE}. Current fetch=${fetchUrl}, push=${pushUrl}`,
    );
  }

  console.log(`Git remote OK: ${EXPECTED_REMOTE}`);
}

function checkNode() {
  const current = process.versions.node;
  if (!isSupportedAngularNode(current)) {
    fail(`Node ${current} is not supported for Angular 22. Use ${EXPECTED_NODE}.`);
  }

  console.log(`Node OK: ${current}`);
}

function checkPnpm() {
  const current = runCorepackPnpmText(['--version']);
  const [major, minor] = current.split('.').map(Number);
  if (major !== 11 || minor < 20) {
    fail(`pnpm ${current} is not supported. Use ${EXPECTED_PNPM}.`);
  }

  console.log(`pnpm OK: ${current}`);
}

function checkAngularWorkspace() {
  const angular = JSON.parse(readFileSync(join(root, 'angular.json'), 'utf8'));
  if (angular.cli?.packageManager !== EXPECTED_ANGULAR_PACKAGE_MANAGER) {
    fail(`angular.json must use cli.packageManager=${EXPECTED_ANGULAR_PACKAGE_MANAGER}.`);
  }
  if (angular.newProjectRoot !== 'apps') {
    fail('angular.json must use newProjectRoot=apps.');
  }

  console.log('Angular workspace OK');
}

function checkJava() {
  const javaHome = resolveJavaHome();
  const output = runText(join(javaHome, 'bin', javaBinaryName()), ['-version'], {
    mergeStdErr: true,
    shell: false,
  });
  if (!output.includes('25.')) {
    fail(`Java 25 is required. Detected output: ${output}`);
  }

  console.log(`Java OK: ${javaHome}`);
}

function resolveJavaHome() {
  if (process.env.JAVA_HOME && existsSync(join(process.env.JAVA_HOME, 'bin', javaBinaryName()))) {
    return process.env.JAVA_HOME;
  }

  const output = runText(executable('java'), ['-XshowSettings:properties', '-version'], {
    mergeStdErr: true,
  });
  const javaHome = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith('java.home = '))
    ?.replace('java.home = ', '')
    .trim();

  if (!javaHome || !existsSync(join(javaHome, 'bin', javaBinaryName()))) {
    fail('JAVA_HOME is not set and Java home could not be resolved from java on PATH.');
  }

  return javaHome;
}

function javaBinaryName() {
  return process.platform === 'win32' ? 'java.exe' : 'java';
}

function checkFile(path) {
  if (!existsSync(join(root, path))) {
    fail(`Missing required file: ${path}`);
  }
}

function isSupportedAngularNode(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (major >= 26) {
    return true;
  }
  if (major === 24) {
    return minor > 15 || (minor === 15 && patch >= 0);
  }
  if (major === 22) {
    return minor > 22 || (minor === 22 && patch >= 3);
  }
  return false;
}

function runCorepackPnpm(args) {
  if (process.platform === 'win32') {
    run('cmd.exe', ['/d', '/s', '/c', 'corepack', 'pnpm', ...args]);
    return;
  }

  run('corepack', ['pnpm', ...args]);
}

function runCorepackPnpmText(args) {
  if (process.platform === 'win32') {
    return runText('cmd.exe', ['/d', '/s', '/c', 'corepack', 'pnpm', ...args]);
  }

  return runText('corepack', ['pnpm', ...args]);
}

function runText(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    shell: options.shell ?? false,
  });

  const output = options.mergeStdErr
    ? `${result.stdout ?? ''}${result.stderr ?? ''}`
    : (result.stdout ?? '');

  if (result.status !== 0) {
    fail(
      `Command failed: ${command} ${args.join(' ')}\n${result.stdout ?? ''}${result.stderr ?? ''}`,
    );
  }

  return output.trim();
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: options.shell ?? false,
    env: options.env ?? process.env,
  });

  if (result.status !== 0) {
    fail(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function executable(name) {
  if (process.platform !== 'win32') {
    return name;
  }

  if (name === 'git' || name === 'java') {
    return `${name}.exe`;
  }

  return name;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
