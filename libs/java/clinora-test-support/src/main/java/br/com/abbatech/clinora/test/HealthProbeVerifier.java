package br.com.abbatech.clinora.test;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public final class HealthProbeVerifier {

    private static final String[] HEALTH_PATHS = {
            "/actuator/health",
            "/actuator/health/liveness",
            "/actuator/health/readiness"
    };

    private HealthProbeVerifier() {
    }

    public static void verify(int port) throws IOException, InterruptedException {
        try (HttpClient client = HttpClient.newHttpClient()) {
            verify(client, port);
        }
    }

    static void verify(HttpClient client, int port) throws IOException, InterruptedException {
        for (String path : HEALTH_PATHS) {
            HttpResponse<String> response = get(client, port, path);
            requireStatus(response, 200, path);
            if (!response.body().contains("\"status\":\"UP\"")
                    || response.body().contains("components")) {
                throw new AssertionError(path + " deve expor status UP sem componentes internos");
            }
        }

        requireStatus(get(client, port, "/actuator/env"), 404, "/actuator/env");
        requireStatus(get(client, port, "/actuator/prometheus"), 404,
                "/actuator/prometheus");
    }

    public static void verifyPrometheus(int port) throws IOException, InterruptedException {
        try (HttpClient client = HttpClient.newHttpClient()) {
            verifyPrometheus(client, port);
        }
    }

    static void verifyPrometheus(HttpClient client, int port)
            throws IOException, InterruptedException {
        HttpResponse<String> response = get(client, port, "/actuator/prometheus");
        requireStatus(response, 200, "/actuator/prometheus");
        if (!response.body().contains("jvm_")) {
            throw new AssertionError("/actuator/prometheus deve expor metricas JVM");
        }
        requireStatus(get(client, port, "/actuator/env"), 404, "/actuator/env");
    }

    private static HttpResponse<String> get(HttpClient client, int port, String path)
            throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://127.0.0.1:" + port + path))
                .GET()
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private static void requireStatus(HttpResponse<?> response, int expected, String path) {
        if (response.statusCode() != expected) {
            throw new AssertionError(path + " retornou HTTP " + response.statusCode()
                    + ", esperado " + expected);
        }
    }
}
