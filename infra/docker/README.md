# infra/docker

Stack local da SPEC-001. `compose.yaml` fica na raiz, usa o namespace
`clinora-local` e expoe web, docs, cinco servicos Java e PostgreSQL apenas em
`127.0.0.1` nas portas reservadas. O Compose consome os artefatos criados pelo
`verify` como mounts somente leitura; nao usa `node_modules` em containers.

```powershell
corepack pnpm run verify
docker compose config --quiet
docker compose up -d --wait
docker compose ps
docker compose down
```

Antes de subir a stack, confira as portas 44210, 44211, 44220-44224 e 44230 com o
verificador do runbook em `docs/11-local-development.md`. O comando `down`
atua somente no projeto `clinora-local`; nao use `down -v` para diagnostico.

Web e docs usam NGINX sem privilegios. Os servicos Java usam JRE 25, usuario
10001, filesystem somente leitura e `/tmp` temporario. Healthchecks consultam
as paginas web e o readiness real do Actuator. Nenhum dado clinico e montado.
O CI executa `tools/compose-smoke.mjs` em runner isolado, verifica os sete
endpoints e as permissoes dos quatro bancos antes de remover apenas os
containers desse projeto.

PostgreSQL usa volume nomeado persistente, autenticacao host SCRAM e quatro
bancos logicos. Cada banco tem papel proprio, sem `CONNECT` publico:

| Banco | Papel |
| --- | --- |
| `clinora_core` | `clinora_core_user` |
| `clinora_payments` | `clinora_payments_user` |
| `clinora_notifications` | `clinora_notifications_user` |
| `clinora_integrations` | `clinora_integrations_user` |

As variaveis `CLINORA_POSTGRES_ADMIN_PASSWORD` e
`CLINORA_{CORE,PAYMENTS,NOTIFICATIONS,INTEGRATIONS}_DB_PASSWORD` sobrescrevem
as senhas de desenvolvimento. Os valores padrao do Compose sao apenas para
maquina local, nunca para producao ou dados reais. O script de inicializacao
roda somente em volume vazio; mudar variaveis depois nao rotaciona as senhas
existentes. Nenhuma API recebe credenciais de banco na TASK-020.

Redis, RabbitMQ, Mailpit, MinIO e observabilidade serao acrescentados nas
TASK-021 a TASK-025, sem mudar as portas atuais.

