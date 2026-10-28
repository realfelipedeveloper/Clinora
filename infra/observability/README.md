# infra/observability

Configuracoes de observabilidade local da TASK-025. O Compose sobe Prometheus
em `http://127.0.0.1:44281` e Grafana em `http://127.0.0.1:44280`, somente
em loopback. O Grafana exige usuario `clinora_local` e senha de desenvolvimento
`clinora_grafana_local_only_2026`, substituivel por
`CLINORA_GRAFANA_ADMIN_PASSWORD`. As portas podem ser alteradas por
`CLINORA_PROMETHEUS_PORT` e `CLINORA_GRAFANA_PORT`.

`prometheus.yml` coleta `/actuator/prometheus` dos cinco servicos Java da rede
Compose; o perfil `observability` e ativado somente nesses containers. O
datasource Grafana e provisionado para `http://prometheus:9090`. O volume do
Prometheus retem um dia; Grafana persiste configuracoes locais em volume
proprio. Nao use dados clinicos reais, identificadores de pacientes, tenants
ou consultas em labels. Nao exponha essas portas fora de loopback.

O smoke de CI consulta os cinco alvos saudaveis e verifica que a API do
Grafana nega leitura anonima. Prometheus nao tem autenticacao propria nesta
stack de desenvolvimento; producao exige rede, autenticacao e TLS proprios.

Referencias: [Prometheus em Docker](https://prometheus.io/docs/prometheus/latest/installation/),
[Grafana em Docker](https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/).

