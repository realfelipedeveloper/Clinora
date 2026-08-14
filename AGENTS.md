# AGENTS.md — Clinora

## Regras imutáveis
1. Nunca implementar sem spec ativa.
2. Nunca remover ou enfraquecer testes para liberar pipeline.
3. Nunca permitir dupla reserva de profissional, sala, equipamento ou recurso exclusivo.
4. Nunca confiar em tenantId vindo do cliente.
5. Nunca acessar banco de outro serviço.
6. Nunca registrar dados sensíveis de saúde em logs.
7. Nunca usar LocalDateTime indiscriminadamente para instantes globais.
8. Nunca alterar status de consulta por CRUD genérico; usar máquina de estados.
9. Nunca executar comandos destrutivos globais.
10. Nunca usar portas comuns do host sem validação.
11. Nunca deixar pendência quando puder existir configuração padrão.
12. Nunca concluir tarefa sem atualizar documentação e memória.

## Fluxo obrigatório
Load context → validate spec → impact analysis → concurrency/timezone review → threat/privacy model → tests → minimal implementation → validation → regression → security → diff review → context update → completion report.

## Git Flow
main, homologation, development, feature/*, release/* e hotfix/*.
Sem commit direto em main/homologation/development.
