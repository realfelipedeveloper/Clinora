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

Ainda nao ha modulos Maven declarados. Os POMs dos servicos entram nas tarefas especificas de cada servico.

## Comandos

Windows:

```powershell
.\mvnw.cmd verify
```

Linux/macOS:

```sh
./mvnw verify
```

## Decisoes de seguranca
- Sem binario Maven Wrapper versionado.
- Sem secrets em configuracao Maven.
- Sem repositorios privados ou mirrors com credenciais.
- SCM aponta somente para `realfelipedeveloper/Clinora`.
