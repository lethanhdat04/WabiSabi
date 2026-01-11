package com.nihongomaster.mapper

import com.nihongomaster.domain.forum.Comment
import com.nihongomaster.domain.forum.Post
import com.nihongomaster.domain.forum.PostLike
import com.nihongomaster.dto.*
import org.springframework.stereotype.Component

/**
 * Mapper for forum-related entities and DTOs.
 */
@Component
class ForumMapper {

    companion object {
        private const val CONTENT_PREVIEW_LENGTH = 200
    }

    // ================================
    // Post Mappings
    // ================================

    /**
     * Convert Post to summary response.
     */
    fun toSummaryResponse(post: Post): PostSummaryResponse {
        return PostSummaryResponse(
            id = post.id!!,
            title = post.title,
            contentPreview = createContentPreview(post.content),
            topic = post.topic,
            authorId = post.authorId,
            authorUsername = post.authorUsername,
            authorAvatarUrl = post.authorAvatarUrl,
            likeCount = post.likeCount,
            commentCount = post.commentCount,
            viewCount = post.viewCount,
            tags = post.tags,
            isPinned = post.isPinned,
            isLocked = post.isLocked,
            createdAt = post.createdAt,
            updatedAt = post.updatedAt
        )
    }

    /**
     * Convert Post to full response.
     */
    fun toResponse(
        post: Post,
        isLikedByCurrentUser: Boolean = false,
        currentUserId: String? = null,
        isAdmin: Boolean = false
    ): PostResponse {
        val canEdit = currentUserId != null && post.canBeEditedBy(currentUserId, isAdmin)
        val canDelete = currentUserId != null && post.canBeDeletedBy(currentUserId, isAdmin)

        return PostResponse(
            id = post.id!!,
            title = post.title,
            content = post.content,
            topic = post.topic,
            authorId = post.authorId,
            authorUsername = post.authorUsername,
            authorAvatarUrl = post.authorAvatarUrl,
            likeCount = post.likeCount,
            commentCount = post.commentCount,
            viewCount = post.viewCount,
            tags = post.tags,
            isPinned = post.isPinned,
            isLocked = post.isLocked,
            status = post.status,
            isLikedByCurrentUser = isLikedByCurrentUser,
            canEdit = canEdit,
            canDelete = canDelete,
            createdAt = post.createdAt,
            updatedAt = post.updatedAt
        )
    }

    /**
     * Create Post entity from request.
     */
    fun toEntity(
        request: CreatePostRequest,
        authorId: String,
        authorUsername: String,
        authorAvatarUrl: String?
    ): Post {
        return Post(
            title = request.title.trim(),
            content = request.content.trim(),
            topic = request.topic,
            authorId = authorId,
            authorUsername = authorUsername,
            authorAvatarUrl = authorAvatarUrl,
            tags = request.tags.map { it.trim().lowercase() }.distinct()
        )
    }

    // ================================
    // Comment Mappings
    // ================================

    /**
     * Convert Comment to response.
     */
    fun toResponse(
        comment: Comment,
        isLikedByCurrentUser: Boolean = false,
        currentUserId: String? = null,
        isAdmin: Boolean = false,
        replies: List<CommentResponse>? = null
    ): CommentResponse {
        val canEdit = currentUserId != null && comment.canBeEditedBy(currentUserId, isAdmin)
        val canDelete = currentUserId != null && comment.canBeDeletedBy(currentUserId, isAdmin)

        return CommentResponse(
            id = comment.id!!,
            postId = comment.postId,
            authorId = comment.authorId,
            authorUsername = comment.authorUsername,
            authorAvatarUrl = comment.authorAvatarUrl,
            content = comment.content,
            parentCommentId = comment.parentCommentId,
            likeCount = comment.likeCount,
            replyCount = comment.replyCount,
            isEdited = comment.isEdited,
            status = comment.status,
            isLikedByCurrentUser = isLikedByCurrentUser,
            canEdit = canEdit,
            canDelete = canDelete,
            createdAt = comment.createdAt,
            updatedAt = comment.updatedAt,
            replies = replies
        )
    }

    /**
     * Create Comment entity from request.
     */
    fun toEntity(
        request: CreateCommentRequest,
        postId: String,
        authorId: String,
        authorUsername: String,
        authorAvatarUrl: String?
    ): Comment {
        return Comment(
            postId = postId,
            authorId = authorId,
            authorUsername = authorUsername,
            authorAvatarUrl = authorAvatarUrl,
            content = request.content.trim(),
            parentCommentId = request.parentCommentId
        )
    }

    // ================================
    // Like Mappings
    // ================================

    /**
     * Convert PostLike to liker response.
     */
    fun toLikerResponse(postLike: PostLike): LikerResponse {
        return LikerResponse(
            userId = postLike.userId,
            username = postLike.username,
            likedAt = postLike.createdAt
        )
    }

    // ================================
    // Helper Methods
    // ================================

    /**
     * Create content preview for listings.
     */
    private fun createContentPreview(content: String): String {
        // Remove markdown formatting for preview
        val plainText = content
            .replace(Regex("#+\\s*"), "")           // Headers
            .replace(Regex("\\*\\*(.+?)\\*\\*"), "$1")  // Bold
            .replace(Regex("\\*(.+?)\\*"), "$1")        // Italic
            .replace(Regex("\\[(.+?)]\\(.+?\\)"), "$1") // Links
            .replace(Regex("`(.+?)`"), "$1")           // Inline code
            .replace(Regex("```[\\s\\S]*?```"), "")    // Code blocks
            .replace(Regex("\\n+"), " ")               // Newlines
            .trim()

        return if (plainText.length <= CONTENT_PREVIEW_LENGTH) {
            plainText
        } else {
            plainText.take(CONTENT_PREVIEW_LENGTH).trimEnd() + "..."
        }
    }
}
