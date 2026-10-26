package br.com.abbatech.clinora.integration;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
        classes = IntegrationApiApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "debug=false"
)
class IntegrationApiApplicationTest {

    @Value("${local.server.port}")
    private int port;

    @Test
    void expoeSaudeSemDetalhesInternos() throws Exception {
        try (HttpClient client = HttpClient.newHttpClient()) {
            for (String path : new String[] {
                    "/actuator/health",
                    "/actuator/health/liveness",
                    "/actuator/health/readiness"
            }) {
                HttpResponse<String> response = get(client, path);
                assertThat(response.statusCode()).isEqualTo(200);
                assertThat(response.body()).contains("\"status\":\"UP\"");
                assertThat(response.body()).doesNotContain("components");
            }

            assertThat(get(client, "/actuator/env").statusCode()).isEqualTo(404);
        }
    }

    private HttpResponse<String> get(HttpClient client, String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://127.0.0.1:" + port + path))
                .GET()
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
