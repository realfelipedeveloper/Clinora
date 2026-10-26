package br.com.abbatech.clinora.payment;

import br.com.abbatech.clinora.test.HealthProbeVerifier;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("observability")
@SpringBootTest(
        classes = PaymentApiApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "debug=false"
)
class PaymentObservabilityTest {

    @Value("${local.server.port}")
    private int port;

    @Test
    void expoeMetricasPrometheusNoPerfilDeObservabilidade() throws Exception {
        HealthProbeVerifier.verifyPrometheus(port);
    }
}
