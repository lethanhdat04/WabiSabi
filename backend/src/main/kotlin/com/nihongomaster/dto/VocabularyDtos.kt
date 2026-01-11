package com.nihongomaster.dto

import com.nihongomaster.domain.video.JLPTLevel
import com.nihongomaster.domain.vocabulary.*
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.Instant

// ================================
// Deck Request DTOs
// ================================

/**
 * Request to create a new vocabulary deck.
 */
data class CreateDeckRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(max = 200, message = "Title must not exceed 200 characters")
    val title: String,

    @field:Size(max = 2000, message = "Description must not exceed 2000 characters")
    val description: String? = null,

    val coverImageUrl: String? = null,

    val languageDirection: LanguageDirection = LanguageDirection.JP_EN,

    @field:NotNull(message = "Level is required")
    val level: JLPTLevel,

    @field:NotNull(message = "Topic is required")
    val topic: DeckTopic,

    val tags: List<String> = emptyList(),

    val isPublic: Boolean = false,

    @field:Valid
    val sections: List<CreateSectionRequest> = emptyList()
)

/**
 * Request to update an existing deck.
 */
data class UpdateDeckRequest(
    @field:Size(max = 200, message = "Title must not exceed 200 characters")
    val title: String? = null,

    @field:Size(max = 2000, message = "Description must not exceed 2000 characters")
    val description: String? = null,

    val coverImageUrl: String? = null,

    val languageDirection: LanguageDirection? = null,

    val level: JLPTLevel? = null,

    val topic: DeckTopic? = null,

    val tags: List<String>? = null,

    val isPublic: Boolean? = null
)

/**
 * Request to create a section within a deck.
 */
data class CreateSectionRequest(
    @field:NotBlank(message = "Section title is required")
    @field:Size(max = 100, message = "Section title must not exceed 100 characters")
    val title: String,

    val description: String? = null,

    @field:Valid
    val items: List<CreateVocabularyItemRequest> = emptyList()
)

/**
 * Request to add a section to an existing deck.
 */
data class AddSectionRequest(
    @field:NotBlank(message = "Section title is required")
    @field:Size(max = 100, message = "Section title must not exceed 100 characters")
    val title: String,

    val description: String? = null,

    @field:Valid
    val items: List<CreateVocabularyItemRequest> = emptyList()
)

/**
 * Request to update a section.
 */
data class UpdateSectionRequest(
    @field:Size(max = 100, message = "Section title must not exceed 100 characters")
    val title: String? = null,

    val description: String? = null
)

/**
 * Request to create a vocabulary item.
 */
data class CreateVocabularyItemRequest(
    @field:NotBlank(message = "Japanese word is required")
    @field:Size(max = 100, message = "Japanese word must not exceed 100 characters")
    val japaneseWord: String,

    @field:NotBlank(message = "Reading is required")
    @field:Size(max = 200, message = "Reading must not exceed 200 characters")
    val reading: String,

    @field:NotBlank(message = "Meaning is required")
    @field:Size(max = 500, message = "Meaning must not exceed 500 characters")
    val meaning: String,

    val partOfSpeech: PartOfSpeech? = null,

    @field:Size(max = 500, message = "Example sentence must not exceed 500 characters")
    val exampleSentence: String? = null,

    @field:Size(max = 500, message = "Example meaning must not exceed 500 characters")
    val exampleMeaning: String? = null,

    val imageUrl: String? = null,

    val audioUrl: String? = null,

    @field:Size(max = 1000, message = "Notes must not exceed 1000 characters")
    val notes: String? = null
)

/**
 * Request to update a vocabulary item.
 */
data class UpdateVocabularyItemRequest(
    @field:Size(max = 100, message = "Japanese word must not exceed 100 characters")
    val japaneseWord: String? = null,

    @field:Size(max = 200, message = "Reading must not exceed 200 characters")
    val reading: String? = null,

    @field:Size(max = 500, message = "Meaning must not exceed 500 characters")
    val meaning: String? = null,

    val partOfSpeech: PartOfSpeech? = null,

    val exampleSentence: String? = null,

    val exampleMeaning: String? = null,

    val imageUrl: String? = null,

    val audioUrl: String? = null,

    val notes: String? = null
)

// ================================
// Deck Response DTOs
// ================================

/**
 * Summary response for deck listings.
 */
data class DeckSummaryResponse(
    val id: String,
    val title: String,
    val description: String?,
    val coverImageUrl: String?,
    val languageDirection: LanguageDirection,
    val level: JLPTLevel,
    val topic: DeckTopic,
    val tags: List<String>,
    val isPublic: Boolean,
    val isOfficial: Boolean,
    val createdBy: String,
    val creatorName: String?,
    val totalVocabulary: Int,
    val sectionCount: Int,
    val stats: DeckStatsResponse,
    val createdAt: Instant?,
    val updatedAt: Instant?
)

/**
 * Full deck response with all sections and items.
 */
data class DeckResponse(
    val id: String,
    val title: String,
    val description: String?,
    val coverImageUrl: String?,
    val languageDirection: LanguageDirection,
    val level: JLPTLevel,
    val topic: DeckTopic,
    val tags: List<String>,
    val isPublic: Boolean,
    val isOfficial: Boolean,
    val createdBy: String,
    val creatorName: String?,
    val sections: List<SectionResponse>,
    val totalVocabulary: Int,
    val stats: DeckStatsResponse,
    val status: DeckStatus,
    val createdAt: Instant?,
    val updatedAt: Instant?
)

/**
 * Section response.
 */
data class SectionResponse(
    val index: Int,
    val title: String,
    val description: String?,
    val items: List<VocabularyItemResponse>,
    val itemCount: Int
)

/**
 * Vocabulary item response.
 */
data class VocabularyItemResponse(
    val index: Int,
    val japaneseWord: String,
    val reading: String,
    val meaning: String,
    val partOfSpeech: PartOfSpeech?,
    val exampleSentence: String?,
    val exampleMeaning: String?,
    val imageUrl: String?,
    val audioUrl: String?,
    val notes: String?,
    val hasImage: Boolean,
    val hasAudio: Boolean,
    val hasExample: Boolean
)

/**
 * Deck statistics response.
 */
data class DeckStatsResponse(
    val viewCount: Long,
    val studyCount: Long,
    val starCount: Int,
    val forkCount: Int,
    val averageScore: Double,
    val completionRate: Double
)

// ================================
// Practice Mode DTOs
// ================================

// --- Fill-in-the-Blank Mode ---

/**
 * Request to start a fill-in-the-blank practice session.
 */
data class StartFillInPracticeRequest(
    val deckId: String,
    val sectionIndex: Int? = null,  // null = all sections
    val itemCount: Int = 10,        // Number of questions
    val shuffleItems: Boolean = true
)

/**
 * Fill-in-the-blank question.
 */
data class FillInQuestionResponse(
    val questionId: String,          // Unique ID for this question instance
    val sectionIndex: Int,
    val itemIndex: Int,
    val questionType: FillInQuestionType,
    val prompt: String,              // The displayed prompt
    val blankPosition: Int,          // Position of blank in prompt
    val hint: String?,               // Optional hint (e.g., first letter)
    val options: List<String>?,      // For multiple choice variant
    val audioUrl: String?,
    val imageUrl: String?
)

/**
 * Types of fill-in-the-blank questions.
 */
enum class FillInQuestionType {
    MEANING_TO_JAPANESE,    // Show meaning, fill Japanese
    JAPANESE_TO_MEANING,    // Show Japanese, fill meaning
    READING_TO_JAPANESE,    // Show reading, fill Japanese (kanji)
    JAPANESE_TO_READING     // Show Japanese, fill reading
}

/**
 * Answer submission for fill-in-the-blank.
 */
data class FillInAnswerRequest(
    @field:NotBlank(message = "Deck ID is required")
    val deckId: String,

    val sectionIndex: Int,

    val itemIndex: Int,

    @field:NotBlank(message = "Answer is required")
    val userAnswer: String,

    val questionType: FillInQuestionType
)

/**
 * Result of a fill-in-the-blank answer.
 */
data class FillInAnswerResponse(
    val isCorrect: Boolean,
    val userAnswer: String,
    val correctAnswer: String,
    val similarity: Double,         // 0.0 to 1.0 similarity score
    val feedback: String,
    val itemProgress: ItemProgressResponse?,
    val pointsEarned: Int
)

// --- Flashcard Mode ---

/**
 * Request to start a flashcard practice session.
 */
data class StartFlashcardPracticeRequest(
    val deckId: String,
    val sectionIndex: Int? = null,  // null = all sections
    val itemCount: Int = 20,
    val shuffleItems: Boolean = true,
    val showFront: FlashcardFrontType = FlashcardFrontType.JAPANESE
)

/**
 * What to show on the front of the flashcard.
 */
enum class FlashcardFrontType {
    JAPANESE,   // Show Japanese, reveal meaning
    MEANING,    // Show meaning, reveal Japanese
    READING     // Show reading, reveal Japanese
}

/**
 * Flashcard for display.
 */
data class FlashcardResponse(
    val cardId: String,
    val sectionIndex: Int,
    val itemIndex: Int,
    val front: FlashcardSide,
    val back: FlashcardSide,
    val audioUrl: String?,
    val imageUrl: String?,
    val exampleSentence: String?,
    val exampleMeaning: String?,
    val notes: String?
)

/**
 * One side of a flashcard.
 */
data class FlashcardSide(
    val primaryText: String,
    val secondaryText: String?,     // Reading for Japanese, null for meaning
    val label: String               // "Japanese", "Meaning", "Reading"
)

/**
 * Submit flashcard result (self-assessment).
 */
data class FlashcardResultRequest(
    @field:NotBlank(message = "Deck ID is required")
    val deckId: String,

    val sectionIndex: Int,

    val itemIndex: Int,

    @field:NotNull(message = "Result is required")
    val result: FlashcardSelfAssessment
)

/**
 * Self-assessment options for flashcard.
 */
enum class FlashcardSelfAssessment {
    EASY,       // Knew it immediately
    GOOD,       // Knew it after thinking
    HARD,       // Struggled but got it
    FORGOT      // Didn't remember
}

/**
 * Response after submitting flashcard result.
 */
data class FlashcardResultResponse(
    val recorded: Boolean,
    val isCorrect: Boolean,         // Based on self-assessment
    val itemProgress: ItemProgressResponse?,
    val nextReviewAt: Instant?,
    val pointsEarned: Int
)

// ================================
// Progress DTOs
// ================================

/**
 * Progress for a single vocabulary item.
 */
data class ItemProgressResponse(
    val sectionIndex: Int,
    val itemIndex: Int,
    val correctAttempts: Int,
    val incorrectAttempts: Int,
    val totalAttempts: Int,
    val masteryLevel: MasteryLevel,
    val accuracyPercentage: Double,
    val streakCount: Int,
    val bestStreak: Int,
    val lastAttemptAt: Instant?,
    val nextReviewAt: Instant?,
    val isMastered: Boolean
)

/**
 * Progress summary for a section.
 */
data class SectionProgressResponse(
    val sectionIndex: Int,
    val sectionTitle: String,
    val totalItems: Int,
    val practicedItems: Int,
    val masteredItems: Int,
    val averageAccuracy: Double,
    val completionPercentage: Double,
    val lastStudiedAt: Instant?
)

/**
 * Overall deck progress for a user.
 */
data class DeckProgressResponse(
    val deckId: String,
    val deckTitle: String,
    val userId: String,
    val sectionProgress: List<SectionProgressResponse>,
    val overallStats: OverallStatsResponse,
    val studyStreak: Int,
    val lastStudiedAt: Instant?,
    val itemsNeedingReview: Int,
    val nextReviewItems: List<ReviewItemResponse>,
    val createdAt: Instant?,
    val updatedAt: Instant?
)

/**
 * Overall statistics for deck progress.
 */
data class OverallStatsResponse(
    val totalItemsPracticed: Int,
    val totalCorrectAttempts: Int,
    val totalIncorrectAttempts: Int,
    val totalAttempts: Int,
    val itemsMastered: Int,
    val itemsLearning: Int,
    val averageAccuracy: Double,
    val totalStudyTimeMinutes: Long,
    val sessionsCompleted: Int,
    val overallCompletionPercentage: Double
)

/**
 * Item needing review.
 */
data class ReviewItemResponse(
    val sectionIndex: Int,
    val itemIndex: Int,
    val japaneseWord: String,
    val reading: String,
    val meaning: String,
    val lastAttemptAt: Instant?,
    val nextReviewAt: Instant?,
    val masteryLevel: MasteryLevel
)

/**
 * User's vocabulary learning statistics across all decks.
 */
data class UserVocabularyStatsResponse(
    val userId: String,
    val totalDecksStudied: Long,
    val totalItemsPracticed: Int,
    val totalItemsMastered: Int,
    val overallAccuracy: Double,
    val currentStreak: Int,
    val longestStreak: Int,
    val totalStudyTimeMinutes: Long,
    val recentDecks: List<RecentDeckResponse>,
    val itemsToReviewToday: Int
)

/**
 * Recently studied deck summary.
 */
data class RecentDeckResponse(
    val deckId: String,
    val deckTitle: String,
    val lastStudiedAt: Instant?,
    val completionPercentage: Double,
    val itemsMastered: Int,
    val totalItems: Int
)

// ================================
// Practice Session DTOs
// ================================

/**
 * Active practice session.
 */
data class PracticeSessionResponse(
    val sessionId: String,
    val deckId: String,
    val deckTitle: String,
    val practiceMode: PracticeMode,
    val totalQuestions: Int,
    val currentQuestionIndex: Int,
    val correctAnswers: Int,
    val incorrectAnswers: Int,
    val startedAt: Instant,
    val questions: List<Any>  // FillInQuestionResponse or FlashcardResponse
)

/**
 * Practice modes available.
 */
enum class PracticeMode {
    FILL_IN_THE_BLANK,
    FLASHCARD,
    REVIEW  // Spaced repetition review
}

/**
 * Session completion summary.
 */
data class SessionSummaryResponse(
    val sessionId: String,
    val deckId: String,
    val deckTitle: String,
    val practiceMode: PracticeMode,
    val totalQuestions: Int,
    val correctAnswers: Int,
    val incorrectAnswers: Int,
    val accuracy: Double,
    val duration: Long,  // in seconds
    val pointsEarned: Int,
    val newItemsMastered: Int,
    val itemsToReview: List<ReviewItemResponse>,
    val completedAt: Instant
)
