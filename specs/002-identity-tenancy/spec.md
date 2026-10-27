# SPEC-002 — Identidade, tenants e autorização

Status: DRAFT — aprovação necessária antes de implementar.
Release: 1.

## Objetivo
Autenticar pessoas e autorizar cada operação no contexto de um tenant real, sem
aceitar `tenantId` fornecido pelo cliente como fonte de verdade.

## Escopo e limites
- IdP OIDC local configurável para desenvolvimento; Spring Security valida
  assinatura, emissor, audiência, expiração e escopos. Senhas, MFA e refresh
  tokens pertencem ao IdP, não ao banco da Clinora.
- Tenant, vínculo de usuário, papel e atribuição de unidade/profissional no
  `core-api`; identidade externa é mapeada por `(issuer, subject)`.
- Papéis iniciais: proprietário, administrador, recepção, profissional e
  paciente; políticas RBAC + ABAC são centralizadas e negam por padrão.
- Seleção de tenant só é válida se o usuário autenticado tiver vínculo ativo;
  o contexto validado é propagado aos repositórios e à auditoria. Sem
  identidade válida, nenhum endpoint de domínio pode consultar dados.
- Login e seleção de contexto em pt-BR na web; MFA obrigatório para funções
  administrativas e step-up para operação crítica.
- Tokens, segredos e dados de saúde não entram em logs. Auditoria registra
  ator, tenant validado, finalidade, ação, instante UTC e resultado.
- Cada serviço mantém propriedade de seu banco; nenhum acesso direto ao banco
  de outro serviço. Integrações entre serviços usam contratos autenticados.

## Regras e ameaças
- Revogação de vínculo impede novas operações mesmo com token ainda válido,
  por verificação server-side com cache invalidável.
- Mudança de papel, tenant ou unidade invalida decisões de autorização antigas.
- Usuário sem vínculo, tenant desativado, IDOR, token adulterado, troca de
  tenant e replay de refresh devem falhar fechados.
- Persistir `Instant` para eventos de auditoria; timezone IANA só na exibição.
- Bootstrap administrativo é configuração local explícita e não cria uma
  credencial fixa utilizável em produção.

## Aceite e regressão obrigatória
- Unidade: matriz de políticas e negação por padrão, token/claim inválido,
  vínculo revogado, cache invalidado e step-up.
- Integração/Testcontainers: isolamento de consultas entre dois tenants,
  constraints compostas, migrações, autorização por papel/unidade e auditoria
  sem conteúdo clínico.
- E2E: login, MFA, troca de contexto permitida e recusada, sessão expirada,
  logout e acesso negado por URL direta, em desktop e mobile.
- Segurança: IDOR horizontal/vertical, JWT com emissor/audiência errados,
  replay, CSRF conforme transporte, rate limit e ausência de tokens em logs.
- Cobertura de autorização e isolamento >= 95%, mutation testing nas decisões
  críticas, contratos e gates de segurança verdes.

## Fora de escopo
Cadastro clínico, disponibilidade, reservas e pagamento. Nenhuma regra de
agenda é implementada nesta spec.
