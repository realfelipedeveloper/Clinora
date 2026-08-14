# Git Flow

## Branches
- `main`: linha estavel de producao.
- `homologation`: linha de validacao antes de `main`.
- `development`: linha principal de integracao e branch padrao do repositorio.
- `feature/spec-001-task-XXX`: branches de tarefa da SPEC-001.
- `release/*`: preparacao de release.
- `hotfix/*`: correcao urgente a partir de `main`.

Fluxo padrao:

```text
feature/* -> development -> homologation -> main
```

Nao fazer commit direto em `main`, `homologation` ou `development`. Mudancas devem passar por Pull Request.

## Protecoes remotas
`main`, `homologation` e `development` estao protegidas no GitHub com:
- aplicacao das regras para administradores;
- Pull Request obrigatorio;
- 0 aprovacoes obrigatorias durante o bootstrap solo;
- historico linear;
- resolucao obrigatoria de conversas;
- force push desabilitado;
- delecao de branch desabilitada.

Quando houver mais colaboradores, aumentar `required_approving_review_count` para `1` ou mais.

## Commitlint
Commits devem seguir Conventional Commits:

```text
type(scope): descricao
```

Exemplos:

```text
chore(git): configure git flow baseline
docs(spec): update platform foundation notes
feat(apps): add web shell
```

Validacao local:

```powershell
pnpm commitlint
```

## Pull Requests
Usar o template em `.github/pull_request_template.md` e preencher spec, tarefa, validacoes, seguranca, privacidade, concorrencia, tempo, documentacao e memoria.

Alvos esperados:
- features e correcoes comuns entram em `development`;
- validacoes de pre-producao entram de `development` para `homologation`;
- promocao estavel entra de `homologation` para `main`.

## Alinhamento de baseline
Durante o bootstrap da SPEC-001, quando uma tarefa ja estiver validada e o usuario pedir
branches coesas, promover a mesma baseline por Pull Requests em cadeia:

```text
development -> homologation -> main
```

Ao final, `development`, `homologation` e `main` devem ter a mesma arvore de arquivos,
mesmo que os hashes de commit sejam diferentes por causa de merge, squash ou rebase do GitHub.
