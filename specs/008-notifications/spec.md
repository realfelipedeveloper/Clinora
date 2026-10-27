# SPEC-008 — Notificações e consentimento

Status: APPROVED
Release: 7.

## Objetivo
Enviar avisos locais simulados e e-mail de desenvolvimento com consentimento,
templates versionados e entrega resiliente, sem dados sensíveis em logs.

## Escopo e regras
- `notification-api` é dona exclusiva de `clinora_notifications`. Recebe
  eventos/contratos, nunca consulta diretamente bancos de agenda/pagamento.
- Canais: e-mail via Mailpit local, SMS/WhatsApp/in-app fake. Nenhum provedor
  externo real nesta release.
- Consentimento por finalidade/canal é verificado no envio, inclusive para
  lembretes; preferência alterada invalida envio pendente não obrigatório.
- Templates pt-BR versionados, com variáveis em lista permitida e conteúdo
  mínimo. Não incluir diagnóstico ou prontuário em mensagem.
- Outbox/inbox, acknowledge, retry com limite, DLQ e deduplicação garantem
  processamento idempotente sem entrega duplicada por reexecução conhecida.
- Agendamento de lembrete usa `Instant` UTC e timezone IANA para horário civil,
  inclusive DST; cancelamento da consulta cancela lembrete pendente.

## Ameaças e privacidade
- Endereço de contato e payload são protegidos em repouso e mascarados em
  logs. Templates não aceitam HTML arbitrário ou injeção em cabeçalho.
- Tenant vem de evento autenticado/validado; DLQ não pode vazar dado sensível
  de um tenant para outro.

## Aceite e regressão obrigatória
- Unidade: consentimento, templates, horários, retry, deduplicação e DLQ.
- Integração/Testcontainers: RabbitMQ, Mailpit, banco isolado, reentrega,
  cancelamento e evento cruzado recusado.
- Contratos/E2E: confirmação, lembrete, falha de canal e preferências em pt-BR.
- Segurança: injeção de template/cabeçalho, IDOR, logs, isolamento e ausência
  de PHI no payload mínimo. Cobertura crítica >= 95%, gates verdes.

## Fora de escopo
WhatsApp/SMS reais e marketing não solicitado.
