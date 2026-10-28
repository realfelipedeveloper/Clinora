package br.com.abbatech.clinora.test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import java.util.Arrays;

public final class ArchitectureVerifier {

    private static final String BASE_PACKAGE = "br.com.abbatech.clinora.";
    private static final String[] SERVICES = {
            "core", "payment", "notification", "integration", "scheduler"
    };

    private ArchitectureVerifier() {
    }

    public static void verifyServiceBoundary(JavaClasses classes, String service) {
        String[] forbidden = Arrays.stream(SERVICES)
                .filter(name -> !name.equals(service))
                .map(name -> BASE_PACKAGE + name + "..")
                .toArray(String[]::new);

        noClasses().that().resideInAPackage(BASE_PACKAGE + service + "..")
                .should().dependOnClassesThat().resideInAnyPackage(forbidden)
                .check(classes);
    }
}
