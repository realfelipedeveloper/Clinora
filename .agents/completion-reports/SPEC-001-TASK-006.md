# Relatorio de Conclusao

## Tarefa
SPEC-001, TASK-006: core-api.

## Objetivo
Criar o primeiro servico Java executavel, com verificacao de saude e readiness.

## Arquivos alterados
- `pom.xml` e `services/core-api/pom.xml`.
- `services/core-api/src/main` e `services/core-api/src/test`.
- `README.md`, `services/core-api/README.md` e `docs/13-java-build.md`.
- Memoria em `.agents`.

## Decisoes
- Spring Boot 4.1.0 com Web MVC e Actuator.
- Porta `44220` configuravel por `CLINORA_CORE_API_PORT`.
- Apenas o endpoint `health` fica exposto pelo Actuator.
- O teste HTTP usa porta aleatoria para nao disputar a porta local catalogada.

## Testes
- `mvnw.cmd -q verify`: aprovado.
- HTTP: health, liveness e readiness retornam 200 e status UP.
- HTTP: `/actuator/env` retorna 404.

## Seguranca e privacidade
- Nenhum dado de saude, tenant, banco ou endpoint de negocio foi introduzido.
- Detalhes internos de health ficam ocultos.
- Nenhum endpoint administrativo alem de health e exposto.

## Riscos residuais
- A integracao com dependencias locais entra nas tarefas posteriores da SPEC-001.
- O cache Maven do usuario exige acesso de escrita fora do sandbox local.

## Rollback
Reverter o commit desta tarefa por PR.

## Documentacao e memoria
README, guia de build, README do servico, active-feature e lessons-learned atualizados.

## Status final
Concluida localmente; publicacao pelo Git Flow pendente.
