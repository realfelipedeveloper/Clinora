# Workspace Frontend

## Escopo
Fundacao Angular/pnpm da SPEC-001, TASK-003.

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
O workspace Angular esta na raiz, sem aplicacao inicial.

```text
angular.json
tsconfig.json
pnpm-workspace.yaml
apps/
libs/typescript/
```

`angular.json` usa `newProjectRoot: apps`, entao aplicacoes futuras devem ser geradas em
`apps/*`.

## Comandos

```powershell
fnm use
corepack prepare pnpm@11.20.0 --activate
corepack pnpm install
corepack pnpm peers check
corepack pnpm frontend:version
```

O workspace registra uma excecao de peer transitivo para `listr2@10.2.2`, porque
`@angular/cli@22.1.4` declara essa versao diretamente enquanto
`@listr2/prompt-adapter-inquirer@4.2.4` ainda pede `10.2.1`.

As configuracoes pnpm ficam em `pnpm-workspace.yaml`, conforme pnpm 11.

## Proximos projetos
- `apps/web`: entra na TASK-013.
- `apps/docs`: entra na TASK-018.

## Seguranca e privacidade
- Nenhum dado sensivel de saude introduzido.
- Nenhum segredo real criado.
- Nenhuma aplicacao de produto criada nesta tarefa.
- `engineStrict` bloqueia Node fora da faixa suportada pelo Angular 22.
