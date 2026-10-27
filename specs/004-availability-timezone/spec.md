# SPEC-004 — Disponibilidade, recorrência e fuso horário

Status: APPROVED
Release: 3.

## Objetivo
Calcular janelas disponíveis com regras semanais, exceções, bloqueios e
recorrência, preservando o significado civil do horário local.

## Escopo e regras
- Regras pertencem ao tenant, unidade e profissional habilitado, com recursos
  compatíveis do catálogo. Horário recorrente é local com timezone IANA.
- Exceções cobrem feriado, férias, afastamento, bloqueio e abertura extra;
  precedência determinística é documentada e testada.
- Materialização tem horizonte configurável, execução idempotente e versão de
  regra. Alteração invalida projeções antigas sem apagar histórico.
- Horário local inexistente na transição de verão é rejeitado; horário ambíguo
  exige offset explícito. Persistir janelas concretas como `Instant` UTC.
- Duração, preparação e intervalo posterior entram no cálculo; resultado é
  uma indicação sujeita à confirmação transacional da SPEC-005, nunca reserva.
- Intervalos usam semântica `[início, fim)`; fronteiras adjacentes não colidem.

## Concorrência, ameaças e privacidade
- Edição simultânea de regras usa versionamento otimista e não publica
  projeção parcial. Cache não é fonte oficial de disponibilidade.
- Tenant e permissão vêm do contexto autenticado; horários de outro tenant
  não podem ser inferidos por enumeração ou resposta diferenciada.
- Não logar dados de saúde ou calendário nominal sem finalidade autorizada.

## Aceite e regressão obrigatória
- Unidade: precedência, buffers, fronteiras, recorrência e períodos vazios.
- Integração/Testcontainers: projeção idempotente, edição concorrente,
  invalidação, isolamento de tenant e limites de consulta.
- Tempo: DST gap/overlap, mudança de timezone, virada de dia/ano, UTC e
  `America/Sao_Paulo` mais pelo menos um timezone com transição de verão.
- E2E: criação/edição de regras e calendário em pt-BR, erros e acessibilidade.
- Segurança: autorização por unidade, IDOR e ausência de vazamento em logs.
- Cobertura de regras críticas >= 95%, mutation testing e gates verdes.

## Fora de escopo
Hold, confirmação, cancelamento, pagamento e lista de espera.
