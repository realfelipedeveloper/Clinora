package br.com.abbatech.clinora.core;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class IdentityContextControllerTest {

    @Test
    void listaESecaoNaoArmazenamRespostaEmCache() {
        IdentityContextService service = mock(IdentityContextService.class);
        Jwt jwt = mock(Jwt.class);
        UUID tenant = UUID.randomUUID();
        var context = new IdentityContextService.TenantContext(tenant, "Clinica A",
                IdentityAuthorizationPolicy.Role.RECEPTION, List.of());
        when(service.contexts(jwt)).thenReturn(List.of(context));
        when(service.context(jwt, tenant.toString())).thenReturn(context);
        var controller = new IdentityContextController(service);

        var list = controller.contexts(jwt);
        var selected = controller.context(jwt, tenant.toString());

        assertThat(list.getBody()).containsExactly(context);
        assertThat(selected.getBody()).isEqualTo(context);
        assertThat(list.getHeaders().getCacheControl()).contains("no-store");
        assertThat(selected.getHeaders().getCacheControl()).contains("no-store");
    }
}
