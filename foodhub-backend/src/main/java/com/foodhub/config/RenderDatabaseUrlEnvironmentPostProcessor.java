package com.foodhub.config;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.util.StringUtils;

/**
 * Render Postgres exposes a connection string like postgresql://user:pass@host:port/db.
 * Spring Boot expects a JDBC URL, so convert it before datasource auto-configuration runs.
 */
public class RenderDatabaseUrlEnvironmentPostProcessor
        implements EnvironmentPostProcessor, Ordered {

    private static final String PROPERTY_SOURCE_NAME = "renderDatabaseUrlOverrides";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment,
            SpringApplication application) {
        String databaseUrl = firstNonBlank(
                environment.getProperty("DATABASE_URL"),
                environment.getProperty("SPRING_DATASOURCE_URL"));

        if (!StringUtils.hasText(databaseUrl)
                || databaseUrl.startsWith("jdbc:")
                || (!databaseUrl.startsWith("postgresql://")
                && !databaseUrl.startsWith("postgres://"))) {
            return;
        }

        Map<String, Object> overrides = buildJdbcOverrides(environment, databaseUrl);
        if (overrides.isEmpty()) {
            return;
        }

        environment.getPropertySources().addFirst(
                new MapPropertySource(PROPERTY_SOURCE_NAME, overrides));
    }

    private Map<String, Object> buildJdbcOverrides(ConfigurableEnvironment environment,
            String databaseUrl) {
        try {
            URI uri = new URI(databaseUrl);
            if (!StringUtils.hasText(uri.getHost()) || !StringUtils.hasText(uri.getPath())) {
                return Map.of();
            }

            Map<String, Object> overrides = new LinkedHashMap<>();
            String jdbcUrl = buildJdbcUrl(uri);
            overrides.put("spring.datasource.url", jdbcUrl);

            if (!hasExplicitSetting(environment,
                    "SPRING_DATASOURCE_DRIVER_CLASS_NAME",
                    "spring.datasource.driver-class-name")) {
                overrides.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
            }
            if (!hasExplicitSetting(environment,
                    "SPRING_JPA_DATABASE_PLATFORM",
                    "spring.jpa.database-platform")) {
                overrides.put("spring.jpa.database-platform", "org.hibernate.dialect.PostgreSQLDialect");
            }

            String userInfo = uri.getUserInfo();
            if (StringUtils.hasText(userInfo)
                    && !hasExplicitSetting(environment,
                            "SPRING_DATASOURCE_USERNAME",
                            "spring.datasource.username")) {
                String[] credentials = userInfo.split(":", 2);
                overrides.put("spring.datasource.username", credentials[0]);
                if (credentials.length > 1
                        && !hasExplicitSetting(environment,
                                "SPRING_DATASOURCE_PASSWORD",
                                "spring.datasource.password")) {
                    overrides.put("spring.datasource.password", credentials[1]);
                }
            }

            return overrides;
        } catch (URISyntaxException ex) {
            return Map.of();
        }
    }

    private String buildJdbcUrl(URI uri) {
        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                .append(uri.getHost());

        if (uri.getPort() > 0) {
            jdbcUrl.append(':').append(uri.getPort());
        }

        jdbcUrl.append(uri.getPath());

        if (StringUtils.hasText(uri.getQuery())) {
            jdbcUrl.append('?').append(uri.getQuery());
        }

        return jdbcUrl.toString();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }

    private boolean hasExplicitSetting(ConfigurableEnvironment environment,
            String systemEnvironmentKey,
            String systemPropertyKey) {
        Object rawValue = environment.getSystemEnvironment().get(systemEnvironmentKey);
        return (rawValue != null && StringUtils.hasText(rawValue.toString()))
                || StringUtils.hasText(System.getProperty(systemPropertyKey));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
