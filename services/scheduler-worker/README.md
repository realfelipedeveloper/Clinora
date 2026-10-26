# services/scheduler-worker

Worker de agendamento. Na SPEC-001, fornece apenas a fundacao executavel e
endpoints de saude. Nenhum job de agenda e executado nesta fase.

Escopo futuro: holds, expiracoes, recorrencias, lembretes e lista de espera. Regras de agenda ficam fora desta primeira tarefa.

## Executar

Na raiz do repositorio, com Java 25 e `JAVA_HOME` configurado:

```powershell
.\mvnw.cmd -pl services/scheduler-worker spring-boot:run
```

Porta padrao `44224`, configuravel por `CLINORA_SCHEDULER_WORKER_PORT`.
Verifique que a porta esta livre antes de iniciar. Apenas `/actuator/health`,
`/actuator/health/liveness` e `/actuator/health/readiness` ficam expostos.

