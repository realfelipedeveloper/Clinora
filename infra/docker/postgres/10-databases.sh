#!/bin/sh

psql --username "$POSTGRES_USER" --dbname postgres -v ON_ERROR_STOP=1 <<'SQL'
\getenv core_password CLINORA_CORE_DB_PASSWORD
\getenv payments_password CLINORA_PAYMENTS_DB_PASSWORD
\getenv notifications_password CLINORA_NOTIFICATIONS_DB_PASSWORD
\getenv integrations_password CLINORA_INTEGRATIONS_DB_PASSWORD

SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'clinora_core_user', :'core_password') \gexec
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'clinora_payments_user', :'payments_password') \gexec
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'clinora_notifications_user', :'notifications_password') \gexec
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'clinora_integrations_user', :'integrations_password') \gexec

CREATE DATABASE clinora_core OWNER clinora_core_user;
CREATE DATABASE clinora_payments OWNER clinora_payments_user;
CREATE DATABASE clinora_notifications OWNER clinora_notifications_user;
CREATE DATABASE clinora_integrations OWNER clinora_integrations_user;

REVOKE ALL ON DATABASE clinora_core FROM PUBLIC;
REVOKE ALL ON DATABASE clinora_payments FROM PUBLIC;
REVOKE ALL ON DATABASE clinora_notifications FROM PUBLIC;
REVOKE ALL ON DATABASE clinora_integrations FROM PUBLIC;
SQL
