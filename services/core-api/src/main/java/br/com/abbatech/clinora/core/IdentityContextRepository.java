package br.com.abbatech.clinora.core;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!no-db")
class IdentityContextRepository {

    private final JdbcTemplate jdbc;

    IdentityContextRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    List<MembershipContext> activeContexts(String issuer, String subject) {
        return jdbc.query("""
                SELECT m.id AS membership_id, m.tenant_id, t.display_name, m.role
                FROM external_identity e
                JOIN membership m ON m.identity_id = e.id
                JOIN tenant t ON t.id = m.tenant_id
                WHERE e.issuer = ? AND e.subject = ?
                  AND m.status = 'ACTIVE' AND t.status = 'ACTIVE'
                ORDER BY t.display_name, t.id
                """, (row, ignored) -> {
            UUID tenantId = row.getObject("tenant_id", UUID.class);
            UUID membershipId = row.getObject("membership_id", UUID.class);
            List<UUID> units = jdbc.queryForList("""
                    SELECT a.unit_id FROM unit_assignment a
                    JOIN tenant_unit u ON u.id = a.unit_id AND u.tenant_id = a.tenant_id
                    WHERE a.tenant_id = ? AND a.membership_id = ? AND u.status = 'ACTIVE'
                    ORDER BY unit_id
                    """, UUID.class, tenantId, membershipId);
            return new MembershipContext(tenantId, membershipId,
                    row.getString("display_name"),
                    IdentityAuthorizationPolicy.Role.valueOf(row.getString("role")), units);
        }, issuer, subject);
    }

    void audit(String issuer, String subject, UUID validatedTenant, String action,
            String result, Instant occurredAt) {
        jdbc.update("""
                INSERT INTO identity_audit_event
                    (id, actor_issuer, actor_subject, tenant_id, purpose, action, result, occurred_at)
                VALUES (?, ?, ?, ?, 'IDENTITY_CONTEXT', ?, ?, ?)
                """, UUID.randomUUID(), issuer, subject, validatedTenant, action, result,
                Timestamp.from(occurredAt));
    }

    record MembershipContext(UUID tenantId, UUID membershipId, String tenantName,
            IdentityAuthorizationPolicy.Role role, List<UUID> unitIds) {
    }
}
