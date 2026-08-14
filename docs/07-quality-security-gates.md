# Quality e Security Gates

## Backend
Maven verify, formatter, Checkstyle, PMD, SpotBugs, unit, integration, ArchUnit, Testcontainers, Flyway validation, contracts e PIT.

## Frontend
Lint, format, TypeScript strict, Vitest, accessibility, Storybook tests, build e Playwright.

## E2E críticos
Cadastro, login/MFA, paciente, profissional, disponibilidade, hold, confirmação, reagendamento, cancelamento, lista de espera, pagamento, notificação e isolamento entre tenants.

## Bloqueios
Falha de teste anterior, possibilidade de dupla reserva, contrato quebrado, migration inválida, segredo detectado, vulnerabilidade alta/crítica, vazamento em logs ou queda de cobertura.
