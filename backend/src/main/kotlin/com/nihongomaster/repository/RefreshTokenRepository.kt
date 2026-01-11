package com.nihongomaster.repository

import com.nihongomaster.domain.user.RefreshToken
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository
import java.util.Optional

/**
 * Repository for RefreshToken entity operations.
 */
@Repository
interface RefreshTokenRepository : MongoRepository<RefreshToken, String> {

    /**
     * Find refresh token by token string.
     */
    fun findByToken(token: String): Optional<RefreshToken>

    /**
     * Find all tokens for a user.
     */
    fun findByUserId(userId: String): List<RefreshToken>

    /**
     * Delete all tokens for a user (logout from all devices).
     */
    fun deleteByUserId(userId: String)

    /**
     * Delete a specific token.
     */
    fun deleteByToken(token: String)
}
