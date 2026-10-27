# Relatorio de Conclusao

## Tarefa
SPEC-001, TASK-017: landing Clinora.

## Objetivo
Apresentar a Clinora em pt-BR sem simular funcionalidades clinicas ainda fora
do escopo da fundacao.

## Alteracoes
- Landing Angular responsiva com hero fotografico local, secoes Visao e
  Andamento, ancoras funcionais e links para o repositorio oficial.
- Estado de desenvolvimento expresso na propria pagina, sem formularios ou
  promessas de agenda ja disponivel.
- Testes unitarios e E2E ampliados para conteudo, links, imagem, navegacao,
  viewport estreito, overflow e acessibilidade automatizada.
- Documentacao de uso e matriz de regressao atualizadas.

## Analise de impacto
- Somente a web publica foi alterada; contratos HTTP e servicos inalterados.
- A imagem local evita dependencia de terceiros em runtime.
- O link externo abre nova aba com `noopener noreferrer`.

## Concorrencia, tempo, seguranca e privacidade
- Nenhuma reserva, tenant, banco, dado de saude ou instante global e tratado.
- A landing nao coleta dados nem faz chamadas a APIs.
- O servidor de desenvolvimento usa somente a porta reservada 44210 em
  loopback, validada livre antes de iniciar.

## Testes
- Quatro testes Vitest da web aprovados.
- `verify` completo aprovado: 30 testes de scripts, Maven/JaCoCo,
  quatro testes da web, dez da biblioteca UI, builds Angular/Storybook,
  oito E2E desktop/mobile e auditorias configuradas.
- Playwright validou imagem carregada, ancoras, viewport de 320 px,
  ausencia de overflow e axe-core WCAG A/AA sem violacoes detectadas.
- Capturas desktop, mobile e 320 px revisadas, com ajuste do enquadramento
  mobile e da legibilidade do texto.
- CI Linux aprovado nos PRs #71, #72 e #73, com status obrigatorio
  `clinora/qualidade` em todas as etapas.

## Limites
- Axe-core nao substitui avaliacao manual de acessibilidade.
- Agenda, autenticacao, cadastros e integracoes exigem specs futuras.
- A auditoria reportou sete alertas em dependencias de desenvolvimento
  (dois altos); nenhum aviso conhecido em dependencias de producao. O gate
  rejeita criticas, sem enfraquecer testes ou criar excecoes.

## Rollback
Reverter por PR, preservando a suite de regressao existente.

## Documentacao e memoria
README, guia frontend, runbook local, matriz de testes, active-feature,
lessons-learned e este relatorio atualizados.

## Status final
Concluida e promovida ate `main` em 2026-10-27. As arvores de `development`,
`homologation` e `main` foram conferidas como identicas.
