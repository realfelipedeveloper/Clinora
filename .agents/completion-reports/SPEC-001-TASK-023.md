# Relatorio de Conclusao

## Tarefa
SPEC-001, TASK-023: Mailpit local para capturar email de teste.

## Objetivo e impacto
Disponibilizar captura SMTP e inspecao local, sem conectar APIs clinicas nem
habilitar envio real antes de uma spec de notificacoes ativa.

## Alteracoes
- Mailpit 1.32.0 em Compose, SMTP/UI somente em loopback, sem volume, usuario
  sem root, filesystem somente leitura e `/tmp` temporario.
- UI/API com HTTP Basic, allowlist Host, retencao limitada e destinatarios
  SMTP restritos a `@example.test`. Sem relay ou encaminhamento.

## Testes novos e camadas
- Unidade/estrutura: `tools/compose.test.mjs` reproduziu a ausencia do
  servico antes da mudanca; agora verifica imagem, portas, efemeridade,
  isolamento, autenticacao, limites, filtro e override.
- Integracao/seguranca: `tools/compose-smoke.mjs` no CI sobe o container,
  testa SMTP aceito/rejeitado, captura pela API, HTTP Basic e Host indevido.
- Regressao do probe Host: o primeiro CI do PR #95 recebeu 200 com `fetch`
  onde esperava 403. Um teste estrutural novo falhou antes da correcao;
  o probe passou a enviar `Host` explicitamente via `node:http`.
- E2E de produto nao se aplica: nenhuma API da SPEC-001 envia mensagens.
  O smoke de ponta a ponta SMTP -> API cobre a infraestrutura local.

## Concorrencia, tempo, ameacas e privacidade
Sem reserva, tenant, dados clinicos ou horario global nesta alteracao.
SMTP local sem TLS e senha de desenvolvimento sao exclusivos do host isolado;
nao usar dados reais. O filtro de destinatarios e barreira de teste, nao
politica de autorizacao de producao. Nenhum outro servico recebe credenciais.

## Validacao
O teste estrutural falhou antes da implementacao e passou 10/10 depois;
o teste do probe Host falhou antes da correcao e a suite passou 11/11 depois.
`node --check tools/compose-smoke.mjs` passou. `pnpm run verify` local passou:
scripts, Maven, Angular, Storybook, 16 E2E Playwright/axe-core e auditoria.
A auditoria reportou 7 vulnerabilidades (1 baixa, 4 moderadas, 2 altas),
dentro dos limites atuais; isso nao significa ausencia de risco. O smoke
Linux passou no PR #95 (run 40594103946), incluindo SMTP aceito e
rejeitado, autenticacao negativa, Host indevido e captura pela API. Docker
Desktop local segue sem permissao para iniciar `com.docker.service`.

## Documentacao e memoria
README, runbook, infra/docker/README, matriz de regressao, active-feature e
lessons-learned atualizados. A TASK-023 foi promovida pelos PRs #95, #96 e
#97 com status obrigatorio; as arvores de development, homologation e main
terminaram identicas.
