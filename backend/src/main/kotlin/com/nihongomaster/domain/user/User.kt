package com.nihongomaster.domain.user

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * User entity representing a registered user in the system.
 * Stored in MongoDB 'users' collection.
 */
@Document(collection = "users")
data class User(
    @Id
    val id: String? = null,

    @Indexed(unique = true)
    val email: String,

    @Indexed(unique = true)
    val username: String,

    val passwordHash: String,

    val displayName: String,

    val avatarUrl: String? = null,

    val bio: String? = null,

    val role: UserRole = UserRole.USER,

    val nativeLanguage: String = "en",

    val targetLevel: JLPTLevel? = null,

    val preferences: UserPreferences = UserPreferences(),

    val progress: UserProgress = UserProgress(),

    val followersCount: Int = 0,

    val followingCount: Int = 0,

    val emailVerified: Boolean = false,

    val isActive: Boolean = true,

    @CreatedDate
    val createdAt: Instant? = null,

    @LastModifiedDate
    val updatedAt: Instant? = null,

    val lastActiveAt: Instant? = null
) {
    /**
     * Check if user has at least the specified role level.
     */
    fun hasRole(requiredRole: UserRole): Boolean {
        return role.ordinal >= requiredRole.ordinal
    }

    /**
     * Check if user is an admin.
     */
    fun isAdmin(): Boolean = role == UserRole.ADMIN
}

/**
 * User roles with hierarchical access levels.
 * Ordinal determines privilege level (higher = more privileges).
 */
enum class UserRole {
    USER,
    PREMIUM,
    ADMIN
}

/**
 * JLPT (Japanese Language Proficiency Test) levels.
 * N5 is beginner, N1 is most advanced.
 */
enum class JLPTLevel {
    N5, N4, N3, N2, N1
}

/**
 * User preferences for application settings.
 */
data class UserPreferences(
    val notificationsEnabled: Boolean = true,
    val emailReminders: Boolean = true,
    val reviewTime: String = "09:00",
    val interfaceLanguage: String = "en",
    val showFurigana: Boolean = true,
    val autoPlayAudio: Boolean = true,
    val dailyGoalMinutes: Int = 15
)

/**
 * User progress tracking for gamification and analytics.
 */
data class UserProgress(
    val listeningScore: Double = 0.0,
    val speakingScore: Double = 0.0,
    val vocabularyScore: Double = 0.0,
    val totalXP: Long = 0,
    val streak: Int = 0,
    val longestStreak: Int = 0,
    val lastPracticeDate: Instant? = null,
    val totalVideosCompleted: Int = 0,
    val totalVocabMastered: Int = 0,
    val totalPracticeMinutes: Long = 0
)
