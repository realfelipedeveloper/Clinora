package br.com.abbatech.clinora.test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

class HealthProbeVerifierTest {

    @Test
    void verificaSaudeSemExporDadosInternos() throws Exception {
        List<String> requests = new ArrayList<>();
        HttpClient client = client(Map.of(), requests);

        HealthProbeVerifier.verify(client, 44220);

        assertThat(requests).containsExactly(
                "http://127.0.0.1:44220/actuator/health",
                "http://127.0.0.1:44220/actuator/health/liveness",
                "http://127.0.0.1:44220/actuator/health/readiness",
                "http://127.0.0.1:44220/actuator/env",
                "http://127.0.0.1:44220/actuator/prometheus");
    }

    @Test
    void rejeitaSaudeIndisponivel() throws Exception {
        HttpClient client = client(Map.of("/actuator/health", reply(503, "{\"status\":\"DOWN\"}")),
                new ArrayList<>());

        assertThatThrownBy(() -> HealthProbeVerifier.verify(client, 44220))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("/actuator/health retornou HTTP 503");
    }

    @Test
    void distingueProcessoVivoDeServicoNaoPronto() throws Exception {
        List<String> requests = new ArrayList<>();
        HttpClient client = client(Map.of(
                "/actuator/health/readiness", reply(503, "{\"status\":\"OUT_OF_SERVICE\"}")), requests);

        HealthProbeVerifier.verifyNotReady(client, 44220);

        assertThat(requests).containsExactly(
                "http://127.0.0.1:44220/actuator/health/liveness",
                "http://127.0.0.1:44220/actuator/health/readiness");
    }

    @Test
    void verificaReadinessDegradadoPorHttpRealEmPortaEfemera() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/actuator/health/liveness", exchange -> {
            byte[] body = "{\"status\":\"UP\"}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, body.length);
            try (var output = exchange.getResponseBody()) {
                output.write(body);
            }
        });
        server.createContext("/actuator/health/readiness", exchange -> {
            byte[] body = "{\"status\":\"OUT_OF_SERVICE\"}"
                    .getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(503, body.length);
            try (var output = exchange.getResponseBody()) {
                output.write(body);
            }
        });
        server.start();
        try {
            HealthProbeVerifier.verifyNotReady(server.getAddress().getPort());
        } finally {
            server.stop(0);
        }
    }

    @Test
    void rejeitaReadinessQueAceitaTrafegoDuranteDegradacao() throws Exception {
        HttpClient client = client(Map.of(), new ArrayList<>());

        assertThatThrownBy(() -> HealthProbeVerifier.verifyNotReady(client, 44220))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("/actuator/health/readiness retornou HTTP 200");
    }

    @Test
    void rejeitaLivenessIndisponivelDuranteDegradacao() throws Exception {
        HttpClient client = client(Map.of(
                "/actuator/health/liveness", reply(503, "{\"status\":\"DOWN\"}")),
                new ArrayList<>());

        assertThatThrownBy(() -> HealthProbeVerifier.verifyNotReady(client, 44220))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("/actuator/health/liveness retornou HTTP 503");
    }

    @Test
    void rejeitaDetalhesInternosDuranteDegradacao() throws Exception {
        HttpClient client = client(Map.of(
                "/actuator/health/readiness",
                reply(503, "{\"status\":\"OUT_OF_SERVICE\",\"components\":{}}")),
                new ArrayList<>());

        assertThatThrownBy(() -> HealthProbeVerifier.verifyNotReady(client, 44220))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("sem componentes internos");
    }

    @Test
    void rejeitaDetalhesInternosNaSaude() throws Exception {
        HttpClient client = client(Map.of("/actuator/health",
                reply(200, "{\"status\":\"UP\",\"components\":{\"db\":{}}}")), new ArrayList<>());

        assertThatThrownBy(() -> HealthProbeVerifier.verify(client, 44220))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("sem componentes internos");
    }

    @Test
    void rejeitaAmbienteExpostoNoPerfilPadrao() throws Exception {
        HttpClient client = client(Map.of("/actuator/env", reply(200, "segredo")), new ArrayList<>());

        assertThatThrownBy(() -> HealthProbeVerifier.verify(client, 44220))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("/actuator/env retornou HTTP 200");
    }

    @Test
    void rejeitaMetricasExpostasNoPerfilPadrao() throws Exception {
        HttpClient client = client(Map.of("/actuator/prometheus", reply(200, "jvm_memory_used_bytes")),
                new ArrayList<>());

        assertThatThrownBy(() -> HealthProbeVerifier.verify(client, 44220))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("/actuator/prometheus retornou HTTP 200");
    }

    @Test
    void exigeMetricasJvmNoPerfilDeObservabilidade() throws Exception {
        HttpClient client = client(Map.of("/actuator/prometheus", reply(200, "http_requests_total 1")),
                new ArrayList<>());

        assertThatThrownBy(() -> HealthProbeVerifier.verifyPrometheus(client, 44220))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("metricas JVM");
    }

    @Test
    void observaMetricasSemExporAmbiente() throws Exception {
        List<String> requests = new ArrayList<>();
        HttpClient client = client(Map.of("/actuator/prometheus", reply(200, "jvm_memory_used_bytes 1")),
                requests);

        HealthProbeVerifier.verifyPrometheus(client, 44220);

        assertThat(requests).containsExactly(
                "http://127.0.0.1:44220/actuator/prometheus",
                "http://127.0.0.1:44220/actuator/env");
    }

    @Test
    void rejeitaAmbienteExpostoMesmoComObservabilidade() throws Exception {
        HttpClient client = client(Map.of(
                "/actuator/prometheus", reply(200, "jvm_memory_used_bytes 1"),
                "/actuator/env", reply(200, "segredo")), new ArrayList<>());

        assertThatThrownBy(() -> HealthProbeVerifier.verifyPrometheus(client, 44220))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("/actuator/env retornou HTTP 200");
    }

    private static Reply reply(int status, String body) {
        return new Reply(status, body);
    }

    @SuppressWarnings("unchecked")
    private static HttpClient client(Map<String, Reply> replies, List<String> requests)
            throws Exception {
        HttpClient client = mock(HttpClient.class);
        when(client.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenAnswer(invocation -> {
                    HttpRequest request = invocation.getArgument(0);
                    requests.add(request.uri().toString());
                    String path = request.uri().getPath();
                    Reply defaultReply = path.startsWith("/actuator/health")
                            ? reply(200, "{\"status\":\"UP\"}")
                            : reply(404, "");
                    Reply result = replies.getOrDefault(path, defaultReply);
                    HttpResponse<String> response = mock(HttpResponse.class);
                    when(response.statusCode()).thenReturn(result.status());
                    when(response.body()).thenReturn(result.body());
                    return response;
                });
        return client;
    }

    private record Reply(int status, String body) {
    }
}
