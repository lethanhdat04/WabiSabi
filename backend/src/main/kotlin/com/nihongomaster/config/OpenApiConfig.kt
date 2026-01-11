package com.nihongomaster.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.License
import io.swagger.v3.oas.models.security.SecurityScheme
import io.swagger.v3.oas.models.servers.Server
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * OpenAPI/Swagger documentation configuration.
 */
@Configuration
class OpenApiConfig {

    @Bean
    fun customOpenAPI(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("Nihongo Master API")
                    .version("1.0.0")
                    .description("""
                        REST API for Nihongo Master - Japanese Learning Platform.

                        ## Authentication
                        Most endpoints require authentication via JWT Bearer token.
                        Obtain a token by calling `/api/auth/login` or `/api/auth/register`.

                        Include the token in the `Authorization` header:
                        ```
                        Authorization: Bearer <your-access-token>
                        ```
                    """.trimIndent())
                    .contact(
                        Contact()
                            .name("Nihongo Master Team")
                            .email("support@nihongomaster.com")
                    )
                    .license(
                        License()
                            .name("MIT License")
                            .url("https://opensource.org/licenses/MIT")
                    )
            )
            .servers(
                listOf(
                    Server()
                        .url("http://localhost:8080")
                        .description("Development server"),
                    Server()
                        .url("https://api.nihongomaster.com")
                        .description("Production server")
                )
            )
            .components(
                Components()
                    .addSecuritySchemes(
                        "bearerAuth",
                        SecurityScheme()
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")
                            .description("JWT authentication token")
                    )
            )
    }
}
