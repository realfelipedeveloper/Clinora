# Especificações do Clinora

Apenas `SPEC-001` está aprovada e ativa. As demais são propostas para revisão;
`DRAFT` não autoriza implementação. Aprovação deve registrar escopo, critérios
de aceite e riscos antes de mudar `.agents/active-feature.json`.

| Release | Spec | Tema | Estado |
| --- | --- | --- | --- |
| 0 | [SPEC-001](001-platform-foundation/spec.md) | Fundação | APPROVED |
| 1 | [SPEC-002](002-identity-tenancy/spec.md) | Identidade e tenants | DRAFT |
| 2 | [SPEC-003](003-clinical-catalog/spec.md) | Catálogo clínico | DRAFT |
| 3 | [SPEC-004](004-availability-timezone/spec.md) | Disponibilidade e timezone | DRAFT |
| 4 | [SPEC-005](005-appointments-holds/spec.md) | Consultas e holds | DRAFT |
| 5 | [SPEC-006](006-waiting-checkin/spec.md) | Espera, check-in e no-show | DRAFT |
| 6 | [SPEC-007](007-fake-payments/spec.md) | Pagamentos fake | DRAFT |
| 7 | [SPEC-008](008-notifications/spec.md) | Notificações | DRAFT |
| 8 | [SPEC-009](009-saas-billing/spec.md) | SaaS e billing | DRAFT |
| 9 | [SPEC-010](010-fake-integrations/spec.md) | Integrações fake | DRAFT |
| 10 | [SPEC-011](011-hardening-lgpd/spec.md) | Hardening e LGPD | DRAFT |

Cada spec proposta tem `tasks.md` próprio. Depois de aprovada, cada tarefa
deve seguir `feature/*` → `development` → `homologation` → `main`, com gates,
testes proporcionais ao risco, documentação, memória e relatório de conclusão.
As specs de agenda exigem provas de concorrência no PostgreSQL e de timezone;
as de dados clínicos exigem isolamento de tenant e privacidade. Nenhuma spec
posterior pode enfraquecer as invariantes de `AGENTS.md`.
