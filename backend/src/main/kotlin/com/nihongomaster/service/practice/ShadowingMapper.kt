package com.nihongomaster.service.practice

import com.nihongomaster.domain.practice.DetailedShadowingFeedback
import com.nihongomaster.domain.practice.PhonemeScore
import com.nihongomaster.domain.practice.ShadowingAttempt
import com.nihongomaster.domain.practice.ShadowingEvaluation
import com.nihongomaster.dto.practice.*
import org.springframework.stereotype.Component

/**
 * Mapper for converting ShadowingAttempt entities to DTOs.
 */
@Component
class ShadowingMapper(
    private val mockAIService: MockAIService
) {

    /**
     * Convert ShadowingAttempt to full response DTO.
     */
    fun toResponse(attempt: ShadowingAttempt): ShadowingAttemptResponse {
        return ShadowingAttemptResponse(
            id = attempt.id!!,
            userId = attempt.userId,
            videoId = attempt.videoId,
            segmentIndex = attempt.segmentIndex,
            audioUrl = attempt.audioUrl,
            evaluation = toEvaluationResponse(attempt.evaluation),
            createdAt = attempt.createdAt
        )
    }

    /**
     * Convert ShadowingAttempt to summary DTO.
     */
    fun toSummaryResponse(attempt: ShadowingAttempt): ShadowingAttemptSummaryResponse {
        return ShadowingAttemptSummaryResponse(
            id = attempt.id!!,
            videoId = attempt.videoId,
            segmentIndex = attempt.segmentIndex,
            overallScore = attempt.evaluation.overallScore,
            grade = mockAIService.getGrade(attempt.evaluation.overallScore),
            createdAt = attempt.createdAt
        )
    }

    /**
     * Convert ShadowingEvaluation to response DTO.
     */
    fun toEvaluationResponse(evaluation: ShadowingEvaluation): ShadowingEvaluationResponse {
        return ShadowingEvaluationResponse(
            pronunciationScore = evaluation.pronunciationScore,
            speedScore = evaluation.speedScore,
            intonationScore = evaluation.intonationScore,
            overallScore = evaluation.overallScore,
            feedbackText = evaluation.feedbackText,
            grade = mockAIService.getGrade(evaluation.overallScore),
            detailedFeedback = evaluation.detailedFeedback?.let { toDetailedFeedbackResponse(it) }
        )
    }

    /**
     * Convert DetailedShadowingFeedback to response DTO.
     */
    private fun toDetailedFeedbackResponse(
        feedback: DetailedShadowingFeedback
    ): DetailedShadowingFeedbackResponse {
        return DetailedShadowingFeedbackResponse(
            strengths = feedback.strengths,
            improvements = feedback.improvements,
            specificTips = feedback.specificTips,
            transcribedText = feedback.transcribedText,
            phonemeAnalysis = feedback.phonemeAnalysis.map { toPhonemeScoreResponse(it) }
        )
    }

    /**
     * Convert PhonemeScore to response DTO.
     */
    private fun toPhonemeScoreResponse(phoneme: PhonemeScore): PhonemeScoreResponse {
        return PhonemeScoreResponse(
            phoneme = phoneme.phoneme,
            expected = phoneme.expected,
            actual = phoneme.actual,
            score = phoneme.score
        )
    }
}
