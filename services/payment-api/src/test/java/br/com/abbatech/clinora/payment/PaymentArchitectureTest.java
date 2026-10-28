package br.com.abbatech.clinora.payment;

import br.com.abbatech.clinora.test.ArchitectureVerifier;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

class PaymentArchitectureTest {

    @Test
    void naoDependeDeOutrosServicos() {
        ArchitectureVerifier.verifyServiceBoundary(new ClassFileImporter()
                .withImportOption(new ImportOption.DoNotIncludeTests())
                .importPackagesOf(PaymentApiApplication.class), "payment");
    }
}
