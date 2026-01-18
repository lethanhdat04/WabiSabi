package com.nihongomaster.config

import com.nihongomaster.security.jwt.JwtAuthenticationFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

/**
 * Spring Security configuration for the application.
 * Configures JWT-based stateless authentication.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            // Disable CSRF for stateless API
            .csrf { it.disable() }

            // Configure CORS
            .cors { it.configurationSource(corsConfigurationSource()) }

            // Stateless session management
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }

            // Configure authorization rules
            .authorizeHttpRequests { auth ->
                auth
                    // Public endpoints
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                    .requestMatchers("/actuator/health", "/actuator/info").permitAll()

                    // Public read access to certain resources
                    .requestMatchers(HttpMethod.GET, "/api/videos/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/vocabulary/decks").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/vocabulary/decks/*/summary").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/vocabulary/decks/official").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/vocabulary/decks/popular").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/vocabulary/decks/search").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/forum/posts/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/forum/comments/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/users/profile/**").permitAll()

                    // Admin endpoints
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")

                    // All other endpoints require authentication
                    .anyRequest().authenticated()
            }

            // Add JWT filter before UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

            // Exception handling
            .exceptionHandling { exceptions ->
                exceptions
                    .authenticationEntryPoint { _, response, _ ->
                        response.sendError(401, "Unauthorized")
                    }
                    .accessDeniedHandler { _, response, _ ->
                        response.sendError(403, "Access Denied")
                    }
            }

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration().apply {
            allowedOrigins = listOf(
                "http://localhost:3000",      // Next.js dev server
                "http://localhost:8080",      // Same origin (dev)
                "https://datto.io.vn",        // Production
                "https://www.datto.io.vn"     // Production with www
            )
            allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
            exposedHeaders = listOf("Authorization")
            allowCredentials = true
            maxAge = 3600
        }

        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/api/**", configuration)
        }
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder(12)
    }

    @Bean
    fun authenticationManager(config: AuthenticationConfiguration): AuthenticationManager {
        return config.authenticationManager
    }
}
