package br.com.abbatech.clinora.notification;

import br.com.abbatech.clinora.test.ArchitectureVerifier;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

class NotificationArchitectureTest {

    @Test
    void naoDependeDeOutrosServicos() {
        ArchitectureVerifier.verifyServiceBoundary(new ClassFileImporter()
                .withImportOption(new ImportOption.DoNotIncludeTests())
                .importPackagesOf(NotificationApiApplication.class), "notification");
    }
}
