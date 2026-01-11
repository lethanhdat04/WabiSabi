package com.nihongomaster.config

import com.nihongomaster.security.jwt.JwtProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration

/**
 * Configuration to enable JWT properties binding.
 */
@Configuration
@EnableConfigurationProperties(JwtProperties::class)
class JwtConfig
