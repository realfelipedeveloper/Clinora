# Relatorio de Conclusao

## Tarefa
SPEC-001, TASK-022: RabbitMQ local com fila e DLQ de teste.

## Objetivo e impacto
Disponibilizar topologia de teste importada no boot, sem conectar servicos ou
introduzir mensageria clinica antes de spec de negocio ativa.

## Alteracoes
- Broker RabbitMQ em Compose com AMQP e painel apenas em loopback, volume
  proprio, vhost e usuario local sem `guest`.
- Duas exchanges, fila principal e DLQ de teste com routing keys explicitas.
- Senha de desenvolvimento versionada apenas como hash nas definicoes.

## Testes novos e camadas
- Unidade/estrutura: `tools/compose.test.mjs` valida imagem, portas, mounts,
  hash, usuario, vhost, exchanges, filas, bindings e override de portas. O
  teste falhou antes da implementacao pela ausencia do broker.
- Integracao/seguranca: `tools/compose-smoke.mjs` no CI inicia containers,
  rejeita acesso anonimo e `guest`, valida a topologia real, publica mensagem
  de teste, rejeita sem requeue e exige chegada na DLQ com `x-death`.
- E2E de navegador nao se aplica: o painel e ferramenta operacional de teste,
  sem fluxo de produto nesta spec. AMQP entre apps fica para specs posteriores.

## Concorrencia, tempo, ameacas e privacidade
Nao ha reserva, tenant, dados clinicos ou instantes globais nesta mudanca.
A topologia local nao garante entrega em cluster; outbox, confirms,
idempotencia e isolamento de servicos entram com regras de negocio futuras.
Senha conhecida serve somente a desenvolvimento em loopback e nao deve ser
usada para ambientes reais. Nenhuma API recebe credencial nesta task.

## Validacao
`corepack pnpm run verify` local aprovado: 38 testes de scripts, Maven,
testes e builds Angular/Storybook, 16 E2E Playwright/axe-core e auditoria
nos limites documentados. Os oito testes estruturais Compose passaram.
Depois do rebase sobre o hotfix, `tools:test` passou com 39 testes.
Docker Desktop local continua sem permissao para iniciar o servico; smoke
real do broker e promocao protegida ainda dependem do CI.

## Documentacao e memoria
Runbook, infra/docker/README, matriz de regressao, active-feature,
lessons-learned e relatorio TASK-021 atualizados.
