package com.nihongomaster.domain.forum

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.index.TextIndexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * Post entity representing a discussion post in the community forum.
 */
@Document(collection = "posts")
@CompoundIndex(name = "topic_created_idx", def = "{'topic': 1, 'createdAt': -1}")
@CompoundIndex(name = "author_created_idx", def = "{'authorId': 1, 'createdAt': -1}")
@CompoundIndex(name = "status_created_idx", def = "{'status': 1, 'createdAt': -1}")
data class Post(
    @Id
    val id: String? = null,

    @TextIndexed(weight = 3F)
    val title: String,

    @TextIndexed
    val content: String,

    @Indexed
    val topic: ForumTopic,

    @Indexed
    val authorId: String,

    val authorUsername: String,

    val authorAvatarUrl: String? = null,

    val likeCount: Int = 0,

    val commentCount: Int = 0,

    val viewCount: Long = 0,

    val tags: List<String> = emptyList(),

    val isPinned: Boolean = false,

    val isLocked: Boolean = false,  // Prevents new comments

    @Indexed
    val status: PostStatus = PostStatus.ACTIVE,

    @CreatedDate
    val createdAt: Instant? = null,

    @LastModifiedDate
    val updatedAt: Instant? = null
) {
    /**
     * Check if post belongs to a specific user.
     */
    fun belongsTo(userId: String): Boolean = authorId == userId

    /**
     * Check if user can edit this post.
     */
    fun canBeEditedBy(userId: String, isAdmin: Boolean): Boolean {
        return authorId == userId || isAdmin
    }

    /**
     * Check if user can delete this post.
     */
    fun canBeDeletedBy(userId: String, isAdmin: Boolean): Boolean {
        return authorId == userId || isAdmin
    }

    /**
     * Check if comments can be added.
     */
    fun canAcceptComments(): Boolean {
        return !isLocked && status == PostStatus.ACTIVE
    }
}

/**
 * Forum topics for categorizing posts.
 */
enum class ForumTopic {
    JLPT_TIPS,              // JLPT exam preparation tips
    LEARNING_RESOURCES,     // Study materials and resources
    JAPAN_CULTURE,          // Japanese culture discussions
    TRAVEL,                 // Travel to Japan
    GRAMMAR_QUESTIONS,      // Grammar help
    VOCABULARY_HELP,        // Vocabulary discussions
    PRACTICE_PARTNERS,      // Finding study partners
    SUCCESS_STORIES,        // Learning achievements
    GENERAL_DISCUSSION,     // General topics
    ANNOUNCEMENTS,          // Official announcements (admin only)
    FEEDBACK                // App feedback and suggestions
}

/**
 * Post status for moderation.
 */
enum class PostStatus {
    ACTIVE,     // Normal, visible post
    HIDDEN,     // Hidden by moderator
    DELETED     // Soft deleted
}
