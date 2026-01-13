package com.nihongomaster.service.practice

import com.nihongomaster.domain.practice.ShadowingAttempt
import com.nihongomaster.domain.video.Video
import com.nihongomaster.dto.common.PageResponse
import com.nihongomaster.dto.practice.*
import com.nihongomaster.exception.BadRequestException
import com.nihongomaster.exception.ResourceNotFoundException
import com.nihongomaster.repository.ShadowingAttemptRepository
import com.nihongomaster.repository.VideoRepository
import com.nihongomaster.service.user.PracticeActivityType
import com.nihongomaster.service.user.ProgressUpdateRequest
import com.nihongomaster.service.user.UserService
import com.nihongomaster.service.video.PracticeType
import com.nihongomaster.service.video.VideoService
import mu.KotlinLogging
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

private val logger = KotlinLogging.logger {}

/**
 * Service interface for shadowing practice operations.
 */
interface ShadowingService {
    fun submitAttempt(userId: String, request: ShadowingAttemptRequest): ShadowingAttemptResponse
    fun getAttemptById(attemptId: String): ShadowingAttemptResponse
    fun getUserAttempts(userId: String, pageable: Pageable): PageResponse<ShadowingAttemptSummaryResponse>
    fun getVideoAttempts(userId: String, videoId: String): List<ShadowingAttemptSummaryResponse>
    fun getSegmentAttempts(userId: String, videoId: String, segmentIndex: Int): List<ShadowingAttemptResponse>
    fun getBestAttempt(userId: String, videoId: String, segmentIndex: Int): ShadowingAttemptResponse?
    fun getVideoProgress(userId: String, videoId: String): ShadowingProgressResponse
    fun getUserStats(userId: String): ShadowingStatsResponse
}

@Service
class ShadowingServiceImpl(
    private val shadowingAttemptRepository: ShadowingAttemptRepository,
    private val videoRepository: VideoRepository,
    private val videoService: VideoService,
    private val mockAIService: MockAIService,
    private val shadowingMapper: ShadowingMapper,
    private val userService: UserService
) : ShadowingService {

    /**
     * Submit a new shadowing practice attempt.
     */
    @Transactional
    override fun submitAttempt(userId: String, request: ShadowingAttemptRequest): ShadowingAttemptResponse {
        logger.info { "User $userId submitting shadowing attempt for video ${request.videoId}, segment ${request.segmentIndex}" }

        // Validate video and segment exist
        val video = findVideo(request.videoId)
        val segment = video.getSegment(request.segmentIndex)
            ?: throw BadRequestException("Segment ${request.segmentIndex} not found. Video has ${video.getSegmentCount()} segments.")

        // Generate mock AI evaluation
        val evaluation = mockAIService.evaluateShadowing(
            audioUrl = request.audioUrl,
            referenceText = segment.japaneseText
        )

        // Create and save attempt
        val attempt = ShadowingAttempt(
            userId = userId,
            videoId = request.videoId,
            segmentIndex = request.segmentIndex,
            audioUrl = request.audioUrl,
            evaluation = evaluation
        )

        val savedAttempt = shadowingAttemptRepository.save(attempt)
        logger.info { "Shadowing attempt saved: ${savedAttempt.id}, score: ${evaluation.overallScore}" }

        // Update video practice count
        videoService.incrementPracticeCount(request.videoId, PracticeType.SHADOWING)

        // Update user progress
        val xpEarned = calculateXP(evaluation.overallScore)
        userService.updateProgress(
            userId = userId,
            request = ProgressUpdateRequest(
                activityType = PracticeActivityType.SHADOWING,
                xpEarned = xpEarned,
                scoreEarned = evaluation.overallScore,
                practiceMinutes = 1  // Estimate 1 minute per segment
            )
        )

        return shadowingMapper.toResponse(savedAttempt)
    }

    /**
     * Get attempt by ID.
     */
    override fun getAttemptById(attemptId: String): ShadowingAttemptResponse {
        val attempt = shadowingAttemptRepository.findById(attemptId)
            .orElseThrow { ResourceNotFoundException("Shadowing attempt not found: $attemptId") }
        return shadowingMapper.toResponse(attempt)
    }

    /**
     * Get paginated list of user's shadowing attempts.
     */
    override fun getUserAttempts(userId: String, pageable: Pageable): PageResponse<ShadowingAttemptSummaryResponse> {
        val page = shadowingAttemptRepository.findByUserId(userId, pageable)
        return PageResponse.fromMapped(page) { shadowingMapper.toSummaryResponse(it) }
    }

    /**
     * Get all attempts for a specific video.
     */
    override fun getVideoAttempts(userId: String, videoId: String): List<ShadowingAttemptSummaryResponse> {
        val attempts = shadowingAttemptRepository.findByUserIdAndVideoId(userId, videoId)
        return attempts.map { shadowingMapper.toSummaryResponse(it) }
    }

    /**
     * Get all attempts for a specific segment.
     */
    override fun getSegmentAttempts(
        userId: String,
        videoId: String,
        segmentIndex: Int
    ): List<ShadowingAttemptResponse> {
        val attempts = shadowingAttemptRepository.findByUserIdAndVideoIdAndSegmentIndex(
            userId, videoId, segmentIndex
        )
        return attempts.map { shadowingMapper.toResponse(it) }
    }

    /**
     * Get best (highest score) attempt for a segment.
     */
    override fun getBestAttempt(
        userId: String,
        videoId: String,
        segmentIndex: Int
    ): ShadowingAttemptResponse? {
        val attempt = shadowingAttemptRepository
            .findTopByUserIdAndVideoIdAndSegmentIndexOrderByEvaluationOverallScoreDesc(
                userId, videoId, segmentIndex
            )
        return attempt?.let { shadowingMapper.toResponse(it) }
    }

    /**
     * Get user's progress for a specific video.
     */
    override fun getVideoProgress(userId: String, videoId: String): ShadowingProgressResponse {
        val video = findVideo(videoId)
        val attempts = shadowingAttemptRepository.findByUserIdAndVideoId(userId, videoId)

        if (attempts.isEmpty()) {
            return ShadowingProgressResponse(
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

        return ShadowingProgressResponse(
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
     * Get user's overall shadowing statistics.
     */
    override fun getUserStats(userId: String): ShadowingStatsResponse {
        val totalAttempts = shadowingAttemptRepository.countByUserId(userId)
        val recentAttempts = shadowingAttemptRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId)
        val avgScore = shadowingAttemptRepository.calculateAverageScoreByUserId(userId) ?: 0.0

        // Count unique videos attempted
        val allAttempts = shadowingAttemptRepository.findByUserId(userId, Pageable.unpaged())
        val videosAttempted = allAttempts.content.map { it.videoId }.distinct().size
        val bestScore = allAttempts.content.maxOfOrNull { it.evaluation.overallScore } ?: 0.0

        return ShadowingStatsResponse(
            totalAttempts = totalAttempts,
            totalVideosAttempted = videosAttempted,
            averageScore = roundScore(avgScore),
            bestScore = roundScore(bestScore),
            recentAttempts = recentAttempts.map { shadowingMapper.toSummaryResponse(it) }
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

    /**
     * Calculate XP based on score.
     */
    private fun calculateXP(score: Double): Long {
        return when {
            score >= 95 -> 20L
            score >= 80 -> 15L
            score >= 60 -> 10L
            score >= 40 -> 5L
            else -> 2L
        }
    }
}
