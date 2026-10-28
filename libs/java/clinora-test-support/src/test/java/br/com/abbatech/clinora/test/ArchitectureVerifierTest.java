package br.com.abbatech.clinora.test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.abbatech.clinora.core.fixture.CoreArchitectureFixtures;
import br.com.abbatech.clinora.payment.fixture.PaymentType;

import com.tngtech.archunit.core.importer.ClassFileImporter;
import org.junit.jupiter.api.Test;

class ArchitectureVerifierTest {

    @Test
    void aceitaServicoSemDependenciaDiretaDeOutroServico() {
        var classes = new ClassFileImporter().importClasses(CoreArchitectureFixtures.Independent.class);

        assertThatCode(() -> ArchitectureVerifier.verifyServiceBoundary(classes, "core"))
                .doesNotThrowAnyException();
    }

    @Test
    void rejeitaDependenciaDiretaEntreServicos() {
        var classes = new ClassFileImporter().importClasses(
                CoreArchitectureFixtures.Coupled.class, PaymentType.class);

        assertThatThrownBy(() -> ArchitectureVerifier.verifyServiceBoundary(classes, "core"))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("payment");
    }
}
