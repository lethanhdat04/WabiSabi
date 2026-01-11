package com.nihongomaster.domain.practice

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * DictationAttempt entity representing a single dictation practice attempt.
 * User listens to a segment and types what they hear to practice listening comprehension.
 */
@Document(collection = "dictation_attempts")
@CompoundIndex(name = "user_video_idx", def = "{'userId': 1, 'videoId': 1}")
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
data class DictationAttempt(
    @Id
    val id: String? = null,

    @Indexed
    val userId: String,

    @Indexed
    val videoId: String,

    val segmentIndex: Int,

    val userInputText: String,  // What the user typed

    val correctText: String,    // The original Japanese text (for reference)

    val evaluation: DictationEvaluation,

    @CreatedDate
    val createdAt: Instant? = null
)

/**
 * AI evaluation results for dictation practice.
 * Compares user input with correct text and provides feedback.
 */
data class DictationEvaluation(
    val accuracyScore: Double,        // 0-100: Overall accuracy percentage
    val characterAccuracy: Double,    // 0-100: Character-level accuracy
    val wordAccuracy: Double,         // 0-100: Word-level accuracy
    val overallScore: Double,         // 0-100: Weighted overall score
    val feedbackText: String,         // Human-readable feedback message
    val mistakes: List<DictationMistake> = emptyList(),
    val detailedFeedback: DetailedDictationFeedback? = null
)

/**
 * Represents a single mistake in dictation.
 */
data class DictationMistake(
    val position: Int,           // Character position where mistake occurred
    val expected: String,        // What should have been typed
    val actual: String,          // What was actually typed
    val type: MistakeType        // Type of mistake
)

/**
 * Types of dictation mistakes.
 */
enum class MistakeType {
    MISSING,        // Character was not typed
    EXTRA,          // Extra character was typed
    SUBSTITUTION,   // Wrong character was typed
    TRANSPOSITION   // Characters were swapped
}

/**
 * Detailed feedback for dictation practice.
 */
data class DetailedDictationFeedback(
    val strengths: List<String> = emptyList(),
    val improvements: List<String> = emptyList(),
    val specificTips: List<String> = emptyList(),
    val correctSegments: List<String> = emptyList(),   // Parts typed correctly
    val incorrectSegments: List<String> = emptyList(), // Parts typed incorrectly
    val similarityPercentage: Double = 0.0             // String similarity metric
)
