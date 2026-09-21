package com.foodhub.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

class RenderDatabaseUrlEnvironmentPostProcessorTest {

    @Test
    void convertsRenderPostgresUrlIntoSpringDatasourceProperties() {
        StandardEnvironment environment = environmentWith(Map.of(
                "DATABASE_URL",
                "postgresql://snap%40eats:top%2Fsecret@db.example.test:5433/snap_eats?sslmode=require"));

        postProcess(environment);

        assertThat(environment.getProperty("spring.datasource.url"))
                .isEqualTo("jdbc:postgresql://db.example.test:5433/snap_eats?sslmode=require");
        assertThat(environment.getProperty("spring.datasource.username")).isEqualTo("snap@eats");
        assertThat(environment.getProperty("spring.datasource.password")).isEqualTo("top/secret");
        assertThat(environment.getProperty("spring.datasource.driver-class-name"))
                .isEqualTo("org.postgresql.Driver");
        assertThat(environment.getProperty("spring.jpa.database-platform"))
                .isEqualTo("org.hibernate.dialect.PostgreSQLDialect");
        assertThat(environment.getProperty("spring.flyway.locations"))
                .isEqualTo("classpath:db/migration-postgresql");
    }

    @Test
    void leavesExistingJdbcUrlUntouched() {
        StandardEnvironment environment = environmentWith(Map.of(
                "SPRING_DATASOURCE_URL", "jdbc:postgresql://localhost:5432/snap_eats"));

        postProcess(environment);

        assertThat(environment.getPropertySources().contains("renderDatabaseUrlOverrides")).isFalse();
        assertThat(environment.getProperty("SPRING_DATASOURCE_URL"))
                .isEqualTo("jdbc:postgresql://localhost:5432/snap_eats");
    }

    private StandardEnvironment environmentWith(Map<String, Object> properties) {
        StandardEnvironment environment = new StandardEnvironment();
        environment.getPropertySources().addFirst(new MapPropertySource("testProperties", properties));
        return environment;
    }

    private void postProcess(StandardEnvironment environment) {
        new RenderDatabaseUrlEnvironmentPostProcessor()
                .postProcessEnvironment(environment, new SpringApplication());
    }
}
