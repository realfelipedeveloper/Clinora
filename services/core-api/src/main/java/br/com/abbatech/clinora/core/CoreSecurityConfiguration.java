package br.com.abbatech.clinora.core;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
class CoreSecurityConfiguration {

    @Bean
    SecurityFilterChain coreSecurity(HttpSecurity http, CorsConfigurationSource coreCors) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(cors -> cors.configurationSource(coreCors))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/prometheus").permitAll()
                        .requestMatchers("/api/v1/identity/**").hasAuthority("SCOPE_clinora")
                        .anyRequest().denyAll())
                .oauth2ResourceServer(resourceServer -> resourceServer.jwt(Customizer.withDefaults()))
                .build();
    }

    @Bean
    CorsConfigurationSource coreCors(@Value("${clinora.web.origin}") String webOrigin) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(webOrigin));
        configuration.setAllowedMethods(List.of(HttpMethod.GET.name(), HttpMethod.POST.name(),
                HttpMethod.PUT.name(), HttpMethod.PATCH.name(), HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name()));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Clinora-Tenant"));
        configuration.setExposedHeaders(List.of("Cache-Control"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/v1/**", configuration);
        return source;
    }
}
