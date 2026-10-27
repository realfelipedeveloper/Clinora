# SPEC-003 — Catálogo clínico e recursos

Status: DRAFT — aprovação necessária antes de implementar.
Release: 2.

## Objetivo
Cadastrar pacientes, profissionais, especialidades, serviços, unidades,
salas, equipamentos e convênios sem vazamento entre tenants.

## Escopo e regras
- `core-api` é dono dos dados e migrações; `tenant_id` vem exclusivamente do
  contexto autenticado da SPEC-002. IDs de clientes nunca bastam para acesso.
- Paciente guarda o mínimo necessário, com consentimento/finalidade e controle
  contextual de visualização. Não registrar conteúdo clínico em logs.
- Profissional pode atuar em unidades e especialidades autorizadas.
- Serviço define duração, preparação anterior, intervalo posterior e recursos
  requeridos; valores e limites são configuráveis por tenant.
- Sala, equipamento e recurso exclusivo têm identificador estável e política
  de exclusividade; desativar recurso não apaga histórico.
- Convênio é catálogo e elegibilidade fake, sem integração externa nesta spec.
- Unicidade e referências usam chaves compostas por tenant; transações negam
  referências a paciente, profissional, unidade ou recurso de outro tenant.
- Datas civis são `LocalDate`; eventos globais são `Instant` e exibidos no
  timezone IANA da unidade/usuário.

## Ameaças e privacidade
- Busca e listagem são paginadas, filtradas por tenant e papel, com limites de
  consulta; campos sensíveis só aparecem a quem tem finalidade autorizada.
- Entrada maliciosa, mass assignment, enumeração de IDs, upload indevido e
  exclusão acidental devem falhar sem expor dados internos.
- Alterações são auditadas sem copiar o prontuário ou dados sensíveis ao log.

## Aceite e regressão obrigatória
- Unidade: validações, duração/buffers, exclusividade e transições ativo/inativo.
- Integração/Testcontainers: migrações, constraints compostas, CRUD autorizado,
  referências cruzadas negadas e consultas simultâneas sem perda de dados.
- E2E: cadastro/edição/busca dos catálogos em pt-BR, erros e permissões.
- Segurança: testes cross-tenant, IDOR, mass assignment, injeção, logs e
  controle de campos sensíveis.
- Cobertura geral >= 85%; isolamento/autorização >= 95%; gates verdes.

## Fora de escopo
Disponibilidade, hold, consulta, pagamento real e dados de prontuário.
