package br.com.abbatech.clinora.core;

import br.com.abbatech.clinora.test.ArchitectureVerifier;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

class CoreArchitectureTest {

    @Test
    void naoDependeDeOutrosServicos() {
        ArchitectureVerifier.verifyServiceBoundary(new ClassFileImporter()
                .withImportOption(new ImportOption.DoNotIncludeTests())
                .importPackagesOf(CoreApiApplication.class), "core");
    }
}
