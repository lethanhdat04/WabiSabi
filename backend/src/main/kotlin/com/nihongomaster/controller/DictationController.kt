package com.nihongomaster.controller

import com.nihongomaster.dto.common.PageResponse
import com.nihongomaster.dto.practice.*
import com.nihongomaster.security.CurrentUser
import com.nihongomaster.security.UserPrincipal
import com.nihongomaster.service.practice.DictationService
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
 * REST controller for dictation practice endpoints.
 * Handles text submission and evaluation for listening comprehension.
 */
@RestController
@RequestMapping("/api/practice/dictation")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Dictation Practice", description = "Dictation (listening) practice endpoints")
class DictationController(
    private val dictationService: DictationService
) {

    /**
     * Submit a dictation practice attempt.
     *
     * POST /api/practice/dictation/attempts
     */
    @PostMapping("/attempts")
    @Operation(
        summary = "Submit dictation attempt",
        description = "Submit typed text for a video segment and receive accuracy evaluation"
    )
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Attempt submitted and evaluated"),
        ApiResponse(responseCode = "400", description = "Invalid request data"),
        ApiResponse(responseCode = "401", description = "Not authenticated"),
        ApiResponse(responseCode = "404", description = "Video or segment not found")
    )
    fun submitAttempt(
        @CurrentUser user: UserPrincipal,
        @Valid @RequestBody request: DictationAttemptRequest
    ): ResponseEntity<DictationAttemptResponse> {
        val response = dictationService.submitAttempt(user.id, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    /**
     * Get a specific attempt by ID.
     *
     * GET /api/practice/dictation/attempts/{attemptId}
     */
    @GetMapping("/attempts/{attemptId}")
    @Operation(
        summary = "Get attempt by ID",
        description = "Returns full details of a dictation attempt including evaluation"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Attempt retrieved successfully"),
        ApiResponse(responseCode = "401", description = "Not authenticated"),
        ApiResponse(responseCode = "404", description = "Attempt not found")
    )
    fun getAttemptById(
        @PathVariable attemptId: String
    ): ResponseEntity<DictationAttemptResponse> {
        val response = dictationService.getAttemptById(attemptId)
        return ResponseEntity.ok(response)
    }

    /**
     * Get user's dictation attempt history.
     *
     * GET /api/practice/dictation/attempts
     */
    @GetMapping("/attempts")
    @Operation(
        summary = "Get user's attempt history",
        description = "Returns paginated list of user's dictation attempts"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Attempts retrieved successfully"),
        ApiResponse(responseCode = "401", description = "Not authenticated")
    )
    fun getUserAttempts(
        @CurrentUser user: UserPrincipal,
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<PageResponse<DictationAttemptSummaryResponse>> {
        val response = dictationService.getUserAttempts(user.id, pageable)
        return ResponseEntity.ok(response)
    }

    /**
     * Get user's attempts for a specific video.
     *
     * GET /api/practice/dictation/videos/{videoId}/attempts
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
    ): ResponseEntity<List<DictationAttemptSummaryResponse>> {
        val response = dictationService.getVideoAttempts(user.id, videoId)
        return ResponseEntity.ok(response)
    }

    /**
     * Get user's attempts for a specific segment.
     *
     * GET /api/practice/dictation/videos/{videoId}/segments/{segmentIndex}/attempts
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
    ): ResponseEntity<List<DictationAttemptResponse>> {
        val response = dictationService.getSegmentAttempts(user.id, videoId, segmentIndex)
        return ResponseEntity.ok(response)
    }

    /**
     * Get best attempt for a segment.
     *
     * GET /api/practice/dictation/videos/{videoId}/segments/{segmentIndex}/best
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
    ): ResponseEntity<DictationAttemptResponse> {
        val response = dictationService.getBestAttempt(user.id, videoId, segmentIndex)
        return if (response != null) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.noContent().build()
        }
    }

    /**
     * Get user's progress for a video.
     *
     * GET /api/practice/dictation/videos/{videoId}/progress
     */
    @GetMapping("/videos/{videoId}/progress")
    @Operation(
        summary = "Get progress for a video",
        description = "Returns user's dictation progress summary for a video"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Progress retrieved successfully"),
        ApiResponse(responseCode = "401", description = "Not authenticated"),
        ApiResponse(responseCode = "404", description = "Video not found")
    )
    fun getVideoProgress(
        @CurrentUser user: UserPrincipal,
        @PathVariable videoId: String
    ): ResponseEntity<DictationProgressResponse> {
        val response = dictationService.getVideoProgress(user.id, videoId)
        return ResponseEntity.ok(response)
    }

    /**
     * Get user's overall dictation statistics.
     *
     * GET /api/practice/dictation/stats
     */
    @GetMapping("/stats")
    @Operation(
        summary = "Get user's dictation statistics",
        description = "Returns overall dictation practice statistics"
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
        ApiResponse(responseCode = "401", description = "Not authenticated")
    )
    fun getUserStats(
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<DictationStatsResponse> {
        val response = dictationService.getUserStats(user.id)
        return ResponseEntity.ok(response)
    }
}
