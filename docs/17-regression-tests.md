# Testes de regressao

Toda correcao, feature, hotfix e regra de negocio deve trazer testes
automatizados que cubram o comportamento alterado e o caso adverso relevante.
Quando um bug for reproduzivel, o teste deve falhar antes da correcao. O
relatorio de cada tarefa registra comandos, resultados e lacunas; nao basta
afirmar que a suite anterior continuou verde.

## Inventario retroativo da SPEC-001

| Tarefas | Comportamento | Cobertura automatizada atual | Lacuna e tarefa de fechamento |
| --- | --- | --- | --- |
| 001-005 | Estrutura, toolchain, scripts e Git Flow | `doctor` valida toolchain, workspace e remote; cinco testes de caixa-preta cobrem as duas URLs oficiais, fetch/push incorretos e falta de `origin`; testes unitarios cobrem publicacao segura do status de qualidade; commitlint local | Testes de falha de configuracao e politica de branch/PR ainda pendentes |
| 006-010 | Cinco servicos HTTP | Dez testes Spring Boot em porta aleatoria verificam health e observabilidade por servico; TASK-027 acrescenta cinco testes HTTP de recusa de trafego com readiness 503 e liveness 200 | Dependencias reais em containers: TASK-029 |
| 011 | Verificador HTTP compartilhado | Treze testes JUnit/Mockito/AssertJ e HTTP efemero cobrem resposta, URL loopback, privacidade, erros e readiness degradado; JaCoCo exige 80% das linhas da classe | Nenhuma lacuna conhecida no contrato atual |
| 012 | Actuator e Prometheus | Testes HTTP dos cinco servicos e testes unitarios do verificador | Verificacao de metricas e logs em CI: TASK-035/036 |
| 013-014, 017 | Web Angular, tokens e landing | Quatro testes Vitest verificam identidade pt-BR, secoes e links externos seguros; cobertura com pisos 50% statements/funcoes, 90% branches, 25% linhas; `ng build web` valida CSS; Playwright cobre desktop/mobile, imagem, ancoras, viewport estreito, overflow e axe-core WCAG A/AA | Acessibilidade manual complementar ainda necessaria |
| 018 | Portal docs | Vitest cobre catalogo, busca, rota arbitraria, HTML malicioso, erro HTTP e troca rapida de pagina; build copia Markdown; Playwright desktop/mobile cobre leitura real, busca, navegacao, rota invalida, overflow e axe-core WCAG A/AA | Acessibilidade manual complementar ainda necessaria |
| 019 | Docker Compose | Testes estruturados de `docker compose config` cobrem sete servicos, namespace, loopback, portas, usuario sem root, readiness, mounts somente leitura e override; smoke no CI sobe containers, espera healthchecks e consulta todos os endpoints | Runtime local depende do Docker Desktop ativo |
| 020 | PostgreSQL local | Teste estrutural valida porta em loopback, volume, SCRAM, credenciais distintas e ausencia de senhas nas APIs; smoke no CI conecta cada papel ao proprio banco e rejeita acesso cruzado aos quatro bancos | Rotacao de senha em volume persistente requer operacao explicita |
| 021 | Redis local | Testes estruturais cobrem porta em loopback, processo sem root, filesystem somente leitura, ACL, memoria sem eviccao e cinco senhas distintas; smoke no CI cobre login, escrita/leitura no prefixo proprio, acesso anonimo/cross-service e `FLUSHALL` negados | Redis nao e fonte oficial nem persistente |
| 022 | RabbitMQ local | Teste estrutural cobre duas portas em loopback, usuario/vhost unico, hash de senha, exchanges, filas, bindings e DLQ; smoke no CI rejeita acesso anonimo/`guest`, publica, rejeita sem requeue e confirma `x-death` na DLQ | Sem AMQP de aplicacao ou garantia de entrega em cluster nesta spec |
| 022 hotfix | Publicacao no smoke RabbitMQ | Teste fixa `POST` no endpoint de publicacao; primeiro smoke real retornou 405 para `PUT` antes da correcao; segundo run passou no CI Linux com mensagem na DLQ | Sem lacuna conhecida no smoke atual |
| 023 | Mailpit local | Teste estrutural cobre imagem, portas, filesystem efemero, usuario sem root, autenticacao, allowlist Host, limites e override; smoke CI testa SMTP permitido/negado, UI/API autenticada e Host malicioso | Sem E2E de produto: nenhum fluxo clinico envia email nesta spec; Docker local indisponivel neste host |
| 023 correcao | Probe Host Mailpit | Primeiro CI retornou 200 no probe com `fetch`; teste novo exige `node:http` com `Host` explicito; run 40594103946 passou no CI Linux | Sem lacuna no smoke local; nenhum fluxo de produto nesta spec |
| 024 | Garage S3 local | Teste de spec falhou antes da emenda aprovada; teste estrutural cobre imagem, portas, bucket, volume, token e isolamento das APIs; smoke CI grava/le/exclui objeto ficticio com AWS SDK e nega credenciais invalidas e acesso administrativo anonimo | Sem E2E de produto: nenhum fluxo clinico utiliza objetos nesta spec; Docker local indisponivel neste host |
| 024 correcao | Status de negativa administrativa Garage | Primeiro smoke Linux retornou 403 para acesso anonimo, divergindo da expectativa 401; teste fixa 403 para token ausente/incorreto e 200 para token valido; segundo run 40627426659 passou | Sem lacuna conhecida no contrato local |
| 025 | Prometheus e Grafana locais | Teste estrutural valida imagens, portas loopback, perfil Java, cinco targets, datasource, autenticacao e overrides; smoke Linux run 40596282964 confirmou cinco alvos saudaveis e negou API Grafana anonima | Nao ha fluxo de produto a exercitar em navegador; Prometheus local nao tem autenticacao propria e nao pode ser exposto externamente |
| 026 | Verificador de portas | Quatro testes cobrem Compose/override, exposicao fora de loopback, porta invalida, colisao, bind ocupado/liberado e CLI com override sem encerrar listener; comando real checa 18 reservas | Diagnostico nao reserva portas; outro processo pode ocupa-las apos a checagem |
| 027 | Health/readiness degradado | Quatro testes unitarios do verificador, um HTTP real em porta efemera e cinco testes Spring Boot alteram `ReadinessState` para exigir readiness 503 sem perder liveness 200; smoke CI ja valida readiness UP nos containers; `clean verify` do modulo comprovou 85,7% de linhas sem reduzir piso | Nenhuma dependencia de negocio e conectada aos servicos nesta spec; TASK-029 cobriu PostgreSQL efemero isolado |
| 029 | PostgreSQL com Testcontainers | Tres testes JUnit no CI sobem PostgreSQL 17 efemero em porta mapeada: conexao correta, senha incorreta e bancos de servicos com acesso proprio permitido/cross-service negado; run 40630980744 confirmou 3/3 sem skips | Host Windows sem Docker acessivel marca esses testes skipped; CI Linux e o gate obrigatorio comprovam o runtime |
| 030 | ArchUnit entre servicos Java | Dois testes do verificador exercitam fixture valida e violacao deliberada `core -> payment`; cinco testes de modulo importam somente classes de producao e proíbem dependencias diretas entre pacotes de servicos; JaCoCo do verificador 9/9 linhas | Nao substitui isolamento de banco, autorizacao nem contratos HTTP; estes tem gates proprios |
| 033 | Pact e WireMock para contratos tecnicos | Um teste Pact V4 gera contrato de readiness em porta efemera; dois testes WireMock exercitam `HealthProbeVerifier` sobre HTTP real com resposta saudavel e readiness degradado | Fixture tecnica nao substitui contratos de APIs de negocio; criar contratos consumidor/provedor por operacao nas specs futuras |
| 015 | Sete componentes UI | Dez testes Vitest cobrem formulario, estados, modal e semantica; pisos 85% statements/branches, 70% funcoes, 90% linhas | Interacao E2E e axe-core: TASK-031/032 |
| 016 | Storybook | Build estatico e smoke test executados na TASK-016; build permanente no `verify` e CI | Smoke test de servidor em CI ainda pendente |
| 035-044 | CI, auditoria e status de qualidade | `verify` em PR; testes unitarios de run, SHA, fork, falha, timeout e permissao isolada; prova automatica nos PRs #62-#64; verificador da protecao das tres bases; merges protegidos #65-#67 | Forks precisam de fluxo proprio |
| 035 hotfix | Falsos runs falhos na promocao | Teste de gatilho falhou antes da correcao; `pull_request` somente em `development`, `workflow_dispatch` mantido nas promocoes #117-#118 com status obrigatorio verde e sem runs vazios | PR manual direto para `homologation`/`main` precisa de dispatch explicito |
| Specs 002-011 | Releases 1-10 aprovadas pelo usuário, ainda inativas | Testes do índice Markdown verificam links, arquivos, roadmap, status e divergências; cada `tasks.md` deve indicar aprovação | Implementação depende do CI e merge do PR #82 e de ativação sequencial |

O projeto ainda nao implementa tenant, pacientes, reservas, agenda ou
pagamentos. Portanto nao ha testes desses dominios a declarar nesta spec.
As respectivas specs deverao especificar concorrencia, fuso horario,
isolamento de tenant e privacidade antes de qualquer implementacao.

## Camadas obrigatorias por mudanca

- Unidade: regras puras, limites, erro e transicoes.
- Integracao: contratos entre componentes, banco, fila e servicos fake quando
  existirem; ambientes efemeros sem depender de portas comuns.
- E2E: fluxo principal e cenarios adversos no navegador para interfaces.
- Seguranca: autorizacao, isolamento de tenant, exposicao de dados, entradas
  maliciosas e logs, conforme a superficie alterada.
- Concorrencia e tempo: reservas simultaneas, idempotencia, UTC e timezone
  quando a mudanca tocar nesses dominios.

Camada nao aplicavel precisa de justificativa no relatorio. Teste novo deve
entrar em um script reproduzivel e no gate de CI apropriado. A suite E2E da
TASK-032 roda Chromium em desktop e mobile; ampliar fluxos conforme as features.
Nunca remover ou enfraquecer um teste para liberar pipeline.

## Comandos disponiveis agora

```powershell
corepack pnpm run verify
.\mvnw.cmd verify
corepack pnpm web:test
corepack pnpm ui:test
corepack pnpm web:build
corepack pnpm ui:build
corepack pnpm ui:storybook:build
corepack pnpm e2e:test
corepack pnpm run security:check
```

Os comandos Angular e Playwright exigem Node/pnpm indicados no README. Instale
o navegador com `corepack pnpm e2e:install` antes da primeira execucao local.
O Playwright inicia a web na porta reservada 44210 e falha se ela ja estiver
ocupada; nao reutiliza servidor desconhecido. Testes E2E mais amplos e gates
de seguranca da plataforma ainda precisam de tarefas futuras; `verify` cobre
somente as camadas presentes na matriz. A workflow `Qualidade Clinora` executa
`corepack pnpm run verify` em PRs para `development` e por dispatch nas
promocoes para as demais bases. A workflow de
publicacao confere run concluido, PR aberto, repositorio e SHA antes de
registrar `clinora/qualidade`; o job isolado de TASK-043 solicita a publicacao
ao fim da qualidade, inclusive se o gate falhar.
O teste de regressao do publicador simula mais de 20 consultas pendentes antes
da conclusao do run; a espera permanece finita e rejeita erro de API e run
estranho sem repeticao.
Forks ainda nao sao elegiveis para esse status.
