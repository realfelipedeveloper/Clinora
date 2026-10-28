package br.com.abbatech.clinora.core.fixture;

import br.com.abbatech.clinora.payment.fixture.PaymentType;

public final class CoreArchitectureFixtures {

    private CoreArchitectureFixtures() {
    }

    public static final class Independent {
    }

    public static final class Coupled {
        private PaymentType payment;
    }
}
