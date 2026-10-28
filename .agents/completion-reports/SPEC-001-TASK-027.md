# Relatorio de Conclusao

## Tarefa
SPEC-001, TASK-027: health/readiness sob degradacao.

## Objetivo e impacto
Provar que os cinco servicos Java param de aceitar trafego quando nao estao
prontos, sem reportar o processo como morto ou expor componentes internos.

## Testes novos e camadas
- Unidade: quatro testes JUnit/Mockito do verificador cobrem estado degradado,
  readiness falso positivo, liveness indisponivel e detalhes internos.
- Integracao HTTP: cinco testes Spring Boot em porta aleatoria publicam
  `REFUSING_TRAFFIC`, exigem readiness 503/OUT_OF_SERVICE e liveness 200/UP,
  e restauram `ACCEPTING_TRAFFIC` em `finally`.
- E2E navegador nao se aplica a probes de infraestrutura. O smoke de Compose
  ja confirma readiness 200 dos cinco containers; nao injeta falha no runner.
- Seguranca: os corpos de probe nao podem listar componentes internos; o
  verificador existente rejeita `/actuator/env` exposto no perfil padrao.

## Concorrencia, tempo, ameacas e privacidade
Nenhuma reserva, tenant, dado clinico ou instante global. Cada teste restaura
o estado de disponibilidade para nao interferir em outros cenarios. Os probes
nao devem revelar detalhes de dependencias nem dados sensiveis.

## Validacao
Teste novo falhou na compilacao antes da implementacao de `verifyNotReady`.
`mvnw verify` e `pnpm run verify` passaram localmente depois da implementacao,
incluindo 53 testes de ferramentas, Maven, Angular/Storybook, 16 E2E e
auditoria. Esta registrou 8 alertas em dependencias de desenvolvimento
(2 low, 4 moderate, 2 high) dentro do gate, nenhum em producao. Smoke real
de CI e promocao protegida pendentes nesta etapa.

## Documentacao e memoria
Guia de observabilidade, matriz de regressao, active-feature e
lessons-learned atualizados.
