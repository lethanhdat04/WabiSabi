package com.nihongomaster.repository

import com.nihongomaster.domain.forum.CommentLike
import com.nihongomaster.domain.forum.PostLike
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository
import java.util.Optional

/**
 * Repository for PostLike entity operations.
 */
@Repository
interface PostLikeRepository : MongoRepository<PostLike, String> {

    /**
     * Find a like by user and post.
     */
    fun findByUserIdAndPostId(userId: String, postId: String): Optional<PostLike>

    /**
     * Check if user has liked a post.
     */
    fun existsByUserIdAndPostId(userId: String, postId: String): Boolean

    /**
     * Delete a like by user and post.
     */
    fun deleteByUserIdAndPostId(userId: String, postId: String)

    /**
     * Count likes for a post.
     */
    fun countByPostId(postId: String): Long

    /**
     * Find all likes for a post.
     */
    fun findByPostIdOrderByCreatedAtDesc(postId: String, pageable: Pageable): Page<PostLike>

    /**
     * Find posts liked by a user.
     */
    fun findByUserIdOrderByCreatedAtDesc(userId: String, pageable: Pageable): Page<PostLike>

    /**
     * Delete all likes for a post (for cascade delete).
     */
    fun deleteByPostId(postId: String)

    /**
     * Find recent likes by a user.
     */
    fun findTop20ByUserIdOrderByCreatedAtDesc(userId: String): List<PostLike>

    /**
     * Count posts liked by a user.
     */
    fun countByUserId(userId: String): Long
}

/**
 * Repository for CommentLike entity operations.
 */
@Repository
interface CommentLikeRepository : MongoRepository<CommentLike, String> {

    /**
     * Find a like by user and comment.
     */
    fun findByUserIdAndCommentId(userId: String, commentId: String): Optional<CommentLike>

    /**
     * Check if user has liked a comment.
     */
    fun existsByUserIdAndCommentId(userId: String, commentId: String): Boolean

    /**
     * Delete a like by user and comment.
     */
    fun deleteByUserIdAndCommentId(userId: String, commentId: String)

    /**
     * Count likes for a comment.
     */
    fun countByCommentId(commentId: String): Long

    /**
     * Delete all likes for a comment.
     */
    fun deleteByCommentId(commentId: String)
}
