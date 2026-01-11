package com.nihongomaster.repository

import com.nihongomaster.domain.forum.ForumTopic
import com.nihongomaster.domain.forum.Post
import com.nihongomaster.domain.forum.PostStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import org.springframework.stereotype.Repository

/**
 * Repository for Post entity operations.
 */
@Repository
interface PostRepository : MongoRepository<Post, String> {

    /**
     * Find all active posts with pagination.
     */
    fun findByStatusOrderByCreatedAtDesc(
        status: PostStatus,
        pageable: Pageable
    ): Page<Post>

    /**
     * Find posts by topic.
     */
    fun findByTopicAndStatusOrderByCreatedAtDesc(
        topic: ForumTopic,
        status: PostStatus,
        pageable: Pageable
    ): Page<Post>

    /**
     * Find posts by author.
     */
    fun findByAuthorIdAndStatusOrderByCreatedAtDesc(
        authorId: String,
        status: PostStatus,
        pageable: Pageable
    ): Page<Post>

    /**
     * Find pinned posts for a topic.
     */
    fun findByTopicAndIsPinnedAndStatusOrderByCreatedAtDesc(
        topic: ForumTopic,
        isPinned: Boolean,
        status: PostStatus
    ): List<Post>

    /**
     * Find all pinned posts.
     */
    fun findByIsPinnedAndStatusOrderByCreatedAtDesc(
        isPinned: Boolean,
        status: PostStatus
    ): List<Post>

    /**
     * Text search on title and content.
     */
    @Query("{ '\$text': { '\$search': ?0 }, 'status': ?1 }")
    fun searchPosts(
        searchText: String,
        status: PostStatus,
        pageable: Pageable
    ): Page<Post>

    /**
     * Find popular posts by like count.
     */
    fun findByStatusOrderByLikeCountDescCreatedAtDesc(
        status: PostStatus,
        pageable: Pageable
    ): Page<Post>

    /**
     * Find recent posts by a user (for profile).
     */
    fun findTop10ByAuthorIdAndStatusOrderByCreatedAtDesc(
        authorId: String,
        status: PostStatus
    ): List<Post>

    /**
     * Count posts by author.
     */
    fun countByAuthorIdAndStatus(authorId: String, status: PostStatus): Long

    /**
     * Count posts by topic.
     */
    fun countByTopicAndStatus(topic: ForumTopic, status: PostStatus): Long

    /**
     * Find posts with specific tags.
     */
    @Query("{ 'tags': { '\$in': ?0 }, 'status': ?1 }")
    fun findByTagsContainingAndStatus(
        tags: List<String>,
        status: PostStatus,
        pageable: Pageable
    ): Page<Post>

    /**
     * Find trending posts (high engagement in recent time).
     */
    @Query("{ 'status': ?0, 'createdAt': { '\$gte': ?1 } }")
    fun findRecentPostsOrderByEngagement(
        status: PostStatus,
        since: java.time.Instant,
        pageable: Pageable
    ): Page<Post>
}
