# SPEC-005 — Holds e ciclo de vida da consulta

Status: DRAFT — aprovação necessária antes de implementar.
Release: 4.

## Objetivo
Criar, confirmar, cancelar e reagendar consultas sob concorrência real sem
dupla reserva de profissional, sala, equipamento ou recurso exclusivo.

## Regras invariantes
- Toda alteração de status passa por comandos explícitos de uma máquina de
  estados; não existe CRUD genérico para `Appointment.status`.
- Estados e transições seguem `docs/04-scheduling-domain.md`, incluindo
  DRAFT, HELD, PENDING_CONFIRMATION, CONFIRMED, CHECKED_IN, IN_PROGRESS,
  COMPLETED, cancelamentos, NO_SHOW, RESCHEDULED e EXPIRED.
- Hold tem token opaco, TTL configurável, expiração idempotente e confirmação
  única. Worker pode repetir mensagens sem confirmar duas vezes.
- Alocação ativa ocupa intervalo `[início, fim)` com preparação e intervalo
  posterior. Transação e constraint/exclusion no PostgreSQL impedem qualquer
  sobreposição para profissional, sala, equipamento ou recurso exclusivo.
- Redis pode acelerar ou coordenar, mas PostgreSQL decide a ocupação oficial.
- Reagendar libera a alocação anterior e cria a nova atomicamente; falha da
  nova reserva preserva o estado anterior.
- Idempotência é escopada por tenant, ator e comando, com resposta estável.
- Tenant é derivado da identidade; cada referência é validada no mesmo tenant.
- Instantes persistidos em UTC; a escolha do horário usa timezone IANA da
  unidade, com política de DST da SPEC-004.

## Ameaças e privacidade
- Token de hold não é previsível nem aparece em logs; autorização protege
  confirmação, cancelamento e reagendamento contra IDOR.
- Auditoria registra transição, ator, finalidade e resultado sem conteúdo
  clínico completo. Falhas concorrentes não expõem detalhes de outro paciente.
- Nenhum serviço acessa diretamente o banco de agenda do `core-api`.

## Aceite e regressão obrigatória
- Unidade: tabela completa de transições válidas/inválidas, expiração,
  idempotência, buffers e fronteiras temporais.
- Integração/Testcontainers: exclusion constraints por cada tipo de recurso,
  rollback de reagendamento, worker repetido e tenant cruzado recusado.
- Concorrência: pelo menos duas requisições simultâneas disputando cada
  recurso; exatamente uma confirma. Testes repetidos com múltiplas instâncias.
- E2E: busca, hold, confirmação, cancelamento, reagendamento, expiração e
  conflito em pt-BR, desktop/mobile e acessibilidade.
- Segurança: IDOR, token adulterado, replay, logs, rate limit e isolamento.
- Cobertura de agenda/autorização/isolamento >= 95%, mutation testing em
  estados e conflito, gates verdes.

## Fora de escopo
Lista de espera, check-in e pagamento real.
