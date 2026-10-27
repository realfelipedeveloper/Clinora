# SPEC-006 — Lista de espera, check-in e no-show

Status: APPROVED
Release: 5.

## Objetivo
Oferecer vagas liberadas com justiça configurável e registrar chegada/no-show
sem contornar a máquina de estados nem a proteção contra dupla reserva.

## Regras
- Entrada na lista é tenant-aware, por serviço/unidade/janela de preferência,
  com prioridade configurável e desempate determinístico por instante UTC.
- Uma vaga só pode ter uma oferta ativa por vez; oferta tem token opaco e TTL.
  Aceite usa o mesmo comando transacional de hold/confirmação da SPEC-005.
- Expiração, recusa ou falha avançam a fila de forma idempotente; reentrega de
  mensagem não cria duas consultas nem salta um candidato elegível.
- Check-in e no-show são transições explícitas, autorizadas e auditadas.
  Janela de tolerância e política de liberação são configuráveis por tenant.
- Encaixe exige autorização e a mesma constraint de alocação, sem exceção
  silenciosa à exclusividade de profissional/sala/equipamento.
- Instantes UTC; horários exibidos no timezone IANA da unidade/usuário.

## Ameaças e privacidade
- Ordem/posição da fila e identidade de outros pacientes não são expostas.
- Token, contato e conteúdo sensível não entram em logs; consentimento para
  aviso é respeitado pela Notification API da SPEC-008.
- Seleção de tenant vem do contexto validado, nunca de campo do cliente.

## Aceite e regressão obrigatória
- Unidade: prioridade, empate, elegibilidade, TTL, transições e reentrega.
- Integração/Testcontainers: oferta única, aceite simultâneo, avanço após
  expiração, isolamento de tenant e impossibilidade de dupla reserva.
- E2E: entrar/sair da fila, consultar oferta na web, aceitar/recusar, check-in,
  no-show e encaixe com erros em pt-BR.
- Segurança: IDOR, enumeração de posição, replay de token e logs.
- Cobertura de regras críticas >= 95%, mutation testing e gates verdes.

## Fora de escopo
Notificações reais e cobrança por no-show.
