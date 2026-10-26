# Observabilidade local

Os cinco servicos Java expoem health, liveness e readiness pelo Actuator.
O perfil padrao expoe apenas health e escuta em `127.0.0.1`.

O perfil `observability` habilita `/actuator/prometheus` para scrape. Exemplo
de execucao a partir da raiz, apos validar a porta do servico:

```powershell
.\mvnw.cmd -pl services/core-api -am package
java -jar services/core-api/target/core-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=observability
```

O endpoint `/actuator/env` nao e exposto em nenhum perfil. As metricas usam
apenas o nome da aplicacao como tag comum; identificadores de pacientes,
tenants, consultas e outros dados sensiveis nao devem virar tags.

`CLINORA_BIND_ADDRESS` permite alterar o bind local. Em Docker Compose,
definir `0.0.0.0` apenas dentro da rede de containers e publicar portas do
host em `127.0.0.1`; Prometheus deve acessar os nomes internos dos servicos.

O desligamento HTTP e gracioso, com ate `20s` por fase para drenar requisicoes.
Jobs e consumidores futuros devem respeitar o mesmo encerramento ordenado.
