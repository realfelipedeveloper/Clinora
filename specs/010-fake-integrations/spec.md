# SPEC-010 — Integrações fake, calendário e teleconsulta

Status: DRAFT — aprovação necessária antes de implementar.
Release: 9.

## Objetivo
Exercitar contratos de integração sem transmitir dados de saúde a terceiros
reais e preparar adaptação futura a padrões de interoperabilidade.

## Escopo e regras
- `integration-api` é dona exclusiva de `clinora_integrations`; adapters
  fake de convênio, calendário e teleconsulta têm cenários determinísticos.
- Eventos de agenda chegam por contrato versionado e autenticado; nenhuma
  leitura direta do banco do `core-api`. Inbox/outbox, retry e DLQ são
  idempotentes e limitados.
- Sincronização de calendário usa identificador externo opaco e atualização
  segura; conflito remoto não altera uma consulta confirmada fora dos comandos
  da máquina de estados.
- Link fake de teleconsulta tem TTL, autorização contextual e não revela
  dados clínicos. Revogação acompanha cancelamento/reagendamento.
- FHIR fica preparado por mapeamentos/contratos testados, sem endpoint de
  produção nem exportação real nesta release.
- Instantes em UTC, timezone IANA na fronteira do calendário; DST tratado
  como na SPEC-004.

## Ameaças e privacidade
- Egress de rede é restrito aos fakes configurados. SSRF, callback forjado,
  token de integração vazado e replay são bloqueados.
- Payload externo contém apenas dados mínimos por finalidade e consentimento;
  logs, traces e DLQ não armazenam PHI desnecessária.
- Tenant é validado no evento e no destino; resultado de outro tenant não é
  retornado nem aplicado.

## Aceite e regressão obrigatória
- Unidade: mapeamento, TTL, deduplicação, conflito e timezone.
- Integração/Testcontainers/WireMock/Pact: contratos, timeout, retry, DLQ,
  callback inválido, reentrega e isolamento do banco/tenant.
- E2E: calendário fake, link de teleconsulta e erro de convênio em pt-BR.
- Segurança: SSRF, replay, IDOR, egress, tokens/logs e consentimento.
- Cobertura crítica >= 95%, mutation testing e gates verdes.

## Fora de escopo
Conexões reais a operadoras, calendários, vídeo e servidores FHIR.
