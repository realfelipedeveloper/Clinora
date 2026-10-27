# apps/docs

Portal Angular de documentacao navegavel da Clinora (SPEC-001, TASK-018).

Os guias de `docs/` e a SPEC-001 sao copiados como assets no build. A lista
permitida de slugs e arquivos fica em `src/app/documents.ts`; acrescente uma
entrada ao publicar um novo guia. URLs nao catalogadas nao disparam leitura.
O Markdown e convertido com `marked` e renderizado pelo `innerHTML` do Angular,
sem bypass da sanitizacao. O portal nao recebe nem publica dados clinicos.

```powershell
corepack pnpm docs:serve
corepack pnpm docs:test
corepack pnpm docs:build
corepack pnpm e2e:test
```

O servidor usa `127.0.0.1:44211`, porta reservada na spec. `verify` executa
testes, build, E2E e axe-core em desktop/mobile. O portal funciona sem API.

