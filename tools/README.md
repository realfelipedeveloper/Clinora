# Tools

Scripts e utilitarios locais da Clinora.

`clinora.mjs` oferece `doctor`, `verify`, comandos de teste/build/seguranca,
guard do remote oficial e `ports:check`. Este ultimo usa o JSON efetivo de
`docker compose config` e tenta bind em loopback para diagnosticar conflitos
antes de iniciar a stack. Os testes de scripts rodam em `pnpm run tools:test`.

