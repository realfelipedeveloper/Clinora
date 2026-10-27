# Relatorio de Preparacao de Specs

## Objetivo
Detalhar as Releases 1-10, registrar a aprovação condicionada e manter a
implementação inativa até CI e merge.

## Alteracoes
- SPEC-002 a SPEC-011 em `specs/`, cada uma com objetivo, regras, riscos,
  critérios de aceite, testes e tarefas propostas.
- Índice e roadmap apontam para as dez specs aprovadas pelo usuário; somente
  SPEC-001 permanece ativa durante a fundação.
- Teste automatizado lê a tabela Markdown, confere links reais, release,
  status e presença de tarefas; casos adulterados devem falhar.

## Concorrencia, tempo, ameacas e privacidade
As specs de disponibilidade, consulta e lista de espera exigem testes de
concorrência e timezone antes de qualquer implementação. Todas exigem tenant
validado, bancos isolados e proteção de dados de saúde. Nenhuma regra de
negócio, banco ou contrato runtime foi alterado neste PR.

## Testes
- Unidade/integração documental: `node --test tools/specs.test.mjs` passou com
  três testes de índice, links, arquivos, status de spec/tasks e spec ativa.
  O teste de status aprovado falhou antes da atualização dos arquivos.
- `corepack pnpm run verify` local passou: 43 testes de scripts, Maven,
  Angular/Storybook, 16 E2E Playwright/axe-core e auditoria nos limites
  documentados. CI do SHA aprovado permanece pendente.
- E2E e segurança de domínio não se aplicam a este PR sem código runtime;
  as exigências específicas estão em cada spec e serão testadas por feature.

## Limite e aprovação
O usuário aprovou explicitamente SPEC-002 a SPEC-011 após CI e merge do PR
#82. O status aprovado nesta branch só entra em vigor quando o PR for
mesclado; SPEC-001 continua como única spec ativa até completar a fundação.
Nenhuma feature de Releases 1-10 foi implementada neste PR.

## Documentacao e memoria
Índice, roadmap, README, matriz de regressão, lessons-learned e este relatório
atualizados.

## Status final
Aguardando CI e merge protegido; implementação de Releases 1-10 ainda inativa.
