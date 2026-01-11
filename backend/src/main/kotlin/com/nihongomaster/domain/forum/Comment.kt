package com.nihongomaster.domain.forum

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * Comment entity representing a reply to a forum post.
 */
@Document(collection = "comments")
@CompoundIndex(name = "post_created_idx", def = "{'postId': 1, 'createdAt': 1}")
@CompoundIndex(name = "author_created_idx", def = "{'authorId': 1, 'createdAt': -1}")
@CompoundIndex(name = "parent_created_idx", def = "{'parentCommentId': 1, 'createdAt': 1}")
data class Comment(
    @Id
    val id: String? = null,

    @Indexed
    val postId: String,

    @Indexed
    val authorId: String,

    val authorUsername: String,

    val authorAvatarUrl: String? = null,

    val content: String,

    val parentCommentId: String? = null,  // For nested replies (optional)

    val likeCount: Int = 0,

    val replyCount: Int = 0,

    val isEdited: Boolean = false,

    @Indexed
    val status: CommentStatus = CommentStatus.ACTIVE,

    @CreatedDate
    val createdAt: Instant? = null,

    @LastModifiedDate
    val updatedAt: Instant? = null
) {
    /**
     * Check if comment belongs to a specific user.
     */
    fun belongsTo(userId: String): Boolean = authorId == userId

    /**
     * Check if user can edit this comment.
     */
    fun canBeEditedBy(userId: String, isAdmin: Boolean): Boolean {
        return authorId == userId || isAdmin
    }

    /**
     * Check if user can delete this comment.
     */
    fun canBeDeletedBy(userId: String, isAdmin: Boolean): Boolean {
        return authorId == userId || isAdmin
    }

    /**
     * Check if this is a reply to another comment.
     */
    fun isReply(): Boolean = parentCommentId != null
}

/**
 * Comment status for moderation.
 */
enum class CommentStatus {
    ACTIVE,     // Normal, visible comment
    HIDDEN,     // Hidden by moderator
    DELETED     // Soft deleted
}
