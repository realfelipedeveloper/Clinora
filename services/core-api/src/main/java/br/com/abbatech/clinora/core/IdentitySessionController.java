package br.com.abbatech.clinora.core;

import java.net.URI;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/identity")
class IdentitySessionController {

    @GetMapping("/session")
    ResponseEntity<IdentitySession> session(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(new IdentitySession(URI.create(jwt.getIssuer().toString()), jwt.getSubject()));
    }

    record IdentitySession(URI issuer, String subject) {
    }
}
