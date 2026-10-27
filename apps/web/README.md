# apps/web

Aplicacao Angular principal da Clinora.

Aplicacao Angular executavel da SPEC-001. A TASK-013 estabelece a base com
roteamento, Vitest, build de producao e interface inicial em pt-BR.

Na raiz do repositorio, com Node 24.15.0 e pnpm 11.20.0:

```powershell
corepack pnpm web:test
corepack pnpm web:build
corepack pnpm web:serve
corepack pnpm e2e:install
corepack pnpm e2e:test
```

O servidor local usa `127.0.0.1:44210`; confirme que a porta esta livre antes
de inicia-lo. Tailwind CSS 4 e os tokens de cor ficam em `src/styles.css`.
Design System e landing completa pertencem as tarefas seguintes.
Playwright executa smoke desktop/mobile e axe-core; o `verify` global inclui
esses testes. A porta 44210 precisa estar livre para a suite iniciar.

