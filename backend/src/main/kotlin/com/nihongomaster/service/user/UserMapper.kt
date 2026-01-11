package com.nihongomaster.service.user

import com.nihongomaster.domain.user.User
import com.nihongomaster.dto.user.*
import org.springframework.stereotype.Component

/**
 * Mapper for converting User entities to DTOs.
 */
@Component
class UserMapper {

    /**
     * Convert User entity to full UserResponse DTO.
     */
    fun toResponse(user: User): UserResponse {
        return UserResponse(
            id = user.id!!,
            email = user.email,
            username = user.username,
            displayName = user.displayName,
            avatarUrl = user.avatarUrl,
            bio = user.bio,
            role = user.role.name,
            nativeLanguage = user.nativeLanguage,
            targetLevel = user.targetLevel?.name,
            preferences = toPreferencesResponse(user.preferences),
            progress = toProgressResponse(user.progress),
            followersCount = user.followersCount,
            followingCount = user.followingCount,
            emailVerified = user.emailVerified,
            createdAt = user.createdAt,
            lastActiveAt = user.lastActiveAt
        )
    }

    /**
     * Convert User entity to PublicProfileResponse DTO.
     */
    fun toPublicResponse(user: User): PublicProfileResponse {
        return PublicProfileResponse(
            id = user.id!!,
            username = user.username,
            displayName = user.displayName,
            avatarUrl = user.avatarUrl,
            bio = user.bio,
            targetLevel = user.targetLevel?.name,
            progress = toPublicProgressResponse(user.progress),
            followersCount = user.followersCount,
            followingCount = user.followingCount,
            createdAt = user.createdAt
        )
    }

    private fun toPreferencesResponse(prefs: com.nihongomaster.domain.user.UserPreferences): UserPreferencesResponse {
        return UserPreferencesResponse(
            notificationsEnabled = prefs.notificationsEnabled,
            emailReminders = prefs.emailReminders,
            reviewTime = prefs.reviewTime,
            interfaceLanguage = prefs.interfaceLanguage,
            showFurigana = prefs.showFurigana,
            autoPlayAudio = prefs.autoPlayAudio,
            dailyGoalMinutes = prefs.dailyGoalMinutes
        )
    }

    private fun toProgressResponse(progress: com.nihongomaster.domain.user.UserProgress): UserProgressResponse {
        return UserProgressResponse(
            listeningScore = progress.listeningScore,
            speakingScore = progress.speakingScore,
            vocabularyScore = progress.vocabularyScore,
            totalXP = progress.totalXP,
            streak = progress.streak,
            longestStreak = progress.longestStreak,
            lastPracticeDate = progress.lastPracticeDate,
            totalVideosCompleted = progress.totalVideosCompleted,
            totalVocabMastered = progress.totalVocabMastered,
            totalPracticeMinutes = progress.totalPracticeMinutes
        )
    }

    private fun toPublicProgressResponse(progress: com.nihongomaster.domain.user.UserProgress): PublicProgressResponse {
        return PublicProgressResponse(
            totalXP = progress.totalXP,
            streak = progress.streak,
            longestStreak = progress.longestStreak,
            totalVideosCompleted = progress.totalVideosCompleted,
            totalVocabMastered = progress.totalVocabMastered
        )
    }
}
