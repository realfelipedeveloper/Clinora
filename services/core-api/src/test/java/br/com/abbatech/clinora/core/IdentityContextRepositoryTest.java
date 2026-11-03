package br.com.abbatech.clinora.core;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.ResultSet;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

class IdentityContextRepositoryTest {

    @Test
    void mapeiaTenantVinculoPapelEUnidadesAtivas() throws Exception {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        ResultSet row = mock(ResultSet.class);
        UUID tenant = UUID.randomUUID();
        UUID membership = UUID.randomUUID();
        UUID unit = UUID.randomUUID();
        when(row.getObject("tenant_id", UUID.class)).thenReturn(tenant);
        when(row.getObject("membership_id", UUID.class)).thenReturn(membership);
        when(row.getString("display_name")).thenReturn("Clinica A");
        when(row.getString("role")).thenReturn("RECEPTION");
        when(jdbc.queryForList(anyString(), eq(UUID.class), eq(tenant), eq(membership)))
                .thenReturn(List.of(unit));
        when(jdbc.query(anyString(),
                org.mockito.ArgumentMatchers.<RowMapper<IdentityContextRepository.MembershipContext>>any(),
                eq("issuer"), eq("subject")))
                .thenAnswer(invocation -> {
                    RowMapper<IdentityContextRepository.MembershipContext> mapper = invocation.getArgument(1);
                    return List.of(mapper.mapRow(row, 0));
                });

        var contexts = new IdentityContextRepository(jdbc).activeContexts("issuer", "subject");

        assertThat(contexts).containsExactly(new IdentityContextRepository.MembershipContext(
                tenant, membership, "Clinica A", IdentityAuthorizationPolicy.Role.RECEPTION,
                List.of(unit)));
        verify(jdbc).queryForList(org.mockito.ArgumentMatchers.contains("u.status = 'ACTIVE'"),
                eq(UUID.class), eq(tenant), eq(membership));
    }

    @Test
    void auditoriaUsaSomenteCamposPermitidos() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        Instant when = Instant.parse("2026-11-03T12:00:00Z");

        new IdentityContextRepository(jdbc).audit("issuer", "subject", null,
                "SELECT_CONTEXT", "DENIED", when);

        verify(jdbc).update(org.mockito.ArgumentMatchers.contains("identity_audit_event"),
                any(UUID.class), eq("issuer"), eq("subject"), eq(null),
                eq("SELECT_CONTEXT"), eq("DENIED"), eq(java.sql.Timestamp.from(when)));
    }
}
