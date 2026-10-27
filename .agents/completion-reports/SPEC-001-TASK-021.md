# Relatorio de Conclusao

## Tarefa
SPEC-001, TASK-021: Redis local.

## Objetivo
Disponibilizar cache efemero com ACL por servico e sem acesso anonimo, sem
integrar regras de negocio nesta etapa.

## Alteracoes
- Redis no Compose, apenas em loopback na porta 44240, usuario sem root,
  filesystem somente leitura e `/tmp` temporario.
- Bootstrap de cinco usuarios ACL e prefixos de chave exclusivos, senhas locais
  configuraveis, sem persistencia e com limite de memoria `noeviction`.
- Testes estruturais e smoke de permissoes positivas/negativas, inclusive
  rejeicao de senhas invalidas sem ecoar segredo no CI.

## Concorrencia, tempo, ameacas e privacidade
- Nenhuma reserva, estado ou instante global foi alterado. PostgreSQL permanece
  fonte oficial; Redis nao guarda a unica copia de reserva ou dado clinico.
- ACL nega login anonimo, chave de outro servico e comandos globais destrutivos.
- Nenhuma API recebeu credenciais Redis ou acesso a banco alheio. Senhas nao
  aparecem em argumentos de `redis-server` ou `redis-cli` no smoke.

## Testes
- Testes falharam antes da implementacao por ausencia de Redis.
- `docker compose config`, sintaxe shell e sete testes estruturais: aprovados.
- `verify` local e smoke de ACL no CI: pendentes.
- Docker local inacessivel por permissao do Windows; runtime local nao validado.

## Limites
Redis local usa senhas de desenvolvimento, sem dados reais. Aplicacoes ainda
nao se conectam a ele; ACLs poderao ser ampliadas por specs aprovadas com
testes de permissao. RabbitMQ e DLQ entram na TASK-022.

## Rollback
Reverter por PR; nao usar comandos globais de limpeza Redis no host.

## Documentacao e memoria
README, runbook, infra/docker/README, matriz de regressao, active-feature,
lessons-learned e este relatorio atualizados.

## Status final
Em validacao.
