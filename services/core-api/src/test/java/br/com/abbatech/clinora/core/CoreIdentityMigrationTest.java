package br.com.abbatech.clinora.core;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

@Testcontainers
@EnabledIfEnvironmentVariable(named = "CI", matches = "true")
class CoreIdentityMigrationTest {

    @Container
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17.11-alpine3.23")
            .withDatabaseName("clinora_core")
            .withUsername("clinora_core_user")
            .withPassword("clinora_core_test_only");

    private static Flyway flyway;

    @BeforeAll
    static void migrate() {
        flyway = Flyway.configure()
                .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                .locations("classpath:db/migration")
                .load();
        flyway.migrate();
    }

    @Test
    void migraEsquemaUmaVezEConservaAsSeisTabelasDeIdentidade() throws Exception {
        assertEquals(0, flyway.migrate().migrationsExecuted);
        assertThat(queryLong("SELECT count(*) FROM information_schema.tables "
                + "WHERE table_schema = 'public' AND table_name IN "
                + "('tenant', 'external_identity', 'membership', 'tenant_unit', "
                + "'unit_assignment', 'professional_assignment')"))
                .isEqualTo(6L);
    }

    @Test
    void identificaPessoaPorEmissorESubjectESegregaVinculoPorTenant() throws Exception {
        UUID tenantA = tenant("identity-a");
        UUID tenantB = tenant("identity-b");
        UUID identity = identity("https://idp.example.test/a", "same-subject");
        identity("https://idp.example.test/b", "same-subject");

        assertSqlState("23505", () -> identity("https://idp.example.test/a", "same-subject"));
        membership(tenantA, identity, "OWNER", "ACTIVE");
        membership(tenantB, identity, "PATIENT", "ACTIVE");
        assertSqlState("23505", () -> membership(tenantA, identity, "ADMIN", "ACTIVE"));
    }

    @Test
    void impedeAtribuicaoDeUnidadeDeOutroTenantNoBanco() throws Exception {
        UUID tenantA = tenant("unit-a");
        UUID tenantB = tenant("unit-b");
        UUID actor = membership(tenantA, identity("https://idp.example.test/a", "unit-actor"),
                "RECEPTION", "ACTIVE");
        UUID unitA = unit(tenantA, "recepcao");
        UUID unitB = unit(tenantB, "recepcao");

        execute("INSERT INTO unit_assignment (tenant_id, membership_id, unit_id) VALUES (?, ?, ?)",
                tenantA, actor, unitA);
        assertSqlState("23503", () -> execute(
                "INSERT INTO unit_assignment (tenant_id, membership_id, unit_id) VALUES (?, ?, ?)",
                tenantA, actor, unitB));
    }

    @Test
    void impedeAtribuicaoDeProfissionalDeOutroTenantNoBanco() throws Exception {
        UUID tenantA = tenant("professional-a");
        UUID tenantB = tenant("professional-b");
        UUID actor = membership(tenantA,
                identity("https://idp.example.test/a", "professional-actor"),
                "RECEPTION", "ACTIVE");
        UUID localProfessional = membership(tenantA,
                identity("https://idp.example.test/a", "professional-local"),
                "PROFESSIONAL", "ACTIVE");
        UUID foreignProfessional = membership(tenantB,
                identity("https://idp.example.test/a", "professional-foreign"),
                "PROFESSIONAL", "ACTIVE");

        execute("INSERT INTO professional_assignment "
                + "(tenant_id, membership_id, professional_membership_id) VALUES (?, ?, ?)",
                tenantA, actor, localProfessional);
        assertSqlState("23503", () -> execute("INSERT INTO professional_assignment "
                + "(tenant_id, membership_id, professional_membership_id) VALUES (?, ?, ?)",
                tenantA, actor, foreignProfessional));
    }

    @Test
    void rejeitaPapelInvalidoERevogacaoSemInstanteUtc() throws Exception {
        UUID tenant = tenant("revocation");
        UUID identity = identity("https://idp.example.test/a", "revoked-user");

        assertSqlState("23514", () -> membership(tenant, identity, "ROOT", "ACTIVE"));
        assertSqlState("23514", () -> membership(tenant, identity, "ADMIN", "REVOKED"));
        UUID member = membership(tenant, identity, "ADMIN", "ACTIVE");
        Instant revokedAt = Instant.parse("2026-11-03T12:00:00Z");
        execute("UPDATE membership SET status = 'REVOKED', revoked_at = ?, version = version + 1 "
                + "WHERE id = ? AND tenant_id = ?", Timestamp.from(revokedAt), member, tenant);
        assertThat(queryLong("SELECT version FROM membership WHERE id = ?", member)).isEqualTo(1L);
        assertThat(queryInstant("SELECT revoked_at FROM membership WHERE id = ?", member))
                .isEqualTo(revokedAt);
    }

    private static UUID tenant(String slug) throws SQLException {
        UUID id = UUID.randomUUID();
        execute("INSERT INTO tenant (id, slug, status) VALUES (?, ?, 'ACTIVE')", id, slug);
        return id;
    }

    private static UUID identity(String issuer, String subject) throws SQLException {
        UUID id = UUID.randomUUID();
        execute("INSERT INTO external_identity (id, issuer, subject) VALUES (?, ?, ?)",
                id, issuer, subject);
        return id;
    }

    private static UUID membership(UUID tenant, UUID identity, String role, String status)
            throws SQLException {
        UUID id = UUID.randomUUID();
        execute("INSERT INTO membership (id, tenant_id, identity_id, role, status) "
                + "VALUES (?, ?, ?, ?, ?)", id, tenant, identity, role, status);
        return id;
    }

    private static UUID unit(UUID tenant, String code) throws SQLException {
        UUID id = UUID.randomUUID();
        execute("INSERT INTO tenant_unit (id, tenant_id, code, status) "
                + "VALUES (?, ?, ?, 'ACTIVE')", id, tenant, code);
        return id;
    }

    private static void execute(String sql, Object... arguments) throws SQLException {
        try (var connection = DriverManager.getConnection(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
                var statement = connection.prepareStatement(sql)) {
            for (int index = 0; index < arguments.length; index++) {
                statement.setObject(index + 1, arguments[index]);
            }
            statement.executeUpdate();
        }
    }

    private static long queryLong(String sql, Object... arguments) throws SQLException {
        try (var connection = DriverManager.getConnection(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
                var statement = connection.prepareStatement(sql)) {
            for (int index = 0; index < arguments.length; index++) {
                statement.setObject(index + 1, arguments[index]);
            }
            try (var result = statement.executeQuery()) {
                assertThat(result.next()).isTrue();
                return result.getLong(1);
            }
        }
    }

    private static Instant queryInstant(String sql, Object argument) throws SQLException {
        try (var connection = DriverManager.getConnection(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
                var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, argument);
            try (var result = statement.executeQuery()) {
                assertThat(result.next()).isTrue();
                return result.getTimestamp(1).toInstant();
            }
        }
    }

    private static void assertSqlState(String expected, SqlOperation operation) {
        SQLException failure = assertThrows(SQLException.class, operation::run);
        assertThat(failure.getSQLState()).isEqualTo(expected);
    }

    @FunctionalInterface
    private interface SqlOperation {
        void run() throws SQLException;
    }
}
