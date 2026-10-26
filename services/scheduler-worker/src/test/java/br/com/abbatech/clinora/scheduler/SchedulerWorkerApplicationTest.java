package br.com.abbatech.clinora.scheduler;

import br.com.abbatech.clinora.test.HealthProbeVerifier;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
        classes = SchedulerWorkerApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "debug=false"
)
class SchedulerWorkerApplicationTest {

    @Value("${local.server.port}")
    private int port;

    @Test
    void expoeSaudeSemDetalhesInternos() throws Exception {
        HealthProbeVerifier.verify(port);
    }
}
