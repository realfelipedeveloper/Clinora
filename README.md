# Clinora — Base Oficial de Engenharia

Plataforma SaaS multi-tenant para agendamento de consultas, gestão de disponibilidade, pacientes, profissionais, unidades, recursos, pagamentos e notificações.

## Ordem de leitura
1. docs/01-project-constitution.md
2. AGENTS.md
3. docs/02-agents-and-skills.md
4. docs/03-system-architecture.md
5. docs/04-scheduling-domain.md
6. docs/05-data-privacy-security.md
7. docs/06-engineering-loop.md
8. docs/07-quality-security-gates.md
9. docs/08-mcp-catalog.md
10. docs/09-roadmap.md
11. docs/10-default-config.md
12. docs/11-local-development.md
13. docs/12-git-flow.md
14. docs/13-java-build.md
15. docs/14-frontend-workspace.md
16. docs/15-global-scripts.md
17. docs/16-observability.md
18. docs/17-regression-tests.md
19. specs/001-platform-foundation/spec.md
20. specs/001-platform-foundation/tasks.md
21. specs/README.md — índice das specs aprovadas das Releases 1–10

## Stack
- Java 25 LTS + Spring Boot 4.1 + Maven
- Angular 22 + TypeScript strict + Tailwind CSS
- PostgreSQL + Spring Data JPA + Hibernate + Flyway
- Redis
- RabbitMQ
- MinIO
- Docker Compose
- OpenTelemetry, Prometheus e Grafana
- JUnit 5, Mockito, AssertJ, Testcontainers, REST Assured, ArchUnit, Pact, WireMock, PIT
- Vitest, Angular Testing Library, Storybook, Playwright e axe-core

## Estado do bootstrap
SPEC-001 aprovada. O repositorio foi iniciado pela TASK-001 com a estrutura poliglota em `apps`, `services`, `libs`, `infra` e `tools`.
As SPEC-002 a SPEC-011 foram preparadas para revisão, mas ainda não estão
aprovadas e não autorizam implementação.
As SPEC-002 a SPEC-011 foram preparadas para revisão, mas ainda não estão
aprovadas e não autorizam implementação.

Os servicos `services/core-api`, `services/payment-api` e
`services/notification-api`, `services/integration-api` e
`services/scheduler-worker` estao executaveis, com endpoints de saude.
O Compose local orquestra web, docs, cinco servicos Java, PostgreSQL, Redis, RabbitMQ, Mailpit, Prometheus e Grafana. Consulte
`docs/11-local-development.md` para o estado local e portas reservadas,
`docs/12-git-flow.md` para o fluxo de branches,
`docs/13-java-build.md` para o build Maven, `docs/14-frontend-workspace.md` para
o workspace Angular e `docs/15-global-scripts.md` para os comandos globais.
Para o `verify` local, instale Chromium com `corepack pnpm e2e:install`;
Playwright e axe-core rodam em desktop e mobile nas portas reservadas 44210 e
44211.
A landing Angular da TASK-017 apresenta a visao do produto e o andamento real
da fundacao, sem simular agenda ou acesso clinico ainda fora do escopo.
O portal Angular em `apps/docs` permite navegar e buscar os guias locais e a
SPEC-001, sem backend. Consulte `apps/docs/README.md` para uso e seguranca.
