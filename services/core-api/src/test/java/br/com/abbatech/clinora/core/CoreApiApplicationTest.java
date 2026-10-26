package br.com.abbatech.clinora.core;

import br.com.abbatech.clinora.test.HealthProbeVerifier;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
        classes = CoreApiApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "debug=false"
)
class CoreApiApplicationTest {

    @Value("${local.server.port}")
    private int port;

    @Test
    void expoeSomenteSaudeSemDetalhesInternos() throws Exception {
        HealthProbeVerifier.verify(port);
    }
}
