# SPEC-009 — SaaS, planos, flags e billing

Status: APPROVED
Release: 8.

## Objetivo
Aplicar planos e limites configuráveis a cada tenant sem confundir autorização
com direito comercial e sem cobrar de verdade.

## Escopo e regras
- Catálogo versionado dos planos Free, Professional, Clinic, Network e
  Enterprise, em BRL. Preços, limites, prazos e tolerâncias são configuração,
  não constantes de domínio.
- Entitlements são avaliados no servidor pelo tenant autenticado, com versão e
  invalidação de cache. Flag desativada nega o recurso mesmo se a UI mostrar.
- Uso e cotas são contabilizados atomicamente, sem ultrapassar limite sob
  requisições concorrentes. Mudança de plano mantém histórico e vigência.
- Billing fake usa contratos com a Payment API; falha ou retry de evento não
  duplica fatura, assinatura ou alteração de plano.
- Períodos de cobrança usam `LocalDate` e timezone IANA do contrato para
  calendário civil; eventos financeiros persistem `Instant` UTC.
- Suspensão, reativação e downgrade seguem transições explícitas e não apagam
  registros clínicos nem liberam reserva fora da máquina de agenda.

## Ameaças e privacidade
- Tenant/assinatura vêm do contexto validado, não de `tenantId` do cliente.
- Webhook fake, alteração de plano e flag administrativa exigem autorização,
  step-up, idempotência e auditoria sem dados de saúde.
- Nenhum serviço lê banco alheio; contratos e eventos são versionados.

## Aceite e regressão obrigatória
- Unidade: catálogo, vigência, prorrata fake, cota, flag e transições.
- Integração/Testcontainers: duas requisições no último slot de cota,
  invalidação de cache, duplicata de evento e isolamento de tenant.
- Contrato/E2E: upgrade/downgrade, limite atingido, suspensão, reativação e
  fatura fake em pt-BR.
- Segurança: bypass de flag pela API, IDOR, replay, privilégios e logs.
- Cobertura de autorização/isolamento >= 95%, mutation testing e gates verdes.

## Fora de escopo
Cobrança real, cobrança fiscal e migração automática de dados entre tenants.
