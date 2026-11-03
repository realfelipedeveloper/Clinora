package br.com.abbatech.clinora.core;

import static br.com.abbatech.clinora.core.IdentityAuthorizationPolicy.Action.CRITICAL_OPERATION;
import static br.com.abbatech.clinora.core.IdentityAuthorizationPolicy.Action.MANAGE_TENANT;
import static br.com.abbatech.clinora.core.IdentityAuthorizationPolicy.Action.VIEW_CONTEXT;
import static br.com.abbatech.clinora.core.IdentityAuthorizationPolicy.Action.VIEW_UNIT;
import static br.com.abbatech.clinora.core.IdentityAuthorizationPolicy.Role.ADMIN;
import static br.com.abbatech.clinora.core.IdentityAuthorizationPolicy.Role.OWNER;
import static br.com.abbatech.clinora.core.IdentityAuthorizationPolicy.Role.PATIENT;
import static br.com.abbatech.clinora.core.IdentityAuthorizationPolicy.Role.PROFESSIONAL;
import static br.com.abbatech.clinora.core.IdentityAuthorizationPolicy.Role.RECEPTION;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.Test;

class IdentityAuthorizationPolicyTest {

    private static final UUID TENANT = UUID.randomUUID();
    private static final UUID OTHER_TENANT = UUID.randomUUID();
    private static final UUID UNIT = UUID.randomUUID();
    private static final UUID OTHER_UNIT = UUID.randomUUID();
    private static final Instant NOW = Instant.parse("2026-11-03T12:00:00Z");

    @Test
    void exigeMesmoTenantParaTodasAsAcoes() {
        var owner = context(OWNER, Set.of(UNIT), true, NOW);
        var other = new IdentityAuthorizationPolicy.Target(OTHER_TENANT, UNIT);
        for (var action : IdentityAuthorizationPolicy.Action.values()) {
            assertThat(IdentityAuthorizationPolicy.permits(action, owner, other, NOW)).isFalse();
        }
    }

    @Test
    void negaAcaoEContextoAusentesPorPadrao() {
        var patient = context(PATIENT, Set.of(), false, null);
        var ownTenant = target(null);
        assertThat(IdentityAuthorizationPolicy.permits(null, patient, ownTenant, NOW)).isFalse();
        assertThat(IdentityAuthorizationPolicy.permits(VIEW_CONTEXT, null, ownTenant, NOW)).isFalse();
        assertThat(IdentityAuthorizationPolicy.permits(VIEW_CONTEXT, patient, null, NOW)).isFalse();
        assertThat(IdentityAuthorizationPolicy.permits(VIEW_CONTEXT, patient, ownTenant, null))
                .isFalse();
    }

    @Test
    void permiteContextoAtivoMasExigeMfaParaAdministradores() {
        for (var role : Set.of(RECEPTION, PROFESSIONAL, PATIENT)) {
            assertThat(IdentityAuthorizationPolicy.permits(VIEW_CONTEXT,
                    context(role, Set.of(), false, null), target(null), NOW)).isTrue();
        }
        for (var role : Set.of(OWNER, ADMIN)) {
            assertThat(IdentityAuthorizationPolicy.permits(VIEW_CONTEXT,
                    context(role, Set.of(), false, NOW), target(null), NOW)).isFalse();
            assertThat(IdentityAuthorizationPolicy.permits(VIEW_CONTEXT,
                    context(role, Set.of(), true, NOW), target(null), NOW)).isTrue();
        }
    }

    @Test
    void restringeGestaoDoTenantAProprietarioOuAdministradorComMfa() {
        for (var role : Set.of(OWNER, ADMIN)) {
            assertThat(IdentityAuthorizationPolicy.permits(MANAGE_TENANT,
                    context(role, Set.of(), true, NOW), target(null), NOW)).isTrue();
        }
        for (var role : Set.of(RECEPTION, PROFESSIONAL, PATIENT)) {
            assertThat(IdentityAuthorizationPolicy.permits(MANAGE_TENANT,
                    context(role, Set.of(), true, NOW), target(null), NOW)).isFalse();
        }
    }

    @Test
    void restringeUnidadePorAtribuicaoEPerfil() {
        for (var role : Set.of(RECEPTION, PROFESSIONAL)) {
            var actor = context(role, Set.of(UNIT), false, null);
            assertThat(IdentityAuthorizationPolicy.permits(VIEW_UNIT, actor, target(UNIT), NOW))
                    .isTrue();
            assertThat(IdentityAuthorizationPolicy.permits(VIEW_UNIT, actor, target(OTHER_UNIT), NOW))
                    .isFalse();
        }
        assertThat(IdentityAuthorizationPolicy.permits(VIEW_UNIT,
                context(PATIENT, Set.of(UNIT), false, null), target(UNIT), NOW)).isFalse();
        assertThat(IdentityAuthorizationPolicy.permits(VIEW_UNIT,
                context(ADMIN, Set.of(), true, NOW), target(UNIT), NOW)).isTrue();
        assertThat(IdentityAuthorizationPolicy.permits(VIEW_UNIT,
                context(ADMIN, Set.of(), true, NOW), target(null), NOW)).isFalse();
    }

    @Test
    void stepUpExigeMfaEAutenticacaoRecenteSemAceitarTempoFuturo() {
        assertThat(IdentityAuthorizationPolicy.permits(CRITICAL_OPERATION,
                context(OWNER, Set.of(), true, NOW.minusSeconds(300)), target(null), NOW))
                .isTrue();
        assertThat(IdentityAuthorizationPolicy.permits(CRITICAL_OPERATION,
                context(ADMIN, Set.of(), true, NOW.minusSeconds(301)), target(null), NOW))
                .isFalse();
        assertThat(IdentityAuthorizationPolicy.permits(CRITICAL_OPERATION,
                context(ADMIN, Set.of(), true, NOW.plusSeconds(1)), target(null), NOW))
                .isFalse();
        assertThat(IdentityAuthorizationPolicy.permits(CRITICAL_OPERATION,
                context(ADMIN, Set.of(), true, null), target(null), NOW)).isFalse();
        assertThat(IdentityAuthorizationPolicy.permits(CRITICAL_OPERATION,
                context(RECEPTION, Set.of(), true, NOW), target(null), NOW)).isFalse();
    }

    private static IdentityAuthorizationPolicy.Context context(
            IdentityAuthorizationPolicy.Role role, Set<UUID> units, boolean mfa, Instant at) {
        return new IdentityAuthorizationPolicy.Context(TENANT, role, units, mfa, at);
    }

    private static IdentityAuthorizationPolicy.Target target(UUID unit) {
        return new IdentityAuthorizationPolicy.Target(TENANT, unit);
    }
}
