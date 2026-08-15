# Lições Aprendidas

- 2026-08-14: O workspace inicial nao tinha `.git`; a fundacao foi iniciada em `develop` e `feature/spec-001-task-001` antes de editar arquivos. Depois, `develop` foi renomeada para `development`.
- 2026-08-14: Java 25, Node, pnpm, Git e Docker estao disponiveis localmente; `mvn` e `task` globais nao estao instalados.
- 2026-08-14: O remoto GitHub estava vazio; a primeira branch publicada virou default temporaria ate as branches base serem criadas. O nome correto da integracao e `development`.
- 2026-08-14: Para a TASK-002, o Maven Wrapper `only-script` evita versionar `maven-wrapper.jar` e ainda permite validar SHA-256 da distribuicao Maven.
- 2026-08-14: O fluxo correto usa `development` como integracao e `homologation` antes de `main`; `develop` foi aposentada.
- 2026-08-14: Angular 22 exige Node `^22.22.3`, `^24.15.0` ou `>=26.0.0`; Node `24.14.1` e `22.22.2` locais ficam abaixo do minimo.
- 2026-08-14: Quando o usuario pedir branches base sem destoar durante o bootstrap, alinhar conteudo por PRs em cadeia ate `main`.
- 2026-08-14: O binario `task` nao esta instalado globalmente; manter scripts `corepack pnpm ...` como caminho validavel e Taskfile como atalho opcional.
