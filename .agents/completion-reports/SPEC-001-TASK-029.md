# Relatorio de Conclusao

## Tarefa
SPEC-001, TASK-029: Testcontainers de PostgreSQL efemero.

## Objetivo e impacto
Exercitar o banco da fundacao em container descartavel e porta mapeada,
sem acoplar as APIs de negocio ao banco antes das specs correspondentes.

## Testes novos e camadas
- Integracao: `PostgresContainerTest` inicia PostgreSQL 17.11 e consulta
  banco/usuario por JDBC real, sem porta fixa.
- Seguranca: senha incorreta deve falhar com SQLSTATE `28P01` sem vazar o
  valor no erro; papeis de core/payments so acessam o proprio banco e o
  acesso cruzado deve falhar com SQLSTATE `42501`.
- Unidade: nao ha regra pura nova; os testes de unidade existentes continuam
  no gate. E2E navegador nao se aplica a banco de infraestrutura.

## Concorrencia, tempo, ameacas e privacidade
Testcontainers mapeia porta efemera, evitando colisao com as reservas do
Compose; o container e descartado ao fim da classe. So existem bancos,
usuarios e senhas ficticios. Nenhum dado clinico, tenant, reserva ou instante
global e usado. Os servicos Java nao recebem driver ou credenciais.

## Validacao
Teste falhou inicialmente por dependencias ausentes; apos adicionar dependencias
de teste gerenciadas, a API nao generica do Testcontainers 2.0.5 foi ajustada.
`mvnw -pl libs/java/clinora-test-support -am clean verify` e `pnpm run verify`
passaram localmente, incluindo 53 testes de ferramentas, Maven,
Angular/Storybook, 16 E2E e auditoria. Esta registrou 8 alertas em
dependencias de desenvolvimento e nenhum em producao. O relatorio Surefire
marca os tres testes de container explicitamente skipped sem Docker acessivel;
nao ha alegacao de cobertura local dessa camada. Execucao real Linux e
promocao protegida pendentes nesta etapa.

## Documentacao e memoria
Guia Java, matriz de regressao, active-feature e lessons-learned atualizados.
