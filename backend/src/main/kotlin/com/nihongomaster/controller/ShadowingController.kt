package com.nihongomaster.controller

import com.nihongomaster.dto.common.PageResponse
import com.nihongomaster.dto.practice.*
import com.nihongomaster.security.CurrentUser
import com.nihongomaster.security.UserPrincipal
import com.nihongomaster.service.practice.ShadowingService
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
import org.springframework.web.bind.annotation.*

/**
 * REST controller for shadowing practice endpoints.
 * Handles voice recording submission and evaluation.
 */
@RestController
@RequestMapping("/api/practice/shadowing")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Shadowing Practice", description = "Shadowing (speaking) practice endpoints")
class ShadowingController(
    private val shadowingService: ShadowingService
) {

    /**
     * Submit a shadowing practice attempt.
     *
     * POST /api/practice/shadowing/attempts
     */
    @PostMapping("/attempts")
    @Operation(
        summary = "Submit shadowing attempt",
        description = "Submit a voice recording for a video segment and receive AI evaluation"
    )
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Attempt submitted and evaluated"),
        ApiResponse(responseCode = "400", description = "Invalid request data"),
        ApiResponse(responseCode = "401", description = "Not authenticated"),
        ApiResponse(responseCode = "404", description = "Video or segment not found")
    )
    fun submitAttempt(
        @CurrentUser user: UserPrincipal,
        @Valid @RequestBody request: ShadowingAttemptRequest
    ): ResponseEntity<ShadowingAttemptResponse> {
        val response = shadowingService.submitAttempt(user.id, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    /**
     * Get a specific attempt by ID.
     *
     * GET /api/practice/shadowing/attempts/{attemptId}
     */
    @GetMapping("/attempts/{attemptId}")
    @Operation(
        summary = "Get attempt by ID",
        description = "Returns full details of a shadowing attempt including evaluation"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Attempt retrieved successfully"),
        ApiResponse(responseCode = "401", description = "Not authenticated"),
        ApiResponse(responseCode = "404", description = "Attempt not found")
    )
    fun getAttemptById(
        @PathVariable attemptId: String
    ): ResponseEntity<ShadowingAttemptResponse> {
        val response = shadowingService.getAttemptById(attemptId)
        return ResponseEntity.ok(response)
    }

    /**
     * Get user's shadowing attempt history.
     *
     * GET /api/practice/shadowing/attempts
     */
    @GetMapping("/attempts")
    @Operation(
        summary = "Get user's attempt history",
        description = "Returns paginated list of user's shadowing attempts"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Attempts retrieved successfully"),
        ApiResponse(responseCode = "401", description = "Not authenticated")
    )
    fun getUserAttempts(
        @CurrentUser user: UserPrincipal,
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<PageResponse<ShadowingAttemptSummaryResponse>> {
        val response = shadowingService.getUserAttempts(user.id, pageable)
        return ResponseEntity.ok(response)
    }

    /**
     * Get user's attempts for a specific video.
     *
     * GET /api/practice/shadowing/videos/{videoId}/attempts
     */
    @GetMapping("/videos/{videoId}/attempts")
    @Operation(
        summary = "Get attempts for a video",
        description = "Returns all user's attempts for a specific video"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Attempts retrieved successfully"),
        ApiResponse(responseCode = "401", description = "Not authenticated")
    )
    fun getVideoAttempts(
        @CurrentUser user: UserPrincipal,
        @PathVariable videoId: String
    ): ResponseEntity<List<ShadowingAttemptSummaryResponse>> {
        val response = shadowingService.getVideoAttempts(user.id, videoId)
        return ResponseEntity.ok(response)
    }

    /**
     * Get user's attempts for a specific segment.
     *
     * GET /api/practice/shadowing/videos/{videoId}/segments/{segmentIndex}/attempts
     */
    @GetMapping("/videos/{videoId}/segments/{segmentIndex}/attempts")
    @Operation(
        summary = "Get attempts for a segment",
        description = "Returns all user's attempts for a specific video segment"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Attempts retrieved successfully"),
        ApiResponse(responseCode = "401", description = "Not authenticated")
    )
    fun getSegmentAttempts(
        @CurrentUser user: UserPrincipal,
        @PathVariable videoId: String,
        @PathVariable segmentIndex: Int
    ): ResponseEntity<List<ShadowingAttemptResponse>> {
        val response = shadowingService.getSegmentAttempts(user.id, videoId, segmentIndex)
        return ResponseEntity.ok(response)
    }

    /**
     * Get best attempt for a segment.
     *
     * GET /api/practice/shadowing/videos/{videoId}/segments/{segmentIndex}/best
     */
    @GetMapping("/videos/{videoId}/segments/{segmentIndex}/best")
    @Operation(
        summary = "Get best attempt for a segment",
        description = "Returns the highest-scoring attempt for a specific segment"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Best attempt retrieved"),
        ApiResponse(responseCode = "204", description = "No attempts found"),
        ApiResponse(responseCode = "401", description = "Not authenticated")
    )
    fun getBestAttempt(
        @CurrentUser user: UserPrincipal,
        @PathVariable videoId: String,
        @PathVariable segmentIndex: Int
    ): ResponseEntity<ShadowingAttemptResponse> {
        val response = shadowingService.getBestAttempt(user.id, videoId, segmentIndex)
        return if (response != null) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.noContent().build()
        }
    }

    /**
     * Get user's progress for a video.
     *
     * GET /api/practice/shadowing/videos/{videoId}/progress
     */
    @GetMapping("/videos/{videoId}/progress")
    @Operation(
        summary = "Get progress for a video",
        description = "Returns user's shadowing progress summary for a video"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Progress retrieved successfully"),
        ApiResponse(responseCode = "401", description = "Not authenticated"),
        ApiResponse(responseCode = "404", description = "Video not found")
    )
    fun getVideoProgress(
        @CurrentUser user: UserPrincipal,
        @PathVariable videoId: String
    ): ResponseEntity<ShadowingProgressResponse> {
        val response = shadowingService.getVideoProgress(user.id, videoId)
        return ResponseEntity.ok(response)
    }

    /**
     * Get user's overall shadowing statistics.
     *
     * GET /api/practice/shadowing/stats
     */
    @GetMapping("/stats")
    @Operation(
        summary = "Get user's shadowing statistics",
        description = "Returns overall shadowing practice statistics"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
        ApiResponse(responseCode = "401", description = "Not authenticated")
    )
    fun getUserStats(
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<ShadowingStatsResponse> {
        val response = shadowingService.getUserStats(user.id)
        return ResponseEntity.ok(response)
    }
}
