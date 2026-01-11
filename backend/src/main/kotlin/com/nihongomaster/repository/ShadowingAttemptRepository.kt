package com.nihongomaster.repository

import com.nihongomaster.domain.practice.ShadowingAttempt
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.Aggregation
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository
import java.time.Instant

/**
 * Repository for ShadowingAttempt entity operations.
 */
@Repository
interface ShadowingAttemptRepository : MongoRepository<ShadowingAttempt, String> {

    /**
     * Find all attempts by user with pagination.
     */
    fun findByUserId(userId: String, pageable: Pageable): Page<ShadowingAttempt>

    /**
     * Find attempts by user and video.
     */
    fun findByUserIdAndVideoId(userId: String, videoId: String): List<ShadowingAttempt>

    /**
     * Find attempts by user, video, and segment.
     */
    fun findByUserIdAndVideoIdAndSegmentIndex(
        userId: String,
        videoId: String,
        segmentIndex: Int
    ): List<ShadowingAttempt>

    /**
     * Find attempts by user within a date range.
     */
    fun findByUserIdAndCreatedAtBetween(
        userId: String,
        startDate: Instant,
        endDate: Instant,
        pageable: Pageable
    ): Page<ShadowingAttempt>

    /**
     * Count total attempts by user.
     */
    fun countByUserId(userId: String): Long

    /**
     * Count attempts for a specific video.
     */
    fun countByVideoId(videoId: String): Long

    /**
     * Count attempts by user and video.
     */
    fun countByUserIdAndVideoId(userId: String, videoId: String): Long

    /**
     * Find best attempt (highest score) for a segment.
     */
    fun findTopByUserIdAndVideoIdAndSegmentIndexOrderByEvaluationOverallScoreDesc(
        userId: String,
        videoId: String,
        segmentIndex: Int
    ): ShadowingAttempt?

    /**
     * Calculate average score for a user.
     */
    @Aggregation(pipeline = [
        "{ '\$match': { 'userId': ?0 } }",
        "{ '\$group': { '_id': null, 'avgScore': { '\$avg': '\$evaluation.overallScore' } } }"
    ])
    fun calculateAverageScoreByUserId(userId: String): Double?

    /**
     * Find recent attempts by user.
     */
    fun findTop10ByUserIdOrderByCreatedAtDesc(userId: String): List<ShadowingAttempt>

    /**
     * Delete all attempts for a video.
     */
    fun deleteByVideoId(videoId: String)
}
