package br.com.abbatech.clinora.test;

import static org.junit.jupiter.api.Assertions.assertEquals;

import au.com.dius.pact.consumer.MockServer;
import au.com.dius.pact.consumer.dsl.PactBuilder;
import au.com.dius.pact.consumer.junit5.PactConsumerTest;
import au.com.dius.pact.consumer.junit5.PactTestFor;
import au.com.dius.pact.core.model.V4Pact;
import au.com.dius.pact.core.model.annotations.Pact;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;

@PactConsumerTest
@PactTestFor(providerName = "ClinoraHealthFixture")
class HealthProbePactTest {

    @Pact(provider = "ClinoraHealthFixture", consumer = "ClinoraHealthProbe")
    public V4Pact readiness(PactBuilder builder) {
        return builder.usingLegacyDsl()
                .uponReceiving("consulta de readiness saudavel")
                .path("/actuator/health/readiness")
                .method("GET")
                .willRespondWith()
                .status(200)
                .headers(java.util.Map.of("Content-Type", "application/json"))
                .body("{\"status\":\"UP\"}")
                .toPact(V4Pact.class);
    }

    @Test
    void generatesAndChecksReadinessContract(MockServer server)
            throws IOException, InterruptedException {
        try (HttpClient client = HttpClient.newHttpClient()) {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(server.getUrl() + "/actuator/health/readiness"))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request,
                    HttpResponse.BodyHandlers.ofString());
            assertEquals(200, response.statusCode());
            assertEquals("{\"status\":\"UP\"}", response.body());
        }
    }
}
