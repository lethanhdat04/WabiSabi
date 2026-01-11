package com.nihongomaster.dto.practice

import com.nihongomaster.domain.practice.DetailedShadowingFeedback
import com.nihongomaster.domain.practice.PhonemeScore
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.time.Instant

// ===========================================
// REQUEST DTOs
// ===========================================

/**
 * Request DTO for submitting a shadowing practice attempt.
 */
data class ShadowingAttemptRequest(
    @field:NotBlank(message = "Video ID is required")
    val videoId: String,

    @field:Min(0, message = "Segment index must be non-negative")
    val segmentIndex: Int,

    @field:NotBlank(message = "Audio URL is required")
    val audioUrl: String
)

// ===========================================
// RESPONSE DTOs
// ===========================================

/**
 * Response DTO for shadowing attempt with evaluation.
 */
data class ShadowingAttemptResponse(
    val id: String,
    val userId: String,
    val videoId: String,
    val segmentIndex: Int,
    val audioUrl: String,
    val evaluation: ShadowingEvaluationResponse,
    val createdAt: Instant?
)

/**
 * Shadowing evaluation response.
 */
data class ShadowingEvaluationResponse(
    val pronunciationScore: Double,
    val speedScore: Double,
    val intonationScore: Double,
    val overallScore: Double,
    val feedbackText: String,
    val grade: String,                    // A, B, C, D, F based on score
    val detailedFeedback: DetailedShadowingFeedbackResponse?
)

/**
 * Detailed feedback response.
 */
data class DetailedShadowingFeedbackResponse(
    val strengths: List<String>,
    val improvements: List<String>,
    val specificTips: List<String>,
    val transcribedText: String?,
    val phonemeAnalysis: List<PhonemeScoreResponse>
)

/**
 * Phoneme score response.
 */
data class PhonemeScoreResponse(
    val phoneme: String,
    val expected: String,
    val actual: String,
    val score: Double
)

/**
 * Summary of user's shadowing progress for a video.
 */
data class ShadowingProgressResponse(
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
 * User's overall shadowing statistics.
 */
data class ShadowingStatsResponse(
    val totalAttempts: Long,
    val totalVideosAttempted: Int,
    val averageScore: Double,
    val bestScore: Double,
    val recentAttempts: List<ShadowingAttemptSummaryResponse>
)

/**
 * Lightweight attempt summary.
 */
data class ShadowingAttemptSummaryResponse(
    val id: String,
    val videoId: String,
    val segmentIndex: Int,
    val overallScore: Double,
    val grade: String,
    val createdAt: Instant?
)
