package com.nihongomaster.service.user

import com.nihongomaster.domain.user.User
import com.nihongomaster.domain.user.UserPreferences
import com.nihongomaster.dto.user.*
import com.nihongomaster.exception.ResourceNotFoundException
import com.nihongomaster.exception.UsernameAlreadyExistsException
import com.nihongomaster.repository.UserRepository
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

private val logger = KotlinLogging.logger {}

/**
 * Service handling user-related operations.
 */
interface UserService {
    fun getCurrentUser(userId: String): UserResponse
    fun getPublicProfile(username: String): PublicProfileResponse
    fun updateProfile(userId: String, request: UpdateProfileRequest): UserResponse
    fun updatePreferences(userId: String, request: UpdatePreferencesRequest): UserResponse
    fun addXP(userId: String, points: Long): User
    fun updateLastActive(userId: String)
}

@Service
class UserServiceImpl(
    private val userRepository: UserRepository,
    private val userMapper: UserMapper
) : UserService {

    /**
     * Get current authenticated user's full profile.
     */
    override fun getCurrentUser(userId: String): UserResponse {
        val user = findUserById(userId)
        return userMapper.toResponse(user)
    }

    /**
     * Get public profile by username.
     */
    override fun getPublicProfile(username: String): PublicProfileResponse {
        val user = userRepository.findByUsername(username.lowercase())
            .orElseThrow { ResourceNotFoundException("User not found: $username") }

        return userMapper.toPublicResponse(user)
    }

    /**
     * Update user profile information.
     */
    @Transactional
    override fun updateProfile(userId: String, request: UpdateProfileRequest): UserResponse {
        val user = findUserById(userId)

        val updatedUser = user.copy(
            displayName = request.displayName?.trim() ?: user.displayName,
            bio = request.bio?.trim() ?: user.bio,
            avatarUrl = request.avatarUrl ?: user.avatarUrl,
            nativeLanguage = request.nativeLanguage ?: user.nativeLanguage,
            targetLevel = request.targetLevel ?: user.targetLevel
        )

        val savedUser = userRepository.save(updatedUser)
        logger.info { "Profile updated for user: $userId" }

        return userMapper.toResponse(savedUser)
    }

    /**
     * Update user preferences.
     */
    @Transactional
    override fun updatePreferences(userId: String, request: UpdatePreferencesRequest): UserResponse {
        val user = findUserById(userId)

        val currentPrefs = user.preferences
        val updatedPrefs = UserPreferences(
            notificationsEnabled = request.notificationsEnabled ?: currentPrefs.notificationsEnabled,
            emailReminders = request.emailReminders ?: currentPrefs.emailReminders,
            reviewTime = request.reviewTime ?: currentPrefs.reviewTime,
            interfaceLanguage = request.interfaceLanguage ?: currentPrefs.interfaceLanguage,
            showFurigana = request.showFurigana ?: currentPrefs.showFurigana,
            autoPlayAudio = request.autoPlayAudio ?: currentPrefs.autoPlayAudio,
            dailyGoalMinutes = request.dailyGoalMinutes ?: currentPrefs.dailyGoalMinutes
        )

        val updatedUser = user.copy(preferences = updatedPrefs)
        val savedUser = userRepository.save(updatedUser)
        logger.info { "Preferences updated for user: $userId" }

        return userMapper.toResponse(savedUser)
    }

    /**
     * Add XP points to user (for gamification).
     */
    @Transactional
    override fun addXP(userId: String, points: Long): User {
        val user = findUserById(userId)

        val updatedProgress = user.progress.copy(
            totalXP = user.progress.totalXP + points
        )

        val updatedUser = user.copy(progress = updatedProgress)
        return userRepository.save(updatedUser)
    }

    /**
     * Update user's last active timestamp.
     */
    @Transactional
    override fun updateLastActive(userId: String) {
        val user = findUserById(userId)
        val updatedUser = user.copy(lastActiveAt = Instant.now())
        userRepository.save(updatedUser)
    }

    private fun findUserById(userId: String): User {
        return userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found: $userId") }
    }
}
