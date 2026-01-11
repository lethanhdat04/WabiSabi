package com.nihongomaster.service.forum

import com.nihongomaster.domain.forum.Comment
import com.nihongomaster.domain.forum.CommentStatus
import com.nihongomaster.domain.user.Role
import com.nihongomaster.dto.*
import com.nihongomaster.exception.ForbiddenException
import com.nihongomaster.exception.ResourceNotFoundException
import com.nihongomaster.mapper.ForumMapper
import com.nihongomaster.repository.CommentLikeRepository
import com.nihongomaster.repository.CommentRepository
import com.nihongomaster.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Service for managing forum comments.
 */
@Service
class CommentService(
    private val commentRepository: CommentRepository,
    private val commentLikeRepository: CommentLikeRepository,
    private val userRepository: UserRepository,
    private val postService: PostService,
    private val mapper: ForumMapper
) {
    private val logger = LoggerFactory.getLogger(CommentService::class.java)

    // ================================
    // Comment CRUD Operations
    // ================================

    /**
     * Create a new comment on a post.
     */
    @Transactional
    fun createComment(
        postId: String,
        request: CreateCommentRequest,
        userId: String
    ): CommentResponse {
        // Verify post exists and can accept comments
        val post = postService.findPostById(postId)

        if (!post.canAcceptComments()) {
            throw ForbiddenException("This post is locked and cannot accept new comments")
        }

        // If replying to a comment, verify parent exists
        if (request.parentCommentId != null) {
            val parentComment = findCommentById(request.parentCommentId)
            if (parentComment.postId != postId) {
                throw ForbiddenException("Parent comment does not belong to this post")
            }
        }

        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        val comment = mapper.toEntity(
            request = request,
            postId = postId,
            authorId = userId,
            authorUsername = user.username,
            authorAvatarUrl = user.profile.avatarUrl
        )

        val savedComment = commentRepository.save(comment)

        // Update post comment count
        postService.updateCommentCount(postId, 1)

        // Update parent comment reply count if it's a reply
        if (request.parentCommentId != null) {
            updateReplyCount(request.parentCommentId, 1)
        }

        logger.info("Comment created: ${savedComment.id} on post $postId by user $userId")

        return mapper.toResponse(
            comment = savedComment,
            currentUserId = userId,
            isAdmin = user.roles.contains(Role.ADMIN)
        )
    }

    /**
     * Get comment by ID.
     */
    fun getComment(commentId: String, userId: String?): CommentResponse {
        val comment = findCommentById(commentId)
        val isAdmin = userId?.let { isUserAdmin(it) } ?: false
        val isLiked = userId?.let { commentLikeRepository.existsByUserIdAndCommentId(it, commentId) } ?: false

        return mapper.toResponse(
            comment = comment,
            isLikedByCurrentUser = isLiked,
            currentUserId = userId,
            isAdmin = isAdmin
        )
    }

    /**
     * Get comments for a post.
     */
    fun getCommentsForPost(
        postId: String,
        userId: String?,
        pageable: Pageable
    ): Page<CommentResponse> {
        // Verify post exists
        postService.findPostById(postId)

        val comments = commentRepository.findByPostIdAndParentCommentIdIsNullAndStatusOrderByCreatedAtAsc(
            postId,
            CommentStatus.ACTIVE,
            pageable
        )

        val isAdmin = userId?.let { isUserAdmin(it) } ?: false

        return comments.map { comment ->
            val isLiked = userId?.let { commentLikeRepository.existsByUserIdAndCommentId(it, comment.id!!) } ?: false
            mapper.toResponse(comment, isLiked, userId, isAdmin)
        }
    }

    /**
     * Get replies to a comment.
     */
    fun getReplies(
        commentId: String,
        userId: String?,
        pageable: Pageable
    ): Page<CommentResponse> {
        // Verify parent comment exists
        findCommentById(commentId)

        val replies = commentRepository.findByParentCommentIdAndStatusOrderByCreatedAtAsc(
            commentId,
            CommentStatus.ACTIVE,
            pageable
        )

        val isAdmin = userId?.let { isUserAdmin(it) } ?: false

        return replies.map { reply ->
            val isLiked = userId?.let { commentLikeRepository.existsByUserIdAndCommentId(it, reply.id!!) } ?: false
            mapper.toResponse(reply, isLiked, userId, isAdmin)
        }
    }

    /**
     * Update a comment.
     */
    @Transactional
    fun updateComment(
        commentId: String,
        request: UpdateCommentRequest,
        userId: String
    ): CommentResponse {
        val comment = findCommentById(commentId)
        val isAdmin = isUserAdmin(userId)

        if (!comment.canBeEditedBy(userId, isAdmin)) {
            throw ForbiddenException("You don't have permission to edit this comment")
        }

        val updatedComment = comment.copy(
            content = request.content.trim(),
            isEdited = true
        )

        val savedComment = commentRepository.save(updatedComment)
        val isLiked = commentLikeRepository.existsByUserIdAndCommentId(userId, commentId)

        logger.info("Comment updated: $commentId by user $userId")

        return mapper.toResponse(savedComment, isLiked, userId, isAdmin)
    }

    /**
     * Delete a comment (soft delete).
     */
    @Transactional
    fun deleteComment(commentId: String, userId: String) {
        val comment = findCommentById(commentId)
        val isAdmin = isUserAdmin(userId)

        if (!comment.canBeDeletedBy(userId, isAdmin)) {
            throw ForbiddenException("You don't have permission to delete this comment")
        }

        val deletedComment = comment.copy(status = CommentStatus.DELETED)
        commentRepository.save(deletedComment)

        // Update post comment count
        postService.updateCommentCount(comment.postId, -1)

        // Update parent comment reply count if it's a reply
        if (comment.parentCommentId != null) {
            updateReplyCount(comment.parentCommentId, -1)
        }

        logger.info("Comment deleted: $commentId by user $userId")
    }

    // ================================
    // Comment Discovery
    // ================================

    /**
     * Get user's comments.
     */
    fun getUserComments(userId: String, pageable: Pageable): Page<CommentResponse> {
        val comments = commentRepository.findByAuthorIdAndStatusOrderByCreatedAtDesc(
            userId,
            CommentStatus.ACTIVE,
            pageable
        )

        val isAdmin = isUserAdmin(userId)

        return comments.map { comment ->
            val isLiked = commentLikeRepository.existsByUserIdAndCommentId(userId, comment.id!!)
            mapper.toResponse(comment, isLiked, userId, isAdmin)
        }
    }

    /**
     * Get user's recent comments.
     */
    fun getUserRecentComments(userId: String): List<CommentResponse> {
        val comments = commentRepository.findTop10ByAuthorIdAndStatusOrderByCreatedAtDesc(
            userId,
            CommentStatus.ACTIVE
        )

        return comments.map { comment ->
            mapper.toResponse(comment, currentUserId = userId)
        }
    }

    // ================================
    // Statistics
    // ================================

    /**
     * Get comment count for a post.
     */
    fun getPostCommentCount(postId: String): Long {
        return commentRepository.countByPostIdAndStatus(postId, CommentStatus.ACTIVE)
    }

    /**
     * Get user's comment count.
     */
    fun getUserCommentCount(userId: String): Long {
        return commentRepository.countByAuthorIdAndStatus(userId, CommentStatus.ACTIVE)
    }

    /**
     * Check if user has commented on a post.
     */
    fun hasUserCommented(postId: String, userId: String): Boolean {
        return commentRepository.existsByPostIdAndAuthorIdAndStatus(
            postId,
            userId,
            CommentStatus.ACTIVE
        )
    }

    // ================================
    // Like Operations
    // ================================

    /**
     * Like a comment.
     */
    @Transactional
    fun likeComment(commentId: String, userId: String): CommentLikeResponse {
        val comment = findCommentById(commentId)

        // Check if already liked
        if (commentLikeRepository.existsByUserIdAndCommentId(userId, commentId)) {
            return CommentLikeResponse(
                commentId = commentId,
                isLiked = true,
                likeCount = comment.likeCount,
                message = "Comment already liked"
            )
        }

        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        // Create like
        val like = com.nihongomaster.domain.forum.CommentLike(
            commentId = commentId,
            userId = userId,
            username = user.username
        )
        commentLikeRepository.save(like)

        // Update like count
        val updatedComment = comment.copy(likeCount = comment.likeCount + 1)
        commentRepository.save(updatedComment)

        logger.info("Comment liked: $commentId by user $userId")

        return CommentLikeResponse(
            commentId = commentId,
            isLiked = true,
            likeCount = updatedComment.likeCount,
            message = "Comment liked successfully"
        )
    }

    /**
     * Unlike a comment.
     */
    @Transactional
    fun unlikeComment(commentId: String, userId: String): CommentLikeResponse {
        val comment = findCommentById(commentId)

        // Check if not liked
        if (!commentLikeRepository.existsByUserIdAndCommentId(userId, commentId)) {
            return CommentLikeResponse(
                commentId = commentId,
                isLiked = false,
                likeCount = comment.likeCount,
                message = "Comment not liked"
            )
        }

        // Delete like
        commentLikeRepository.deleteByUserIdAndCommentId(userId, commentId)

        // Update like count
        val updatedComment = comment.copy(likeCount = maxOf(0, comment.likeCount - 1))
        commentRepository.save(updatedComment)

        logger.info("Comment unliked: $commentId by user $userId")

        return CommentLikeResponse(
            commentId = commentId,
            isLiked = false,
            likeCount = updatedComment.likeCount,
            message = "Comment unliked successfully"
        )
    }

    // ================================
    // Internal Methods
    // ================================

    /**
     * Find comment by ID or throw exception.
     */
    internal fun findCommentById(commentId: String): Comment {
        return commentRepository.findById(commentId)
            .orElseThrow { ResourceNotFoundException("Comment not found with ID: $commentId") }
    }

    /**
     * Update reply count on a comment.
     */
    private fun updateReplyCount(commentId: String, delta: Int) {
        val comment = findCommentById(commentId)
        val updatedComment = comment.copy(replyCount = maxOf(0, comment.replyCount + delta))
        commentRepository.save(updatedComment)
    }

    /**
     * Check if user is admin.
     */
    private fun isUserAdmin(userId: String): Boolean {
        return userRepository.findById(userId)
            .map { it.roles.contains(Role.ADMIN) }
            .orElse(false)
    }
}
