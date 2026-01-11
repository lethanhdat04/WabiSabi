package com.nihongomaster.domain.user

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * Refresh token entity for JWT token refresh mechanism.
 * Stored separately to allow token revocation and tracking.
 */
@Document(collection = "refresh_tokens")
data class RefreshToken(
    @Id
    val id: String? = null,

    @Indexed
    val userId: String,

    @Indexed(unique = true)
    val token: String,

    val expiresAt: Instant,

    val revoked: Boolean = false,

    val userAgent: String? = null,

    val ipAddress: String? = null,

    @CreatedDate
    val createdAt: Instant? = null
) {
    fun isExpired(): Boolean = Instant.now().isAfter(expiresAt)

    fun isValid(): Boolean = !revoked && !isExpired()
}
