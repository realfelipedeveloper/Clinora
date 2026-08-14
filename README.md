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
11. specs/001-platform-foundation/spec.md
12. specs/001-platform-foundation/tasks.md

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

Ainda nao ha aplicacao executavel, workspace Angular, parent POM Maven ou Docker Compose. Consulte `docs/11-local-development.md` para o estado local e portas reservadas.
