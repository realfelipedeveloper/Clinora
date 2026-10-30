# ADR-001 — OIDC e contexto de tenant

Status: Accepted

## Contexto

A SPEC-002 exige autenticação externa, isolamento entre tenants e autorização
imediatamente revogável. O navegador escolhe o tenant de trabalho, mas não pode
declarar a própria autorização. O `core-api` ainda só possui endpoints de saúde.

## Decisão

- Usar Keycloak como IdP OIDC local e um provedor OIDC configurável fora do
  desenvolvimento. O IdP guarda senhas, MFA e refresh tokens; a Clinora guarda
  apenas o vínculo entre `(issuer, subject)` e os tenants.
- O web usa Authorization Code + PKCE S256, sem client secret. Tokens ficam
  somente em memória, nunca em `localStorage`, `sessionStorage`, URL ou logs.
  Logout encerra a sessão no IdP. CSP estrita e proteção contra XSS são
  necessárias porque um token em memória ainda é acessível a scripts da página.
- O `core-api` valida assinatura por JWKS do emissor configurado, `iss`, `aud`
  (`clinora-core`), `exp` e `nbf` em toda requisição protegida. Um token não pode
  indicar um emissor ou JWKS arbitrário. Escopos autorizam acesso à API, não
  substituem papéis ou vínculos. O mapeamento de identidade usa `(iss, sub)`.
- `GET /api/v1/identity/contexts` lista somente vínculos ativos. O web envia
  `X-Clinora-Tenant` nas operações de domínio. O servidor resolve esse UUID
  contra o vínculo ativo, tenant ativo e atribuições vigentes antes de qualquer
  consulta de domínio; o valor do header nunca entra diretamente em queries.
  `GET /api/v1/identity/context` devolve o contexto já validado. Ver
  `contracts/identity-v1.openapi.json`.
- Inicialmente, consultar o banco a cada decisão de autorização; não usar cache
  de vínculo até haver invalidação comprovada. Assim, revogação ou alteração de
  papel/unidade vale para a próxima operação. Repositórios de domínio exigem
  contexto validado e aplicam filtro de tenant e constraints compostas.
- Administradores e proprietários exigem MFA. Operações críticas exigem
  `acr` de MFA reconhecido e `auth_time` recente (janela máxima de cinco
  minutos), com step-up no IdP. Claims ausentes ou não reconhecidas negam
  acesso. A política de ACR será configurada no IdP junto com a TASK-005.
- Registrar auditoria com ator interno, tenant validado, finalidade, ação,
  resultado e `Instant` UTC, sem token, segredo ou conteúdo clínico.

## Alternativas

- Autenticação local: descartada por ampliar a guarda de credenciais e MFA.
- Tenant e papel no JWT: descartados por permanecerem válidos após revogação.
- BFF com cookie HttpOnly: reduz exposição de tokens a scripts e é candidato
  para uma revisão posterior, mas acrescenta sessão servidor, CSRF e operação
  de refresh antes dos fluxos de identidade desta release. O risco residual
  de XSS no SPA será monitorado e testado.

## Consequências

Cada serviço recebe apenas contratos autenticados; não lê o banco do
`core-api`. O catálogo de tenants pode estar indisponível quando o banco cair:
a autorização falha fechada, sem recorrer a claims antigas. O ambiente local
precisará de porta, realm e dados sintéticos explícitos para o IdP.

## Segurança e privacidade

O cliente não informa `issuer`, `subject`, papel, unidade ou permissões como
autoridade. Um tenant inexistente, de outro usuário ou inativo retorna a mesma
negação genérica. Respostas de identidade usam `Cache-Control: no-store`.
Tokens não entram em mensagens de erro ou telemetria. A CORS permitida será
restrita à origem web local; não há cookies da API no fluxo SPA, então CSRF não
substitui a proteção contra XSS e state/nonce do OIDC.

## Riscos

XSS pode exfiltrar o token em memória. Uma política de MFA apenas no cliente
seria contornável; o servidor deve validar `acr`/`auth_time`. A configuração
incorreta de audiência ou do IdP deve falhar no bootstrap ou na autenticação.
Esta ADR não implementa esses controles: as TASK-002 a TASK-006 os entregam e
testam antes de liberar a release.

## Referências

- `specs/002-identity-tenancy/spec.md`
- `contracts/identity-v1.openapi.json`
- https://www.keycloak.org/server/containers
- https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html
