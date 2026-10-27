# infra/docker

Stack local da SPEC-001. `compose.yaml` fica na raiz, usa o namespace
`clinora-local` e expoe web, docs, cinco servicos Java, PostgreSQL, Redis e RabbitMQ apenas em
`127.0.0.1` nas portas reservadas. O Compose consome os artefatos criados pelo
`verify` como mounts somente leitura; nao usa `node_modules` em containers.

```powershell
corepack pnpm run verify
docker compose config --quiet
docker compose up -d --wait
docker compose ps
docker compose down
```

Antes de subir a stack, confira as portas 44210, 44211, 44220-44224, 44230,
44240, 44250 e 44251 com o
verificador do runbook em `docs/11-local-development.md`. O comando `down`
atua somente no projeto `clinora-local`; nao use `down -v` para diagnostico.

Web e docs usam NGINX sem privilegios. Os servicos Java usam JRE 25, usuario
10001, filesystem somente leitura e `/tmp` temporario. Healthchecks consultam
as paginas web e o readiness real do Actuator. Nenhum dado clinico e montado.
O CI executa `tools/compose-smoke.mjs` em runner isolado, verifica os sete
endpoints, as permissoes dos quatro bancos, as ACLs Redis e o roteamento da
fila de teste para a DLQ RabbitMQ antes de remover
apenas os containers desse projeto.

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

Redis e efemero, sem snapshot/AOF, com limite de 128 MB e politica `noeviction`.
O usuario anonimo fica desativado; `clinora_core`, `clinora_payments`,
`clinora_notifications`, `clinora_integrations` e `clinora_scheduler` acessam
somente chaves `clinora:<servico>:*` e comandos explicitamente permitidos.
As variaveis `CLINORA_{CORE,PAYMENTS,NOTIFICATIONS,INTEGRATIONS,SCHEDULER}_REDIS_PASSWORD`
podem substituir senhas de desenvolvimento com ao menos 16 caracteres ASCII
seguros. Nenhuma API recebe credenciais Redis na TASK-021. Redis nunca e fonte
oficial de reserva; dados clinicos reais nao pertencem a esta stack.

RabbitMQ usa a imagem `4.2.9-management-alpine`, vhost `clinora_local` e
usuario `clinora_local`; `guest` nao e importado. A senha local de exemplo e
`clinora_rabbit_local_only_2026` e fica apenas como hash no arquivo de
definicoes. AMQP e painel ficam nas portas 44250 e 44251 em loopback. O
painel local fica em `http://127.0.0.1:44251`. A fila `clinora.smoke` recebe
mensagens da exchange `clinora.smoke.events` com chave `test`; rejeicao sem
requeue envia para `clinora.smoke.dlq` pela exchange `clinora.smoke.dlx`.
Somente mensagens de teste devem usar essa topologia. Ela nao promete entrega
garantida em cluster nem substitui outbox, publisher confirms ou consumidores
idempotentes das specs de negocio. O volume nomeado persiste definicoes; uma
mudanca de senha/hash nao rotaciona usuario existente automaticamente.
Veja as referencias oficiais de [importacao de definicoes](https://www.rabbitmq.com/docs/4.2/definitions),
[dead-letter exchanges](https://www.rabbitmq.com/docs/4.2/dlx) e
[API HTTP](https://www.rabbitmq.com/docs/4.2/http-api-reference).

Mailpit, MinIO e observabilidade entram nas TASK-023 a TASK-025, sem mudar
as portas atuais.

