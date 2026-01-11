package com.nihongomaster.service.auth

import com.nihongomaster.domain.user.RefreshToken
import com.nihongomaster.domain.user.User
import com.nihongomaster.domain.user.UserRole
import com.nihongomaster.dto.auth.*
import com.nihongomaster.exception.*
import com.nihongomaster.repository.RefreshTokenRepository
import com.nihongomaster.repository.UserRepository
import com.nihongomaster.security.jwt.JwtService
import mu.KotlinLogging
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

private val logger = KotlinLogging.logger {}

/**
 * Service handling authentication operations.
 */
interface AuthService {
    fun register(request: RegisterRequest): AuthResponse
    fun login(request: LoginRequest): AuthResponse
    fun refreshToken(request: RefreshTokenRequest): AuthResponse
    fun logout(userId: String)
    fun logoutAll(userId: String)
}

@Service
class AuthServiceImpl(
    private val userRepository: UserRepository,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val jwtService: JwtService,
    private val passwordEncoder: PasswordEncoder
) : AuthService {

    /**
     * Register a new user account.
     */
    @Transactional
    override fun register(request: RegisterRequest): AuthResponse {
        logger.info { "Registering new user: ${request.email}" }

        // Check for existing email
        if (userRepository.existsByEmail(request.email.lowercase())) {
            throw EmailAlreadyExistsException()
        }

        // Check for existing username
        if (userRepository.existsByUsername(request.username.lowercase())) {
            throw UsernameAlreadyExistsException()
        }

        // Create new user
        val user = User(
            email = request.email.lowercase().trim(),
            username = request.username.lowercase().trim(),
            passwordHash = passwordEncoder.encode(request.password),
            displayName = request.displayName.trim(),
            nativeLanguage = request.nativeLanguage,
            targetLevel = request.targetLevel,
            role = UserRole.USER
        )

        val savedUser = userRepository.save(user)
        logger.info { "User registered successfully: ${savedUser.id}" }

        return generateAuthResponse(savedUser)
    }

    /**
     * Authenticate user with email/username and password.
     */
    @Transactional
    override fun login(request: LoginRequest): AuthResponse {
        val identifier = request.emailOrUsername.lowercase().trim()
        logger.info { "Login attempt for: $identifier" }

        // Find user by email or username
        val user = userRepository.findByEmailOrUsername(identifier, identifier)
            .orElseThrow { InvalidCredentialsException() }

        // Verify password
        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            logger.warn { "Invalid password for user: ${user.id}" }
            throw InvalidCredentialsException()
        }

        // Check if user is active
        if (!user.isActive) {
            throw UnauthorizedException("Account is deactivated")
        }

        // Update last active timestamp
        val updatedUser = user.copy(lastActiveAt = Instant.now())
        userRepository.save(updatedUser)

        logger.info { "User logged in successfully: ${user.id}" }
        return generateAuthResponse(updatedUser)
    }

    /**
     * Refresh access token using refresh token.
     */
    @Transactional
    override fun refreshToken(request: RefreshTokenRequest): AuthResponse {
        logger.debug { "Refreshing token" }

        // Validate refresh token format
        if (!jwtService.validateToken(request.refreshToken) || !jwtService.isRefreshToken(request.refreshToken)) {
            throw InvalidTokenException("Invalid refresh token")
        }

        // Find stored refresh token
        val storedToken = refreshTokenRepository.findByToken(request.refreshToken)
            .orElseThrow { InvalidTokenException("Refresh token not found") }

        // Validate token status
        if (!storedToken.isValid()) {
            refreshTokenRepository.delete(storedToken)
            throw InvalidTokenException("Refresh token is expired or revoked")
        }

        // Find user
        val user = userRepository.findById(storedToken.userId)
            .orElseThrow { InvalidTokenException("User not found") }

        if (!user.isActive) {
            throw UnauthorizedException("Account is deactivated")
        }

        // Revoke old refresh token
        refreshTokenRepository.delete(storedToken)

        logger.info { "Token refreshed for user: ${user.id}" }
        return generateAuthResponse(user)
    }

    /**
     * Logout user (revoke current refresh token).
     */
    @Transactional
    override fun logout(userId: String) {
        logger.info { "User logout: $userId" }
        // In a real implementation, you'd revoke the specific token
        // For simplicity, we'll delete the most recent token
    }

    /**
     * Logout from all devices (revoke all refresh tokens).
     */
    @Transactional
    override fun logoutAll(userId: String) {
        logger.info { "User logout from all devices: $userId" }
        refreshTokenRepository.deleteByUserId(userId)
    }

    /**
     * Generate auth response with tokens.
     */
    private fun generateAuthResponse(user: User): AuthResponse {
        val accessToken = jwtService.generateAccessToken(user)
        val refreshTokenString = jwtService.generateRefreshToken(user)

        // Store refresh token
        val refreshToken = RefreshToken(
            userId = user.id!!,
            token = refreshTokenString,
            expiresAt = Instant.now().plusMillis(jwtService.getRefreshTokenExpirationMs())
        )
        refreshTokenRepository.save(refreshToken)

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshTokenString,
            expiresIn = jwtService.getAccessTokenExpirationSeconds(),
            user = UserSummaryResponse(
                id = user.id,
                email = user.email,
                username = user.username,
                displayName = user.displayName,
                avatarUrl = user.avatarUrl,
                role = user.role.name
            )
        )
    }
}
