# SPEC-007 — Payment API fake

Status: DRAFT — aprovação necessária antes de implementar.
Release: 6.

## Objetivo
Simular cobranças, estornos e webhooks sem processar dinheiro real ou dados de
cartão, preservando idempotência e isolamento de serviços.

## Escopo e regras
- `payment-api` é dona exclusiva de `clinora_payments`; recebe comandos por
  contrato autenticado, nunca lê tabelas do `core-api`.
- Valor em BRL é representado em centavos inteiros ou decimal de escala fixa,
  sem `float`; tarifas, limites e prazos vêm de catálogo configurável.
- Gateway fake oferece cenários determinísticos de aprovado, recusado,
  pendente, timeout, reembolso e chargeback. Não captura PAN/CVV/Pix real.
- Cada comando e webhook tem chave idempotente escopada por tenant e operação.
  Estado financeiro muda apenas por transições explícitas e eventos de saída
  são publicados por outbox com entrega repetível.
- Relógio de eventos é `Instant` UTC; exibição usa timezone IANA.
- Falha de pagamento não cria nem libera reserva fora dos comandos da agenda.

## Ameaças e privacidade
- Webhooks fake exigem assinatura, timestamp e proteção contra replay.
- Tenant é resolvido pelo contrato autenticado, não por ID informado pelo
  chamador; erros não revelam cobranças de outro tenant.
- Logs não incluem token, instrumento de pagamento, dado de saúde ou payload
  completo. Banco de pagamentos é inacessível a outros serviços.

## Aceite e regressão obrigatória
- Unidade: arredondamento, valores limite, transições, timeout e idempotência.
- Integração/Testcontainers: migrações, outbox, retry, duplicata, isolamento de
  banco/tenant e contrato com o `core-api` fake.
- Contrato/WireMock: cenários determinísticos e assinaturas de webhook.
- E2E: cobrança fake, falha e estorno em pt-BR, sem instrumento real.
- Segurança: replay, assinatura inválida, IDOR, segredo em log e payload
  malicioso. Cobertura crítica >= 95%, mutation testing e gates verdes.

## Fora de escopo
Processamento financeiro real, PCI e integração com gateway externo.
