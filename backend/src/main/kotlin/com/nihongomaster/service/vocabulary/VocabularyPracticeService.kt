package com.nihongomaster.service.vocabulary

import com.nihongomaster.domain.vocabulary.*
import com.nihongomaster.dto.*
import com.nihongomaster.exception.ForbiddenException
import com.nihongomaster.exception.ResourceNotFoundException
import com.nihongomaster.mapper.VocabularyMapper
import com.nihongomaster.repository.VocabularyDeckRepository
import com.nihongomaster.repository.VocabularyProgressRepository
import com.nihongomaster.service.user.PracticeActivityType
import com.nihongomaster.service.user.ProgressUpdateRequest
import com.nihongomaster.service.user.UserService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset
import java.util.*
import kotlin.math.min

/**
 * Service for vocabulary practice modes: Fill-in-the-Blank and Flashcard.
 */
@Service
class VocabularyPracticeService(
    private val deckRepository: VocabularyDeckRepository,
    private val progressRepository: VocabularyProgressRepository,
    private val deckService: DeckService,
    private val mapper: VocabularyMapper,
    private val userService: UserService
) {
    private val logger = LoggerFactory.getLogger(VocabularyPracticeService::class.java)

    // ================================
    // Fill-in-the-Blank Practice
    // ================================

    /**
     * Generate fill-in-the-blank questions for a deck.
     */
    fun generateFillInQuestions(
        request: StartFillInPracticeRequest,
        userId: String
    ): List<FillInQuestionResponse> {
        val deck = getDeckWithAccessCheck(request.deckId, userId)

        // Get items from specified section or all sections
        val items = if (request.sectionIndex != null) {
            val section = deck.getSection(request.sectionIndex)
                ?: throw ResourceNotFoundException("Section not found")
            section.items.map { it to request.sectionIndex }
        } else {
            deck.sections.flatMap { section ->
                section.items.map { item -> item to section.index }
            }
        }

        if (items.isEmpty()) {
            return emptyList()
        }

        // Select and optionally shuffle items
        val selectedItems = if (request.shuffleItems) {
            items.shuffled().take(min(request.itemCount, items.size))
        } else {
            items.take(min(request.itemCount, items.size))
        }

        // Generate questions with varying types
        val questionTypes = FillInQuestionType.entries
        return selectedItems.mapIndexed { index, (item, sectionIndex) ->
            val questionType = questionTypes[index % questionTypes.size]

            // Generate multiple choice options (for some questions)
            val options = if (index % 2 == 0) {
                generateOptions(item, questionType, deck, 4)
            } else {
                null  // Free-form answer
            }

            mapper.toFillInQuestionResponse(item, sectionIndex, questionType, options)
        }
    }

    /**
     * Submit and evaluate a fill-in-the-blank answer.
     */
    @Transactional
    fun submitFillInAnswer(
        request: FillInAnswerRequest,
        userId: String
    ): FillInAnswerResponse {
        val deck = getDeckWithAccessCheck(request.deckId, userId)
        val item = deck.getVocabularyItem(request.sectionIndex, request.itemIndex)
            ?: throw ResourceNotFoundException("Vocabulary item not found")

        // Determine correct answer based on question type
        val correctAnswer = when (request.questionType) {
            FillInQuestionType.MEANING_TO_JAPANESE -> item.japaneseWord
            FillInQuestionType.JAPANESE_TO_MEANING -> item.meaning
            FillInQuestionType.READING_TO_JAPANESE -> item.japaneseWord
            FillInQuestionType.JAPANESE_TO_READING -> item.reading
        }

        // Calculate similarity
        val similarity = calculateSimilarity(request.userAnswer.trim(), correctAnswer.trim())
        val isCorrect = similarity >= 0.85  // 85% similarity threshold

        // Generate feedback
        val feedback = generateFillInFeedback(isCorrect, similarity, request.userAnswer, correctAnswer)

        // Update progress
        val itemProgress = updateItemProgress(
            userId = userId,
            deckId = request.deckId,
            sectionIndex = request.sectionIndex,
            itemIndex = request.itemIndex,
            isCorrect = isCorrect,
            deck = deck
        )

        // Calculate points
        val pointsEarned = calculatePoints(isCorrect, similarity, itemProgress)

        logger.info("Fill-in answer submitted: user=$userId, deck=${request.deckId}, " +
                "correct=$isCorrect, similarity=$similarity")

        // Update user progress
        val isMastered = itemProgress?.masteryLevel == MasteryLevel.FAMILIAR ||
                         itemProgress?.masteryLevel == MasteryLevel.MASTERED
        userService.updateProgress(
            userId = userId,
            request = ProgressUpdateRequest(
                activityType = PracticeActivityType.VOCABULARY,
                xpEarned = pointsEarned.toLong(),
                scoreEarned = similarity * 100,
                vocabMastered = if (isMastered && itemProgress?.totalAttempts == 1) 1 else 0
            )
        )

        return FillInAnswerResponse(
            isCorrect = isCorrect,
            userAnswer = request.userAnswer,
            correctAnswer = correctAnswer,
            similarity = similarity,
            feedback = feedback,
            itemProgress = itemProgress?.let { mapper.toItemProgressResponse(it) },
            pointsEarned = pointsEarned
        )
    }

    // ================================
    // Flashcard Practice
    // ================================

    /**
     * Generate flashcards for a deck.
     */
    fun generateFlashcards(
        request: StartFlashcardPracticeRequest,
        userId: String
    ): List<FlashcardResponse> {
        val deck = getDeckWithAccessCheck(request.deckId, userId)

        // Get items from specified section or all sections
        val items = if (request.sectionIndex != null) {
            val section = deck.getSection(request.sectionIndex)
                ?: throw ResourceNotFoundException("Section not found")
            section.items.map { it to request.sectionIndex }
        } else {
            deck.sections.flatMap { section ->
                section.items.map { item -> item to section.index }
            }
        }

        if (items.isEmpty()) {
            return emptyList()
        }

        // Select and optionally shuffle items
        val selectedItems = if (request.shuffleItems) {
            items.shuffled().take(min(request.itemCount, items.size))
        } else {
            items.take(min(request.itemCount, items.size))
        }

        return selectedItems.map { (item, sectionIndex) ->
            mapper.toFlashcardResponse(item, sectionIndex, request.showFront)
        }
    }

    /**
     * Submit flashcard self-assessment result.
     */
    @Transactional
    fun submitFlashcardResult(
        request: FlashcardResultRequest,
        userId: String
    ): FlashcardResultResponse {
        val deck = getDeckWithAccessCheck(request.deckId, userId)

        // Validate item exists
        deck.getVocabularyItem(request.sectionIndex, request.itemIndex)
            ?: throw ResourceNotFoundException("Vocabulary item not found")

        // Map self-assessment to correct/incorrect
        val isCorrect = request.result in listOf(
            FlashcardSelfAssessment.EASY,
            FlashcardSelfAssessment.GOOD
        )

        // Update progress
        val itemProgress = updateItemProgress(
            userId = userId,
            deckId = request.deckId,
            sectionIndex = request.sectionIndex,
            itemIndex = request.itemIndex,
            isCorrect = isCorrect,
            deck = deck
        )

        // Calculate points based on self-assessment
        val pointsEarned = when (request.result) {
            FlashcardSelfAssessment.EASY -> 15
            FlashcardSelfAssessment.GOOD -> 10
            FlashcardSelfAssessment.HARD -> 5
            FlashcardSelfAssessment.FORGOT -> 2
        }

        logger.info("Flashcard result submitted: user=$userId, deck=${request.deckId}, " +
                "result=${request.result}")

        // Update user progress
        val isMastered = itemProgress?.masteryLevel == MasteryLevel.FAMILIAR ||
                         itemProgress?.masteryLevel == MasteryLevel.MASTERED
        val scoreEarned = when (request.result) {
            FlashcardSelfAssessment.EASY -> 100.0
            FlashcardSelfAssessment.GOOD -> 80.0
            FlashcardSelfAssessment.HARD -> 50.0
            FlashcardSelfAssessment.FORGOT -> 20.0
        }
        userService.updateProgress(
            userId = userId,
            request = ProgressUpdateRequest(
                activityType = PracticeActivityType.VOCABULARY,
                xpEarned = pointsEarned.toLong(),
                scoreEarned = scoreEarned,
                vocabMastered = if (isMastered && itemProgress?.totalAttempts == 1) 1 else 0
            )
        )

        return FlashcardResultResponse(
            recorded = true,
            isCorrect = isCorrect,
            itemProgress = itemProgress?.let { mapper.toItemProgressResponse(it) },
            nextReviewAt = itemProgress?.nextReviewAt,
            pointsEarned = pointsEarned
        )
    }

    // ================================
    // Review Mode (SRS-based)
    // ================================

    /**
     * Get items that need review based on spaced repetition.
     */
    fun getItemsForReview(
        deckId: String,
        userId: String,
        limit: Int = 20
    ): List<FlashcardResponse> {
        val deck = getDeckWithAccessCheck(deckId, userId)
        val progress = getOrCreateProgress(userId, deckId)

        val itemsNeedingReview = progress.getItemsNeedingReview()

        val reviewItems = itemsNeedingReview
            .take(limit)
            .mapNotNull { key ->
                val (sectionIndex, itemIndex) = parseItemKey(key)
                val item = deck.getVocabularyItem(sectionIndex, itemIndex)
                item?.let { mapper.toFlashcardResponse(it, sectionIndex, FlashcardFrontType.JAPANESE) }
            }

        return reviewItems
    }

    /**
     * Get count of items needing review.
     */
    fun getReviewCount(deckId: String, userId: String): Int {
        val deck = getDeckWithAccessCheck(deckId, userId)
        val progress = progressRepository.findByUserIdAndDeckId(userId, deckId)
            .orElse(null) ?: return 0

        return progress.getItemsNeedingReview().size
    }

    // ================================
    // Helper Methods
    // ================================

    /**
     * Get deck with access check.
     */
    private fun getDeckWithAccessCheck(deckId: String, userId: String): VocabularyDeck {
        val deck = deckService.findDeckById(deckId)

        if (!deck.isAccessibleBy(userId)) {
            throw ForbiddenException("You don't have access to this deck")
        }

        return deck
    }

    /**
     * Get or create progress for a user and deck.
     */
    private fun getOrCreateProgress(userId: String, deckId: String): VocabularyProgress {
        return progressRepository.findByUserIdAndDeckId(userId, deckId)
            .orElseGet {
                val newProgress = VocabularyProgress(
                    userId = userId,
                    deckId = deckId
                )
                progressRepository.save(newProgress)
            }
    }

    /**
     * Update item progress after an attempt.
     */
    private fun updateItemProgress(
        userId: String,
        deckId: String,
        sectionIndex: Int,
        itemIndex: Int,
        isCorrect: Boolean,
        deck: VocabularyDeck
    ): ItemProgress? {
        var progress = getOrCreateProgress(userId, deckId)
        val itemKey = VocabularyProgress.itemKey(sectionIndex, itemIndex)

        // Get or create item progress
        val currentItemProgress = progress.itemProgress[itemKey] ?: ItemProgress(
            sectionIndex = sectionIndex,
            itemIndex = itemIndex
        )

        // Record the attempt
        val updatedItemProgress = currentItemProgress.recordAttempt(isCorrect)

        // Update item progress map
        val updatedItemProgressMap = progress.itemProgress.toMutableMap()
        updatedItemProgressMap[itemKey] = updatedItemProgress

        // Update section progress
        val section = deck.getSection(sectionIndex)
        val updatedSectionProgress = if (section != null) {
            calculateSectionProgress(sectionIndex, section, updatedItemProgressMap)
        } else {
            progress.sectionProgress
        }

        // Update overall stats
        val updatedOverallStats = calculateOverallStats(updatedItemProgressMap)

        // Update study streak
        val (newStreak, newStreakDate) = updateStudyStreak(progress)

        // Save updated progress
        progress = progress.copy(
            itemProgress = updatedItemProgressMap,
            sectionProgress = updatedSectionProgress,
            overallStats = updatedOverallStats,
            lastStudiedAt = Instant.now(),
            studyStreak = newStreak,
            lastStreakDate = newStreakDate
        )

        progressRepository.save(progress)

        // Increment deck study count (only once per session)
        if (progress.overallStats.totalAttempts == 0) {
            deckService.incrementStudyCount(deckId)
        }

        return updatedItemProgress
    }

    /**
     * Calculate section progress summary.
     */
    private fun calculateSectionProgress(
        sectionIndex: Int,
        section: VocabularySection,
        itemProgressMap: Map<String, ItemProgress>
    ): Map<Int, SectionProgressSummary> {
        val sectionItems = itemProgressMap.filter { (key, _) ->
            key.startsWith("$sectionIndex-")
        }

        val practicedCount = sectionItems.size
        val masteredCount = sectionItems.values.count { it.masteryLevel >= MasteryLevel.FAMILIAR }
        val totalAccuracy = sectionItems.values.sumOf { it.getAccuracyPercentage() }
        val avgAccuracy = if (practicedCount > 0) totalAccuracy / practicedCount else 0.0
        val lastStudied = sectionItems.values.mapNotNull { it.lastAttemptAt }.maxOrNull()

        val summary = SectionProgressSummary(
            sectionIndex = sectionIndex,
            totalItems = section.items.size,
            practicedItems = practicedCount,
            masteredItems = masteredCount,
            averageAccuracy = avgAccuracy,
            lastStudiedAt = lastStudied
        )

        return mapOf(sectionIndex to summary)
    }

    /**
     * Calculate overall statistics.
     */
    private fun calculateOverallStats(itemProgressMap: Map<String, ItemProgress>): ProgressStats {
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
     * Update study streak.
     */
    private fun updateStudyStreak(progress: VocabularyProgress): Pair<Int, Instant> {
        val today = LocalDate.now(ZoneOffset.UTC)
        val lastStudyDate = progress.lastStreakDate?.let {
            LocalDate.ofInstant(it, ZoneOffset.UTC)
        }

        return when {
            lastStudyDate == null -> 1 to Instant.now()
            lastStudyDate == today -> progress.studyStreak to progress.lastStreakDate!!
            lastStudyDate == today.minusDays(1) -> (progress.studyStreak + 1) to Instant.now()
            else -> 1 to Instant.now()  // Streak broken
        }
    }

    /**
     * Calculate string similarity using Levenshtein distance.
     */
    private fun calculateSimilarity(s1: String, s2: String): Double {
        if (s1.isEmpty() && s2.isEmpty()) return 1.0
        if (s1.isEmpty() || s2.isEmpty()) return 0.0

        val s1Lower = s1.lowercase()
        val s2Lower = s2.lowercase()

        if (s1Lower == s2Lower) return 1.0

        val distance = levenshteinDistance(s1Lower, s2Lower)
        val maxLength = maxOf(s1.length, s2.length)
        return 1.0 - (distance.toDouble() / maxLength)
    }

    /**
     * Calculate Levenshtein distance between two strings.
     */
    private fun levenshteinDistance(s1: String, s2: String): Int {
        val dp = Array(s1.length + 1) { IntArray(s2.length + 1) }

        for (i in 0..s1.length) dp[i][0] = i
        for (j in 0..s2.length) dp[0][j] = j

        for (i in 1..s1.length) {
            for (j in 1..s2.length) {
                val cost = if (s1[i - 1] == s2[j - 1]) 0 else 1
                dp[i][j] = minOf(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + cost
                )
            }
        }

        return dp[s1.length][s2.length]
    }

    /**
     * Generate feedback for fill-in-the-blank answer.
     */
    private fun generateFillInFeedback(
        isCorrect: Boolean,
        similarity: Double,
        userAnswer: String,
        correctAnswer: String
    ): String {
        return when {
            isCorrect && similarity >= 0.98 -> "Perfect! Exactly right!"
            isCorrect -> "Correct! Great job!"
            similarity >= 0.7 -> "Almost! The correct answer is: $correctAnswer"
            similarity >= 0.5 -> "Close, but not quite. The answer is: $correctAnswer"
            else -> "Not quite right. The correct answer is: $correctAnswer"
        }
    }

    /**
     * Calculate points earned for an answer.
     */
    private fun calculatePoints(
        isCorrect: Boolean,
        similarity: Double,
        itemProgress: ItemProgress?
    ): Int {
        val basePoints = when {
            isCorrect && similarity >= 0.98 -> 15
            isCorrect -> 10
            similarity >= 0.7 -> 5
            else -> 2
        }

        // Bonus for streak
        val streakBonus = itemProgress?.streakCount?.let {
            if (it > 3) 5 else 0
        } ?: 0

        return basePoints + streakBonus
    }

    /**
     * Generate multiple choice options.
     */
    private fun generateOptions(
        correctItem: VocabularyItem,
        questionType: FillInQuestionType,
        deck: VocabularyDeck,
        optionCount: Int
    ): List<String> {
        val correctAnswer = when (questionType) {
            FillInQuestionType.MEANING_TO_JAPANESE -> correctItem.japaneseWord
            FillInQuestionType.JAPANESE_TO_MEANING -> correctItem.meaning
            FillInQuestionType.READING_TO_JAPANESE -> correctItem.japaneseWord
            FillInQuestionType.JAPANESE_TO_READING -> correctItem.reading
        }

        // Get other items as distractors
        val allItems = deck.getAllVocabularyItems()
        val distractors = allItems
            .filter { it.japaneseWord != correctItem.japaneseWord }
            .shuffled()
            .take(optionCount - 1)
            .map { item ->
                when (questionType) {
                    FillInQuestionType.MEANING_TO_JAPANESE -> item.japaneseWord
                    FillInQuestionType.JAPANESE_TO_MEANING -> item.meaning
                    FillInQuestionType.READING_TO_JAPANESE -> item.japaneseWord
                    FillInQuestionType.JAPANESE_TO_READING -> item.reading
                }
            }

        // Combine and shuffle options
        return (listOf(correctAnswer) + distractors).shuffled()
    }

    /**
     * Parse item key to section and item indices.
     */
    private fun parseItemKey(key: String): Pair<Int, Int> {
        val parts = key.split("-")
        return Pair(parts[0].toInt(), parts[1].toInt())
    }
}
