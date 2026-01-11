package com.nihongomaster.service.forum

import com.nihongomaster.domain.forum.PostLike
import com.nihongomaster.dto.LikeResponse
import com.nihongomaster.dto.LikerResponse
import com.nihongomaster.exception.ResourceNotFoundException
import com.nihongomaster.mapper.ForumMapper
import com.nihongomaster.repository.PostLikeRepository
import com.nihongomaster.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Service for managing post likes (hearts).
 */
@Service
class PostLikeService(
    private val postLikeRepository: PostLikeRepository,
    private val userRepository: UserRepository,
    private val postService: PostService,
    private val mapper: ForumMapper
) {
    private val logger = LoggerFactory.getLogger(PostLikeService::class.java)

    // ================================
    // Like Operations
    // ================================

    /**
     * Like a post.
     */
    @Transactional
    fun likePost(postId: String, userId: String): LikeResponse {
        // Verify post exists
        val post = postService.findPostById(postId)

        // Check if already liked
        if (postLikeRepository.existsByUserIdAndPostId(userId, postId)) {
            return LikeResponse(
                postId = postId,
                isLiked = true,
                likeCount = post.likeCount,
                message = "Post already liked"
            )
        }

        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        // Create like
        val like = PostLike(
            postId = postId,
            userId = userId,
            username = user.username
        )
        postLikeRepository.save(like)

        // Update post like count
        postService.updateLikeCount(postId, 1)

        logger.info("Post liked: $postId by user $userId")

        return LikeResponse(
            postId = postId,
            isLiked = true,
            likeCount = post.likeCount + 1,
            message = "Post liked successfully"
        )
    }

    /**
     * Unlike a post.
     */
    @Transactional
    fun unlikePost(postId: String, userId: String): LikeResponse {
        // Verify post exists
        val post = postService.findPostById(postId)

        // Check if not liked
        if (!postLikeRepository.existsByUserIdAndPostId(userId, postId)) {
            return LikeResponse(
                postId = postId,
                isLiked = false,
                likeCount = post.likeCount,
                message = "Post not liked"
            )
        }

        // Delete like
        postLikeRepository.deleteByUserIdAndPostId(userId, postId)

        // Update post like count
        postService.updateLikeCount(postId, -1)

        logger.info("Post unliked: $postId by user $userId")

        return LikeResponse(
            postId = postId,
            isLiked = false,
            likeCount = maxOf(0, post.likeCount - 1),
            message = "Post unliked successfully"
        )
    }

    /**
     * Toggle like status on a post.
     */
    @Transactional
    fun toggleLike(postId: String, userId: String): LikeResponse {
        return if (postLikeRepository.existsByUserIdAndPostId(userId, postId)) {
            unlikePost(postId, userId)
        } else {
            likePost(postId, userId)
        }
    }

    // ================================
    // Like Queries
    // ================================

    /**
     * Check if user has liked a post.
     */
    fun hasUserLikedPost(postId: String, userId: String): Boolean {
        return postLikeRepository.existsByUserIdAndPostId(userId, postId)
    }

    /**
     * Get like count for a post.
     */
    fun getPostLikeCount(postId: String): Long {
        return postLikeRepository.countByPostId(postId)
    }

    /**
     * Get users who liked a post.
     */
    fun getPostLikers(postId: String, pageable: Pageable): Page<LikerResponse> {
        // Verify post exists
        postService.findPostById(postId)

        val likes = postLikeRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable)
        return likes.map { mapper.toLikerResponse(it) }
    }

    /**
     * Get posts liked by a user.
     */
    fun getUserLikedPosts(userId: String, pageable: Pageable): Page<PostLike> {
        return postLikeRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
    }

    /**
     * Get user's recent liked posts.
     */
    fun getUserRecentLikes(userId: String): List<PostLike> {
        return postLikeRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId)
    }

    /**
     * Get count of posts liked by user.
     */
    fun getUserLikeCount(userId: String): Long {
        return postLikeRepository.countByUserId(userId)
    }

    // ================================
    // Batch Operations
    // ================================

    /**
     * Check if user has liked multiple posts.
     * Returns a map of postId -> isLiked
     */
    fun checkUserLikes(postIds: List<String>, userId: String): Map<String, Boolean> {
        return postIds.associateWith { postId ->
            postLikeRepository.existsByUserIdAndPostId(userId, postId)
        }
    }
}
