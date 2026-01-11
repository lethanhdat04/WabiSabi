package com.nihongomaster.service.practice

import com.nihongomaster.domain.practice.DetailedDictationFeedback
import com.nihongomaster.domain.practice.DictationAttempt
import com.nihongomaster.domain.practice.DictationEvaluation
import com.nihongomaster.domain.practice.DictationMistake
import com.nihongomaster.dto.practice.*
import org.springframework.stereotype.Component

/**
 * Mapper for converting DictationAttempt entities to DTOs.
 */
@Component
class DictationMapper(
    private val mockAIService: MockAIService
) {

    /**
     * Convert DictationAttempt to full response DTO.
     */
    fun toResponse(attempt: DictationAttempt): DictationAttemptResponse {
        return DictationAttemptResponse(
            id = attempt.id!!,
            userId = attempt.userId,
            videoId = attempt.videoId,
            segmentIndex = attempt.segmentIndex,
            userInputText = attempt.userInputText,
            correctText = attempt.correctText,
            evaluation = toEvaluationResponse(attempt.evaluation),
            createdAt = attempt.createdAt
        )
    }

    /**
     * Convert DictationAttempt to summary DTO.
     */
    fun toSummaryResponse(attempt: DictationAttempt): DictationAttemptSummaryResponse {
        return DictationAttemptSummaryResponse(
            id = attempt.id!!,
            videoId = attempt.videoId,
            segmentIndex = attempt.segmentIndex,
            overallScore = attempt.evaluation.overallScore,
            grade = mockAIService.getGrade(attempt.evaluation.overallScore),
            createdAt = attempt.createdAt
        )
    }

    /**
     * Convert DictationEvaluation to response DTO.
     */
    fun toEvaluationResponse(evaluation: DictationEvaluation): DictationEvaluationResponse {
        return DictationEvaluationResponse(
            accuracyScore = evaluation.accuracyScore,
            characterAccuracy = evaluation.characterAccuracy,
            wordAccuracy = evaluation.wordAccuracy,
            overallScore = evaluation.overallScore,
            feedbackText = evaluation.feedbackText,
            grade = mockAIService.getGrade(evaluation.overallScore),
            mistakes = evaluation.mistakes.map { toMistakeResponse(it) },
            detailedFeedback = evaluation.detailedFeedback?.let { toDetailedFeedbackResponse(it) }
        )
    }

    /**
     * Convert DictationMistake to response DTO.
     */
    private fun toMistakeResponse(mistake: DictationMistake): DictationMistakeResponse {
        return DictationMistakeResponse(
            position = mistake.position,
            expected = mistake.expected,
            actual = mistake.actual,
            type = mistake.type.name
        )
    }

    /**
     * Convert DetailedDictationFeedback to response DTO.
     */
    private fun toDetailedFeedbackResponse(
        feedback: DetailedDictationFeedback
    ): DetailedDictationFeedbackResponse {
        return DetailedDictationFeedbackResponse(
            strengths = feedback.strengths,
            improvements = feedback.improvements,
            specificTips = feedback.specificTips,
            correctSegments = feedback.correctSegments,
            incorrectSegments = feedback.incorrectSegments,
            similarityPercentage = feedback.similarityPercentage
        )
    }
}
