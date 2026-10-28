# Build Java

## Escopo
Fundacao Maven da SPEC-001.

## Wrapper
O repositorio usa Apache Maven Wrapper `3.3.4` no modo `only-script`, sem `maven-wrapper.jar` versionado.

Maven fixado:

```text
Apache Maven 3.9.16
```

O download da distribuicao Maven e validado por SHA-256 em `.mvn/wrapper/maven-wrapper.properties`.

## Requisito local
O Maven baixado pelo wrapper precisa de `JAVA_HOME` apontando para um JDK 25.

Exemplo Windows:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-25.0.1.8-hotspot'
.\mvnw.cmd verify
```

Para uso recorrente, configure `JAVA_HOME` no ambiente do usuario ou do sistema.

## Parent POM
O `pom.xml` raiz e um parent/aggregator com:
- Java `25`;
- Spring Boot `4.1.0`;
- dependency management do `spring-boot-dependencies`;
- plugin management para Compiler Plugin e Spring Boot Maven Plugin;
- Maven Enforcer em `validate` para exigir Maven `3.9.16+` e Java `25`.
- JaCoCo `0.8.15` em `verify` para relatorio e piso de 80% de linhas por
  classe com logica; classes `*Application` de bootstrap ficam fora do check.

Os modulos `services/core-api`, `services/payment-api`,
`services/notification-api`, `services/integration-api` e
`services/scheduler-worker` foram adicionados nas TASK-006 a TASK-010. Eles
usam Spring Boot Web MVC e Actuator, com testes HTTP de health, liveness e
readiness em portas aleatorias.
Testcontainers 2.0.5 valida PostgreSQL 17 em porta efemera no CI Linux:
conexao correta, senha incorreta e isolamento entre bancos de servicos. Os
testes ficam no modulo `clinora-test-support` e exigem `CI=true` e Docker;
fora do CI sao marcados como skipped, sem fingir cobertura local. Nenhum
servico Java de negocio recebe driver ou credencial de banco nesta spec.
O Surefire `3.5.5` e gerenciado pelo parent POM.
Todos os servicos tambem incluem o registry Prometheus do Micrometer, mas o
endpoint de scrape so e exposto no perfil `observability`.

O modulo `libs/java/clinora-test-support` centraliza a verificacao HTTP dos
probes. Os servicos o declaram apenas como dependencia de teste. Para testar
um servico isoladamente, inclua suas dependencias no reactor:

```powershell
.\mvnw.cmd -pl services/core-api -am test
```

Para iniciar um servico em checkout novo, use `-am package` para construir
tambem o modulo de suporte e execute o JAR gerado. Os READMEs dos servicos
mostram os comandos completos.

## Comandos

Windows:

```powershell
.\mvnw.cmd verify
```

Linux/macOS:

```sh
./mvnw verify
```

Os relatorios JaCoCo ficam em `target/site/jacoco` de cada modulo. O modulo
`clinora-test-support` parte de 30/36 linhas cobertas; novas classes de
producao entram automaticamente na regra, exceto bootstrap.

## Decisoes de seguranca
- Sem binario Maven Wrapper versionado.
- Sem secrets em configuracao Maven.
- Sem repositorios privados ou mirrors com credenciais.
- SCM aponta somente para `realfelipedeveloper/Clinora`.
