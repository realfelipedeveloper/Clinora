# Constituição do Clinora

## Missão
Construir uma plataforma SaaS robusta de agendamento em saúde, adequada a profissionais, consultórios, clínicas e redes.

## Princípios
- Integridade de agenda sob concorrência real.
- Privacidade por design para dados de saúde.
- Implementação incremental em tarefas pequenas.
- Regressão bloqueada.
- Configuração em vez de pendências.
- Cloud portability sem implementar cloud agora.
- PostgreSQL como fonte oficial transacional.
- MongoDB não faz parte da arquitetura.

## Capacidades
Pacientes, profissionais, especialidades, serviços, unidades, salas, equipamentos, convênios, disponibilidade, bloqueios, agendamentos, reagendamentos, cancelamentos, check-in, lista de espera, no-show, pagamentos fake, notificações omnichannel, planos e feature flags.

## Qualidade
Cobertura geral >= 85%; agenda, autorização e isolamento >= 95%; mutation testing em regras críticas; testes E2E e de concorrência obrigatórios.
