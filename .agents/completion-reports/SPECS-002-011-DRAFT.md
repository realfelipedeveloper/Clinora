# Relatorio de Preparacao de Specs

## Objetivo
Detalhar as Releases 1-10 para revisão, sem implementar funcionalidades ainda
não aprovadas.

## Alteracoes
- SPEC-002 a SPEC-011 em `specs/`, cada uma com objetivo, regras, riscos,
  critérios de aceite, testes e tarefas propostas.
- Índice e roadmap apontam para os rascunhos; somente SPEC-001 permanece
  `APPROVED` e ativa.
- Teste automatizado lê a tabela Markdown, confere links reais, release,
  status e presença de tarefas; casos adulterados devem falhar.

## Concorrencia, tempo, ameacas e privacidade
As specs de disponibilidade, consulta e lista de espera exigem testes de
concorrência e timezone antes de qualquer implementação. Todas exigem tenant
validado, bancos isolados e proteção de dados de saúde. Nenhuma regra de
negócio, banco ou contrato runtime foi alterado neste PR.

## Testes
- `node --test tools/specs.test.mjs`: três testes aprovados localmente;
  `tools:test`: 38 testes aprovados.
- `verify` e CI: pendentes do PR documental.

## Limite e aprovação
O usuário autorizou preparar e submeter as specs, não aprovou ainda sua
implementação. Status `DRAFT` permanece até aprovação explícita. A SPEC-001
continua como única spec ativa.

## Documentacao e memoria
Índice, roadmap, README, matriz de regressão, lessons-learned e este relatório
atualizados.

## Status final
Preparadas para revisão, sem implementação das Releases 1-10.
