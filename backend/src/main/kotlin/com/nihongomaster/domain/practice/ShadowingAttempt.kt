package com.nihongomaster.domain.practice

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * ShadowingAttempt entity representing a single shadowing practice attempt.
 * User listens to a segment and records their voice to practice pronunciation.
 */
@Document(collection = "shadowing_attempts")
@CompoundIndex(name = "user_video_idx", def = "{'userId': 1, 'videoId': 1}")
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
data class ShadowingAttempt(
    @Id
    val id: String? = null,

    @Indexed
    val userId: String,

    @Indexed
    val videoId: String,

    val segmentIndex: Int,

    val audioUrl: String,  // URL to the recorded audio file

    val evaluation: ShadowingEvaluation,

    @CreatedDate
    val createdAt: Instant? = null
)

/**
 * AI evaluation results for shadowing practice.
 * In production, this would come from a speech recognition/analysis API.
 * Currently mocked for development.
 */
data class ShadowingEvaluation(
    val pronunciationScore: Double,   // 0-100: How accurately sounds were pronounced
    val speedScore: Double,           // 0-100: How well the pace matched the original
    val intonationScore: Double,      // 0-100: How well pitch patterns matched
    val overallScore: Double,         // 0-100: Weighted average of all scores
    val feedbackText: String,         // Human-readable feedback message
    val detailedFeedback: DetailedShadowingFeedback? = null
)

/**
 * Detailed feedback breakdown for advanced analysis.
 */
data class DetailedShadowingFeedback(
    val strengths: List<String> = emptyList(),        // What the user did well
    val improvements: List<String> = emptyList(),     // Areas to improve
    val specificTips: List<String> = emptyList(),     // Actionable tips
    val transcribedText: String? = null,              // What AI heard (mock)
    val phonemeAnalysis: List<PhonemeScore> = emptyList()
)

/**
 * Individual phoneme/sound analysis.
 */
data class PhonemeScore(
    val phoneme: String,      // The sound being analyzed
    val expected: String,     // What was expected
    val actual: String,       // What was detected
    val score: Double         // 0-100 accuracy
)
