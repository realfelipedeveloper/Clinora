# SPEC-001 — Fundação da Plataforma Clinora

Status: APPROVED

## Objetivo
Criar a fundação executável sem implementar regras de negócio da agenda.

## Escopo
Maven multi-module, Angular workspace, Java 25, Spring Boot 4.1, Angular 22, Tailwind, PostgreSQL, Redis, RabbitMQ, MinIO, Mailpit, Docker Compose, health checks, observabilidade, CI, docs, Design System e memória persistente.

## Apps e serviços
apps/web, apps/docs, services/core-api, services/payment-api, services/notification-api, services/integration-api e services/scheduler-worker.

## Portas do host
CLINORA_WEB_PORT=44210
CLINORA_DOCS_PORT=44211
CLINORA_CORE_API_PORT=44220
CLINORA_PAYMENT_API_PORT=44221
CLINORA_NOTIFICATION_API_PORT=44222
CLINORA_INTEGRATION_API_PORT=44223
CLINORA_POSTGRES_PORT=44230
CLINORA_REDIS_PORT=44240
CLINORA_RABBIT_AMQP_PORT=44250
CLINORA_RABBIT_UI_PORT=44251
CLINORA_MAIL_SMTP_PORT=44260
CLINORA_MAIL_UI_PORT=44261
CLINORA_MINIO_PORT=44270
CLINORA_MINIO_CONSOLE_PORT=44271
CLINORA_GRAFANA_PORT=44280
CLINORA_PROMETHEUS_PORT=44281

## Requisitos
- Todos os serviços iniciam e expõem health/readiness.
- Docker Compose usa namespace exclusivo.
- Landing Clinora em Angular.
- Tailwind usa tokens.
- Design System com Button, Input, Select, Card, Alert, Modal e StatusBadge.
- Docs navegável.
- Pipeline Java e Angular.
- Testcontainers.
- Topologia RabbitMQ com queue e DLQ de teste.
- Verificador de portas.
- Memória persistente.

## Critérios de aceite
./mvnw verify, pnpm lint/test/build e docker compose up passam; portas livres; health checks verdes; CI verde; docs disponíveis; sem vulnerabilidade crítica conhecida.

## Fora de escopo
Autenticação, pacientes, profissionais, agenda, pagamentos reais, notificações reais, integrações reais e cloud.
