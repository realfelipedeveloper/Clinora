package br.com.abbatech.clinora.payment;

import br.com.abbatech.clinora.test.HealthProbeVerifier;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

@SpringBootTest(
        classes = PaymentApiApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "debug=false"
)
class PaymentApiApplicationTest {

    @Value("${local.server.port}")
    private int port;

    @Autowired
    private ApplicationContext context;

    @Test
    void expoeSaudeSemDetalhesInternos() throws Exception {
        HealthProbeVerifier.verify(port);
    }

    @Test
    void recusaTrafegoSemPerderLiveness() throws Exception {
        AvailabilityChangeEvent.publish(context, ReadinessState.REFUSING_TRAFFIC);
        try {
            HealthProbeVerifier.verifyNotReady(port);
        } finally {
            AvailabilityChangeEvent.publish(context, ReadinessState.ACCEPTING_TRAFFIC);
        }
    }
}
