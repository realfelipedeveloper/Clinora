# Quality e Security Gates

## Estado executavel da fundacao
`corepack pnpm run verify` executa `doctor`, testes do guard Git, `mvnw verify`,
instalacao pnpm congelada, verificacao de peers, testes Vitest da web e UI,
builds web/UI, build estatico do Storybook, Playwright/axe-core e auditoria pnpm. A workflow `Qualidade Clinora`
executa o mesmo comando em PRs para `development`, `homologation` e `main`.
Veja `docs/17-regression-tests.md` para cobertura real e lacunas retroativas.

JaCoCo exige 80% de linhas por classe Java com logica, excluindo apenas
`*Application` (bootstrap validado por testes HTTP). Angular mede todos os
arquivos TS de producao e aplica os pisos registrados em `angular.json`.
`security:check` bloqueia avisos altos/criticos de dependencias de producao e
criticos no conjunto total. Dois avisos altos transitivos de ferramentas de
desenvolvimento permanecem documentados ate haver correcao compativel.

`Publicar status de qualidade` recebe o ID de um run da workflow
oficial e transforma o resultado em status de commit `clinora/qualidade`
somente para PR aberto do proprio repositorio com SHA identico ao run.
TASK-042 validou o ciclo manual nos PRs de promocao #59 e #61. A TASK-043
dispara o publicador automaticamente apos o gate, inclusive quando ele falha;
o publicador aguarda por tempo limitado a conclusao do run (90 consultas com
intervalo de quatro segundos, job limitado a dez minutos). Falha de API ou
run nao oficial encerra imediatamente, sem publicar sucesso. O job com escrita
nao faz checkout do PR. O disparo automatico foi validado nos PRs #62-#64 e
o status agora e obrigatorio nas tres branches base. PRs de forks ainda nao
recebem esse status e nao devem ser aceitos por esse fluxo ate haver solucao.

Os itens abaixo sao o contrato de qualidade do projeto, nao uma declaracao
de que todos os gates ja foram implementados na SPEC-001.

## Backend
Maven verify, formatter, Checkstyle, PMD, SpotBugs, unit, integration, ArchUnit, Testcontainers, Flyway validation, contracts e PIT.

## Frontend
Lint, format, TypeScript strict, Vitest, accessibility, Storybook tests, build e Playwright.

## E2E críticos
Cadastro, login/MFA, paciente, profissional, disponibilidade, hold, confirmação, reagendamento, cancelamento, lista de espera, pagamento, notificação e isolamento entre tenants.

## Bloqueios
Falha de teste anterior, possibilidade de dupla reserva, contrato quebrado, migration inválida, segredo detectado, vulnerabilidade alta/crítica, vazamento em logs ou queda de cobertura.
