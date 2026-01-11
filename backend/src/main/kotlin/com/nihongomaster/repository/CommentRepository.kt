package com.nihongomaster.repository

import com.nihongomaster.domain.forum.Comment
import com.nihongomaster.domain.forum.CommentStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

/**
 * Repository for Comment entity operations.
 */
@Repository
interface CommentRepository : MongoRepository<Comment, String> {

    /**
     * Find comments for a post (top-level only).
     */
    fun findByPostIdAndParentCommentIdIsNullAndStatusOrderByCreatedAtAsc(
        postId: String,
        status: CommentStatus,
        pageable: Pageable
    ): Page<Comment>

    /**
     * Find all comments for a post (including replies).
     */
    fun findByPostIdAndStatusOrderByCreatedAtAsc(
        postId: String,
        status: CommentStatus,
        pageable: Pageable
    ): Page<Comment>

    /**
     * Find replies to a specific comment.
     */
    fun findByParentCommentIdAndStatusOrderByCreatedAtAsc(
        parentCommentId: String,
        status: CommentStatus,
        pageable: Pageable
    ): Page<Comment>

    /**
     * Find comments by author.
     */
    fun findByAuthorIdAndStatusOrderByCreatedAtDesc(
        authorId: String,
        status: CommentStatus,
        pageable: Pageable
    ): Page<Comment>

    /**
     * Count comments for a post.
     */
    fun countByPostIdAndStatus(postId: String, status: CommentStatus): Long

    /**
     * Count replies to a comment.
     */
    fun countByParentCommentIdAndStatus(parentCommentId: String, status: CommentStatus): Long

    /**
     * Count comments by author.
     */
    fun countByAuthorIdAndStatus(authorId: String, status: CommentStatus): Long

    /**
     * Find recent comments by a user (for profile).
     */
    fun findTop10ByAuthorIdAndStatusOrderByCreatedAtDesc(
        authorId: String,
        status: CommentStatus
    ): List<Comment>

    /**
     * Delete all comments for a post (for cascade delete).
     */
    fun deleteByPostId(postId: String)

    /**
     * Find all comments for a post (for batch operations).
     */
    fun findByPostId(postId: String): List<Comment>

    /**
     * Check if user has commented on a post.
     */
    fun existsByPostIdAndAuthorIdAndStatus(
        postId: String,
        authorId: String,
        status: CommentStatus
    ): Boolean
}
