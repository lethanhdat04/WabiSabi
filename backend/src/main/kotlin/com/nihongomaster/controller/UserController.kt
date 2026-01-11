package com.nihongomaster.controller

import com.nihongomaster.dto.user.*
import com.nihongomaster.security.CurrentUser
import com.nihongomaster.security.UserPrincipal
import com.nihongomaster.service.user.UserService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * REST controller for user-related endpoints.
 * Handles user profile and preferences management.
 */
@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User profile and preferences management")
class UserController(
    private val userService: UserService
) {

    /**
     * Get current authenticated user's profile.
     *
     * GET /api/users/me
     */
    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Get current user profile",
        description = "Returns the full profile of the authenticated user"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
        ApiResponse(responseCode = "401", description = "Not authenticated")
    )
    fun getCurrentUser(@CurrentUser user: UserPrincipal): ResponseEntity<UserResponse> {
        val response = userService.getCurrentUser(user.id)
        return ResponseEntity.ok(response)
    }

    /**
     * Get public profile by username.
     *
     * GET /api/users/profile/{username}
     */
    @GetMapping("/profile/{username}")
    @Operation(
        summary = "Get public user profile",
        description = "Returns the public profile of a user by username"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
        ApiResponse(responseCode = "404", description = "User not found")
    )
    fun getPublicProfile(@PathVariable username: String): ResponseEntity<PublicProfileResponse> {
        val response = userService.getPublicProfile(username)
        return ResponseEntity.ok(response)
    }

    /**
     * Update current user's profile.
     *
     * PUT /api/users/me
     */
    @PutMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Update user profile",
        description = "Updates the profile information of the authenticated user"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid request data"),
        ApiResponse(responseCode = "401", description = "Not authenticated")
    )
    fun updateProfile(
        @CurrentUser user: UserPrincipal,
        @Valid @RequestBody request: UpdateProfileRequest
    ): ResponseEntity<UserResponse> {
        val response = userService.updateProfile(user.id, request)
        return ResponseEntity.ok(response)
    }

    /**
     * Update current user's preferences.
     *
     * PUT /api/users/me/preferences
     */
    @PutMapping("/me/preferences")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Update user preferences",
        description = "Updates the preferences of the authenticated user"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Preferences updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid request data"),
        ApiResponse(responseCode = "401", description = "Not authenticated")
    )
    fun updatePreferences(
        @CurrentUser user: UserPrincipal,
        @Valid @RequestBody request: UpdatePreferencesRequest
    ): ResponseEntity<UserResponse> {
        val response = userService.updatePreferences(user.id, request)
        return ResponseEntity.ok(response)
    }
}
