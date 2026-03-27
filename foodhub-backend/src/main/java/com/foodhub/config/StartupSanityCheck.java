package com.foodhub.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
@Order(1000)
public class StartupSanityCheck implements ApplicationRunner {

    private static final List<String> REQUIRED_TABLES = List.of("USERS", "RESTAURANTS", "CATEGORIES");

    private final DataSource dataSource;

    public StartupSanityCheck(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metadata = connection.getMetaData();
            Set<String> tableNames = loadTableNames(metadata);

            for (String requiredTable : REQUIRED_TABLES) {
                if (!tableNames.contains(requiredTable)) {
                    throw new IllegalStateException("Startup sanity check failed: required table missing -> " + requiredTable);
                }
            }
        }
    }

    private Set<String> loadTableNames(DatabaseMetaData metadata) throws Exception {
        Set<String> tableNames = new HashSet<>();
        try (ResultSet resultSet = metadata.getTables(null, null, "%", new String[]{"TABLE"})) {
            while (resultSet.next()) {
                String table = resultSet.getString("TABLE_NAME");
                if (table != null) {
                    tableNames.add(table.toUpperCase(Locale.ROOT));
                }
            }
        }
        return tableNames;
    }
}
