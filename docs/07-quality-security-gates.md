# Quality e Security Gates

## Estado executavel da fundacao
`corepack pnpm run verify` executa `doctor`, testes do guard Git, `mvnw verify`,
instalacao pnpm congelada, verificacao de peers, testes Vitest da web e UI,
builds web/UI e build estatico do Storybook. A workflow `Qualidade Clinora`
executa o mesmo comando em PRs para `development`, `homologation` e `main`.
Veja `docs/17-regression-tests.md` para cobertura real e lacunas retroativas.

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
