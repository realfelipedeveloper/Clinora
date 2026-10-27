# infra/docker

Stack local da SPEC-001, TASK-019. `compose.yaml` fica na raiz, usa o namespace
`clinora-local` e expoe web, docs e os cinco servicos Java apenas em
`127.0.0.1` nas portas reservadas. O Compose consome os artefatos criados pelo
`verify` como mounts somente leitura; nao usa `node_modules` em containers.

```powershell
corepack pnpm run verify
docker compose config --quiet
docker compose up -d --wait
docker compose ps
docker compose down
```

Antes de subir a stack, confira as portas 44210, 44211 e 44220-44224 com o
verificador do runbook em `docs/11-local-development.md`. O comando `down`
atua somente no projeto `clinora-local`; nao use `down -v` para diagnostico.

Web e docs usam NGINX sem privilegios. Os servicos Java usam JRE 25, usuario
10001, filesystem somente leitura e `/tmp` temporario. Healthchecks consultam
as paginas web e o readiness real do Actuator. Nenhum dado clinico e montado.
O CI executa `tools/compose-smoke.mjs` em runner isolado e verifica os sete
endpoints antes de remover apenas os containers desse projeto.

PostgreSQL, Redis, RabbitMQ, Mailpit, MinIO e observabilidade serao
acrescentados nas TASK-020 a TASK-025, sem mudar as portas atuais.

