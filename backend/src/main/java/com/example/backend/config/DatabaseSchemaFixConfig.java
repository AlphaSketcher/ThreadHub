package com.example.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseSchemaFixConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSchemaFixConfig.class);

    @Bean
    public CommandLineRunner fixDatabaseSchema(JdbcTemplate jdbcTemplate) {
        return args -> {
            logger.info("Running DatabaseSchemaFixConfig to ensure TEXT columns...");
            try {
                jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN profile_image TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE posts ALTER COLUMN avatar TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE comments ALTER COLUMN avatar TYPE TEXT");
                logger.info("Successfully updated column types using PostgreSQL syntax.");
            } catch (Exception e) {
                try {
                    jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN profile_image LONGTEXT");
                    jdbcTemplate.execute("ALTER TABLE posts MODIFY COLUMN avatar LONGTEXT");
                    jdbcTemplate.execute("ALTER TABLE comments MODIFY COLUMN avatar LONGTEXT");
                    logger.info("Successfully updated column types using MySQL syntax.");
                } catch (Exception ex) {
                    logger.warn("Could not alter columns (they might already be TEXT, or table doesn't exist yet): {}", ex.getMessage());
                }
            }
        };
    }
}
