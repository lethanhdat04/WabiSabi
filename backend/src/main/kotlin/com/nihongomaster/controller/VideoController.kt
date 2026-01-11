package com.nihongomaster.controller

import com.nihongomaster.dto.common.PageResponse
import com.nihongomaster.dto.video.*
import com.nihongomaster.security.CurrentUser
import com.nihongomaster.security.UserPrincipal
import com.nihongomaster.service.video.VideoService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import com.nihongomaster.domain.video.JLPTLevel
import com.nihongomaster.domain.video.VideoCategory

/**
 * REST controller for video library endpoints.
 */
@RestController
@RequestMapping("/api/videos")
@Tag(name = "Videos", description = "Video library management")
class VideoController(
    private val videoService: VideoService
) {

    /**
     * Get all videos with optional filtering.
     *
     * GET /api/videos
     */
    @GetMapping
    @Operation(
        summary = "Get all videos",
        description = "Returns paginated list of videos with optional filtering by category and level"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Videos retrieved successfully")
    )
    fun getAll(
        @Parameter(description = "Filter by category")
        @RequestParam(required = false) category: VideoCategory?,

        @Parameter(description = "Filter by JLPT level")
        @RequestParam(required = false) level: JLPTLevel?,

        @Parameter(description = "Filter by tag")
        @RequestParam(required = false) tag: String?,

        @Parameter(description = "Filter official videos only")
        @RequestParam(required = false) official: Boolean?,

        @PageableDefault(size = 12, sort = ["createdAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<PageResponse<VideoSummaryResponse>> {
        val params = VideoSearchParams(
            category = category,
            level = level,
            tag = tag,
            official = official
        )
        val response = videoService.getAll(params, pageable)
        return ResponseEntity.ok(response)
    }

    /**
     * Search videos by text query.
     *
     * GET /api/videos/search
     */
    @GetMapping("/search")
    @Operation(
        summary = "Search videos",
        description = "Full-text search on video titles and descriptions"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Search results retrieved")
    )
    fun search(
        @Parameter(description = "Search query", required = true)
        @RequestParam q: String,

        @PageableDefault(size = 12)
        pageable: Pageable
    ): ResponseEntity<PageResponse<VideoSummaryResponse>> {
        val response = videoService.search(q, pageable)
        return ResponseEntity.ok(response)
    }

    /**
     * Get video by ID.
     *
     * GET /api/videos/{videoId}
     */
    @GetMapping("/{videoId}")
    @Operation(
        summary = "Get video by ID",
        description = "Returns full video details including all subtitle segments"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Video retrieved successfully"),
        ApiResponse(responseCode = "404", description = "Video not found")
    )
    fun getById(
        @PathVariable videoId: String
    ): ResponseEntity<VideoResponse> {
        val response = videoService.getById(videoId)

        // Increment view count asynchronously (fire and forget)
        try {
            videoService.incrementViewCount(videoId)
        } catch (_: Exception) {
            // Ignore errors in view count increment
        }

        return ResponseEntity.ok(response)
    }

    /**
     * Get a specific subtitle segment.
     *
     * GET /api/videos/{videoId}/segments/{segmentIndex}
     */
    @GetMapping("/{videoId}/segments/{segmentIndex}")
    @Operation(
        summary = "Get subtitle segment",
        description = "Returns a specific subtitle segment by index"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Segment retrieved successfully"),
        ApiResponse(responseCode = "400", description = "Invalid segment index"),
        ApiResponse(responseCode = "404", description = "Video not found")
    )
    fun getSegment(
        @PathVariable videoId: String,
        @PathVariable segmentIndex: Int
    ): ResponseEntity<SubtitleSegmentResponse> {
        val response = videoService.getSegment(videoId, segmentIndex)
        return ResponseEntity.ok(response)
    }

    /**
     * Get video statistics by category.
     *
     * GET /api/videos/stats/categories
     */
    @GetMapping("/stats/categories")
    @Operation(
        summary = "Get category statistics",
        description = "Returns video count for each category"
    )
    fun getCategoryStats(): ResponseEntity<List<VideoCategoryCountResponse>> {
        val response = videoService.getCategoryStats()
        return ResponseEntity.ok(response)
    }

    /**
     * Get video statistics by level.
     *
     * GET /api/videos/stats/levels
     */
    @GetMapping("/stats/levels")
    @Operation(
        summary = "Get level statistics",
        description = "Returns video count for each JLPT level"
    )
    fun getLevelStats(): ResponseEntity<List<VideoLevelCountResponse>> {
        val response = videoService.getLevelStats()
        return ResponseEntity.ok(response)
    }

    // ===========================================
    // ADMIN ENDPOINTS
    // ===========================================

    /**
     * Create a new video (admin only).
     *
     * POST /api/videos
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Create video (Admin)",
        description = "Creates a new video in the library. Requires ADMIN role."
    )
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Video created successfully"),
        ApiResponse(responseCode = "400", description = "Invalid request data"),
        ApiResponse(responseCode = "401", description = "Not authenticated"),
        ApiResponse(responseCode = "403", description = "Not authorized"),
        ApiResponse(responseCode = "409", description = "Video with YouTube ID already exists")
    )
    fun create(
        @CurrentUser user: UserPrincipal,
        @Valid @RequestBody request: CreateVideoRequest
    ): ResponseEntity<VideoResponse> {
        val response = videoService.create(request, user.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    /**
     * Update a video (admin only).
     *
     * PUT /api/videos/{videoId}
     */
    @PutMapping("/{videoId}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Update video (Admin)",
        description = "Updates an existing video. Requires ADMIN role."
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Video updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid request data"),
        ApiResponse(responseCode = "401", description = "Not authenticated"),
        ApiResponse(responseCode = "403", description = "Not authorized"),
        ApiResponse(responseCode = "404", description = "Video not found")
    )
    fun update(
        @PathVariable videoId: String,
        @Valid @RequestBody request: UpdateVideoRequest
    ): ResponseEntity<VideoResponse> {
        val response = videoService.update(videoId, request)
        return ResponseEntity.ok(response)
    }

    /**
     * Delete a video (admin only).
     *
     * DELETE /api/videos/{videoId}
     */
    @DeleteMapping("/{videoId}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Delete video (Admin)",
        description = "Soft deletes a video. Requires ADMIN role."
    )
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Video deleted successfully"),
        ApiResponse(responseCode = "401", description = "Not authenticated"),
        ApiResponse(responseCode = "403", description = "Not authorized"),
        ApiResponse(responseCode = "404", description = "Video not found")
    )
    fun delete(
        @PathVariable videoId: String
    ): ResponseEntity<Void> {
        videoService.delete(videoId)
        return ResponseEntity.noContent().build()
    }
}
