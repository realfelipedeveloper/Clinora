# Workspace Frontend

## Escopo
Fundacao Angular/pnpm da SPEC-001, TASK-003 e TASK-013.

## Versoes
- Node `24.15.0`
- pnpm `11.20.0`
- Angular CLI `22.1.4`
- Angular framework `22.1.x`
- TypeScript `6.0.x`
- RxJS `7.8.x`

Angular 22 exige Node `^22.22.3`, `^24.15.0` ou `>=26.0.0`. O projeto fixa
`.node-version` em `24.15.0`.

## Estrutura
O workspace Angular esta na raiz e inclui a aplicacao `web`.

```text
angular.json
tsconfig.json
pnpm-workspace.yaml
apps/
  web/
libs/typescript/
```

`angular.json` usa `newProjectRoot: apps`; a aplicacao `web` foi gerada em
`apps/web` com roteamento e Vitest. A interface inicial usa `pt-BR` e
nao acessa APIs nem dados de saude.

## Comandos

```powershell
fnm use
corepack prepare pnpm@11.20.0 --activate
corepack pnpm install
corepack pnpm peers check
corepack pnpm frontend:version
corepack pnpm web:test
corepack pnpm web:build
corepack pnpm web:serve
```

O workspace registra uma excecao de peer transitivo para `listr2@10.2.2`, porque
`@angular/cli@22.1.4` declara essa versao diretamente enquanto
`@listr2/prompt-adapter-inquirer@4.2.4` ainda pede `10.2.1`.

As configuracoes pnpm ficam em `pnpm-workspace.yaml`, conforme pnpm 11.

## Proximos projetos
- `apps/web`: Tailwind, componentes, Storybook e landing entram nas TASK-014 a TASK-017.
- `apps/docs`: entra na TASK-018.

## Seguranca e privacidade
- Nenhum dado sensivel de saude introduzido.
- Nenhum segredo real criado.
- Aplicacao sem dados clinicos, integracoes ou regras de negocio nesta etapa.
- `engineStrict` bloqueia Node fora da faixa suportada pelo Angular 22.
