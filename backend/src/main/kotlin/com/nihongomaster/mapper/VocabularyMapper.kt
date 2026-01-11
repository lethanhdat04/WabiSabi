package com.nihongomaster.mapper

import com.nihongomaster.domain.vocabulary.*
import com.nihongomaster.dto.*
import org.springframework.stereotype.Component

/**
 * Mapper for vocabulary-related entities and DTOs.
 */
@Component
class VocabularyMapper {

    // ================================
    // Deck Mappings
    // ================================

    fun toSummaryResponse(deck: VocabularyDeck, creatorName: String? = null): DeckSummaryResponse {
        return DeckSummaryResponse(
            id = deck.id!!,
            title = deck.title,
            description = deck.description,
            coverImageUrl = deck.coverImageUrl,
            languageDirection = deck.languageDirection,
            level = deck.level,
            topic = deck.topic,
            tags = deck.tags,
            isPublic = deck.isPublic,
            isOfficial = deck.isOfficial,
            createdBy = deck.createdBy,
            creatorName = creatorName,
            totalVocabulary = deck.getTotalVocabularyCount(),
            sectionCount = deck.getSectionCount(),
            stats = toStatsResponse(deck.stats),
            createdAt = deck.createdAt,
            updatedAt = deck.updatedAt
        )
    }

    fun toResponse(deck: VocabularyDeck, creatorName: String? = null): DeckResponse {
        return DeckResponse(
            id = deck.id!!,
            title = deck.title,
            description = deck.description,
            coverImageUrl = deck.coverImageUrl,
            languageDirection = deck.languageDirection,
            level = deck.level,
            topic = deck.topic,
            tags = deck.tags,
            isPublic = deck.isPublic,
            isOfficial = deck.isOfficial,
            createdBy = deck.createdBy,
            creatorName = creatorName,
            sections = deck.sections.map { toSectionResponse(it) },
            totalVocabulary = deck.getTotalVocabularyCount(),
            stats = toStatsResponse(deck.stats),
            status = deck.status,
            createdAt = deck.createdAt,
            updatedAt = deck.updatedAt
        )
    }

    fun toSectionResponse(section: VocabularySection): SectionResponse {
        return SectionResponse(
            index = section.index,
            title = section.title,
            description = section.description,
            items = section.items.map { toItemResponse(it) },
            itemCount = section.getItemCount()
        )
    }

    fun toItemResponse(item: VocabularyItem): VocabularyItemResponse {
        return VocabularyItemResponse(
            index = item.index,
            japaneseWord = item.japaneseWord,
            reading = item.reading,
            meaning = item.meaning,
            partOfSpeech = item.partOfSpeech,
            exampleSentence = item.exampleSentence,
            exampleMeaning = item.exampleMeaning,
            imageUrl = item.imageUrl,
            audioUrl = item.audioUrl,
            notes = item.notes,
            hasImage = item.hasImage(),
            hasAudio = item.hasAudio(),
            hasExample = item.hasExample()
        )
    }

    fun toStatsResponse(stats: DeckStats): DeckStatsResponse {
        return DeckStatsResponse(
            viewCount = stats.viewCount,
            studyCount = stats.studyCount,
            starCount = stats.starCount,
            forkCount = stats.forkCount,
            averageScore = stats.averageScore,
            completionRate = stats.completionRate
        )
    }

    // ================================
    // Create Entity from Request
    // ================================

    fun toEntity(request: CreateDeckRequest, userId: String): VocabularyDeck {
        return VocabularyDeck(
            title = request.title,
            description = request.description,
            coverImageUrl = request.coverImageUrl,
            languageDirection = request.languageDirection,
            level = request.level,
            topic = request.topic,
            tags = request.tags,
            isPublic = request.isPublic,
            createdBy = userId,
            sections = request.sections.mapIndexed { index, sectionRequest ->
                toSectionEntity(sectionRequest, index)
            }
        )
    }

    fun toSectionEntity(request: CreateSectionRequest, sectionIndex: Int): VocabularySection {
        return VocabularySection(
            index = sectionIndex,
            title = request.title,
            description = request.description,
            items = request.items.mapIndexed { itemIndex, itemRequest ->
                toItemEntity(itemRequest, itemIndex)
            }
        )
    }

    fun toSectionEntity(request: AddSectionRequest, sectionIndex: Int): VocabularySection {
        return VocabularySection(
            index = sectionIndex,
            title = request.title,
            description = request.description,
            items = request.items.mapIndexed { itemIndex, itemRequest ->
                toItemEntity(itemRequest, itemIndex)
            }
        )
    }

    fun toItemEntity(request: CreateVocabularyItemRequest, itemIndex: Int): VocabularyItem {
        return VocabularyItem(
            index = itemIndex,
            japaneseWord = request.japaneseWord,
            reading = request.reading,
            meaning = request.meaning,
            partOfSpeech = request.partOfSpeech,
            exampleSentence = request.exampleSentence,
            exampleMeaning = request.exampleMeaning,
            imageUrl = request.imageUrl,
            audioUrl = request.audioUrl,
            notes = request.notes
        )
    }

    // ================================
    // Progress Mappings
    // ================================

    fun toItemProgressResponse(progress: ItemProgress): ItemProgressResponse {
        return ItemProgressResponse(
            sectionIndex = progress.sectionIndex,
            itemIndex = progress.itemIndex,
            correctAttempts = progress.correctAttempts,
            incorrectAttempts = progress.incorrectAttempts,
            totalAttempts = progress.totalAttempts,
            masteryLevel = progress.masteryLevel,
            accuracyPercentage = progress.getAccuracyPercentage(),
            streakCount = progress.streakCount,
            bestStreak = progress.bestStreak,
            lastAttemptAt = progress.lastAttemptAt,
            nextReviewAt = progress.nextReviewAt,
            isMastered = progress.isMastered()
        )
    }

    fun toSectionProgressResponse(
        summary: SectionProgressSummary,
        sectionTitle: String
    ): SectionProgressResponse {
        return SectionProgressResponse(
            sectionIndex = summary.sectionIndex,
            sectionTitle = sectionTitle,
            totalItems = summary.totalItems,
            practicedItems = summary.practicedItems,
            masteredItems = summary.masteredItems,
            averageAccuracy = summary.averageAccuracy,
            completionPercentage = summary.getCompletionPercentage(),
            lastStudiedAt = summary.lastStudiedAt
        )
    }

    fun toOverallStatsResponse(
        stats: ProgressStats,
        totalItems: Int
    ): OverallStatsResponse {
        val completionPercentage = if (totalItems > 0) {
            (stats.itemsMastered.toDouble() / totalItems) * 100
        } else 0.0

        return OverallStatsResponse(
            totalItemsPracticed = stats.totalItemsPracticed,
            totalCorrectAttempts = stats.totalCorrectAttempts,
            totalIncorrectAttempts = stats.totalIncorrectAttempts,
            totalAttempts = stats.totalAttempts,
            itemsMastered = stats.itemsMastered,
            itemsLearning = stats.itemsLearning,
            averageAccuracy = stats.getOverallAccuracy(),
            totalStudyTimeMinutes = stats.totalStudyTimeMinutes,
            sessionsCompleted = stats.sessionsCompleted,
            overallCompletionPercentage = completionPercentage
        )
    }

    fun toDeckProgressResponse(
        progress: VocabularyProgress,
        deck: VocabularyDeck,
        nextReviewItems: List<ReviewItemResponse>
    ): DeckProgressResponse {
        val sectionProgressList = deck.sections.map { section ->
            val summary = progress.sectionProgress[section.index]
                ?: SectionProgressSummary(
                    sectionIndex = section.index,
                    totalItems = section.items.size
                )
            toSectionProgressResponse(summary, section.title)
        }

        return DeckProgressResponse(
            deckId = deck.id!!,
            deckTitle = deck.title,
            userId = progress.userId,
            sectionProgress = sectionProgressList,
            overallStats = toOverallStatsResponse(progress.overallStats, deck.getTotalVocabularyCount()),
            studyStreak = progress.studyStreak,
            lastStudiedAt = progress.lastStudiedAt,
            itemsNeedingReview = progress.getItemsNeedingReview().size,
            nextReviewItems = nextReviewItems,
            createdAt = progress.createdAt,
            updatedAt = progress.updatedAt
        )
    }

    fun toReviewItemResponse(
        item: VocabularyItem,
        sectionIndex: Int,
        itemProgress: ItemProgress?
    ): ReviewItemResponse {
        return ReviewItemResponse(
            sectionIndex = sectionIndex,
            itemIndex = item.index,
            japaneseWord = item.japaneseWord,
            reading = item.reading,
            meaning = item.meaning,
            lastAttemptAt = itemProgress?.lastAttemptAt,
            nextReviewAt = itemProgress?.nextReviewAt,
            masteryLevel = itemProgress?.masteryLevel ?: MasteryLevel.NEW
        )
    }

    fun toRecentDeckResponse(
        progress: VocabularyProgress,
        deck: VocabularyDeck
    ): RecentDeckResponse {
        return RecentDeckResponse(
            deckId = deck.id!!,
            deckTitle = deck.title,
            lastStudiedAt = progress.lastStudiedAt,
            completionPercentage = progress.getCompletionPercentage(deck.getTotalVocabularyCount()),
            itemsMastered = progress.overallStats.itemsMastered,
            totalItems = deck.getTotalVocabularyCount()
        )
    }

    // ================================
    // Flashcard Mappings
    // ================================

    fun toFlashcardResponse(
        item: VocabularyItem,
        sectionIndex: Int,
        frontType: FlashcardFrontType
    ): FlashcardResponse {
        val (front, back) = when (frontType) {
            FlashcardFrontType.JAPANESE -> Pair(
                FlashcardSide(
                    primaryText = item.japaneseWord,
                    secondaryText = item.reading,
                    label = "Japanese"
                ),
                FlashcardSide(
                    primaryText = item.meaning,
                    secondaryText = null,
                    label = "Meaning"
                )
            )
            FlashcardFrontType.MEANING -> Pair(
                FlashcardSide(
                    primaryText = item.meaning,
                    secondaryText = null,
                    label = "Meaning"
                ),
                FlashcardSide(
                    primaryText = item.japaneseWord,
                    secondaryText = item.reading,
                    label = "Japanese"
                )
            )
            FlashcardFrontType.READING -> Pair(
                FlashcardSide(
                    primaryText = item.reading,
                    secondaryText = null,
                    label = "Reading"
                ),
                FlashcardSide(
                    primaryText = item.japaneseWord,
                    secondaryText = item.meaning,
                    label = "Japanese"
                )
            )
        }

        return FlashcardResponse(
            cardId = "$sectionIndex-${item.index}",
            sectionIndex = sectionIndex,
            itemIndex = item.index,
            front = front,
            back = back,
            audioUrl = item.audioUrl,
            imageUrl = item.imageUrl,
            exampleSentence = item.exampleSentence,
            exampleMeaning = item.exampleMeaning,
            notes = item.notes
        )
    }

    // ================================
    // Fill-in-the-Blank Mappings
    // ================================

    fun toFillInQuestionResponse(
        item: VocabularyItem,
        sectionIndex: Int,
        questionType: FillInQuestionType,
        options: List<String>? = null
    ): FillInQuestionResponse {
        val (prompt, blankPosition, hint) = when (questionType) {
            FillInQuestionType.MEANING_TO_JAPANESE -> Triple(
                "What is the Japanese word for: ${item.meaning}",
                0,
                item.japaneseWord.firstOrNull()?.toString()
            )
            FillInQuestionType.JAPANESE_TO_MEANING -> Triple(
                "What is the meaning of: ${item.japaneseWord} (${item.reading})",
                0,
                item.meaning.firstOrNull()?.toString()
            )
            FillInQuestionType.READING_TO_JAPANESE -> Triple(
                "Write the kanji for: ${item.reading}",
                0,
                item.japaneseWord.firstOrNull()?.toString()
            )
            FillInQuestionType.JAPANESE_TO_READING -> Triple(
                "What is the reading of: ${item.japaneseWord}",
                0,
                item.reading.firstOrNull()?.toString()
            )
        }

        return FillInQuestionResponse(
            questionId = "$sectionIndex-${item.index}-${questionType.name}",
            sectionIndex = sectionIndex,
            itemIndex = item.index,
            questionType = questionType,
            prompt = prompt,
            blankPosition = blankPosition,
            hint = hint,
            options = options,
            audioUrl = item.audioUrl,
            imageUrl = item.imageUrl
        )
    }
}
