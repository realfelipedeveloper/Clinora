package br.com.abbatech.clinora.core;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Profile("!no-db")
@RequestMapping("/api/v1/identity")
class IdentityContextController {

    private final IdentityContextService service;

    IdentityContextController(IdentityContextService service) {
        this.service = service;
    }

    @GetMapping("/contexts")
    ResponseEntity<List<IdentityContextService.TenantContext>> contexts(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.contexts(jwt));
    }

    @GetMapping("/context")
    ResponseEntity<IdentityContextService.TenantContext> context(@AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Clinora-Tenant", required = false) String selectedTenant) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.context(jwt, selectedTenant));
    }
}
