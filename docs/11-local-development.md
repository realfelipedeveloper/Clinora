# Desenvolvimento Local

## Estado atual
Os cinco servicos Java da SPEC-001 estao executaveis com endpoints de saude.
O workspace Angular/pnpm inclui web, portal docs e a biblioteca Clinora UI.
`compose.yaml` executa essas apps, os cinco servicos Java, PostgreSQL, Redis, RabbitMQ e Mailpit depois do `verify`;
veja `infra/docker/README.md`.
Por padrao os servicos Java escutam em `127.0.0.1`. O perfil `observability`
habilita Prometheus; veja `docs/16-observability.md`.

Para executar o build Java, `JAVA_HOME` deve apontar para um JDK 25.
Para executar o workspace frontend, use Node `24.15.0` ou outra versao suportada pelo Angular 22.
Para validar a fundacao atual, use `corepack pnpm run verify`.
Instale Chromium uma vez com `corepack pnpm e2e:install`; `verify` executa
Playwright/axe-core e precisa das portas 44210 (web) e 44211 (docs) livres. O CI instala o
navegador e dependencias de sistema automaticamente.

Com Docker Desktop ativo, rode `corepack pnpm run verify`, confira as portas
reservadas abaixo e entao `docker compose up -d --wait`. O smoke do CI valida
os endpoints em containers. No Windows, o Docker Desktop pode exigir
permissao administrativa para iniciar `com.docker.service`.

## Portas reservadas
As portas abaixo sao reservadas para ambiente local e nao devem ser trocadas sem atualizar spec, docs e memoria:

| Servico | Porta |
| --- | ---: |
| web | 44210 |
| docs | 44211 |
| storybook | 44212 |
| core-api | 44220 |
| payment-api | 44221 |
| notification-api | 44222 |
| integration-api | 44223 |
| scheduler-worker | 44224 |
| postgres | 44230 |
| redis | 44240 |
| rabbitmq amqp | 44250 |
| rabbitmq ui | 44251 |
| mail smtp | 44260 |
| mail ui | 44261 |
| minio | 44270 |
| minio console | 44271 |
| grafana | 44280 |
| prometheus | 44281 |

## Checagem manual de portas

```powershell
$ports = @(44210,44211,44212,44220,44221,44222,44223,44224,44230,44240,44250,44251,44260,44261,44270,44271,44280,44281)
$listeners = netstat -ano -p tcp
foreach ($port in $ports) {
  $matches = $listeners | Select-String -Pattern ":$port\s"
  if ($matches) { "$port IN_USE $($matches.Line.Trim())" } else { "$port FREE" }
}
```

## Proximos passos
1. TASK-024: armazenamento S3 local; decisao de fornecedor pendente por
   arquivamento do MinIO comunitario.
2. TASK-026: verificador de portas.

## Seguranca e privacidade
O PostgreSQL e somente para desenvolvimento, sem dados clinicos reais. As
credenciais padrao em `compose.yaml` sao locais e nao servem para producao.
Nenhum servico Java recebeu credenciais de banco nesta etapa.
Redis usa ACLs por servico e chaves separadas, sem persistencia. Nao guarde
nele a unica copia de qualquer reserva, token critico ou dado clinico.
RabbitMQ local usa somente a topologia de teste e senha de desenvolvimento;
consulte `infra/docker/README.md`. Nao envie eventos clinicos reais para ela.
Mailpit captura somente emails de teste para `@example.test`, sem relay,
com armazenamento efemero, UI autenticada e sem TLS SMTP. Nao envie dados
clinicos reais. Credenciais, portas e limites constam em `infra/docker/README.md`.
