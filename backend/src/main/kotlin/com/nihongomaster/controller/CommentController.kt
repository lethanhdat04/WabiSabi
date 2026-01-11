package com.nihongomaster.controller

import com.nihongomaster.dto.*
import com.nihongomaster.security.CurrentUser
import com.nihongomaster.security.UserPrincipal
import com.nihongomaster.service.forum.CommentService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

/**
 * REST controller for forum comment operations.
 */
@RestController
@RequestMapping("/api/forum/comments")
@Tag(name = "Forum Comments", description = "Community forum comment management API")
class CommentController(
    private val commentService: CommentService
) {

    // ================================
    // Comment Operations
    // ================================

    @GetMapping("/{commentId}")
    @Operation(summary = "Get comment by ID")
    fun getComment(
        @PathVariable commentId: String,
        @CurrentUser user: UserPrincipal?
    ): ResponseEntity<CommentResponse> {
        val comment = commentService.getComment(commentId, user?.id)
        return ResponseEntity.ok(comment)
    }

    @PutMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update a comment")
    fun updateComment(
        @PathVariable commentId: String,
        @Valid @RequestBody request: UpdateCommentRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<CommentResponse> {
        val comment = commentService.updateComment(commentId, request, user.id)
        return ResponseEntity.ok(comment)
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete a comment")
    fun deleteComment(
        @PathVariable commentId: String,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<Void> {
        commentService.deleteComment(commentId, user.id)
        return ResponseEntity.noContent().build()
    }

    // ================================
    // Reply Operations
    // ================================

    @GetMapping("/{commentId}/replies")
    @Operation(summary = "Get replies to a comment")
    fun getReplies(
        @PathVariable commentId: String,
        @CurrentUser user: UserPrincipal?,
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.ASC)
        pageable: Pageable
    ): ResponseEntity<Page<CommentResponse>> {
        val replies = commentService.getReplies(commentId, user?.id, pageable)
        return ResponseEntity.ok(replies)
    }

    // ================================
    // Like Operations
    // ================================

    @PostMapping("/{commentId}/like")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Like a comment")
    fun likeComment(
        @PathVariable commentId: String,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<CommentLikeResponse> {
        val response = commentService.likeComment(commentId, user.id)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/{commentId}/like")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Unlike a comment")
    fun unlikeComment(
        @PathVariable commentId: String,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<CommentLikeResponse> {
        val response = commentService.unlikeComment(commentId, user.id)
        return ResponseEntity.ok(response)
    }

    // ================================
    // User Comment Discovery
    // ================================

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get comments by user")
    fun getUserComments(
        @PathVariable userId: String,
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<Page<CommentResponse>> {
        val comments = commentService.getUserComments(userId, pageable)
        return ResponseEntity.ok(comments)
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's comments")
    fun getMyComments(
        @CurrentUser user: UserPrincipal,
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<Page<CommentResponse>> {
        val comments = commentService.getUserComments(user.id, pageable)
        return ResponseEntity.ok(comments)
    }
}
