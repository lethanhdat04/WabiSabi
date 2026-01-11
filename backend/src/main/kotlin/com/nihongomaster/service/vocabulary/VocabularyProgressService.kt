package com.nihongomaster.service.vocabulary

import com.nihongomaster.domain.vocabulary.*
import com.nihongomaster.dto.*
import com.nihongomaster.exception.ForbiddenException
import com.nihongomaster.exception.ResourceNotFoundException
import com.nihongomaster.mapper.VocabularyMapper
import com.nihongomaster.repository.VocabularyDeckRepository
import com.nihongomaster.repository.VocabularyProgressRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.temporal.ChronoUnit

/**
 * Service for managing vocabulary learning progress.
 */
@Service
class VocabularyProgressService(
    private val progressRepository: VocabularyProgressRepository,
    private val deckRepository: VocabularyDeckRepository,
    private val mapper: VocabularyMapper
) {
    private val logger = LoggerFactory.getLogger(VocabularyProgressService::class.java)

    // ================================
    // Progress Retrieval
    // ================================

    /**
     * Get user's progress for a specific deck.
     */
    fun getDeckProgress(deckId: String, userId: String): DeckProgressResponse {
        val deck = findDeckById(deckId)

        if (!deck.isAccessibleBy(userId)) {
            throw ForbiddenException("You don't have access to this deck")
        }

        val progress = progressRepository.findByUserIdAndDeckId(userId, deckId)
            .orElse(createEmptyProgress(userId, deckId))

        val reviewItems = getNextReviewItems(deck, progress, 5)

        return mapper.toDeckProgressResponse(progress, deck, reviewItems)
    }

    /**
     * Get progress for a specific item.
     */
    fun getItemProgress(
        deckId: String,
        sectionIndex: Int,
        itemIndex: Int,
        userId: String
    ): ItemProgressResponse? {
        val deck = findDeckById(deckId)

        if (!deck.isAccessibleBy(userId)) {
            throw ForbiddenException("You don't have access to this deck")
        }

        val progress = progressRepository.findByUserIdAndDeckId(userId, deckId)
            .orElse(null) ?: return null

        val itemKey = VocabularyProgress.itemKey(sectionIndex, itemIndex)
        val itemProgress = progress.itemProgress[itemKey] ?: return null

        return mapper.toItemProgressResponse(itemProgress)
    }

    /**
     * Get user's progress across all decks.
     */
    fun getUserProgress(userId: String, pageable: Pageable): Page<DeckProgressResponse> {
        val progressPage = progressRepository.findByUserIdOrderByLastStudiedAtDesc(userId, pageable)

        return progressPage.map { progress ->
            val deck = deckRepository.findById(progress.deckId).orElse(null)
            if (deck != null) {
                val reviewItems = getNextReviewItems(deck, progress, 3)
                mapper.toDeckProgressResponse(progress, deck, reviewItems)
            } else {
                // Deck was deleted, create minimal response
                createMinimalProgressResponse(progress)
            }
        }
    }

    /**
     * Get user's recently studied decks.
     */
    fun getRecentlyStudiedDecks(userId: String): List<RecentDeckResponse> {
        val recentProgress = progressRepository.findTop10ByUserIdOrderByLastStudiedAtDesc(userId)

        return recentProgress.mapNotNull { progress ->
            deckRepository.findById(progress.deckId).map { deck ->
                mapper.toRecentDeckResponse(progress, deck)
            }.orElse(null)
        }
    }

    /**
     * Get user's overall vocabulary statistics.
     */
    fun getUserVocabularyStats(userId: String): UserVocabularyStatsResponse {
        val totalDecksStudied = progressRepository.countByUserId(userId)
        val allProgress = progressRepository.findByUserId(userId, PageRequest.of(0, 1000))

        var totalItemsPracticed = 0
        var totalItemsMastered = 0
        var totalCorrect = 0
        var totalAttempts = 0
        var maxStreak = 0
        var currentStreak = 0
        var totalStudyTime = 0L
        var itemsToReview = 0

        allProgress.content.forEach { progress ->
            totalItemsPracticed += progress.overallStats.totalItemsPracticed
            totalItemsMastered += progress.overallStats.itemsMastered
            totalCorrect += progress.overallStats.totalCorrectAttempts
            totalAttempts += progress.overallStats.totalAttempts
            totalStudyTime += progress.overallStats.totalStudyTimeMinutes

            if (progress.studyStreak > maxStreak) {
                maxStreak = progress.studyStreak
            }

            // Count items needing review
            itemsToReview += progress.getItemsNeedingReview().size
        }

        // Get current streak from most recent progress
        val mostRecentProgress = allProgress.content.firstOrNull()
        currentStreak = mostRecentProgress?.studyStreak ?: 0

        val overallAccuracy = if (totalAttempts > 0) {
            (totalCorrect.toDouble() / totalAttempts) * 100
        } else 0.0

        val recentDecks = getRecentlyStudiedDecks(userId).take(5)

        return UserVocabularyStatsResponse(
            userId = userId,
            totalDecksStudied = totalDecksStudied,
            totalItemsPracticed = totalItemsPracticed,
            totalItemsMastered = totalItemsMastered,
            overallAccuracy = overallAccuracy,
            currentStreak = currentStreak,
            longestStreak = maxStreak,
            totalStudyTimeMinutes = totalStudyTime,
            recentDecks = recentDecks,
            itemsToReviewToday = itemsToReview
        )
    }

    // ================================
    // Progress Management
    // ================================

    /**
     * Reset progress for a specific deck.
     */
    @Transactional
    fun resetDeckProgress(deckId: String, userId: String) {
        val deck = findDeckById(deckId)

        if (!deck.isAccessibleBy(userId)) {
            throw ForbiddenException("You don't have access to this deck")
        }

        progressRepository.deleteByUserIdAndDeckId(userId, deckId)
        logger.info("Progress reset for deck $deckId by user $userId")
    }

    /**
     * Reset progress for a specific section.
     */
    @Transactional
    fun resetSectionProgress(
        deckId: String,
        sectionIndex: Int,
        userId: String
    ): DeckProgressResponse {
        val deck = findDeckById(deckId)

        if (!deck.isAccessibleBy(userId)) {
            throw ForbiddenException("You don't have access to this deck")
        }

        val progress = progressRepository.findByUserIdAndDeckId(userId, deckId)
            .orElse(null) ?: return getDeckProgress(deckId, userId)

        // Remove all item progress for the section
        val updatedItemProgress = progress.itemProgress.filter { (key, _) ->
            !key.startsWith("$sectionIndex-")
        }

        // Remove section progress
        val updatedSectionProgress = progress.sectionProgress.filter { (index, _) ->
            index != sectionIndex
        }

        // Recalculate overall stats
        val updatedOverallStats = recalculateOverallStats(updatedItemProgress)

        val updatedProgress = progress.copy(
            itemProgress = updatedItemProgress,
            sectionProgress = updatedSectionProgress,
            overallStats = updatedOverallStats
        )

        progressRepository.save(updatedProgress)

        logger.info("Section $sectionIndex progress reset for deck $deckId by user $userId")

        return getDeckProgress(deckId, userId)
    }

    // ================================
    // Review Items
    // ================================

    /**
     * Get all items that need review for a user (across all decks).
     */
    fun getAllItemsNeedingReview(userId: String, limit: Int = 50): List<ReviewItemResponse> {
        val allProgress = progressRepository.findByUserId(userId, PageRequest.of(0, 100))
        val reviewItems = mutableListOf<ReviewItemResponse>()

        for (progress in allProgress.content) {
            val deck = deckRepository.findById(progress.deckId).orElse(null) ?: continue

            val itemsForReview = progress.getItemsNeedingReview()
            for (itemKey in itemsForReview) {
                if (reviewItems.size >= limit) break

                val (sectionIndex, itemIndex) = parseItemKey(itemKey)
                val item = deck.getVocabularyItem(sectionIndex, itemIndex) ?: continue
                val itemProgress = progress.itemProgress[itemKey]

                reviewItems.add(mapper.toReviewItemResponse(item, sectionIndex, itemProgress))
            }

            if (reviewItems.size >= limit) break
        }

        return reviewItems
    }

    /**
     * Get items needing review for a specific deck.
     */
    fun getDeckItemsNeedingReview(
        deckId: String,
        userId: String,
        limit: Int = 20
    ): List<ReviewItemResponse> {
        val deck = findDeckById(deckId)

        if (!deck.isAccessibleBy(userId)) {
            throw ForbiddenException("You don't have access to this deck")
        }

        val progress = progressRepository.findByUserIdAndDeckId(userId, deckId)
            .orElse(null) ?: return emptyList()

        return getNextReviewItems(deck, progress, limit)
    }

    // ================================
    // Statistics
    // ================================

    /**
     * Get deck study statistics.
     */
    fun getDeckStudyStats(deckId: String): DeckStudyStatsResponse {
        val deck = findDeckById(deckId)
        val usersStudied = progressRepository.countByDeckId(deckId)
        val avgMastered = progressRepository.calculateAverageMasteredByDeckId(deckId) ?: 0.0

        return DeckStudyStatsResponse(
            deckId = deckId,
            deckTitle = deck.title,
            totalUsersStudied = usersStudied,
            averageItemsMastered = avgMastered,
            totalVocabulary = deck.getTotalVocabularyCount()
        )
    }

    // ================================
    // Helper Methods
    // ================================

    /**
     * Find deck by ID or throw exception.
     */
    private fun findDeckById(deckId: String): VocabularyDeck {
        return deckRepository.findById(deckId)
            .orElseThrow { ResourceNotFoundException("Deck not found with ID: $deckId") }
    }

    /**
     * Create empty progress object.
     */
    private fun createEmptyProgress(userId: String, deckId: String): VocabularyProgress {
        return VocabularyProgress(
            userId = userId,
            deckId = deckId
        )
    }

    /**
     * Get next items to review for a deck.
     */
    private fun getNextReviewItems(
        deck: VocabularyDeck,
        progress: VocabularyProgress,
        limit: Int
    ): List<ReviewItemResponse> {
        val now = Instant.now()

        return progress.itemProgress
            .filter { (_, itemProgress) ->
                itemProgress.nextReviewAt?.isBefore(now) == true
            }
            .entries
            .sortedBy { it.value.nextReviewAt }
            .take(limit)
            .mapNotNull { (key, itemProgress) ->
                val (sectionIndex, itemIndex) = parseItemKey(key)
                val item = deck.getVocabularyItem(sectionIndex, itemIndex)
                item?.let { mapper.toReviewItemResponse(it, sectionIndex, itemProgress) }
            }
    }

    /**
     * Recalculate overall stats from item progress.
     */
    private fun recalculateOverallStats(itemProgressMap: Map<String, ItemProgress>): ProgressStats {
        val totalPracticed = itemProgressMap.size
        val totalCorrect = itemProgressMap.values.sumOf { it.correctAttempts }
        val totalIncorrect = itemProgressMap.values.sumOf { it.incorrectAttempts }
        val totalAttempts = itemProgressMap.values.sumOf { it.totalAttempts }
        val mastered = itemProgressMap.values.count { it.masteryLevel >= MasteryLevel.FAMILIAR }
        val learning = itemProgressMap.values.count {
            it.masteryLevel == MasteryLevel.LEARNING || it.masteryLevel == MasteryLevel.NEW
        }
        val avgAccuracy = if (totalAttempts > 0) {
            (totalCorrect.toDouble() / totalAttempts) * 100
        } else 0.0

        return ProgressStats(
            totalItemsPracticed = totalPracticed,
            totalCorrectAttempts = totalCorrect,
            totalIncorrectAttempts = totalIncorrect,
            totalAttempts = totalAttempts,
            itemsMastered = mastered,
            itemsLearning = learning,
            averageAccuracy = avgAccuracy
        )
    }

    /**
     * Create minimal progress response when deck is deleted.
     */
    private fun createMinimalProgressResponse(progress: VocabularyProgress): DeckProgressResponse {
        return DeckProgressResponse(
            deckId = progress.deckId,
            deckTitle = "[Deleted Deck]",
            userId = progress.userId,
            sectionProgress = emptyList(),
            overallStats = OverallStatsResponse(
                totalItemsPracticed = progress.overallStats.totalItemsPracticed,
                totalCorrectAttempts = progress.overallStats.totalCorrectAttempts,
                totalIncorrectAttempts = progress.overallStats.totalIncorrectAttempts,
                totalAttempts = progress.overallStats.totalAttempts,
                itemsMastered = progress.overallStats.itemsMastered,
                itemsLearning = progress.overallStats.itemsLearning,
                averageAccuracy = progress.overallStats.averageAccuracy,
                totalStudyTimeMinutes = progress.overallStats.totalStudyTimeMinutes,
                sessionsCompleted = progress.overallStats.sessionsCompleted,
                overallCompletionPercentage = 0.0
            ),
            studyStreak = progress.studyStreak,
            lastStudiedAt = progress.lastStudiedAt,
            itemsNeedingReview = 0,
            nextReviewItems = emptyList(),
            createdAt = progress.createdAt,
            updatedAt = progress.updatedAt
        )
    }

    /**
     * Parse item key to section and item indices.
     */
    private fun parseItemKey(key: String): Pair<Int, Int> {
        val parts = key.split("-")
        return Pair(parts[0].toInt(), parts[1].toInt())
    }
}

/**
 * Response for deck study statistics.
 */
data class DeckStudyStatsResponse(
    val deckId: String,
    val deckTitle: String,
    val totalUsersStudied: Long,
    val averageItemsMastered: Double,
    val totalVocabulary: Int
)
