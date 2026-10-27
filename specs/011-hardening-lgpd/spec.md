# SPEC-011 — Hardening, LGPD e preparação comercial

Status: APPROVED
Release: 10.

## Objetivo
Consolidar segurança, privacidade, operação e identidade do produto antes de
qualquer oferta pública, com evidências reproduzíveis e revisão humana.

## Escopo e regras
- Inventário e classificação de dados, finalidade, base legal, consentimento,
  retenção configurável, exportação e exclusão/anonimização quando cabível,
  preservando obrigações legais e integridade referencial.
- Auditoria de acesso contextual, trilha imutável e revisão de permissões;
  eventos sem conteúdo clínico completo e com `Instant` UTC.
- Criptografia em trânsito/repouso, gestão de segredos, rotação, backup e
  restore testados. Nenhuma credencial local padrão é aceita em produção.
- SAST, DAST, SCA, SBOM, secret scan e container scan entram nos gates; achado
  alto/crítico bloqueia release até correção ou decisão formal de risco.
- Revisão de ameaça STRIDE/abuse cases, OWASP ASVS L2/API Security, pentest
  independente, revisão LGPD e tabletop de incidente são gates documentados.
- Branding e acessibilidade do produto inteiro são coerentes com a landing;
  fluxos críticos completos em pt-BR, desktop e mobile.
- Observabilidade, SLOs, alertas, runbooks e restore não registram PHI.
- Nenhuma migração ou manutenção global destrutiva sem escopo e aprovação.

## Invariantes de liberação
- Testes de corrida confirmam ausência de dupla reserva para todos os recursos.
- Isolamento/autorização multi-tenant e propriedade de banco por serviço
  continuam comprovados por testes e revisão arquitetural.
- Não há implementação incompleta apresentada como pronta para produção;
  funções ainda fake são rotuladas e bloqueadas de uso real.
- Deploy público depende de aprovação explícita de segurança, privacidade e
  operação, não apenas de pipeline verde.

## Aceite e regressão obrigatória
- Unidade/integração/contrato/E2E: suite retroativa para cada feature e bug,
  incluindo estados, concorrência, timezone, isolamento, falhas e recuperação.
- Segurança: DAST, SAST, SCA, SBOM, secret/container scan, ASVS L2, API
  Security, testes de autorização, logs e vazamento de dados.
- Operação: backup/restore real em ambiente isolado, rotação de segredo,
  degradação, DLQ, rollback e tabletop documentado.
- Cobertura geral >= 85%; agenda/autorização/isolamento >= 95%; mutation
  testing de regras críticas e nenhuma regressão conhecida sem decisão formal.

## Fora de escopo
Cloud ou comercialização automática; exigem projeto e aprovação próprios.
