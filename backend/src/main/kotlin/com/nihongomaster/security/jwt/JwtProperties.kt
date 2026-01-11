package com.nihongomaster.security.jwt

import org.springframework.boot.context.properties.ConfigurationProperties

/**
 * Configuration properties for JWT token management.
 */
@ConfigurationProperties(prefix = "jwt")
data class JwtProperties(
    val secret: String,
    val accessTokenExpiration: Long,  // milliseconds
    val refreshTokenExpiration: Long  // milliseconds
)
