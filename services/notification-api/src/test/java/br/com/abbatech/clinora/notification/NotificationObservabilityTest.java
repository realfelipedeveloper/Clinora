package br.com.abbatech.clinora.notification;

import br.com.abbatech.clinora.test.HealthProbeVerifier;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("observability")
@SpringBootTest(
        classes = NotificationApiApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "debug=false"
)
class NotificationObservabilityTest {

    @Value("${local.server.port}")
    private int port;

    @Test
    void expoeMetricasPrometheusNoPerfilDeObservabilidade() throws Exception {
        HealthProbeVerifier.verifyPrometheus(port);
    }
}
