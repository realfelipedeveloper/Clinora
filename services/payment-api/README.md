# services/payment-api

Servico de pagamentos da Clinora. Na SPEC-001, fornece apenas uma fundacao
executavel com endpoints de saude. Nao processa cobrancas.

Escopo futuro: credito, debito, Pix, assinaturas, reembolsos, chargebacks e webhooks fake.

## Executar

Na raiz do repositorio, com Java 25 e `JAVA_HOME` configurado:

```powershell
.\mvnw.cmd -pl services/payment-api -am package
java -jar services/payment-api/target/payment-api-0.0.1-SNAPSHOT.jar
```

Porta padrao `44221`, configuravel por `CLINORA_PAYMENT_API_PORT`. Verifique
que a porta esta livre antes de iniciar. O servico expoe `/actuator/health`,
`/actuator/health/liveness` e `/actuator/health/readiness`, sem detalhes internos.

