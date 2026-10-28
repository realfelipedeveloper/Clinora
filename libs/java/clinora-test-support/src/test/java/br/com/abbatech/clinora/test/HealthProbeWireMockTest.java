package br.com.abbatech.clinora.test;

import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.serviceUnavailable;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.github.tomakehurst.wiremock.junit5.WireMockRuntimeInfo;
import com.github.tomakehurst.wiremock.junit5.WireMockTest;
import org.junit.jupiter.api.Test;

@WireMockTest
class HealthProbeWireMockTest {

    @Test
    void verifiesHealthOverRealHttp(WireMockRuntimeInfo server) {
        server.getWireMock().register(get(urlEqualTo("/actuator/health"))
                .willReturn(okJson("{\"status\":\"UP\"}")));
        server.getWireMock().register(get(urlEqualTo("/actuator/health/liveness"))
                .willReturn(okJson("{\"status\":\"UP\"}")));
        server.getWireMock().register(get(urlEqualTo("/actuator/health/readiness"))
                .willReturn(okJson("{\"status\":\"UP\"}")));

        assertDoesNotThrow(() -> HealthProbeVerifier.verify(server.getHttpPort()));
        server.getWireMock().verifyThat(1, getRequestedFor(urlEqualTo("/actuator/health")));
        server.getWireMock().verifyThat(1,
                getRequestedFor(urlEqualTo("/actuator/health/readiness")));
    }

    @Test
    void rejectsUnhealthyReadiness(WireMockRuntimeInfo server) {
        server.getWireMock().register(get(urlEqualTo("/actuator/health"))
                .willReturn(okJson("{\"status\":\"UP\"}")));
        server.getWireMock().register(get(urlEqualTo("/actuator/health/liveness"))
                .willReturn(okJson("{\"status\":\"UP\"}")));
        server.getWireMock().register(get(urlEqualTo("/actuator/health/readiness"))
                .willReturn(serviceUnavailable()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"status\":\"OUT_OF_SERVICE\"}")));

        assertDoesNotThrow(() -> HealthProbeVerifier.verifyNotReady(server.getHttpPort()));
        AssertionError failure = assertThrows(AssertionError.class,
                () -> HealthProbeVerifier.verify(server.getHttpPort()));
        assertTrue(failure.getMessage().contains("/actuator/health/readiness"));
    }
}
