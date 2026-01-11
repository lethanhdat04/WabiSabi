package com.nihongomaster.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.config.EnableMongoAuditing
import org.springframework.data.mongodb.core.convert.MongoCustomConversions
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories

/**
 * MongoDB configuration.
 * Enables auditing for @CreatedDate and @LastModifiedDate annotations.
 */
@Configuration
@EnableMongoRepositories(basePackages = ["com.nihongomaster.repository"])
@EnableMongoAuditing
class MongoConfig {

    @Bean
    fun customConversions(): MongoCustomConversions {
        return MongoCustomConversions(emptyList<Any>())
    }
}
