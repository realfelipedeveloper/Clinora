# Scripts Globais

## Escopo
Fundacao de scripts globais e Taskfile da SPEC-001, TASK-004.

## Comandos pnpm

```powershell
corepack pnpm run doctor
corepack pnpm run verify
corepack pnpm run java:verify
corepack pnpm run frontend:check
corepack pnpm run frontend:verify
corepack pnpm run tools:test
corepack pnpm run security:check
corepack pnpm run git:remote
```

## Taskfile
O repositorio possui `Taskfile.yml` no schema `version: '3'`.

Com Go Task instalado:

```powershell
task doctor
task verify
task java:verify
task frontend:check
task frontend:verify
task tools:test
task security:check
task git:remote
```

O Taskfile chama os scripts pnpm equivalentes. Assim, quem nao tem `task` instalado pode
usar `corepack pnpm run ...` sem perder cobertura.

## Validacoes
- `doctor`: toolchain local, arquivos de fundacao, Angular workspace, Java e remoto Git.
- `verify`: executa `doctor`, `tools:test`, `java:verify`, `frontend:verify` e
  `security:check`.
- `java:verify`: executa `mvnw verify` com Java 25.
- `frontend:check`: valida lockfile congelado, peer dependencies e Angular workspace.
- `frontend:verify`: executa `frontend:check`, testes Vitest de web/UI e builds
  de web/UI/Storybook.
- `tools:test`: testa o guard do remote em repositorios Git temporarios.
- `security:check`: auditoria pnpm, bloqueando alertas altos em producao e
  criticos em todas as dependencias.
- `git:remote`: bloqueia qualquer remoto diferente de `realfelipedeveloper/Clinora`.

## Limites
O verificador completo de portas pertence a TASK-026. `doctor` e
`frontend:check` nao iniciam servicos; `verify` executa testes Spring Boot em
portas aleatorias, sem ocupar as portas reservadas do host.

## Seguranca e privacidade
- Nenhum dado sensivel de saude introduzido.
- Nenhum segredo real criado.
- Nenhum servico de negocio persistente e iniciado pelos scripts; testes HTTP
  usam processos efemeros e portas aleatorias.
- Nenhuma regra de agenda, tenant ou status de consulta implementada.
