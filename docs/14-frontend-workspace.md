# Workspace Frontend

## Escopo
Fundacao Angular/pnpm da SPEC-001, TASK-003, TASK-013 e TASK-014.

## Versoes
- Node `24.15.0`
- pnpm `11.20.0`
- Angular CLI `22.1.4`
- Angular framework `22.2.x`
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
`apps/web` com roteamento e Vitest. A landing usa `pt-BR`, uma imagem local da
recepcao e links de navegacao para as secoes Visao e Andamento. Ela informa
que a plataforma ainda esta em desenvolvimento; nao acessa APIs nem dados de
saude.

A TASK-015 adiciona a biblioteca Angular `clinora-ui` em
`libs/typescript/clinora-ui`, com componentes compartilhados e testes Vitest.

Tailwind CSS 4 usa `@tailwindcss/postcss` em `.postcssrc.json` e tokens CSS
em `apps/web/src/styles.css`. Nao ha configuracao JavaScript de tema. Os
tokens `ink`, `brand`, `accent`, `muted`, `line`, `surface` e `paper` geram
classes utilitarias e variaveis CSS. Componentes podem consumir as mesmas
variaveis com `var(--color-*)`.

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
corepack pnpm ui:test
corepack pnpm ui:build
corepack pnpm ui:storybook
corepack pnpm ui:storybook:build
corepack pnpm e2e:install
corepack pnpm e2e:test
```

Os alvos `web:test` e `ui:test` geram cobertura V8 e falham abaixo dos pisos
em `angular.json`. Web: 50% statements/funcoes, 90% branches e 25% linhas.
Clinora UI: 85% statements/branches, 70% funcoes e 90% linhas. Todos os
arquivos TS de producao entram na medicao; specs e historias ficam fora.
Relatorios locais ficam em `coverage/web` e `coverage/clinora-ui`.

Playwright testa Chromium desktop e mobile, idioma, imagem carregada,
navegacao entre secoes, viewport estreito e ausencia de overflow; axe-core
verifica violacoes WCAG A/AA detectaveis automaticamente.
`verify` e CI executam o smoke E2E. O CI instala Chromium e dependencias de
sistema antes da suite. O servidor de teste usa `127.0.0.1:44210` e nao
reutiliza processos existentes nessa porta.

O workspace registra uma excecao de peer transitivo para `listr2@10.2.2`, porque
`@angular/cli@22.1.4` declara essa versao diretamente enquanto
`@listr2/prompt-adapter-inquirer@4.2.4` ainda pede `10.2.1`.

As configuracoes pnpm ficam em `pnpm-workspace.yaml`, conforme pnpm 11.

## Proximos projetos
- `apps/web`: landing da TASK-017; Storybook da biblioteca na TASK-016.
- `apps/docs`: entra na TASK-018.

## Seguranca e privacidade
- Nenhum dado sensivel de saude introduzido.
- Nenhum segredo real criado.
- Aplicacao sem dados clinicos, integracoes ou regras de negocio nesta etapa.
- `engineStrict` bloqueia Node fora da faixa suportada pelo Angular 22.
