package com.nihongomaster.controller

import com.nihongomaster.dto.auth.*
import com.nihongomaster.security.CurrentUser
import com.nihongomaster.security.UserPrincipal
import com.nihongomaster.service.auth.AuthService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * REST controller for authentication endpoints.
 * Handles user registration, login, and token management.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and authorization")
class AuthController(
    private val authService: AuthService
) {

    /**
     * Register a new user account.
     *
     * POST /api/auth/register
     */
    @PostMapping("/register")
    @Operation(
        summary = "Register a new user",
        description = "Creates a new user account and returns authentication tokens"
    )
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "User registered successfully"),
        ApiResponse(responseCode = "400", description = "Invalid request data"),
        ApiResponse(responseCode = "409", description = "Email or username already exists")
    )
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<AuthResponse> {
        val response = authService.register(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    /**
     * Login with email/username and password.
     *
     * POST /api/auth/login
     */
    @PostMapping("/login")
    @Operation(
        summary = "Login to account",
        description = "Authenticates user and returns access and refresh tokens"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Login successful"),
        ApiResponse(responseCode = "401", description = "Invalid credentials")
    )
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        val response = authService.login(request)
        return ResponseEntity.ok(response)
    }

    /**
     * Refresh access token using refresh token.
     *
     * POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    @Operation(
        summary = "Refresh access token",
        description = "Generates new access token using valid refresh token"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    )
    fun refreshToken(@Valid @RequestBody request: RefreshTokenRequest): ResponseEntity<AuthResponse> {
        val response = authService.refreshToken(request)
        return ResponseEntity.ok(response)
    }

    /**
     * Logout from current session.
     *
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    @Operation(
        summary = "Logout from current session",
        description = "Revokes the current refresh token"
    )
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Logout successful"),
        ApiResponse(responseCode = "401", description = "Not authenticated")
    )
    fun logout(@CurrentUser user: UserPrincipal): ResponseEntity<Void> {
        authService.logout(user.id)
        return ResponseEntity.noContent().build()
    }

    /**
     * Logout from all devices.
     *
     * POST /api/auth/logout-all
     */
    @PostMapping("/logout-all")
    @Operation(
        summary = "Logout from all devices",
        description = "Revokes all refresh tokens for the user"
    )
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Logged out from all devices"),
        ApiResponse(responseCode = "401", description = "Not authenticated")
    )
    fun logoutAll(@CurrentUser user: UserPrincipal): ResponseEntity<Void> {
        authService.logoutAll(user.id)
        return ResponseEntity.noContent().build()
    }
}
