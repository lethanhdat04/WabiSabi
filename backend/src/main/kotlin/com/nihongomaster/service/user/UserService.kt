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
import java.time.LocalDate
import java.time.ZoneOffset

private val logger = KotlinLogging.logger {}

/**
 * Enum for different practice types.
 */
enum class PracticeActivityType {
    DICTATION,
    SHADOWING,
    VOCABULARY
}

/**
 * Data class for progress update request.
 */
data class ProgressUpdateRequest(
    val activityType: PracticeActivityType,
    val xpEarned: Long = 0,
    val scoreEarned: Double = 0.0,
    val practiceMinutes: Long = 0,
    val vocabMastered: Int = 0,
    val videoCompleted: Boolean = false
)

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
    fun updateProgress(userId: String, request: ProgressUpdateRequest): User
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

    /**
     * Update user progress after a practice activity.
     * This updates XP, skill scores, streak, and other progress metrics.
     */
    @Transactional
    override fun updateProgress(userId: String, request: ProgressUpdateRequest): User {
        val user = findUserById(userId)
        val currentProgress = user.progress
        val now = Instant.now()

        // Calculate new streak
        val today = LocalDate.now(ZoneOffset.UTC)
        val lastPracticeDate = currentProgress.lastPracticeDate?.let {
            LocalDate.ofInstant(it, ZoneOffset.UTC)
        }

        val (newStreak, newLongestStreak) = when {
            lastPracticeDate == null -> 1 to maxOf(1, currentProgress.longestStreak)
            lastPracticeDate == today -> currentProgress.streak to currentProgress.longestStreak
            lastPracticeDate == today.minusDays(1) -> {
                val newStreakValue = currentProgress.streak + 1
                newStreakValue to maxOf(newStreakValue, currentProgress.longestStreak)
            }
            else -> 1 to currentProgress.longestStreak // Streak broken
        }

        // Update skill scores based on activity type (weighted average)
        val scoreWeight = 0.1 // Each practice contributes 10% to the new average
        val newListeningScore = when (request.activityType) {
            PracticeActivityType.DICTATION -> {
                val current = currentProgress.listeningScore
                current * (1 - scoreWeight) + request.scoreEarned * scoreWeight
            }
            else -> currentProgress.listeningScore
        }

        val newSpeakingScore = when (request.activityType) {
            PracticeActivityType.SHADOWING -> {
                val current = currentProgress.speakingScore
                current * (1 - scoreWeight) + request.scoreEarned * scoreWeight
            }
            else -> currentProgress.speakingScore
        }

        val newVocabularyScore = when (request.activityType) {
            PracticeActivityType.VOCABULARY -> {
                val current = currentProgress.vocabularyScore
                current * (1 - scoreWeight) + request.scoreEarned * scoreWeight
            }
            else -> currentProgress.vocabularyScore
        }

        // Build updated progress
        val updatedProgress = currentProgress.copy(
            listeningScore = newListeningScore.coerceIn(0.0, 100.0),
            speakingScore = newSpeakingScore.coerceIn(0.0, 100.0),
            vocabularyScore = newVocabularyScore.coerceIn(0.0, 100.0),
            totalXP = currentProgress.totalXP + request.xpEarned,
            streak = newStreak,
            longestStreak = newLongestStreak,
            lastPracticeDate = now,
            totalVideosCompleted = currentProgress.totalVideosCompleted + if (request.videoCompleted) 1 else 0,
            totalVocabMastered = currentProgress.totalVocabMastered + request.vocabMastered,
            totalPracticeMinutes = currentProgress.totalPracticeMinutes + request.practiceMinutes
        )

        val updatedUser = user.copy(
            progress = updatedProgress,
            lastActiveAt = now
        )

        val savedUser = userRepository.save(updatedUser)
        logger.info { "Progress updated for user $userId: XP=${request.xpEarned}, type=${request.activityType}" }

        return savedUser
    }

    private fun findUserById(userId: String): User {
        return userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found: $userId") }
    }
}
