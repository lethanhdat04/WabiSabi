package com.nihongomaster.repository

import com.nihongomaster.domain.video.JLPTLevel
import com.nihongomaster.domain.video.Video
import com.nihongomaster.domain.video.VideoCategory
import com.nihongomaster.domain.video.VideoStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional

/**
 * Repository for Video entity operations.
 */
@Repository
interface VideoRepository : MongoRepository<Video, String> {

    /**
     * Find video by YouTube ID.
     */
    fun findByYoutubeId(youtubeId: String): Optional<Video>

    /**
     * Check if YouTube ID already exists.
     */
    fun existsByYoutubeId(youtubeId: String): Boolean

    /**
     * Find all published videos with pagination.
     */
    fun findByStatus(status: VideoStatus, pageable: Pageable): Page<Video>

    /**
     * Find published videos by category.
     */
    fun findByStatusAndCategory(
        status: VideoStatus,
        category: VideoCategory,
        pageable: Pageable
    ): Page<Video>

    /**
     * Find published videos by level.
     */
    fun findByStatusAndLevel(
        status: VideoStatus,
        level: JLPTLevel,
        pageable: Pageable
    ): Page<Video>

    /**
     * Find published videos by category and level.
     */
    fun findByStatusAndCategoryAndLevel(
        status: VideoStatus,
        category: VideoCategory,
        level: JLPTLevel,
        pageable: Pageable
    ): Page<Video>

    /**
     * Find videos by uploader.
     */
    fun findByUploadedBy(uploadedBy: String, pageable: Pageable): Page<Video>

    /**
     * Find official videos only.
     */
    fun findByStatusAndIsOfficial(
        status: VideoStatus,
        isOfficial: Boolean,
        pageable: Pageable
    ): Page<Video>

    /**
     * Find videos containing a specific tag.
     */
    fun findByStatusAndTagsContaining(
        status: VideoStatus,
        tag: String,
        pageable: Pageable
    ): Page<Video>

    /**
     * Find popular videos ordered by practice count.
     */
    @Query("{ 'status': ?0 }")
    fun findPopularVideos(status: VideoStatus, pageable: Pageable): Page<Video>

    /**
     * Text search on title and description.
     */
    @Query("{ '\$text': { '\$search': ?0 }, 'status': ?1 }")
    fun searchByText(searchText: String, status: VideoStatus, pageable: Pageable): Page<Video>

    /**
     * Count videos by category.
     */
    fun countByStatusAndCategory(status: VideoStatus, category: VideoCategory): Long

    /**
     * Count videos by level.
     */
    fun countByStatusAndLevel(status: VideoStatus, level: JLPTLevel): Long
}
