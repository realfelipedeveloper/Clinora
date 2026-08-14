# Services

Servicos backend da Clinora.

## Estrutura
- `core-api`
- `payment-api`
- `notification-api`
- `integration-api`
- `scheduler-worker`

Cada servico deve ter banco logico proprio quando aplicavel. Nenhum servico deve acessar tabelas de outro servico.

