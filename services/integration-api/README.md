# services/integration-api

Servico de integracoes da Clinora. Na SPEC-001, fornece apenas a fundacao
executavel com endpoints de saude. Nao chama sistemas externos.

Escopo futuro: convenios, calendarios, telemedicina e preparacao para FHIR.

## Executar

Na raiz do repositorio, com Java 25 e `JAVA_HOME` configurado:

```powershell
.\mvnw.cmd -pl services/integration-api -am package
java -jar services/integration-api/target/integration-api-0.0.1-SNAPSHOT.jar
```

Porta padrao `44223`, configuravel por `CLINORA_INTEGRATION_API_PORT`.
Verifique que a porta esta livre antes de iniciar. O servico expoe
`/actuator/health`, `/actuator/health/liveness` e
`/actuator/health/readiness`, sem detalhes internos.

