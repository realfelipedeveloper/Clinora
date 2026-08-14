# Domínio de Agendamento

## Entidades
Tenant, ClinicUnit, Professional, Patient, Specialty, Service, Room, Equipment, AvailabilityRule, AvailabilityException, Appointment, AppointmentHold, WaitingListEntry e InsuranceProvider.

## Intervalos
Serviços possuem duração, preparação anterior, intervalo posterior, sala/equipamento e profissionais habilitados.

## Concorrência
Garantia na aplicação e no PostgreSQL: transações, constraints, exclusion constraints quando aplicáveis, optimistic locking, locks pessimistas apenas quando necessários, idempotência e testes paralelos.

## Estados
DRAFT, HELD, PENDING_CONFIRMATION, CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED_BY_PATIENT, CANCELLED_BY_PROVIDER, NO_SHOW, RESCHEDULED e EXPIRED.

## Hold
AVAILABLE → HELD → CONFIRMED.
HELD → EXPIRED → AVAILABLE.
TTL, token opaco, worker, confirmação idempotente e proteção contra dupla reserva.

## Timezone
Persistir instantes em UTC; timezone IANA por tenant/unidade/usuário; usar Instant, LocalDate e ZonedDateTime deliberadamente.

## Recorrência
Agenda semanal, exceções, feriados, férias, afastamentos, bloqueios e horizonte configurável de materialização.

## Lista de espera
Prioridade configurável, oferta temporária, expiração, avanço automático e confirmação única.
