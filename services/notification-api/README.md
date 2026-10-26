# services/notification-api

Servico de notificacoes da Clinora. Na SPEC-001, fornece apenas a fundacao
executavel com endpoints de saude. Nao envia mensagens.

Escopo futuro: e-mail, WhatsApp, SMS, in-app, templates e consentimentos.

## Executar

Na raiz do repositorio, com Java 25 e `JAVA_HOME` configurado:

```powershell
.\mvnw.cmd -pl services/notification-api spring-boot:run
```

Porta padrao `44222`, configuravel por `CLINORA_NOTIFICATION_API_PORT`.
Verifique que a porta esta livre antes de iniciar. O servico expoe
`/actuator/health`, `/actuator/health/liveness` e
`/actuator/health/readiness`, sem detalhes internos.

