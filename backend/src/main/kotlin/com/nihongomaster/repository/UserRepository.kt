package com.nihongomaster.repository

import com.nihongomaster.domain.user.User
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository
import java.util.Optional

/**
 * Repository for User entity operations.
 * Provides custom query methods for user lookup.
 */
@Repository
interface UserRepository : MongoRepository<User, String> {

    /**
     * Find user by email address.
     */
    fun findByEmail(email: String): Optional<User>

    /**
     * Find user by username.
     */
    fun findByUsername(username: String): Optional<User>

    /**
     * Find user by email or username (for login).
     */
    fun findByEmailOrUsername(email: String, username: String): Optional<User>

    /**
     * Check if email already exists.
     */
    fun existsByEmail(email: String): Boolean

    /**
     * Check if username already exists.
     */
    fun existsByUsername(username: String): Boolean
}
