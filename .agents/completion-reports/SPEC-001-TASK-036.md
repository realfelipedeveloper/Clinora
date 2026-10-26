# Relatorio de Conclusao

## Tarefa
SPEC-001, TASK-036: cobertura e gates de seguranca.

## Objetivo
Medir cobertura de producao, bloquear regressoes basicas de cobertura e
dependencias, e preparar status de qualidade exigivel nas branches protegidas.

## Arquivos alterados
- JaCoCo no parent POM, cobertura Angular/Vitest, provider V8 e lockfile.
- Scripts de auditoria e publicador de status com workflow isolada.
- Testes do publicador, runbooks e memoria.

## Decisoes
- JaCoCo 0.8.15 exige 80% de linhas por classe Java com logica; apenas
  `*Application` de bootstrap e excluida do check, nao do relatorio.
- Angular mede todos os TS de producao; web tem pisos 50/90/50/25 e UI
  85/85/70/90 para statements/branches/funcoes/linhas, respectivamente.
- Auditoria falha para aviso alto/critico em producao ou critico no total.
- `workflow_run` publica `clinora/qualidade` apenas para PR aberto do mesmo
  repositorio e SHA do run; codigo de PR nao e executado no job com escrita.

## Testes
- Publicador: 11 cenarios unitarios de sucesso, falha, SHA obsoleto,
  approval pendente, promocao, fork, destino incorreto e falha de API.
- Scripts: 16 testes verdes apos os casos adicionais; `verify` completo
  iniciou com 13 e terminou verde, e os 3 novos passaram em `tools:test`.
- JaCoCo: limite artificial de 95% falhou antes do piso real de 80%; o
  modulo de suporte mede 30/36 linhas e 9/10 branches.
- Angular: limite artificial de 80% de linhas na web falhou contra 25%; os
  pisos medidos passaram (web 2 testes, UI 10).
- `verify`: 18 testes Java, 12 Angular, builds web/UI/Storybook, lockfile
  congelado, peers e auditorias aprovados localmente.
- Prettier e `git diff --check`: aprovados.

## Seguranca, privacidade, concorrencia e tempo
- Workflow de PR permanece somente leitura. Workflow de publicacao recebe
  apenas `contents: read` e `statuses: write`, faz checkout de `development`
  e rejeita run/PR de fork ou SHA divergente.
- Zero vulnerabilidades conhecidas em producao; nenhuma critica no conjunto
  total no momento da auditoria.
- Nenhum dado de paciente, tenant, reserva ou instante global foi alterado.

## Riscos residuais
- Dois avisos altos transitivos em ferramentas de desenvolvimento
  (`webpack-dev-middleware` e `vite`) permanecem sem atualizacao compativel
  com a politica de idade minima. Nao declarar ausencia de altos no total.
- PRs de fork nao recebem `clinora/qualidade`; a protecao por status deve
  ser habilitada somente para o fluxo interno ate existir estrategia segura.
- `workflow_run` e branch protection exigem validacao remota apos merge.
- E2E, contratos, SAST, SBOM e SCA Java ainda dependem de tarefas futuras;
  esta tarefa nao os declara concluidos.
- Bootstrap web tem cobertura de linha baixa (25%); E2E da TASK-032 deve
  exercitar inicializacao real do navegador.

## Rollback
Reverter por PR, preservando os testes anteriores. Para protecao remota,
alterar apenas o status check desta tarefa se houver falha comprovada.

## Documentacao e memoria
Guias de qualidade, Java, frontend, scripts, Git Flow, matriz retroativa,
active-feature e lessons-learned atualizados.

## Status final
Concluida localmente; publicacao e verificacao remota pendentes.
