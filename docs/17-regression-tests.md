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
| 013-014 | Web Angular e tokens Tailwind | Dois testes Vitest verificam identidade pt-BR e classes de token; cobertura com pisos 50% statements/funcoes, 90% branches, 25% linhas; `ng build web` valida CSS | Teste de navegador, responsividade e acessibilidade: TASK-031/032 |
| 015 | Sete componentes UI | Dez testes Vitest cobrem formulario, estados, modal e semantica; pisos 85% statements/branches, 70% funcoes, 90% linhas | Interacao E2E e axe-core: TASK-031/032 |
| 016 | Storybook | Build estatico e smoke test executados na TASK-016; build permanente no `verify` e CI | Smoke test de servidor em CI ainda pendente |
| 035-043 | CI, auditoria e status de qualidade | `verify` em PR; testes unitarios de run, SHA, fork, falha, timeout e permissao isolada do publicador; prova manual nos PRs #59 e #61 | Validar disparo automatico remoto e protecao obrigatoria nas tres bases |

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
TASK-032 ainda precisa ser integrada. Nunca remover ou enfraquecer um teste
para liberar pipeline.

## Comandos disponiveis agora

```powershell
corepack pnpm run verify
.\mvnw.cmd verify
corepack pnpm web:test
corepack pnpm ui:test
corepack pnpm web:build
corepack pnpm ui:build
corepack pnpm ui:storybook:build
corepack pnpm run security:check
```

Os comandos Angular exigem Node/pnpm indicados no README. A suite E2E e os
gates de seguranca amplos ainda nao estao implementados; `verify` cobre
somente as camadas presentes na matriz. A workflow `Qualidade Clinora` executa
`corepack pnpm run verify` em PRs para as tres branches base. A workflow de
publicacao confere run concluido, PR aberto, repositorio e SHA antes de
registrar `clinora/qualidade`; o job isolado de TASK-043 solicita a publicacao
ao fim da qualidade, inclusive se o gate falhar.
Forks ainda nao sao elegiveis para esse status.
