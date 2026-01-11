package com.nihongomaster.service.practice

import com.nihongomaster.domain.practice.DictationAttempt
import com.nihongomaster.domain.video.Video
import com.nihongomaster.dto.common.PageResponse
import com.nihongomaster.dto.practice.*
import com.nihongomaster.exception.BadRequestException
import com.nihongomaster.exception.ResourceNotFoundException
import com.nihongomaster.repository.DictationAttemptRepository
import com.nihongomaster.repository.VideoRepository
import com.nihongomaster.service.video.PracticeType
import com.nihongomaster.service.video.VideoService
import mu.KotlinLogging
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

private val logger = KotlinLogging.logger {}

/**
 * Service interface for dictation practice operations.
 */
interface DictationService {
    fun submitAttempt(userId: String, request: DictationAttemptRequest): DictationAttemptResponse
    fun getAttemptById(attemptId: String): DictationAttemptResponse
    fun getUserAttempts(userId: String, pageable: Pageable): PageResponse<DictationAttemptSummaryResponse>
    fun getVideoAttempts(userId: String, videoId: String): List<DictationAttemptSummaryResponse>
    fun getSegmentAttempts(userId: String, videoId: String, segmentIndex: Int): List<DictationAttemptResponse>
    fun getBestAttempt(userId: String, videoId: String, segmentIndex: Int): DictationAttemptResponse?
    fun getVideoProgress(userId: String, videoId: String): DictationProgressResponse
    fun getUserStats(userId: String): DictationStatsResponse
}

@Service
class DictationServiceImpl(
    private val dictationAttemptRepository: DictationAttemptRepository,
    private val videoRepository: VideoRepository,
    private val videoService: VideoService,
    private val mockAIService: MockAIService,
    private val dictationMapper: DictationMapper
) : DictationService {

    /**
     * Submit a new dictation practice attempt.
     */
    @Transactional
    override fun submitAttempt(userId: String, request: DictationAttemptRequest): DictationAttemptResponse {
        logger.info { "User $userId submitting dictation attempt for video ${request.videoId}, segment ${request.segmentIndex}" }

        // Validate video and segment exist
        val video = findVideo(request.videoId)
        val segment = video.getSegment(request.segmentIndex)
            ?: throw BadRequestException("Segment ${request.segmentIndex} not found. Video has ${video.getSegmentCount()} segments.")

        // Validate user input is not empty
        if (request.userInputText.isBlank()) {
            throw BadRequestException("User input text cannot be empty")
        }

        // Generate evaluation by comparing user input with correct text
        val evaluation = mockAIService.evaluateDictation(
            userInput = request.userInputText,
            correctText = segment.japaneseText
        )

        // Create and save attempt
        val attempt = DictationAttempt(
            userId = userId,
            videoId = request.videoId,
            segmentIndex = request.segmentIndex,
            userInputText = request.userInputText.trim(),
            correctText = segment.japaneseText,
            evaluation = evaluation
        )

        val savedAttempt = dictationAttemptRepository.save(attempt)
        logger.info { "Dictation attempt saved: ${savedAttempt.id}, score: ${evaluation.overallScore}" }

        // Update video practice count
        videoService.incrementPracticeCount(request.videoId, PracticeType.DICTATION)

        return dictationMapper.toResponse(savedAttempt)
    }

    /**
     * Get attempt by ID.
     */
    override fun getAttemptById(attemptId: String): DictationAttemptResponse {
        val attempt = dictationAttemptRepository.findById(attemptId)
            .orElseThrow { ResourceNotFoundException("Dictation attempt not found: $attemptId") }
        return dictationMapper.toResponse(attempt)
    }

    /**
     * Get paginated list of user's dictation attempts.
     */
    override fun getUserAttempts(userId: String, pageable: Pageable): PageResponse<DictationAttemptSummaryResponse> {
        val page = dictationAttemptRepository.findByUserId(userId, pageable)
        return PageResponse.fromMapped(page) { dictationMapper.toSummaryResponse(it) }
    }

    /**
     * Get all attempts for a specific video.
     */
    override fun getVideoAttempts(userId: String, videoId: String): List<DictationAttemptSummaryResponse> {
        val attempts = dictationAttemptRepository.findByUserIdAndVideoId(userId, videoId)
        return attempts.map { dictationMapper.toSummaryResponse(it) }
    }

    /**
     * Get all attempts for a specific segment.
     */
    override fun getSegmentAttempts(
        userId: String,
        videoId: String,
        segmentIndex: Int
    ): List<DictationAttemptResponse> {
        val attempts = dictationAttemptRepository.findByUserIdAndVideoIdAndSegmentIndex(
            userId, videoId, segmentIndex
        )
        return attempts.map { dictationMapper.toResponse(it) }
    }

    /**
     * Get best (highest score) attempt for a segment.
     */
    override fun getBestAttempt(
        userId: String,
        videoId: String,
        segmentIndex: Int
    ): DictationAttemptResponse? {
        val attempt = dictationAttemptRepository
            .findTopByUserIdAndVideoIdAndSegmentIndexOrderByEvaluationOverallScoreDesc(
                userId, videoId, segmentIndex
            )
        return attempt?.let { dictationMapper.toResponse(it) }
    }

    /**
     * Get user's progress for a specific video.
     */
    override fun getVideoProgress(userId: String, videoId: String): DictationProgressResponse {
        val video = findVideo(videoId)
        val attempts = dictationAttemptRepository.findByUserIdAndVideoId(userId, videoId)

        if (attempts.isEmpty()) {
            return DictationProgressResponse(
                videoId = videoId,
                totalSegments = video.getSegmentCount(),
                attemptedSegments = 0,
                completedSegments = 0,
                averageScore = 0.0,
                bestScore = 0.0,
                totalAttempts = 0,
                progressPercentage = 0.0
            )
        }

        // Group attempts by segment
        val attemptsBySegment = attempts.groupBy { it.segmentIndex }

        // Count attempted and completed segments
        val attemptedSegments = attemptsBySegment.keys.size
        val completedSegments = attemptsBySegment.count { (_, segmentAttempts) ->
            segmentAttempts.any { it.evaluation.overallScore >= 70.0 }
        }

        // Calculate scores
        val allScores = attempts.map { it.evaluation.overallScore }
        val averageScore = allScores.average()
        val bestScore = allScores.maxOrNull() ?: 0.0

        val progressPercentage = (completedSegments.toDouble() / video.getSegmentCount()) * 100

        return DictationProgressResponse(
            videoId = videoId,
            totalSegments = video.getSegmentCount(),
            attemptedSegments = attemptedSegments,
            completedSegments = completedSegments,
            averageScore = roundScore(averageScore),
            bestScore = roundScore(bestScore),
            totalAttempts = attempts.size,
            progressPercentage = roundScore(progressPercentage)
        )
    }

    /**
     * Get user's overall dictation statistics.
     */
    override fun getUserStats(userId: String): DictationStatsResponse {
        val totalAttempts = dictationAttemptRepository.countByUserId(userId)
        val recentAttempts = dictationAttemptRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId)
        val avgScore = dictationAttemptRepository.calculateAverageScoreByUserId(userId) ?: 0.0

        // Count unique videos attempted
        val allAttempts = dictationAttemptRepository.findByUserId(userId, Pageable.unpaged())
        val videosAttempted = allAttempts.content.map { it.videoId }.distinct().size
        val bestScore = allAttempts.content.maxOfOrNull { it.evaluation.overallScore } ?: 0.0

        return DictationStatsResponse(
            totalAttempts = totalAttempts,
            totalVideosAttempted = videosAttempted,
            averageScore = roundScore(avgScore),
            bestScore = roundScore(bestScore),
            recentAttempts = recentAttempts.map { dictationMapper.toSummaryResponse(it) }
        )
    }

    // ===========================================
    // PRIVATE METHODS
    // ===========================================

    private fun findVideo(videoId: String): Video {
        return videoRepository.findById(videoId)
            .orElseThrow { ResourceNotFoundException("Video not found: $videoId") }
    }

    private fun roundScore(score: Double): Double {
        return (score * 10).toInt() / 10.0
    }
}
