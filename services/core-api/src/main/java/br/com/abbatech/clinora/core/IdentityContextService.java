package br.com.abbatech.clinora.core;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@Profile("!no-db")
class IdentityContextService {

    private final IdentityContextRepository repository;

    IdentityContextService(IdentityContextRepository repository) {
        this.repository = repository;
    }

    List<TenantContext> contexts(Jwt jwt) {
        Identity identity = identity(jwt);
        try {
            List<TenantContext> contexts = repository.activeContexts(identity.issuer(), identity.subject())
                    .stream().map(TenantContext::from).toList();
            repository.audit(identity.issuer(), identity.subject(), null,
                    "LIST_CONTEXTS", "ALLOWED", Instant.now());
            return contexts;
        } catch (DataAccessException exception) {
            throw unavailable();
        }
    }

    TenantContext context(Jwt jwt, String selectedTenant) {
        Identity identity = identity(jwt);
        UUID tenantId;
        try {
            tenantId = UUID.fromString(selectedTenant);
            if (!tenantId.toString().equalsIgnoreCase(selectedTenant)) {
                throw new IllegalArgumentException("UUID nao canonico");
            }
        } catch (IllegalArgumentException | NullPointerException exception) {
            try {
                repository.audit(identity.issuer(), identity.subject(), null,
                        "SELECT_CONTEXT", "DENIED", Instant.now());
            } catch (DataAccessException auditFailure) {
                throw unavailable();
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecao de tenant invalida");
        }

        try {
            IdentityContextRepository.MembershipContext membership = repository
                    .activeContexts(identity.issuer(), identity.subject()).stream()
                    .filter(candidate -> candidate.tenantId().equals(tenantId))
                    .findFirst().orElse(null);
            boolean allowed = membership != null && IdentityAuthorizationPolicy.permits(
                    IdentityAuthorizationPolicy.Action.VIEW_CONTEXT,
                    new IdentityAuthorizationPolicy.Context(membership.tenantId(), membership.role(),
                            Set.copyOf(membership.unitIds()), hasMfa(jwt), jwt.getClaimAsInstant("auth_time")),
                    new IdentityAuthorizationPolicy.Target(tenantId, null), Instant.now());
            repository.audit(identity.issuer(), identity.subject(),
                    membership == null ? null : membership.tenantId(),
                    "SELECT_CONTEXT", allowed ? "ALLOWED" : "DENIED", Instant.now());
            if (!allowed) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Contexto indisponivel");
            }
            return TenantContext.from(membership);
        } catch (DataAccessException exception) {
            throw unavailable();
        }
    }

    private static Identity identity(Jwt jwt) {
        if (jwt == null || jwt.getIssuer() == null || jwt.getSubject() == null
                || jwt.getSubject().isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Identidade indisponivel");
        }
        return new Identity(jwt.getIssuer().toString(), jwt.getSubject());
    }

    private static boolean hasMfa(Jwt jwt) {
        return "2".equals(jwt.getClaimAsString("acr"))
                || jwt.getClaimAsStringList("amr") != null
                && jwt.getClaimAsStringList("amr").contains("mfa");
    }

    private static ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Validacao indisponivel");
    }

    record TenantContext(UUID tenantId, String tenantName, IdentityAuthorizationPolicy.Role role,
            List<UUID> unitIds) {
        static TenantContext from(IdentityContextRepository.MembershipContext membership) {
            return new TenantContext(membership.tenantId(), membership.tenantName(),
                    membership.role(), membership.unitIds());
        }
    }

    private record Identity(String issuer, String subject) {
    }
}
