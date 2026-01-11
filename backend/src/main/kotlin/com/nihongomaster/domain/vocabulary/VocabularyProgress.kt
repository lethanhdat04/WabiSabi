package com.nihongomaster.domain.vocabulary

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * VocabularyProgress entity tracking a user's learning progress for a specific deck.
 * Stores per-item progress including correct/incorrect attempts.
 */
@Document(collection = "vocabulary_progress")
@CompoundIndex(name = "user_deck_idx", def = "{'userId': 1, 'deckId': 1}", unique = true)
@CompoundIndex(name = "user_updated_idx", def = "{'userId': 1, 'lastStudiedAt': -1}")
data class VocabularyProgress(
    @Id
    val id: String? = null,

    @Indexed
    val userId: String,

    @Indexed
    val deckId: String,

    val itemProgress: Map<String, ItemProgress> = emptyMap(),  // Key: "sectionIndex-itemIndex"

    val sectionProgress: Map<Int, SectionProgressSummary> = emptyMap(),  // Key: sectionIndex

    val overallStats: ProgressStats = ProgressStats(),

    val lastStudiedAt: Instant? = null,

    val studyStreak: Int = 0,  // Consecutive days studied

    val lastStreakDate: Instant? = null,

    @CreatedDate
    val createdAt: Instant? = null,

    @LastModifiedDate
    val updatedAt: Instant? = null
) {
    /**
     * Get progress for a specific item.
     */
    fun getItemProgress(sectionIndex: Int, itemIndex: Int): ItemProgress? {
        return itemProgress["$sectionIndex-$itemIndex"]
    }

    /**
     * Check if an item has been practiced.
     */
    fun hasItemBeenPracticed(sectionIndex: Int, itemIndex: Int): Boolean {
        return itemProgress.containsKey("$sectionIndex-$itemIndex")
    }

    /**
     * Get completion percentage for the entire deck.
     */
    fun getCompletionPercentage(totalItems: Int): Double {
        if (totalItems == 0) return 0.0
        val masteredCount = itemProgress.values.count { it.masteryLevel >= MasteryLevel.FAMILIAR }
        return (masteredCount.toDouble() / totalItems) * 100
    }

    /**
     * Get items that need review (based on SRS-like logic).
     */
    fun getItemsNeedingReview(): List<String> {
        val now = Instant.now()
        return itemProgress.filter { (_, progress) ->
            progress.nextReviewAt?.isBefore(now) == true
        }.keys.toList()
    }

    companion object {
        /**
         * Generate item key from section and item indices.
         */
        fun itemKey(sectionIndex: Int, itemIndex: Int): String = "$sectionIndex-$itemIndex"
    }
}

/**
 * Progress tracking for a single vocabulary item.
 */
data class ItemProgress(
    val sectionIndex: Int,
    val itemIndex: Int,
    val correctAttempts: Int = 0,
    val incorrectAttempts: Int = 0,
    val totalAttempts: Int = 0,
    val masteryLevel: MasteryLevel = MasteryLevel.NEW,
    val lastAttemptAt: Instant? = null,
    val lastCorrectAt: Instant? = null,
    val nextReviewAt: Instant? = null,      // For spaced repetition
    val streakCount: Int = 0,               // Consecutive correct answers
    val bestStreak: Int = 0
) {
    /**
     * Calculate accuracy percentage.
     */
    fun getAccuracyPercentage(): Double {
        if (totalAttempts == 0) return 0.0
        return (correctAttempts.toDouble() / totalAttempts) * 100
    }

    /**
     * Check if item is mastered (accuracy >= 80% with at least 3 attempts).
     */
    fun isMastered(): Boolean {
        return totalAttempts >= 3 && getAccuracyPercentage() >= 80.0
    }

    /**
     * Update progress after an attempt.
     */
    fun recordAttempt(isCorrect: Boolean): ItemProgress {
        val now = Instant.now()
        val newCorrect = if (isCorrect) correctAttempts + 1 else correctAttempts
        val newIncorrect = if (!isCorrect) incorrectAttempts + 1 else incorrectAttempts
        val newTotal = totalAttempts + 1
        val newStreak = if (isCorrect) streakCount + 1 else 0
        val newBestStreak = maxOf(bestStreak, newStreak)

        // Calculate new mastery level
        val accuracy = newCorrect.toDouble() / newTotal
        val newMastery = when {
            newTotal >= 5 && accuracy >= 0.9 -> MasteryLevel.MASTERED
            newTotal >= 3 && accuracy >= 0.7 -> MasteryLevel.FAMILIAR
            newTotal >= 1 -> MasteryLevel.LEARNING
            else -> MasteryLevel.NEW
        }

        // Calculate next review time (simple SRS)
        val nextReview = calculateNextReview(newMastery, newStreak)

        return copy(
            correctAttempts = newCorrect,
            incorrectAttempts = newIncorrect,
            totalAttempts = newTotal,
            masteryLevel = newMastery,
            lastAttemptAt = now,
            lastCorrectAt = if (isCorrect) now else lastCorrectAt,
            nextReviewAt = nextReview,
            streakCount = newStreak,
            bestStreak = newBestStreak
        )
    }

    private fun calculateNextReview(mastery: MasteryLevel, streak: Int): Instant {
        val now = Instant.now()
        val hoursToAdd = when (mastery) {
            MasteryLevel.NEW -> 1L
            MasteryLevel.LEARNING -> 4L * (streak + 1)
            MasteryLevel.FAMILIAR -> 24L * (streak + 1)
            MasteryLevel.MASTERED -> 72L * (streak + 1)
        }
        return now.plusSeconds(hoursToAdd * 3600)
    }
}

/**
 * Mastery levels for vocabulary items.
 */
enum class MasteryLevel {
    NEW,        // Never practiced
    LEARNING,   // 1-2 attempts
    FAMILIAR,   // 3+ attempts, 70%+ accuracy
    MASTERED    // 5+ attempts, 90%+ accuracy
}

/**
 * Summary of progress for a section.
 */
data class SectionProgressSummary(
    val sectionIndex: Int,
    val totalItems: Int,
    val practicedItems: Int = 0,
    val masteredItems: Int = 0,
    val averageAccuracy: Double = 0.0,
    val lastStudiedAt: Instant? = null
) {
    fun getCompletionPercentage(): Double {
        if (totalItems == 0) return 0.0
        return (masteredItems.toDouble() / totalItems) * 100
    }
}

/**
 * Overall progress statistics for a deck.
 */
data class ProgressStats(
    val totalItemsPracticed: Int = 0,
    val totalCorrectAttempts: Int = 0,
    val totalIncorrectAttempts: Int = 0,
    val totalAttempts: Int = 0,
    val itemsMastered: Int = 0,
    val itemsLearning: Int = 0,
    val averageAccuracy: Double = 0.0,
    val totalStudyTimeMinutes: Long = 0,
    val sessionsCompleted: Int = 0
) {
    fun getOverallAccuracy(): Double {
        if (totalAttempts == 0) return 0.0
        return (totalCorrectAttempts.toDouble() / totalAttempts) * 100
    }
}
