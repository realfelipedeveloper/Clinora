# services/core-api

Servico central da Clinora. Nesta fase ele executa sem banco de dados e expoe
somente os endpoints de saude do Actuator.

Escopo futuro: identidade, tenants, pacientes, profissionais, unidades, recursos
e agenda. A SPEC-001 cobre apenas a fundacao executavel.

## Executar

Na raiz do repositorio, com Java 25 e `JAVA_HOME` configurado:

```powershell
.\mvnw.cmd -pl services/core-api -am package
java -jar services/core-api/target/core-api-0.0.1-SNAPSHOT.jar
```

Por padrao o servico usa a porta `44220`, configuravel por
`CLINORA_CORE_API_PORT`. Antes de iniciar, confirme que a porta esta livre.

Endpoints: `/actuator/health`, `/actuator/health/liveness` e
`/actuator/health/readiness`. Detalhes internos da saude nao sao expostos.

