package com.nihongomaster.dto

import com.nihongomaster.domain.forum.CommentStatus
import com.nihongomaster.domain.forum.ForumTopic
import com.nihongomaster.domain.forum.PostStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.Instant

// ================================
// Post Request DTOs
// ================================

/**
 * Request to create a new post.
 */
data class CreatePostRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    val title: String,

    @field:NotBlank(message = "Content is required")
    @field:Size(min = 10, max = 50000, message = "Content must be between 10 and 50000 characters")
    val content: String,

    @field:NotNull(message = "Topic is required")
    val topic: ForumTopic,

    val tags: List<String> = emptyList()
)

/**
 * Request to update a post.
 */
data class UpdatePostRequest(
    @field:Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    val title: String? = null,

    @field:Size(min = 10, max = 50000, message = "Content must be between 10 and 50000 characters")
    val content: String? = null,

    val topic: ForumTopic? = null,

    val tags: List<String>? = null
)

/**
 * Request for admin to update post status.
 */
data class UpdatePostStatusRequest(
    @field:NotNull(message = "Status is required")
    val status: PostStatus,

    val isPinned: Boolean? = null,

    val isLocked: Boolean? = null
)

// ================================
// Post Response DTOs
// ================================

/**
 * Summary response for post listings.
 */
data class PostSummaryResponse(
    val id: String,
    val title: String,
    val contentPreview: String,  // First 200 chars
    val topic: ForumTopic,
    val authorId: String,
    val authorUsername: String,
    val authorAvatarUrl: String?,
    val likeCount: Int,
    val commentCount: Int,
    val viewCount: Long,
    val tags: List<String>,
    val isPinned: Boolean,
    val isLocked: Boolean,
    val createdAt: Instant?,
    val updatedAt: Instant?
)

/**
 * Full post response with content.
 */
data class PostResponse(
    val id: String,
    val title: String,
    val content: String,
    val topic: ForumTopic,
    val authorId: String,
    val authorUsername: String,
    val authorAvatarUrl: String?,
    val likeCount: Int,
    val commentCount: Int,
    val viewCount: Long,
    val tags: List<String>,
    val isPinned: Boolean,
    val isLocked: Boolean,
    val status: PostStatus,
    val isLikedByCurrentUser: Boolean,
    val canEdit: Boolean,
    val canDelete: Boolean,
    val createdAt: Instant?,
    val updatedAt: Instant?
)

/**
 * Post with recent comments.
 */
data class PostWithCommentsResponse(
    val post: PostResponse,
    val comments: List<CommentResponse>,
    val totalComments: Long,
    val hasMoreComments: Boolean
)

// ================================
// Comment Request DTOs
// ================================

/**
 * Request to create a comment.
 */
data class CreateCommentRequest(
    @field:NotBlank(message = "Content is required")
    @field:Size(min = 1, max = 10000, message = "Content must be between 1 and 10000 characters")
    val content: String,

    val parentCommentId: String? = null  // For nested replies
)

/**
 * Request to update a comment.
 */
data class UpdateCommentRequest(
    @field:NotBlank(message = "Content is required")
    @field:Size(min = 1, max = 10000, message = "Content must be between 1 and 10000 characters")
    val content: String
)

// ================================
// Comment Response DTOs
// ================================

/**
 * Comment response.
 */
data class CommentResponse(
    val id: String,
    val postId: String,
    val authorId: String,
    val authorUsername: String,
    val authorAvatarUrl: String?,
    val content: String,
    val parentCommentId: String?,
    val likeCount: Int,
    val replyCount: Int,
    val isEdited: Boolean,
    val status: CommentStatus,
    val isLikedByCurrentUser: Boolean,
    val canEdit: Boolean,
    val canDelete: Boolean,
    val createdAt: Instant?,
    val updatedAt: Instant?,
    val replies: List<CommentResponse>? = null  // Nested replies (optional)
)

// ================================
// Like DTOs
// ================================

/**
 * Response after liking/unliking a post.
 */
data class LikeResponse(
    val postId: String,
    val isLiked: Boolean,
    val likeCount: Int,
    val message: String
)

/**
 * Response after liking/unliking a comment.
 */
data class CommentLikeResponse(
    val commentId: String,
    val isLiked: Boolean,
    val likeCount: Int,
    val message: String
)

/**
 * User who liked a post.
 */
data class LikerResponse(
    val userId: String,
    val username: String,
    val likedAt: Instant?
)

// ================================
// Forum Statistics DTOs
// ================================

/**
 * Forum statistics response.
 */
data class ForumStatsResponse(
    val totalPosts: Long,
    val totalComments: Long,
    val totalUsers: Long,
    val postsToday: Long,
    val topicStats: List<TopicStatsResponse>,
    val recentActivity: List<RecentActivityResponse>
)

/**
 * Statistics for a topic.
 */
data class TopicStatsResponse(
    val topic: ForumTopic,
    val postCount: Long,
    val latestPostAt: Instant?
)

/**
 * Recent activity item.
 */
data class RecentActivityResponse(
    val type: ActivityType,
    val postId: String,
    val postTitle: String,
    val userId: String,
    val username: String,
    val timestamp: Instant?
)

/**
 * Types of forum activity.
 */
enum class ActivityType {
    NEW_POST,
    NEW_COMMENT,
    POST_LIKED
}

// ================================
// User Forum Profile DTOs
// ================================

/**
 * User's forum activity summary.
 */
data class UserForumProfileResponse(
    val userId: String,
    val username: String,
    val postCount: Long,
    val commentCount: Long,
    val likesReceived: Long,
    val likesGiven: Long,
    val recentPosts: List<PostSummaryResponse>,
    val recentComments: List<CommentResponse>,
    val joinedAt: Instant?
)

// ================================
// Search and Filter DTOs
// ================================

/**
 * Search results response.
 */
data class ForumSearchResponse(
    val posts: List<PostSummaryResponse>,
    val totalResults: Long,
    val page: Int,
    val size: Int,
    val hasMore: Boolean
)

/**
 * Filter options for browsing posts.
 */
data class PostFilterOptions(
    val topic: ForumTopic? = null,
    val authorId: String? = null,
    val tags: List<String>? = null,
    val sortBy: PostSortOption = PostSortOption.NEWEST,
    val timeRange: TimeRange? = null
)

/**
 * Sort options for posts.
 */
enum class PostSortOption {
    NEWEST,
    OLDEST,
    MOST_LIKED,
    MOST_COMMENTED,
    TRENDING
}

/**
 * Time range for filtering.
 */
enum class TimeRange {
    TODAY,
    THIS_WEEK,
    THIS_MONTH,
    THIS_YEAR,
    ALL_TIME
}
