# Relatorio de Conclusao

## Tarefa
SPEC-001, TASK-003: workspace Angular/pnpm.

## Objetivo
Adicionar a fundacao Angular/pnpm sem criar ainda aplicacoes de produto.

## Arquivos alterados
- `.node-version`
- `.prettierrc`
- `angular.json`
- `tsconfig.json`
- `pnpm-workspace.yaml`
- `package.json`
- `pnpm-lock.yaml`
- `docs/14-frontend-workspace.md`
- `docs/11-local-development.md`
- `README.md`
- `.agents/active-feature.json`
- `.agents/lessons-learned.md`
- `.agents/completion-reports/SPEC-001-TASK-003.md`

## Decisoes
- Fixar Node `24.15.0`, menor versao local compativel instalada para Angular 22.
- Manter pnpm `11.20.0`.
- Usar Angular CLI `22.1.4` e Angular framework `22.1.x`.
- Criar workspace Angular vazio na raiz, com `newProjectRoot` em `apps`.
- Nao criar `apps/web` nem `apps/docs` nesta tarefa; ficam para TASK-013 e TASK-018.
- Usar `engineStrict=true` em `pnpm-workspace.yaml` para bloquear Node fora da faixa suportada.

## Testes
- `corepack pnpm install` passou com Node `24.15.0`.
- `corepack pnpm frontend:version` confirmou Angular CLI `22.1.4`, Angular `22.1.2`, Node `24.15.0` e pnpm `11.20.0`.
- `corepack pnpm peers check` encontrou conflito transitivo entre `@angular/cli@22.1.4`, `listr2@10.2.2` e `@listr2/prompt-adapter-inquirer@4.2.4`.
- Adicionada excecao `peerDependencyRules.allowedVersions.listr2=10.2.2` em `pnpm-workspace.yaml`.
- `corepack pnpm peers check` passou apos a excecao documentada.
- `corepack pnpm frontend:workspace` confirmou `pnpm` como package manager do Angular CLI.
- `corepack pnpm install --frozen-lockfile` passou.
- `corepack pnpm commitlint` validou o commit `build(apps): add Angular pnpm workspace`.
- `.\mvnw.cmd verify` passou como regressao da fundacao Java.
- `.agents/active-feature.json` validado como JSON.

## Segurança e privacidade
- Nenhum dado sensivel de saude introduzido.
- Nenhum segredo real criado.
- Nenhuma aplicacao de produto, tenant, agenda ou status de consulta implementado.
- Remoto deve permanecer em `realfelipedeveloper/Clinora`.

## Riscos residuais
- Shells que ainda estiverem em Node `24.14.1` ou `22.22.2` falharao por `engine-strict`.
- Ainda nao ha lint/test/build de apps porque nao ha aplicacao Angular.

## Rollback
Reverter este commit por PR e remover os arquivos de workspace Angular/pnpm.

## Documentação e memória
- `docs/14-frontend-workspace.md` criado.
- README e desenvolvimento local atualizados.
- Memoria persistente atualizada.

## Status final
Concluida.
