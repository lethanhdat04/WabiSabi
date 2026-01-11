package com.nihongomaster.service.video

import com.nihongomaster.domain.video.Video
import com.nihongomaster.domain.video.VideoStatus
import com.nihongomaster.dto.common.PageResponse
import com.nihongomaster.dto.video.*
import com.nihongomaster.exception.BadRequestException
import com.nihongomaster.exception.ConflictException
import com.nihongomaster.exception.ResourceNotFoundException
import com.nihongomaster.repository.VideoRepository
import mu.KotlinLogging
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

private val logger = KotlinLogging.logger {}

/**
 * Service interface for video operations.
 */
interface VideoService {
    fun getById(videoId: String): VideoResponse
    fun getAll(params: VideoSearchParams, pageable: Pageable): PageResponse<VideoSummaryResponse>
    fun search(query: String, pageable: Pageable): PageResponse<VideoSummaryResponse>
    fun create(request: CreateVideoRequest, uploadedBy: String): VideoResponse
    fun update(videoId: String, request: UpdateVideoRequest): VideoResponse
    fun delete(videoId: String)
    fun getSegment(videoId: String, segmentIndex: Int): SubtitleSegmentResponse
    fun incrementViewCount(videoId: String)
    fun incrementPracticeCount(videoId: String, practiceType: PracticeType)
    fun getCategoryStats(): List<VideoCategoryCountResponse>
    fun getLevelStats(): List<VideoLevelCountResponse>
}

enum class PracticeType {
    SHADOWING, DICTATION
}

@Service
class VideoServiceImpl(
    private val videoRepository: VideoRepository,
    private val videoMapper: VideoMapper
) : VideoService {

    /**
     * Get video by ID with full details.
     */
    override fun getById(videoId: String): VideoResponse {
        val video = findVideoById(videoId)
        return videoMapper.toResponse(video)
    }

    /**
     * Get all videos with optional filtering.
     */
    override fun getAll(params: VideoSearchParams, pageable: Pageable): PageResponse<VideoSummaryResponse> {
        val page = when {
            params.category != null && params.level != null -> {
                videoRepository.findByStatusAndCategoryAndLevel(
                    VideoStatus.PUBLISHED, params.category, params.level, pageable
                )
            }
            params.category != null -> {
                videoRepository.findByStatusAndCategory(
                    VideoStatus.PUBLISHED, params.category, pageable
                )
            }
            params.level != null -> {
                videoRepository.findByStatusAndLevel(
                    VideoStatus.PUBLISHED, params.level, pageable
                )
            }
            params.tag != null -> {
                videoRepository.findByStatusAndTagsContaining(
                    VideoStatus.PUBLISHED, params.tag.lowercase(), pageable
                )
            }
            params.official == true -> {
                videoRepository.findByStatusAndIsOfficial(
                    VideoStatus.PUBLISHED, true, pageable
                )
            }
            else -> {
                videoRepository.findByStatus(VideoStatus.PUBLISHED, pageable)
            }
        }

        return PageResponse.fromMapped(page) { videoMapper.toSummaryResponse(it) }
    }

    /**
     * Search videos by text query.
     */
    override fun search(query: String, pageable: Pageable): PageResponse<VideoSummaryResponse> {
        if (query.isBlank()) {
            throw BadRequestException("Search query cannot be empty")
        }

        val page = videoRepository.searchByText(query.trim(), VideoStatus.PUBLISHED, pageable)
        return PageResponse.fromMapped(page) { videoMapper.toSummaryResponse(it) }
    }

    /**
     * Create a new video (admin only).
     */
    @Transactional
    override fun create(request: CreateVideoRequest, uploadedBy: String): VideoResponse {
        logger.info { "Creating video: ${request.title}" }

        // Check for duplicate YouTube ID
        if (videoRepository.existsByYoutubeId(request.youtubeId)) {
            throw ConflictException("Video with this YouTube ID already exists")
        }

        // Validate subtitles
        validateSubtitles(request.subtitles, request.duration)

        val video = videoMapper.toEntity(request, uploadedBy)
        val savedVideo = videoRepository.save(video)

        logger.info { "Video created: ${savedVideo.id}" }
        return videoMapper.toResponse(savedVideo)
    }

    /**
     * Update an existing video.
     */
    @Transactional
    override fun update(videoId: String, request: UpdateVideoRequest): VideoResponse {
        val video = findVideoById(videoId)

        // Validate subtitles if provided
        request.subtitles?.let { validateSubtitles(it, video.duration) }

        val updatedVideo = video.copy(
            title = request.title?.trim() ?: video.title,
            titleJapanese = request.titleJapanese?.trim() ?: video.titleJapanese,
            description = request.description?.trim() ?: video.description,
            category = request.category ?: video.category,
            level = request.level ?: video.level,
            tags = request.tags?.map { it.trim().lowercase() } ?: video.tags,
            subtitles = request.subtitles?.map { videoMapper.toSegmentEntity(it) } ?: video.subtitles,
            status = request.status ?: video.status,
            isOfficial = request.isOfficial ?: video.isOfficial
        )

        val savedVideo = videoRepository.save(updatedVideo)
        logger.info { "Video updated: $videoId" }

        return videoMapper.toResponse(savedVideo)
    }

    /**
     * Soft delete a video.
     */
    @Transactional
    override fun delete(videoId: String) {
        val video = findVideoById(videoId)
        val deletedVideo = video.copy(status = VideoStatus.DELETED)
        videoRepository.save(deletedVideo)
        logger.info { "Video deleted: $videoId" }
    }

    /**
     * Get a specific subtitle segment by index.
     */
    override fun getSegment(videoId: String, segmentIndex: Int): SubtitleSegmentResponse {
        val video = findVideoById(videoId)

        val segment = video.getSegment(segmentIndex)
            ?: throw BadRequestException("Segment index $segmentIndex not found. Video has ${video.getSegmentCount()} segments.")

        return videoMapper.toSegmentResponse(segment)
    }

    /**
     * Increment video view count.
     */
    @Transactional
    override fun incrementViewCount(videoId: String) {
        val video = findVideoById(videoId)
        val updatedStats = video.stats.copy(viewCount = video.stats.viewCount + 1)
        val updatedVideo = video.copy(stats = updatedStats)
        videoRepository.save(updatedVideo)
    }

    /**
     * Increment practice count for a specific practice type.
     */
    @Transactional
    override fun incrementPracticeCount(videoId: String, practiceType: PracticeType) {
        val video = findVideoById(videoId)
        val updatedStats = when (practiceType) {
            PracticeType.SHADOWING -> video.stats.copy(
                practiceCount = video.stats.practiceCount + 1,
                shadowingCount = video.stats.shadowingCount + 1
            )
            PracticeType.DICTATION -> video.stats.copy(
                practiceCount = video.stats.practiceCount + 1,
                dictationCount = video.stats.dictationCount + 1
            )
        }
        val updatedVideo = video.copy(stats = updatedStats)
        videoRepository.save(updatedVideo)
    }

    /**
     * Get video counts by category.
     */
    override fun getCategoryStats(): List<VideoCategoryCountResponse> {
        return com.nihongomaster.domain.video.VideoCategory.entries.map { category ->
            VideoCategoryCountResponse(
                category = category.name,
                count = videoRepository.countByStatusAndCategory(VideoStatus.PUBLISHED, category)
            )
        }
    }

    /**
     * Get video counts by level.
     */
    override fun getLevelStats(): List<VideoLevelCountResponse> {
        return com.nihongomaster.domain.video.JLPTLevel.entries.map { level ->
            VideoLevelCountResponse(
                level = level.name,
                count = videoRepository.countByStatusAndLevel(VideoStatus.PUBLISHED, level)
            )
        }
    }

    // ===========================================
    // PRIVATE METHODS
    // ===========================================

    private fun findVideoById(videoId: String): Video {
        return videoRepository.findById(videoId)
            .orElseThrow { ResourceNotFoundException("Video not found: $videoId") }
    }

    private fun validateSubtitles(subtitles: List<SubtitleSegmentRequest>, videoDuration: Int) {
        if (subtitles.isEmpty()) {
            throw BadRequestException("At least one subtitle segment is required")
        }

        // Check for valid indices
        val indices = subtitles.map { it.index }
        if (indices.distinct().size != indices.size) {
            throw BadRequestException("Subtitle indices must be unique")
        }

        // Validate time ranges
        subtitles.forEach { segment ->
            if (segment.startTime >= segment.endTime) {
                throw BadRequestException("Segment ${segment.index}: startTime must be less than endTime")
            }
            if (segment.endTime > videoDuration) {
                throw BadRequestException("Segment ${segment.index}: endTime exceeds video duration")
            }
        }

        // Check for overlapping segments
        val sortedSegments = subtitles.sortedBy { it.startTime }
        for (i in 0 until sortedSegments.size - 1) {
            if (sortedSegments[i].endTime > sortedSegments[i + 1].startTime) {
                throw BadRequestException(
                    "Segments ${sortedSegments[i].index} and ${sortedSegments[i + 1].index} overlap"
                )
            }
        }
    }
}
