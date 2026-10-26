# apps/web

Aplicacao Angular principal da Clinora.

Aplicacao Angular executavel da SPEC-001. A TASK-013 estabelece a base com
roteamento, Vitest, build de producao e interface inicial em pt-BR.

Na raiz do repositorio, com Node 24.15.0 e pnpm 11.20.0:

```powershell
corepack pnpm web:test
corepack pnpm web:build
corepack pnpm web:serve
```

O servidor local usa `127.0.0.1:44210`; confirme que a porta esta livre antes
de inicia-lo. Tailwind, Design System e landing completa pertencem as tarefas
seguintes.

