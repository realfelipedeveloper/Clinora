# Desenvolvimento Local

## Estado atual
Os cinco servicos Java da SPEC-001 estao executaveis com endpoints de saude.
O `core-api` da SPEC-002 valida JWT OIDC e expoe `/api/v1/identity/session`,
`/api/v1/identity/contexts` e `/api/v1/identity/context`.
O workspace Angular/pnpm inclui web, portal docs e a biblioteca Clinora UI.
`compose.yaml` executa essas apps, os cinco servicos Java, PostgreSQL, Redis, RabbitMQ, Mailpit, Garage, Keycloak, Prometheus e Grafana depois do `verify`;
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
| garage s3 | 44270 |
| garage admin | 44271 |
| grafana | 44280 |
| prometheus | 44281 |
| idp keycloak | 44282 |

## Checagem de portas

```powershell
corepack pnpm run ports:check
```

O comando le as portas efetivas de `docker compose config`, incluindo
overrides, e a reserva de Storybook. Falha se uma porta estiver ocupada,
duplicada ou publicada fora de `127.0.0.1`. Rode antes de iniciar a stack;
nao encerra processos existentes. A checagem nao reserva as portas, entao
outro processo ainda pode ocupa-las antes do `docker compose up`.

## Proximos passos
1. Adicionar vínculos tenant-aware e as políticas de autorização com testes de isolamento.
2. Implementar login, MFA e seleção de contexto no web após as políticas do servidor.

## Seguranca e privacidade
O PostgreSQL e somente para desenvolvimento, sem dados clinicos reais. As
credenciais padrao em `compose.yaml` sao locais e nao servem para producao.
Na SPEC-002, somente o `core-api` recebe as credenciais de `clinora_core` e
executa a migração Flyway no startup. `CLINORA_CORE_DB_URL`,
`CLINORA_CORE_DB_USERNAME` e `CLINORA_CORE_DB_PASSWORD` são obrigatórias fora
do Compose. Os demais serviços Java não recebem credenciais de banco.
Redis usa ACLs por servico e chaves separadas, sem persistencia. Nao guarde
nele a unica copia de qualquer reserva, token critico ou dado clinico.
RabbitMQ local usa somente a topologia de teste e senha de desenvolvimento;
consulte `infra/docker/README.md`. Nao envie eventos clinicos reais para ela.
Mailpit captura somente emails de teste para `@example.test`, sem relay,
com armazenamento efemero, UI autenticada e sem TLS SMTP. Nao envie dados
clinicos reais. Credenciais, portas e limites constam em `infra/docker/README.md`.
Garage single-node serve apenas ao desenvolvimento, sem redundancia. Seu bucket
`clinora-smoke` e as credenciais padrao sao publicos no repositorio, portanto
nao devem armazenar dados reais ou ser expostos fora de loopback.
Keycloak `start-dev` usa credencial administrativa e realm sintético locais;
nenhum dos dois deve ser reutilizado em produção. O IdP responde em
`http://127.0.0.1:44282/realms/clinora` e não contém usuários reais.

## Acesso web local
A area `/app` usa Authorization Code + PKCE S256. Os enderecos publicos do
IdP e do `core-api` ficam em `apps/web/public/clinora-config.js`, carregado
antes do bundle Angular. Esse arquivo pode ser substituido no deploy; nao
coloque senhas, tokens nem segredos nele. Fora de `127.0.0.1`, use HTTPS.

Para experimentar um contexto real no ambiente local, crie uma pessoa de teste
na administracao do realm `clinora`, defina uma senha efemera e copie seu UUID
de usuario (o `sub` do token). No banco `clinora_core`, crie um `tenant` ativo,
uma `external_identity` com o emissor acima e aquele `sub`, e um `membership`
ativo para o mesmo tenant. Use um papel nao administrativo primeiro, por
exemplo `RECEPTION`; `OWNER` e `ADMIN` exigem LoA 2 com OTP configurado na
conta do Keycloak. A selecao em `/app` sempre reconsulta esses vinculos, entao
revogacao ou desativacao do tenant bloqueia o acesso imediatamente.

O realm local importa um fluxo separado com senha no LoA 1 e OTP obrigatorio
no LoA 2. O botao de verificacao adicional solicita `acr_values=2`; o backend
nao aceita esse pedido como prova por si so, exigindo o `acr` do token emitido
pelo IdP. Nao use contas ou dados reais nessa stack local.
