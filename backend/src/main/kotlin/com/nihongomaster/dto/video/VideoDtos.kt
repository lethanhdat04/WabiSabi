package com.nihongomaster.dto.video

import com.nihongomaster.domain.video.JLPTLevel
import com.nihongomaster.domain.video.VideoCategory
import com.nihongomaster.domain.video.VideoStatus
import jakarta.validation.Valid
import jakarta.validation.constraints.*
import java.time.Instant

// ===========================================
// REQUEST DTOs
// ===========================================

/**
 * Request DTO for creating a new video.
 */
data class CreateVideoRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(max = 200, message = "Title must be less than 200 characters")
    val title: String,

    @field:Size(max = 200, message = "Japanese title must be less than 200 characters")
    val titleJapanese: String? = null,

    @field:Size(max = 1000, message = "Description must be less than 1000 characters")
    val description: String? = null,

    @field:NotBlank(message = "YouTube ID is required")
    @field:Pattern(
        regexp = "^[a-zA-Z0-9_-]{11}$",
        message = "Invalid YouTube ID format"
    )
    val youtubeId: String,

    @field:NotBlank(message = "Thumbnail URL is required")
    val thumbnailUrl: String,

    @field:Min(60, message = "Duration must be at least 60 seconds")
    @field:Max(300, message = "Duration must be at most 300 seconds (5 minutes)")
    val duration: Int,

    @field:NotNull(message = "Category is required")
    val category: VideoCategory,

    @field:NotNull(message = "Level is required")
    val level: JLPTLevel,

    @field:Size(max = 10, message = "Maximum 10 tags allowed")
    val tags: List<String> = emptyList(),

    @field:NotEmpty(message = "At least one subtitle segment is required")
    @field:Valid
    val subtitles: List<SubtitleSegmentRequest>,

    val isOfficial: Boolean = false
)

/**
 * Request DTO for a subtitle segment.
 */
data class SubtitleSegmentRequest(
    @field:Min(0, message = "Index must be non-negative")
    val index: Int,

    @field:NotBlank(message = "Japanese text is required")
    @field:Size(max = 500, message = "Japanese text must be less than 500 characters")
    val japaneseText: String,

    @field:Size(max = 500, message = "Romaji must be less than 500 characters")
    val romaji: String? = null,

    @field:NotBlank(message = "Meaning/translation is required")
    @field:Size(max = 500, message = "Meaning must be less than 500 characters")
    val meaning: String,

    @field:DecimalMin("0.0", message = "Start time must be non-negative")
    val startTime: Double,

    @field:DecimalMin("0.0", message = "End time must be non-negative")
    val endTime: Double,

    val vocabulary: List<String> = emptyList()
)

/**
 * Request DTO for updating a video.
 */
data class UpdateVideoRequest(
    @field:Size(max = 200, message = "Title must be less than 200 characters")
    val title: String? = null,

    @field:Size(max = 200, message = "Japanese title must be less than 200 characters")
    val titleJapanese: String? = null,

    @field:Size(max = 1000, message = "Description must be less than 1000 characters")
    val description: String? = null,

    val category: VideoCategory? = null,

    val level: JLPTLevel? = null,

    val tags: List<String>? = null,

    @field:Valid
    val subtitles: List<SubtitleSegmentRequest>? = null,

    val status: VideoStatus? = null,

    val isOfficial: Boolean? = null
)

/**
 * Query parameters for video search/filtering.
 */
data class VideoSearchParams(
    val category: VideoCategory? = null,
    val level: JLPTLevel? = null,
    val tag: String? = null,
    val search: String? = null,
    val official: Boolean? = null
)

// ===========================================
// RESPONSE DTOs
// ===========================================

/**
 * Full video response with all details.
 */
data class VideoResponse(
    val id: String,
    val title: String,
    val titleJapanese: String?,
    val description: String?,
    val youtubeId: String,
    val thumbnailUrl: String,
    val duration: Int,
    val category: String,
    val level: String,
    val tags: List<String>,
    val subtitles: List<SubtitleSegmentResponse>,
    val segmentCount: Int,
    val uploadedBy: String,
    val isOfficial: Boolean,
    val status: String,
    val stats: VideoStatsResponse,
    val createdAt: Instant?,
    val updatedAt: Instant?
)

/**
 * Subtitle segment response.
 */
data class SubtitleSegmentResponse(
    val index: Int,
    val japaneseText: String,
    val romaji: String?,
    val meaning: String,
    val startTime: Double,
    val endTime: Double,
    val duration: Double,
    val vocabulary: List<String>
)

/**
 * Video statistics response.
 */
data class VideoStatsResponse(
    val viewCount: Long,
    val practiceCount: Long,
    val shadowingCount: Long,
    val dictationCount: Long,
    val averageScore: Double,
    val totalRatings: Int,
    val averageRating: Double
)

/**
 * Lightweight video summary for lists.
 */
data class VideoSummaryResponse(
    val id: String,
    val title: String,
    val titleJapanese: String?,
    val youtubeId: String,
    val thumbnailUrl: String,
    val duration: Int,
    val category: String,
    val level: String,
    val segmentCount: Int,
    val isOfficial: Boolean,
    val stats: VideoStatsResponse
)

/**
 * Response containing category counts.
 */
data class VideoCategoryCountResponse(
    val category: String,
    val count: Long
)

/**
 * Response containing level counts.
 */
data class VideoLevelCountResponse(
    val level: String,
    val count: Long
)
