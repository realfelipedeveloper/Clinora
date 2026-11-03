package br.com.abbatech.clinora.core;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

final class IdentityAuthorizationPolicy {

    private static final Duration STEP_UP_WINDOW = Duration.ofMinutes(5);

    enum Role {
        OWNER, ADMIN, RECEPTION, PROFESSIONAL, PATIENT
    }

    enum Action {
        VIEW_CONTEXT, MANAGE_TENANT, VIEW_UNIT, CRITICAL_OPERATION
    }

    record Context(UUID tenantId, Role role, Set<UUID> unitIds, boolean mfa,
            Instant authenticatedAt) {
        Context {
            unitIds = Set.copyOf(unitIds);
        }
    }

    record Target(UUID tenantId, UUID unitId) {
    }

    private IdentityAuthorizationPolicy() {
    }

    static boolean permits(Action action, Context actor, Target target, Instant now) {
        if (action == null || actor == null || target == null || now == null
                || actor.tenantId() == null || actor.role() == null
                || !actor.tenantId().equals(target.tenantId())) {
            return false;
        }

        boolean administrator = actor.role() == Role.OWNER || actor.role() == Role.ADMIN;
        if (administrator && !actor.mfa()) {
            return false;
        }

        return switch (action) {
            case VIEW_CONTEXT -> true;
            case MANAGE_TENANT -> administrator;
            case VIEW_UNIT -> target.unitId() != null && (administrator
                    || (actor.role() != Role.PATIENT && actor.unitIds().contains(target.unitId())));
            case CRITICAL_OPERATION -> administrator && actor.authenticatedAt() != null
                    && !actor.authenticatedAt().isBefore(now.minus(STEP_UP_WINDOW))
                    && !actor.authenticatedAt().isAfter(now);
        };
    }
}
