# Arquitetura do Sistema

## Serviços
- apps/web: Angular.
- apps/docs: portal de documentação.
- services/core-api: Spring Boot + Spring Modulith; identidade, tenants, pacientes, profissionais, unidades, recursos e agenda.
- services/payment-api: crédito, débito, Pix, assinaturas, reembolsos, chargebacks e webhooks fake.
- services/notification-api: e-mail, WhatsApp, SMS, in-app, templates e consentimentos.
- services/integration-api: adapters fake para convênios, calendários, telemedicina e FHIR futuro.
- services/scheduler-worker: holds, expirações, recorrências, lembretes e lista de espera.

## Bancos lógicos
clinora_core, clinora_payments, clinora_notifications e clinora_integrations. Podem compartilhar a instância local, nunca as tabelas.

## Redis
Cache, rate limit, idempotência, locks, sessões revogáveis, feature flags e dados temporários. Nunca fonte oficial da agenda.

## RabbitMQ
Eventos, notificações, billing, integrações, retries e DLQ. Usar publisher confirms, acknowledgements e consumidores idempotentes.

## Multi-tenancy
Schema compartilhado inicialmente, tenant_id obrigatório, contexto de tenant na autenticação, repositories tenant-aware, constraints compostas, testes cross-tenant e RLS preparado.
