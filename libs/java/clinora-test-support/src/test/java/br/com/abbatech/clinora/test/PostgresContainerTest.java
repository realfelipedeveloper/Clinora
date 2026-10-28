package br.com.abbatech.clinora.test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.sql.DriverManager;
import java.sql.SQLException;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

@Testcontainers
@EnabledIfEnvironmentVariable(named = "CI", matches = "true")
class PostgresContainerTest {

    @Container
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17.11-alpine3.23")
            .withDatabaseName("clinora_test")
            .withUsername("clinora_test_user")
            .withPassword("clinora_test_local_only");

    @Test
    void conectaAoBancoEfemeroSemPortaFixa() throws Exception {
        try (var connection = DriverManager.getConnection(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
                var statement = connection.createStatement();
                var result = statement.executeQuery("SELECT current_database(), current_user")) {
            assertThat(result.next()).isTrue();
            assertThat(result.getString(1)).isEqualTo("clinora_test");
            assertThat(result.getString(2)).isEqualTo("clinora_test_user");
            assertThat(result.next()).isFalse();
        }
    }

    @Test
    void rejeitaSenhaIncorretaSemVazarSeuValor() {
        String wrongPassword = "senha_incorreta_de_teste";
        SQLException failure = assertThrows(SQLException.class, () ->
                DriverManager.getConnection(postgres.getJdbcUrl(), postgres.getUsername(),
                        wrongPassword));
        assertThat(failure.getSQLState()).isEqualTo("28P01");
        assertThat(failure.getMessage()).doesNotContain(wrongPassword);
    }

    @Test
    void impedeAcessoCruzadoEntreBancosDeServicos() throws Exception {
        try (var admin = DriverManager.getConnection(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
                var statement = admin.createStatement()) {
            statement.execute("CREATE ROLE clinora_core_user LOGIN PASSWORD 'clinora_core_test_only'");
            statement.execute("CREATE ROLE clinora_payments_user LOGIN PASSWORD 'clinora_payments_test_only'");
            statement.execute("CREATE DATABASE clinora_core OWNER clinora_core_user");
            statement.execute("CREATE DATABASE clinora_payments OWNER clinora_payments_user");
            statement.execute("REVOKE ALL ON DATABASE clinora_core FROM PUBLIC");
            statement.execute("REVOKE ALL ON DATABASE clinora_payments FROM PUBLIC");
        }

        assertDatabaseAccess("clinora_core", "clinora_core_user", "clinora_core_test_only");
        assertDatabaseAccess("clinora_payments", "clinora_payments_user", "clinora_payments_test_only");
        assertDatabaseDenied("clinora_payments", "clinora_core_user", "clinora_core_test_only");
        assertDatabaseDenied("clinora_core", "clinora_payments_user", "clinora_payments_test_only");
    }

    private static void assertDatabaseAccess(String database, String user, String password)
            throws Exception {
        try (var connection = DriverManager.getConnection(databaseUrl(database), user, password);
                var statement = connection.createStatement();
                var result = statement.executeQuery("SELECT current_database()")) {
            assertThat(result.next()).isTrue();
            assertThat(result.getString(1)).isEqualTo(database);
        }
    }

    private static void assertDatabaseDenied(String database, String user, String password) {
        SQLException failure = assertThrows(SQLException.class, () ->
                DriverManager.getConnection(databaseUrl(database), user, password));
        assertThat(failure.getSQLState()).isEqualTo("42501");
    }

    private static String databaseUrl(String database) {
        return "jdbc:postgresql://" + postgres.getHost() + ":"
                + postgres.getMappedPort(5432) + "/" + database;
    }
}
