# libs/java

Modulos Java compartilhados. A TASK-011 adicionou
`clinora-test-support`, uma biblioteca usada apenas no escopo de testes dos
cinco servicos Java.

`HealthProbeVerifier.verify(port)` testa health, liveness e readiness via HTTP
e confirma que `/actuator/env` e `/actuator/prometheus` nao estao expostos no
perfil padrao. `verifyPrometheus(port)` valida o perfil de observabilidade.
O helper nao registra o corpo das respostas em falhas.

Bibliotecas de dominio ou contratos entre servicos so devem entrar quando
houver um caso de uso aprovado e reutilizacao real.

