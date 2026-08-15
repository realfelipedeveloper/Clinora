# Scripts Globais

## Escopo
Fundacao de scripts globais e Taskfile da SPEC-001, TASK-004.

## Comandos pnpm

```powershell
corepack pnpm run doctor
corepack pnpm run verify
corepack pnpm run java:verify
corepack pnpm run frontend:check
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
task git:remote
```

O Taskfile chama os scripts pnpm equivalentes. Assim, quem nao tem `task` instalado pode
usar `corepack pnpm run ...` sem perder cobertura.

## Validacoes
- `doctor`: toolchain local, arquivos de fundacao, Angular workspace, Java e remoto Git.
- `verify`: executa `doctor`, `java:verify` e `frontend:check`.
- `java:verify`: executa `mvnw verify` com Java 25.
- `frontend:check`: valida lockfile congelado, peer dependencies e Angular workspace.
- `git:remote`: bloqueia qualquer remoto diferente de `realfelipedeveloper/Clinora`.

## Limites
O verificador completo de portas pertence a TASK-026. Esta tarefa nao inicia servicos locais.

## Seguranca e privacidade
- Nenhum dado sensivel de saude introduzido.
- Nenhum segredo real criado.
- Nenhum servico local iniciado.
- Nenhuma regra de agenda, tenant ou status de consulta implementada.
