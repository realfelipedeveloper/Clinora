package br.com.abbatech.clinora.core;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Date;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest(
        classes = CoreApiApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "debug=false"
)
class CoreJwtSecurityTest {

    private static final String ISSUER = "https://idp.clinora.test/realms/clinora";
    private static final KeyPair KEY_PAIR = keyPair();
    private static final HttpServer JWK_SERVER = jwkServer();

    @Value("${local.server.port}")
    private int port;

    @Autowired
    private JwtDecoder decoder;

    @DynamicPropertySource
    static void jwtProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.security.oauth2.resourceserver.jwt.issuer-uri", () -> ISSUER);
        registry.add("spring.security.oauth2.resourceserver.jwt.jwk-set-uri",
                () -> "http://127.0.0.1:" + JWK_SERVER.getAddress().getPort() + "/jwks");
    }

    @AfterAll
    static void stopJwkServer() {
        JWK_SERVER.stop(0);
    }

    @Test
    void validaAssinaturaEmissorAudienciaEJanelaTemporal() throws Exception {
        Instant now = Instant.now();
        String valid = token(KEY_PAIR, ISSUER, "clinora-core", "clinora",
                now.minusSeconds(10), now.plusSeconds(120));
        assertThat(decoder.decode(valid).getSubject()).isEqualTo("clinora-user");

        assertRejected(token(KEY_PAIR, "https://evil.example/realms/clinora", "clinora-core",
                "clinora", now.minusSeconds(10), now.plusSeconds(120)));
        assertRejected(token(KEY_PAIR, ISSUER, "another-api", "clinora",
                now.minusSeconds(10), now.plusSeconds(120)));
        assertRejected(token(KEY_PAIR, ISSUER, "clinora-core", "clinora",
                now.minusSeconds(180), now.minusSeconds(120)));
        assertRejected(token(KEY_PAIR, ISSUER, "clinora-core", "clinora",
                now.plusSeconds(120), now.plusSeconds(240)));
        assertRejected(token(keyPair(), ISSUER, "clinora-core", "clinora",
                now.minusSeconds(10), now.plusSeconds(120)));
    }

    @Test
    void endpointExigeTokenValidoEEscopoClinora() throws Exception {
        Instant now = Instant.now();
        String valid = token(KEY_PAIR, ISSUER, "clinora-core", "clinora",
                now.minusSeconds(10), now.plusSeconds(120));
        String noScope = token(KEY_PAIR, ISSUER, "clinora-core", "openid",
                now.minusSeconds(10), now.plusSeconds(120));
        String wrongAudience = token(KEY_PAIR, ISSUER, "another-api", "clinora",
                now.minusSeconds(10), now.plusSeconds(120));

        assertThat(request(null).statusCode()).isEqualTo(401);
        assertThat(request(noScope).statusCode()).isEqualTo(403);
        assertThat(request(wrongAudience).statusCode()).isEqualTo(401);
        HttpResponse<String> session = request(valid);
        assertThat(session.statusCode()).isEqualTo(200);
        assertThat(session.body()).contains("\"issuer\":\"" + ISSUER + "\"")
                .contains("\"subject\":\"clinora-user\"");
        assertThat(session.headers().firstValue("Cache-Control")).hasValue("no-store");
    }

    @Test
    void corsAceitaSomenteOrigemWebLocalSemCredenciais() throws Exception {
        HttpResponse<String> allowed = preflight("http://127.0.0.1:44210");
        assertThat(allowed.headers().firstValue("Access-Control-Allow-Origin"))
                .as("HTTP %s: %s", allowed.statusCode(), allowed.body())
                .hasValue("http://127.0.0.1:44210");
        assertThat(preflight("https://evil.example")
                .headers().firstValue("Access-Control-Allow-Origin"))
                .isEmpty();
        assertThat(preflight("http://127.0.0.1:44210")
                .headers().firstValue("Access-Control-Allow-Credentials"))
                .isEmpty();
    }

    private void assertRejected(String token) {
        assertThatThrownBy(() -> decoder.decode(token)).isInstanceOf(JwtException.class);
    }

    private HttpResponse<String> request(String token) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://127.0.0.1:" + port + "/api/v1/identity/session"))
                .GET();
        if (token != null) builder.header("Authorization", "Bearer " + token);
        try (HttpClient client = HttpClient.newHttpClient()) {
            return client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        }
    }

    private HttpResponse<String> preflight(String origin) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://127.0.0.1:" + port + "/api/v1/identity/session"))
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .header("Origin", origin)
                .header("Access-Control-Request-Method", "GET")
                .header("Access-Control-Request-Headers", "authorization,x-clinora-tenant")
                .build();
        try (HttpClient client = HttpClient.newHttpClient()) {
            return client.send(request, HttpResponse.BodyHandlers.ofString());
        }
    }

    private static String token(KeyPair pair, String issuer, String audience, String scope,
            Instant notBefore, Instant expiresAt) throws Exception {
        SignedJWT jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256)
                .keyID("clinora-test").build(), new JWTClaimsSet.Builder()
                .issuer(issuer)
                .subject("clinora-user")
                .audience(audience)
                .claim("scope", scope)
                .issueTime(Date.from(notBefore))
                .notBeforeTime(Date.from(notBefore))
                .expirationTime(Date.from(expiresAt))
                .build());
        jwt.sign(new RSASSASigner(pair.getPrivate()));
        return jwt.serialize();
    }

    private static KeyPair keyPair() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (Exception error) {
            throw new IllegalStateException("Falha ao criar chave de teste", error);
        }
    }

    private static HttpServer jwkServer() {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            String body = new JWKSet(new RSAKey.Builder((RSAPublicKey) KEY_PAIR.getPublic())
                    .keyID("clinora-test").build()).toString();
            server.createContext("/jwks", exchange -> {
                byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", MediaType.APPLICATION_JSON_VALUE);
                exchange.sendResponseHeaders(200, bytes.length);
                try (var output = exchange.getResponseBody()) {
                    output.write(bytes);
                }
            });
            server.start();
            return server;
        } catch (Exception error) {
            throw new IllegalStateException("Falha ao iniciar JWKS de teste", error);
        }
    }

}
