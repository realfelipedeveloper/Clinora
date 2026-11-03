package br.com.abbatech.clinora.core;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

class IdentityContextServiceTest {

    private static final String ISSUER = "https://idp.example.test/realms/clinora";
    private static final String SUBJECT = "pessoa-1";

    private IdentityContextRepository repository;
    private IdentityContextService service;

    @BeforeEach
    void setUp() {
        repository = mock(IdentityContextRepository.class);
        service = new IdentityContextService(repository);
    }

    @Test
    void listaSomenteVinculosAtivosRetornadosPeloRepositorio() {
        UUID tenant = UUID.randomUUID();
        UUID unit = UUID.randomUUID();
        when(repository.activeContexts(ISSUER, SUBJECT)).thenReturn(List.of(
                membership(tenant, IdentityAuthorizationPolicy.Role.RECEPTION, List.of(unit))));

        var contexts = service.contexts(jwt(Map.of()));

        assertThat(contexts).hasSize(1);
        assertThat(contexts.getFirst().tenantId()).isEqualTo(tenant);
        assertThat(contexts.getFirst().unitIds()).containsExactly(unit);
        verify(repository).audit(eq(ISSUER), eq(SUBJECT), eq(null),
                eq("LIST_CONTEXTS"), eq("ALLOWED"), any(Instant.class));
    }

    @Test
    void selecaoDeOutroTenantFalhaSemAuditarIdNaoValidado() {
        UUID selected = UUID.randomUUID();
        when(repository.activeContexts(ISSUER, SUBJECT)).thenReturn(List.of());

        assertStatus(HttpStatus.FORBIDDEN, () -> service.context(jwt(Map.of()), selected.toString()));
        verify(repository).audit(eq(ISSUER), eq(SUBJECT), eq(null),
                eq("SELECT_CONTEXT"), eq("DENIED"), any(Instant.class));
    }

    @Test
    void exigeMfaParaAdministradorEPermiteAposStepUp() {
        UUID tenant = UUID.randomUUID();
        when(repository.activeContexts(ISSUER, SUBJECT)).thenReturn(List.of(
                membership(tenant, IdentityAuthorizationPolicy.Role.ADMIN, List.of())));

        assertStatus(HttpStatus.FORBIDDEN, () -> service.context(jwt(Map.of()), tenant.toString()));
        assertThat(service.context(jwt(Map.of("acr", "2")), tenant.toString()).role())
                .isEqualTo(IdentityAuthorizationPolicy.Role.ADMIN);
        verify(repository).audit(eq(ISSUER), eq(SUBJECT), eq(tenant),
                eq("SELECT_CONTEXT"), eq("DENIED"), any(Instant.class));
        verify(repository).audit(eq(ISSUER), eq(SUBJECT), eq(tenant),
                eq("SELECT_CONTEXT"), eq("ALLOWED"), any(Instant.class));
    }

    @Test
    void selecaoMalformadaRetornaBadRequest() {
        assertStatus(HttpStatus.BAD_REQUEST, () -> service.context(jwt(Map.of()), null));
        assertStatus(HttpStatus.BAD_REQUEST, () -> service.context(jwt(Map.of()), "nao-e-uuid"));
        assertStatus(HttpStatus.BAD_REQUEST, () -> service.context(jwt(Map.of()), "1-1-1-1-1"));
        verify(repository, org.mockito.Mockito.times(3)).audit(eq(ISSUER), eq(SUBJECT), eq(null),
                eq("SELECT_CONTEXT"), eq("DENIED"), any(Instant.class));
    }

    @Test
    void falhaDeRepositorioNaoRetornaContexto() {
        when(repository.activeContexts(ISSUER, SUBJECT))
                .thenThrow(new DataAccessResourceFailureException("indisponivel"));

        assertStatus(HttpStatus.SERVICE_UNAVAILABLE,
                () -> service.context(jwt(Map.of()), UUID.randomUUID().toString()));
        assertStatus(HttpStatus.SERVICE_UNAVAILABLE, () -> service.contexts(jwt(Map.of())));
    }

    private static IdentityContextRepository.MembershipContext membership(UUID tenant,
            IdentityAuthorizationPolicy.Role role, List<UUID> units) {
        return new IdentityContextRepository.MembershipContext(tenant, UUID.randomUUID(),
                "Clinica", role, units);
    }

    private static Jwt jwt(Map<String, Object> extraClaims) {
        var builder = Jwt.withTokenValue("nao-registrar-token")
                .header("alg", "RS256")
                .issuer(ISSUER)
                .subject(SUBJECT)
                .issuedAt(Instant.parse("2026-11-03T12:00:00Z"))
                .expiresAt(Instant.parse("2026-11-03T13:00:00Z"));
        extraClaims.forEach(builder::claim);
        return builder.build();
    }

    private static void assertStatus(HttpStatus expected, Runnable action) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(ResponseStatusException.class,
                exception -> assertThat(exception.getStatusCode()).isEqualTo(expected));
    }
}
