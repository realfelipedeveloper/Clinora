# SPEC-001 / TASK-035 / HOTFIX-01

## Problema e impacto
PRs de promocao criados por `GITHUB_TOKEN` em `homologation` e `main`
geravam runs `pull_request` com `failure` e zero jobs, disparando e-mails
de falha mesmo com o gate efetivo por `workflow_dispatch` aprovado.

## Correcao e teste de regressao
- `tools/quality-status.test.mjs` reproduz a configuracao defeituosa antes
  da correcao e exige PR automatico somente em `development`, preservando
  `workflow_dispatch` e o disparo da workflow de promocao.
- `quality.yml` deixa de criar runs de PR nas bases de promocao; o comando
  `verify`, o smoke Compose e o publicador do status obrigatorio permanecem.

## Camadas e lacunas
- Unidade/estrutura: teste de gatilhos GitHub Actions.
- Integracao: `corepack pnpm run verify` local aprovado (54 testes de scripts,
  Java, Angular, 16 E2E e auditoria de producao sem vulnerabilidades
  conhecidas); CI remoto nos PRs protegidos ainda pendente.
- E2E: o fluxo de PR e status no GitHub e validado remotamente; nao ha E2E
  de navegador para esta mudanca de CI.
- Seguranca: nenhuma permissao foi ampliada; workflows de PR nao usam
  `pull_request_target` para executar codigo de feature com token de escrita.

## Concorrencia, tempo e privacidade
Sem mudanca de reserva, fuso horario, tenant ou dados clinicos. O status
continua vinculado ao SHA atual do PR, impedindo aprovar resultado antigo.

## Documentacao e memoria
Runbooks de qualidade/Git Flow e `.agents/lessons-learned.md` atualizados.

## Status
Verificacao local aprovada; pendente CI remoto e promocao pelo Git Flow.
