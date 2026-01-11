package com.nihongomaster.security.jwt

import com.nihongomaster.domain.user.User
import io.jsonwebtoken.Claims
import io.jsonwebtoken.ExpiredJwtException
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import mu.KotlinLogging
import org.springframework.stereotype.Service
import java.util.*
import javax.crypto.SecretKey

private val logger = KotlinLogging.logger {}

/**
 * Service for JWT token generation and validation.
 * Handles both access tokens and refresh tokens.
 */
@Service
class JwtService(private val jwtProperties: JwtProperties) {

    private val secretKey: SecretKey = Keys.hmacShaKeyFor(jwtProperties.secret.toByteArray())

    /**
     * Generate an access token for a user.
     */
    fun generateAccessToken(user: User): String {
        val now = Date()
        val expiration = Date(now.time + jwtProperties.accessTokenExpiration)

        return Jwts.builder()
            .subject(user.id)
            .claim("email", user.email)
            .claim("username", user.username)
            .claim("role", user.role.name)
            .issuedAt(now)
            .expiration(expiration)
            .signWith(secretKey, Jwts.SIG.HS256)
            .compact()
    }

    /**
     * Generate a refresh token for a user.
     */
    fun generateRefreshToken(user: User): String {
        val now = Date()
        val expiration = Date(now.time + jwtProperties.refreshTokenExpiration)

        return Jwts.builder()
            .subject(user.id)
            .claim("type", "refresh")
            .issuedAt(now)
            .expiration(expiration)
            .signWith(secretKey, Jwts.SIG.HS256)
            .compact()
    }

    /**
     * Extract user ID from a token.
     */
    fun getUserIdFromToken(token: String): String? {
        return try {
            getClaims(token)?.subject
        } catch (e: Exception) {
            logger.warn { "Failed to extract user ID from token: ${e.message}" }
            null
        }
    }

    /**
     * Extract email from a token.
     */
    fun getEmailFromToken(token: String): String? {
        return try {
            getClaims(token)?.get("email", String::class.java)
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Extract role from a token.
     */
    fun getRoleFromToken(token: String): String? {
        return try {
            getClaims(token)?.get("role", String::class.java)
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Validate a token and return true if valid.
     */
    fun validateToken(token: String): Boolean {
        return try {
            val claims = getClaims(token)
            claims != null && !isTokenExpired(claims)
        } catch (e: ExpiredJwtException) {
            logger.debug { "Token expired" }
            false
        } catch (e: JwtException) {
            logger.warn { "Invalid JWT token: ${e.message}" }
            false
        } catch (e: Exception) {
            logger.error { "Error validating token: ${e.message}" }
            false
        }
    }

    /**
     * Check if token is a refresh token.
     */
    fun isRefreshToken(token: String): Boolean {
        return try {
            val claims = getClaims(token)
            claims?.get("type", String::class.java) == "refresh"
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Get token expiration time in seconds.
     */
    fun getAccessTokenExpirationSeconds(): Long {
        return jwtProperties.accessTokenExpiration / 1000
    }

    /**
     * Get refresh token expiration time in milliseconds.
     */
    fun getRefreshTokenExpirationMs(): Long {
        return jwtProperties.refreshTokenExpiration
    }

    private fun getClaims(token: String): Claims? {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }

    private fun isTokenExpired(claims: Claims): Boolean {
        return claims.expiration.before(Date())
    }
}
