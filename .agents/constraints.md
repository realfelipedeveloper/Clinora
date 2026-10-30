# Restrições Ativas
- Não usar MongoDB.
- Não usar portas 3000, 4200, 5432, 5672, 6379, 8080 ou 15672 no host.
- Não implementar cloud.
- Implementar somente o escopo de uma spec aprovada e ativa; a SPEC-002 está ativa.
- Não confiar em tenant, papel ou permissões informados pelo cliente sem vínculo validado no servidor.
- Não persistir tokens no navegador nem registrá-los em logs ou telemetria.
- Não usar secrets reais.
- Não adicionar dependência sem justificativa.
- Não alterar testes para mascarar falhas.
