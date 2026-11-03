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

Na SPEC-002, a migração `V1__identity_tenants.sql` cria `tenant`,
`external_identity`, `membership`, `tenant_unit`, `unit_assignment` e
`professional_assignment` no banco exclusivo `clinora_core`. A identidade
externa é única por `(issuer, subject)` e pode ter vínculos distintos em dois
tenants. As duas tabelas de atribuição usam FKs compostas `(tenant_id, id)`
para rejeitar referências cruzadas no próprio banco. `tenant_unit` guarda só
o identificador mínimo da unidade; os atributos clínicos pertencem à SPEC-003.
O vínculo ativo, papel e unidade ainda precisam ser resolvidos e autorizados
pelo servidor na TASK-004; a migração não libera endpoints de domínio.

Na SPEC-002, a migração `V1__identity_tenants.sql` cria `tenant`,
`external_identity`, `membership`, `tenant_unit`, `unit_assignment` e
`professional_assignment` no banco exclusivo `clinora_core`. A identidade
externa é única por `(issuer, subject)` e pode ter vínculos distintos em dois
tenants. As duas tabelas de atribuição usam FKs compostas `(tenant_id, id)`
para rejeitar referências cruzadas no próprio banco. `tenant_unit` guarda só
o identificador mínimo da unidade; os atributos clínicos pertencem à SPEC-003.
O vínculo ativo, papel e unidade ainda precisam ser resolvidos e autorizados
pelo servidor na TASK-004; a migração não libera endpoints de domínio.
