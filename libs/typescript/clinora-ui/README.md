# Clinora UI

Biblioteca Angular interna do Design System da Clinora. O pacote nao e
publicado no npm.

## Componentes

- `UiButton`: botao nativo com variantes `primary`, `secondary` e `ghost`.
- `UiInput` e `UiSelect`: controles com label obrigatoria, estado de erro,
  `ControlValueAccessor` e suporte a formularios reativos.
- `UiCard`: superficie para um item individual.
- `UiAlert`: aviso com tons `info`, `success`, `warning` e `danger`.
- `UiModal`: dialogo controlado por `open`/`closed`, foco inicial, retorno de
  foco, Escape, clique no fundo e ciclo de Tab.
- `UiStatusBadge`: rotulo textual com tom `neutral`, `success`, `warning` ou
  `danger`; a cor nunca e o unico indicador de estado.

Os componentes usam variaveis `--color-*` definidas pela aplicacao web em
`apps/web/src/styles.css`, com valores de fallback para outros consumidores.

## Comandos

Na raiz, com Node e pnpm da versao indicada em `.node-version`:

```powershell
corepack pnpm ui:test
corepack pnpm ui:build
```

Para consumir a biblioteca por `import { UiButton } from 'clinora-ui'`,
execute `ui:build` antes do build do consumidor. O mapeamento TypeScript
aponta para `dist/clinora-ui`.

Esta biblioteca nao implementa regras de consulta, reservas, tenant ou acesso
a dados clinicos.
