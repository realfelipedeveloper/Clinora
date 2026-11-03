# Relatorio de Conclusao

## Tarefa
SPEC-002, TASK-002: IdP OIDC local e validacao de JWT no `core-api`.

## Entrega
Keycloak local com realm, cliente web PKCE e cliente tecnico para smoke.
O `core-api` valida assinatura, emissor, audiencia, expiração, `nbf` e escopo,
nega demais endpoints por padrão e expõe `/api/v1/identity/session` sem cache.
O contrato OpenAPI, runbook, catálogo de portas e estado ativo foram atualizados.

## Regressao e validacao
`CoreJwtSecurityTest` usa JWKS efemero e JWTs reais para aceitar identidade
válida e rejeitar assinatura, emissor, audiencia, expiração, `nbf` e escopo
incorretos. Exercita endpoint, CORS permitido/negado e resposta sem cache.
`HealthProbeVerifierTest` cobre 401/404 para Actuator não exposto e rejeita
200. `tools/compose.test.mjs` valida a configuração do realm, clientes,
porta em loopback e smoke. `tools/compose-smoke.mjs` obtém token real do IdP
no CI e chama o `core-api`. O Docker local não estava disponível; o smoke em
containers depende do CI Linux antes do merge.
`verify` local passou com 63 testes de ferramentas e 16 E2E desktop/mobile.
Uma fixture de dependência interna eliminou o mutante sobrevivente do
verificador de arquitetura; PIT terminou com 25/25 mutações mortas. A
auditoria não encontrou vulnerabilidades conhecidas em dependências de
produção; 9 avisos permanecem em dependências de desenvolvimento.

## Seguranca e privacidade
Segredos versionados são apenas sintéticos para ambiente local. Tokens não
entram em logs, e o endpoint de sessão não consulta vínculos nem dados clínicos.

## Risco residual
TASK-003 a TASK-006 ainda precisam entregar vínculo tenant-aware, revogação,
MFA/step-up, login web e testes de isolamento. Nenhum endpoint de domínio foi
liberado nesta tarefa.
