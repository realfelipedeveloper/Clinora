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
| 006-010 | Cinco servicos HTTP | Dez testes Spring Boot em porta aleatoria verificam health e observabilidade por servico | Readiness em containers: TASK-027/029 |
| 011 | Verificador HTTP compartilhado | Oito testes JUnit/Mockito/AssertJ cobrem resposta, URL loopback, privacidade e erros; JaCoCo exige 80% das linhas da classe | Nenhuma lacuna conhecida no contrato atual |
| 012 | Actuator e Prometheus | Testes HTTP dos cinco servicos e testes unitarios do verificador | Verificacao de metricas e logs em CI: TASK-035/036 |
| 013-014, 017 | Web Angular, tokens e landing | Quatro testes Vitest verificam identidade pt-BR, secoes e links externos seguros; cobertura com pisos 50% statements/funcoes, 90% branches, 25% linhas; `ng build web` valida CSS; Playwright cobre desktop/mobile, imagem, ancoras, viewport estreito, overflow e axe-core WCAG A/AA | Acessibilidade manual complementar ainda necessaria |
| 018 | Portal docs | Vitest cobre catalogo, busca, rota arbitraria, HTML malicioso, erro HTTP e troca rapida de pagina; build copia Markdown; Playwright desktop/mobile cobre leitura real, busca, navegacao, rota invalida, overflow e axe-core WCAG A/AA | Acessibilidade manual complementar ainda necessaria |
| 019 | Docker Compose | Testes estruturados de `docker compose config` cobrem sete servicos, namespace, loopback, portas, usuario sem root, readiness, mounts somente leitura e override; smoke no CI sobe containers, espera healthchecks e consulta todos os endpoints | Runtime local depende do Docker Desktop ativo |
| 020 | PostgreSQL local | Teste estrutural valida porta em loopback, volume, SCRAM, credenciais distintas e ausencia de senhas nas APIs; smoke no CI conecta cada papel ao proprio banco e rejeita acesso cruzado aos quatro bancos | Rotacao de senha em volume persistente requer operacao explicita |
| 015 | Sete componentes UI | Dez testes Vitest cobrem formulario, estados, modal e semantica; pisos 85% statements/branches, 70% funcoes, 90% linhas | Interacao E2E e axe-core: TASK-031/032 |
| 016 | Storybook | Build estatico e smoke test executados na TASK-016; build permanente no `verify` e CI | Smoke test de servidor em CI ainda pendente |
| 035-044 | CI, auditoria e status de qualidade | `verify` em PR; testes unitarios de run, SHA, fork, falha, timeout e permissao isolada; prova automatica nos PRs #62-#64; verificador da protecao das tres bases; merges protegidos #65-#67 | Forks precisam de fluxo proprio |

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
`corepack pnpm run verify` em PRs para as tres branches base. A workflow de
publicacao confere run concluido, PR aberto, repositorio e SHA antes de
registrar `clinora/qualidade`; o job isolado de TASK-043 solicita a publicacao
ao fim da qualidade, inclusive se o gate falhar.
Forks ainda nao sao elegiveis para esse status.
