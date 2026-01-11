package com.nihongomaster.dto.user

import com.nihongomaster.domain.user.*
import jakarta.validation.constraints.Size
import java.time.Instant

/**
 * Full user response DTO with all details.
 */
data class UserResponse(
    val id: String,
    val email: String,
    val username: String,
    val displayName: String,
    val avatarUrl: String?,
    val bio: String?,
    val role: String,
    val nativeLanguage: String,
    val targetLevel: String?,
    val preferences: UserPreferencesResponse,
    val progress: UserProgressResponse,
    val followersCount: Int,
    val followingCount: Int,
    val emailVerified: Boolean,
    val createdAt: Instant?,
    val lastActiveAt: Instant?
)

/**
 * User preferences response DTO.
 */
data class UserPreferencesResponse(
    val notificationsEnabled: Boolean,
    val emailReminders: Boolean,
    val reviewTime: String,
    val interfaceLanguage: String,
    val showFurigana: Boolean,
    val autoPlayAudio: Boolean,
    val dailyGoalMinutes: Int
)

/**
 * User progress response DTO.
 */
data class UserProgressResponse(
    val listeningScore: Double,
    val speakingScore: Double,
    val vocabularyScore: Double,
    val totalXP: Long,
    val streak: Int,
    val longestStreak: Int,
    val lastPracticeDate: Instant?,
    val totalVideosCompleted: Int,
    val totalVocabMastered: Int,
    val totalPracticeMinutes: Long
)

/**
 * Request DTO for updating user profile.
 */
data class UpdateProfileRequest(
    @field:Size(min = 1, max = 50, message = "Display name must be between 1 and 50 characters")
    val displayName: String? = null,

    @field:Size(max = 500, message = "Bio must be less than 500 characters")
    val bio: String? = null,

    val avatarUrl: String? = null,

    val nativeLanguage: String? = null,

    val targetLevel: JLPTLevel? = null
)

/**
 * Request DTO for updating user preferences.
 */
data class UpdatePreferencesRequest(
    val notificationsEnabled: Boolean? = null,
    val emailReminders: Boolean? = null,
    val reviewTime: String? = null,
    val interfaceLanguage: String? = null,
    val showFurigana: Boolean? = null,
    val autoPlayAudio: Boolean? = null,
    val dailyGoalMinutes: Int? = null
)

/**
 * Public profile view (limited info).
 */
data class PublicProfileResponse(
    val id: String,
    val username: String,
    val displayName: String,
    val avatarUrl: String?,
    val bio: String?,
    val targetLevel: String?,
    val progress: PublicProgressResponse,
    val followersCount: Int,
    val followingCount: Int,
    val createdAt: Instant?
)

/**
 * Public progress (limited info).
 */
data class PublicProgressResponse(
    val totalXP: Long,
    val streak: Int,
    val longestStreak: Int,
    val totalVideosCompleted: Int,
    val totalVocabMastered: Int
)
