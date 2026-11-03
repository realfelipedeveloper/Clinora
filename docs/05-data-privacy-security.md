# Dados, Privacidade e Segurança

Dados de saúde são sensíveis. Aplicar minimização, finalidade, necessidade, segregação por tenant, criptografia em trânsito e repouso, criptografia de campo quando necessária, retenção configurável, auditoria e acesso contextual.

## Autenticação e autorização
Spring Security, OAuth 2.1/OIDC, access token curto, refresh opaco rotativo, WebAuthn, TOTP, RBAC + ABAC e step-up para operações críticas.
O banco `clinora_core` conserva apenas o par de identidade externa
`(issuer, subject)` e vínculos tenant-aware, nunca senha ou refresh token.
Revogação usa `revoked_at` como instante UTC e versão de vínculo; a política
de autorização deve consultar o estado servidor antes de acessar dados.
O banco `clinora_core` conserva apenas o par de identidade externa
`(issuer, subject)` e vínculos tenant-aware, nunca senha ou refresh token.
Revogação usa `revoked_at` como instante UTC e versão de vínculo; a política
de autorização deve consultar o estado servidor antes de acessar dados.

## Auditoria
Registrar identidade, tenant, finalidade, ação, recurso, horário e resultado. Não registrar conteúdo clínico completo.

## Baseline
OWASP ASVS Level 2, OWASP API Security, STRIDE, abuse cases, SAST, DAST, SCA, SBOM, secret scan e container scan.

## Produção
Pentest, revisão LGPD, restore testado, tabletop de incidente e revisão da infraestrutura antes da venda pública.
