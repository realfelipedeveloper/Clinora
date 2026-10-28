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

## Promocao automatica
A workflow `.github/workflows/git-flow-promotion.yml` abre PRs de promocao em cadeia:

```text
merge em development  -> abre PR promovendo development para homologation
merge em homologation -> abre PR promovendo homologation para main
```

A automacao nao faz merge, nao aprova PR e nao faz checkout do codigo do PR de origem. Ela apenas:
- reage a PRs mergeados em `development` ou `homologation`;
- cria ou atualiza uma branch tecnica `promotion/*` baseada no destino;
- aplica nessa branch tecnica a arvore atual da origem logica;
- evita conflitos causados por historicos divergentes entre branches promovidas por squash ou rebase;
- abre o proximo PR com titulo e corpo em PT-BR;
- dispara a workflow de qualidade na branch tecnica quando ela ja estiver
  publicada na branch padrao, evitando depender da aprovacao manual exigida
  pelo GitHub para workflows acionados por PR criado com `GITHUB_TOKEN`.

O gatilho automatico `pull_request` de qualidade escuta apenas
`development`. Nas promocoes, o disparo explicito acima executa o mesmo
gate e evita runs falsamente falhos, sem jobs, em `homologation` e `main`.
PR manual fora da cadeia precisa disparar a qualidade na branch tecnica e
aguardar `clinora/qualidade` no SHA atual antes do merge.

O run por `workflow_dispatch` nao satisfaz, sozinho, um status check exigido
num PR. A workflow `.github/workflows/quality-status.yml` publica
`clinora/qualidade` para o SHA testado apenas se ele ainda for a ponta de um
PR aberto do proprio repositorio. Ela recebe um ID de run, aguarda a conclusao
por tempo limitado, consulta a API e baixa somente o publicador da branch
padrao; nao executa codigo do PR com o token que possui `statuses: write`.
O job `solicitar-status` da qualidade dispara o publicador mesmo quando os
testes falham, sem checkout e com `actions: write` restrito a esse job.
TASK-042 comprovou o bootstrap manual nos PRs #59 e #61; TASK-043 automatiza
o disparo. Exigir o status nas bases somente apos validar o ciclo remoto.

O ciclo automatico foi validado nos PRs #62, #63 e #64. As protecoes de
`development`, `homologation` e `main` exigem `clinora/qualidade` com branch
atualizada (`strict: true`), PR, historico linear, resolucao de conversas e
enforcement para administradores. Para auditar sem expor credenciais:

```powershell
gh api repos/realfelipedeveloper/Clinora/branches/development/protection | node tools/check-branch-protection.mjs development
gh api repos/realfelipedeveloper/Clinora/branches/homologation/protection | node tools/check-branch-protection.mjs homologation
gh api repos/realfelipedeveloper/Clinora/branches/main/protection | node tools/check-branch-protection.mjs main
```

A protecao inicial sem status exige o endpoint de `PUT` completo; o `PATCH`
de `required_status_checks` retorna 404. Preservar os demais campos e ler
novamente a protecao apos qualquer alteracao. Forks ainda precisam de fluxo
proprio antes de poderem satisfazer o status obrigatorio.

O repositorio deve manter a permissao padrao do `GITHUB_TOKEN` como leitura,
habilitar a criacao de Pull Requests por GitHub Actions e deixar a workflow de
promocao declarar `actions: write`, `contents: write` e `pull-requests: write`
somente para este uso especifico. A workflow de qualidade usa apenas
`contents: read` e nao recebe segredos de negocio.

No primeiro merge que publica `quality.yml`, o disparo automatico na promocao
pode ser pulado ate a workflow existir na branch padrao. Validar esse bootstrap
localmente e nos PRs; as promocoes seguintes usam o disparo automatico.

## Alinhamento de baseline
Durante o bootstrap da SPEC-001, quando uma tarefa ja estiver validada e o usuario pedir
branches coesas, promover a mesma baseline por Pull Requests em cadeia:

```text
development -> homologation -> main
```

Ao final, `development`, `homologation` e `main` devem ter a mesma arvore de arquivos,
mesmo que os hashes de commit sejam diferentes por causa de merge, squash ou rebase do GitHub.
