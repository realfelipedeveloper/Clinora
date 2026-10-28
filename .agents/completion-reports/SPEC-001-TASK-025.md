# Relatorio de Conclusao

## Tarefa
SPEC-001, TASK-025: Prometheus e Grafana locais.

## Objetivo e impacto
Coletar metricas de infraestrutura dos cinco servicos Java da SPEC-001 em
ambiente de desenvolvimento, sem labels clinicos nem exposicao externa.

## Alteracoes
- Prometheus 3.15.1 e Grafana 13.3.0 no Compose, portas 44281/44280 em
  loopback, volumes proprios, datasource provisionado e Grafana autenticado.
- Perfil `observability` ativado nos cinco Java somente no Compose. Retencao
  Prometheus de um dia; reporting e update checks do Grafana desabilitados.

## Testes novos e camadas
- Unidade/estrutura: `tools/compose.test.mjs` falhou antes da implementacao
  pela ausencia dos servicos; cobre imagens, portas, mounts, perfil, cinco
  targets, datasource, autenticacao e overrides.
- Integracao/seguranca: `tools/compose-smoke.mjs` no CI verifica readiness,
  scrape saudavel dos cinco Java, datasource e API Grafana negada sem login.
- E2E navegador de produto nao se aplica: dashboards sao ferramenta local,
  sem fluxo de pacientes ou agenda nesta spec.

## Concorrencia, tempo, ameacas e privacidade
Nao ha reservas, tenant ou instantes globais nesta alteracao. Prometheus
nao possui autenticacao nesta stack: publicar apenas em loopback e nunca
enviar dados clinicos ou identificadores como labels. Grafana usa senha
conhecida somente para desenvolvimento, substituivel por variavel local.

## Validacao
Teste estrutural falhou antes e passou 12/12 depois. `pnpm run verify` local
passou scripts, Maven, Angular, Storybook, 16 E2E e auditoria; esta reporta
7 vulnerabilidades dentro dos limites atuais, nao ausencia de risco. Smoke
Linux passou no PR #98 (run 40596282964), incluindo cinco targets saudaveis,
datasource autenticado e acesso anonimo negado. Docker Desktop local indisponivel
por permissao do servico Windows.

## Documentacao e memoria
Runbook, guia de observabilidade, infra, matriz de regressao, active-feature
e lessons-learned atualizados. Promovida por PRs protegidos #98, #99 e #100.
