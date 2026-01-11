package com.nihongomaster.domain.forum

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * PostLike entity representing a user's like (heart) on a post.
 * Stored in a separate collection to efficiently track likes and prevent duplicates.
 */
@Document(collection = "post_likes")
@CompoundIndex(name = "user_post_idx", def = "{'userId': 1, 'postId': 1}", unique = true)
@CompoundIndex(name = "post_created_idx", def = "{'postId': 1, 'createdAt': -1}")
data class PostLike(
    @Id
    val id: String? = null,

    @Indexed
    val postId: String,

    @Indexed
    val userId: String,

    val username: String,

    @CreatedDate
    val createdAt: Instant? = null
)

/**
 * CommentLike entity for tracking likes on comments (optional feature).
 */
@Document(collection = "comment_likes")
@CompoundIndex(name = "user_comment_idx", def = "{'userId': 1, 'commentId': 1}", unique = true)
@CompoundIndex(name = "comment_created_idx", def = "{'commentId': 1, 'createdAt': -1}")
data class CommentLike(
    @Id
    val id: String? = null,

    @Indexed
    val commentId: String,

    @Indexed
    val userId: String,

    val username: String,

    @CreatedDate
    val createdAt: Instant? = null
)
