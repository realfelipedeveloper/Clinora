# Especificações do Clinora

`SPEC-002` a `SPEC-011` receberam aprovação explícita do usuário em
27/10/2026, condicionada ao CI e merge deste PR. Só `SPEC-001` está ativa
agora; as demais podem ser ativadas sequencialmente após o merge, registrando
a tarefa corrente em `.agents/active-feature.json`.

| Release | Spec | Tema | Estado |
| --- | --- | --- | --- |
| 0 | [SPEC-001](001-platform-foundation/spec.md) | Fundação | APPROVED |
| 1 | [SPEC-002](002-identity-tenancy/spec.md) | Identidade e tenants | APPROVED |
| 2 | [SPEC-003](003-clinical-catalog/spec.md) | Catálogo clínico | APPROVED |
| 3 | [SPEC-004](004-availability-timezone/spec.md) | Disponibilidade e timezone | APPROVED |
| 4 | [SPEC-005](005-appointments-holds/spec.md) | Consultas e holds | APPROVED |
| 5 | [SPEC-006](006-waiting-checkin/spec.md) | Espera, check-in e no-show | APPROVED |
| 6 | [SPEC-007](007-fake-payments/spec.md) | Pagamentos fake | APPROVED |
| 7 | [SPEC-008](008-notifications/spec.md) | Notificações | APPROVED |
| 8 | [SPEC-009](009-saas-billing/spec.md) | SaaS e billing | APPROVED |
| 9 | [SPEC-010](010-fake-integrations/spec.md) | Integrações fake | APPROVED |
| 10 | [SPEC-011](011-hardening-lgpd/spec.md) | Hardening e LGPD | APPROVED |

Cada spec tem `tasks.md` próprio. Após sua ativação, cada tarefa
deve seguir `feature/*` → `development` → `homologation` → `main`, com gates,
testes proporcionais ao risco, documentação, memória e relatório de conclusão.
As specs de agenda exigem provas de concorrência no PostgreSQL e de timezone;
as de dados clínicos exigem isolamento de tenant e privacidade. Nenhuma spec
posterior pode enfraquecer as invariantes de `AGENTS.md`.
