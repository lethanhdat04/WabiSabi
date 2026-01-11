package com.nihongomaster.dto.practice

import com.nihongomaster.domain.practice.MistakeType
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.time.Instant

// ===========================================
// REQUEST DTOs
// ===========================================

/**
 * Request DTO for submitting a dictation practice attempt.
 */
data class DictationAttemptRequest(
    @field:NotBlank(message = "Video ID is required")
    val videoId: String,

    @field:Min(0, message = "Segment index must be non-negative")
    val segmentIndex: Int,

    @field:NotBlank(message = "User input text is required")
    val userInputText: String
)

// ===========================================
// RESPONSE DTOs
// ===========================================

/**
 * Response DTO for dictation attempt with evaluation.
 */
data class DictationAttemptResponse(
    val id: String,
    val userId: String,
    val videoId: String,
    val segmentIndex: Int,
    val userInputText: String,
    val correctText: String,
    val evaluation: DictationEvaluationResponse,
    val createdAt: Instant?
)

/**
 * Dictation evaluation response.
 */
data class DictationEvaluationResponse(
    val accuracyScore: Double,
    val characterAccuracy: Double,
    val wordAccuracy: Double,
    val overallScore: Double,
    val feedbackText: String,
    val grade: String,                    // A, B, C, D, F based on score
    val mistakes: List<DictationMistakeResponse>,
    val detailedFeedback: DetailedDictationFeedbackResponse?
)

/**
 * Mistake highlight response.
 */
data class DictationMistakeResponse(
    val position: Int,
    val expected: String,
    val actual: String,
    val type: String                      // MISSING, EXTRA, SUBSTITUTION, TRANSPOSITION
)

/**
 * Detailed feedback response.
 */
data class DetailedDictationFeedbackResponse(
    val strengths: List<String>,
    val improvements: List<String>,
    val specificTips: List<String>,
    val correctSegments: List<String>,
    val incorrectSegments: List<String>,
    val similarityPercentage: Double
)

/**
 * Summary of user's dictation progress for a video.
 */
data class DictationProgressResponse(
    val videoId: String,
    val totalSegments: Int,
    val attemptedSegments: Int,
    val completedSegments: Int,           // Segments with score >= 70
    val averageScore: Double,
    val bestScore: Double,
    val totalAttempts: Int,
    val progressPercentage: Double
)

/**
 * User's overall dictation statistics.
 */
data class DictationStatsResponse(
    val totalAttempts: Long,
    val totalVideosAttempted: Int,
    val averageScore: Double,
    val bestScore: Double,
    val recentAttempts: List<DictationAttemptSummaryResponse>
)

/**
 * Lightweight attempt summary.
 */
data class DictationAttemptSummaryResponse(
    val id: String,
    val videoId: String,
    val segmentIndex: Int,
    val overallScore: Double,
    val grade: String,
    val createdAt: Instant?
)

/**
 * Comparison showing user input vs correct text.
 */
data class DictationComparisonResponse(
    val userInput: String,
    val correctText: String,
    val highlightedDiff: String,          // HTML-style diff highlighting
    val matchPercentage: Double
)
