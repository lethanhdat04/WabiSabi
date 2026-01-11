package com.nihongomaster.service.forum

import com.nihongomaster.domain.forum.ForumTopic
import com.nihongomaster.domain.forum.Post
import com.nihongomaster.domain.forum.PostStatus
import com.nihongomaster.domain.user.Role
import com.nihongomaster.dto.*
import com.nihongomaster.exception.ForbiddenException
import com.nihongomaster.exception.ResourceNotFoundException
import com.nihongomaster.mapper.ForumMapper
import com.nihongomaster.repository.CommentRepository
import com.nihongomaster.repository.PostLikeRepository
import com.nihongomaster.repository.PostRepository
import com.nihongomaster.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.temporal.ChronoUnit

/**
 * Service for managing forum posts.
 */
@Service
class PostService(
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
    private val postLikeRepository: PostLikeRepository,
    private val userRepository: UserRepository,
    private val mapper: ForumMapper
) {
    private val logger = LoggerFactory.getLogger(PostService::class.java)

    // ================================
    // Post CRUD Operations
    // ================================

    /**
     * Create a new post.
     */
    @Transactional
    fun createPost(request: CreatePostRequest, userId: String): PostResponse {
        // Check if topic is restricted (ANNOUNCEMENTS only for admins)
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        if (request.topic == ForumTopic.ANNOUNCEMENTS && !user.roles.contains(Role.ADMIN)) {
            throw ForbiddenException("Only administrators can post announcements")
        }

        val post = mapper.toEntity(
            request = request,
            authorId = userId,
            authorUsername = user.username,
            authorAvatarUrl = user.profile.avatarUrl
        )

        val savedPost = postRepository.save(post)
        logger.info("Post created: ${savedPost.id} by user $userId")

        return mapper.toResponse(
            post = savedPost,
            currentUserId = userId,
            isAdmin = user.roles.contains(Role.ADMIN)
        )
    }

    /**
     * Get a post by ID.
     */
    fun getPost(postId: String, userId: String?): PostResponse {
        val post = findPostById(postId)

        // Increment view count
        incrementViewCount(post)

        val isLiked = userId?.let { postLikeRepository.existsByUserIdAndPostId(it, postId) } ?: false
        val isAdmin = userId?.let { isUserAdmin(it) } ?: false

        return mapper.toResponse(
            post = post,
            isLikedByCurrentUser = isLiked,
            currentUserId = userId,
            isAdmin = isAdmin
        )
    }

    /**
     * Get post with comments.
     */
    fun getPostWithComments(
        postId: String,
        userId: String?,
        commentPageable: Pageable
    ): PostWithCommentsResponse {
        val post = findPostById(postId)
        incrementViewCount(post)

        val isLiked = userId?.let { postLikeRepository.existsByUserIdAndPostId(it, postId) } ?: false
        val isAdmin = userId?.let { isUserAdmin(it) } ?: false

        val commentsPage = commentRepository.findByPostIdAndParentCommentIdIsNullAndStatusOrderByCreatedAtAsc(
            postId,
            com.nihongomaster.domain.forum.CommentStatus.ACTIVE,
            commentPageable
        )

        val commentResponses = commentsPage.content.map { comment ->
            val commentLiked = userId?.let {
                // Note: This could be optimized with batch query
                false // Simplified for now
            } ?: false

            mapper.toResponse(
                comment = comment,
                isLikedByCurrentUser = commentLiked,
                currentUserId = userId,
                isAdmin = isAdmin
            )
        }

        return PostWithCommentsResponse(
            post = mapper.toResponse(post, isLiked, userId, isAdmin),
            comments = commentResponses,
            totalComments = commentsPage.totalElements,
            hasMoreComments = commentsPage.hasNext()
        )
    }

    /**
     * Update a post.
     */
    @Transactional
    fun updatePost(postId: String, request: UpdatePostRequest, userId: String): PostResponse {
        val post = findPostById(postId)
        val isAdmin = isUserAdmin(userId)

        if (!post.canBeEditedBy(userId, isAdmin)) {
            throw ForbiddenException("You don't have permission to edit this post")
        }

        // Check topic restriction
        if (request.topic == ForumTopic.ANNOUNCEMENTS && !isAdmin) {
            throw ForbiddenException("Only administrators can post announcements")
        }

        val updatedPost = post.copy(
            title = request.title?.trim() ?: post.title,
            content = request.content?.trim() ?: post.content,
            topic = request.topic ?: post.topic,
            tags = request.tags?.map { it.trim().lowercase() }?.distinct() ?: post.tags
        )

        val savedPost = postRepository.save(updatedPost)
        val isLiked = postLikeRepository.existsByUserIdAndPostId(userId, postId)

        logger.info("Post updated: $postId by user $userId")

        return mapper.toResponse(savedPost, isLiked, userId, isAdmin)
    }

    /**
     * Delete a post (soft delete).
     */
    @Transactional
    fun deletePost(postId: String, userId: String) {
        val post = findPostById(postId)
        val isAdmin = isUserAdmin(userId)

        if (!post.canBeDeletedBy(userId, isAdmin)) {
            throw ForbiddenException("You don't have permission to delete this post")
        }

        val deletedPost = post.copy(status = PostStatus.DELETED)
        postRepository.save(deletedPost)

        logger.info("Post deleted: $postId by user $userId")
    }

    /**
     * Update post status (admin only).
     */
    @Transactional
    fun updatePostStatus(postId: String, request: UpdatePostStatusRequest, userId: String): PostResponse {
        if (!isUserAdmin(userId)) {
            throw ForbiddenException("Only administrators can update post status")
        }

        val post = findPostById(postId)

        val updatedPost = post.copy(
            status = request.status,
            isPinned = request.isPinned ?: post.isPinned,
            isLocked = request.isLocked ?: post.isLocked
        )

        val savedPost = postRepository.save(updatedPost)
        val isLiked = postLikeRepository.existsByUserIdAndPostId(userId, postId)

        logger.info("Post status updated: $postId to ${request.status} by admin $userId")

        return mapper.toResponse(savedPost, isLiked, userId, true)
    }

    // ================================
    // Post Discovery
    // ================================

    /**
     * Get all active posts with pagination.
     */
    fun getPosts(pageable: Pageable): Page<PostSummaryResponse> {
        val posts = postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.ACTIVE, pageable)
        return posts.map { mapper.toSummaryResponse(it) }
    }

    /**
     * Get posts by topic.
     */
    fun getPostsByTopic(topic: ForumTopic, pageable: Pageable): Page<PostSummaryResponse> {
        val posts = postRepository.findByTopicAndStatusOrderByCreatedAtDesc(
            topic,
            PostStatus.ACTIVE,
            pageable
        )
        return posts.map { mapper.toSummaryResponse(it) }
    }

    /**
     * Get posts by author.
     */
    fun getPostsByAuthor(authorId: String, pageable: Pageable): Page<PostSummaryResponse> {
        val posts = postRepository.findByAuthorIdAndStatusOrderByCreatedAtDesc(
            authorId,
            PostStatus.ACTIVE,
            pageable
        )
        return posts.map { mapper.toSummaryResponse(it) }
    }

    /**
     * Get pinned posts.
     */
    fun getPinnedPosts(topic: ForumTopic? = null): List<PostSummaryResponse> {
        val posts = if (topic != null) {
            postRepository.findByTopicAndIsPinnedAndStatusOrderByCreatedAtDesc(
                topic,
                true,
                PostStatus.ACTIVE
            )
        } else {
            postRepository.findByIsPinnedAndStatusOrderByCreatedAtDesc(true, PostStatus.ACTIVE)
        }
        return posts.map { mapper.toSummaryResponse(it) }
    }

    /**
     * Get popular posts.
     */
    fun getPopularPosts(pageable: Pageable): Page<PostSummaryResponse> {
        val posts = postRepository.findByStatusOrderByLikeCountDescCreatedAtDesc(
            PostStatus.ACTIVE,
            pageable
        )
        return posts.map { mapper.toSummaryResponse(it) }
    }

    /**
     * Search posts.
     */
    fun searchPosts(query: String, pageable: Pageable): Page<PostSummaryResponse> {
        val posts = postRepository.searchPosts(query, PostStatus.ACTIVE, pageable)
        return posts.map { mapper.toSummaryResponse(it) }
    }

    /**
     * Get trending posts (high engagement in last 7 days).
     */
    fun getTrendingPosts(pageable: Pageable): Page<PostSummaryResponse> {
        val weekAgo = Instant.now().minus(7, ChronoUnit.DAYS)
        val sortedPageable = PageRequest.of(
            pageable.pageNumber,
            pageable.pageSize,
            Sort.by(Sort.Direction.DESC, "likeCount", "commentCount", "viewCount")
        )
        val posts = postRepository.findRecentPostsOrderByEngagement(
            PostStatus.ACTIVE,
            weekAgo,
            sortedPageable
        )
        return posts.map { mapper.toSummaryResponse(it) }
    }

    /**
     * Get posts by tags.
     */
    fun getPostsByTags(tags: List<String>, pageable: Pageable): Page<PostSummaryResponse> {
        val normalizedTags = tags.map { it.trim().lowercase() }
        val posts = postRepository.findByTagsContainingAndStatus(
            normalizedTags,
            PostStatus.ACTIVE,
            pageable
        )
        return posts.map { mapper.toSummaryResponse(it) }
    }

    // ================================
    // Statistics
    // ================================

    /**
     * Get user's post count.
     */
    fun getUserPostCount(userId: String): Long {
        return postRepository.countByAuthorIdAndStatus(userId, PostStatus.ACTIVE)
    }

    /**
     * Get topic post count.
     */
    fun getTopicPostCount(topic: ForumTopic): Long {
        return postRepository.countByTopicAndStatus(topic, PostStatus.ACTIVE)
    }

    /**
     * Get user's recent posts.
     */
    fun getUserRecentPosts(userId: String): List<PostSummaryResponse> {
        val posts = postRepository.findTop10ByAuthorIdAndStatusOrderByCreatedAtDesc(
            userId,
            PostStatus.ACTIVE
        )
        return posts.map { mapper.toSummaryResponse(it) }
    }

    // ================================
    // Internal Methods
    // ================================

    /**
     * Update comment count on a post.
     */
    internal fun updateCommentCount(postId: String, delta: Int) {
        val post = findPostById(postId)
        val updatedPost = post.copy(commentCount = maxOf(0, post.commentCount + delta))
        postRepository.save(updatedPost)
    }

    /**
     * Update like count on a post.
     */
    internal fun updateLikeCount(postId: String, delta: Int) {
        val post = findPostById(postId)
        val updatedPost = post.copy(likeCount = maxOf(0, post.likeCount + delta))
        postRepository.save(updatedPost)
    }

    /**
     * Find post by ID or throw exception.
     */
    internal fun findPostById(postId: String): Post {
        return postRepository.findById(postId)
            .orElseThrow { ResourceNotFoundException("Post not found with ID: $postId") }
    }

    /**
     * Check if user is admin.
     */
    private fun isUserAdmin(userId: String): Boolean {
        return userRepository.findById(userId)
            .map { it.roles.contains(Role.ADMIN) }
            .orElse(false)
    }

    /**
     * Increment view count.
     */
    private fun incrementViewCount(post: Post) {
        val updatedPost = post.copy(viewCount = post.viewCount + 1)
        postRepository.save(updatedPost)
    }
}
