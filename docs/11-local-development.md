# Desenvolvimento Local

## Estado atual
Bootstrap iniciado pela SPEC-001, TASK-001: estrutura poliglota.

Ainda nao ha aplicacao executavel ou Docker Compose. O Maven Wrapper e o parent POM foram iniciados na TASK-002. O workspace Angular/pnpm foi iniciado na TASK-003 sem aplicacao inicial.

Para executar o build Java, `JAVA_HOME` deve apontar para um JDK 25.
Para executar o workspace frontend, use Node `24.15.0` ou outra versao suportada pelo Angular 22.
Para validar a fundacao atual, use `corepack pnpm run verify`.

## Portas reservadas
As portas abaixo sao reservadas para ambiente local e nao devem ser trocadas sem atualizar spec, docs e memoria:

| Servico | Porta |
| --- | ---: |
| web | 44210 |
| docs | 44211 |
| core-api | 44220 |
| payment-api | 44221 |
| notification-api | 44222 |
| integration-api | 44223 |
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
$ports = @(44210,44211,44220,44221,44222,44223,44230,44240,44250,44251,44260,44261,44270,44271,44280,44281)
$listeners = netstat -ano -p tcp
foreach ($port in $ports) {
  $matches = $listeners | Select-String -Pattern ":$port\s"
  if ($matches) { "$port IN_USE $($matches.Line.Trim())" } else { "$port FREE" }
}
```

## Proximos passos
1. TASK-006: core-api.
2. TASK-013: Angular web.
3. TASK-018: portal docs.

## Seguranca e privacidade
Nao ha dados sensiveis, segredos reais, banco local ou logs de saude nesta etapa.
