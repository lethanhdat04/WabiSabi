package com.nihongomaster.dto.auth

import com.nihongomaster.domain.user.JLPTLevel
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

/**
 * Request DTO for user registration.
 */
data class RegisterRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,

    @field:NotBlank(message = "Username is required")
    @field:Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    @field:Pattern(
        regexp = "^[a-zA-Z0-9_]+$",
        message = "Username can only contain letters, numbers, and underscores"
    )
    val username: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    val password: String,

    @field:NotBlank(message = "Display name is required")
    @field:Size(min = 1, max = 50, message = "Display name must be between 1 and 50 characters")
    val displayName: String,

    val nativeLanguage: String = "en",

    val targetLevel: JLPTLevel? = null
)

/**
 * Request DTO for user login.
 */
data class LoginRequest(
    @field:NotBlank(message = "Email or username is required")
    val emailOrUsername: String,

    @field:NotBlank(message = "Password is required")
    val password: String
)

/**
 * Request DTO for token refresh.
 */
data class RefreshTokenRequest(
    @field:NotBlank(message = "Refresh token is required")
    val refreshToken: String
)

/**
 * Response DTO for authentication operations.
 */
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long,
    val user: UserSummaryResponse
)

/**
 * Lightweight user summary for auth responses.
 */
data class UserSummaryResponse(
    val id: String,
    val email: String,
    val username: String,
    val displayName: String,
    val avatarUrl: String?,
    val role: String
)
