# Desenvolvimento Local

## Estado atual
Bootstrap iniciado pela SPEC-001, TASK-001: estrutura poliglota.

Ainda nao ha aplicacao executavel, workspace Angular, parent POM Maven ou Docker Compose. Esses itens entram nas proximas tarefas da SPEC-001.

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
1. TASK-002: Maven Wrapper e parent POM.
2. TASK-003: workspace Angular/pnpm.
3. TASK-004: scripts globais e Taskfile.

## Seguranca e privacidade
Nao ha dados sensiveis, segredos reais, banco local ou logs de saude nesta etapa.

