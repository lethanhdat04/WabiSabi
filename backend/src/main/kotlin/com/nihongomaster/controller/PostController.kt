package com.nihongomaster.controller

import com.nihongomaster.domain.forum.ForumTopic
import com.nihongomaster.dto.*
import com.nihongomaster.security.CurrentUser
import com.nihongomaster.security.UserPrincipal
import com.nihongomaster.service.forum.CommentService
import com.nihongomaster.service.forum.PostLikeService
import com.nihongomaster.service.forum.PostService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

/**
 * REST controller for forum post operations.
 */
@RestController
@RequestMapping("/api/forum/posts")
@Tag(name = "Forum Posts", description = "Community forum post management API")
class PostController(
    private val postService: PostService,
    private val commentService: CommentService,
    private val postLikeService: PostLikeService
) {

    // ================================
    // Post CRUD Operations
    // ================================

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create a new post")
    fun createPost(
        @Valid @RequestBody request: CreatePostRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<PostResponse> {
        val post = postService.createPost(request, user.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(post)
    }

    @GetMapping("/{postId}")
    @Operation(summary = "Get post by ID")
    fun getPost(
        @PathVariable postId: String,
        @CurrentUser user: UserPrincipal?
    ): ResponseEntity<PostResponse> {
        val post = postService.getPost(postId, user?.id)
        return ResponseEntity.ok(post)
    }

    @GetMapping("/{postId}/with-comments")
    @Operation(summary = "Get post with comments")
    fun getPostWithComments(
        @PathVariable postId: String,
        @CurrentUser user: UserPrincipal?,
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.ASC)
        commentPageable: Pageable
    ): ResponseEntity<PostWithCommentsResponse> {
        val response = postService.getPostWithComments(postId, user?.id, commentPageable)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{postId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update a post")
    fun updatePost(
        @PathVariable postId: String,
        @Valid @RequestBody request: UpdatePostRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<PostResponse> {
        val post = postService.updatePost(postId, request, user.id)
        return ResponseEntity.ok(post)
    }

    @DeleteMapping("/{postId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete a post")
    fun deletePost(
        @PathVariable postId: String,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<Void> {
        postService.deletePost(postId, user.id)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{postId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update post status (admin only)")
    fun updatePostStatus(
        @PathVariable postId: String,
        @Valid @RequestBody request: UpdatePostStatusRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<PostResponse> {
        val post = postService.updatePostStatus(postId, request, user.id)
        return ResponseEntity.ok(post)
    }

    // ================================
    // Post Discovery
    // ================================

    @GetMapping
    @Operation(summary = "Get all posts with pagination")
    fun getPosts(
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<Page<PostSummaryResponse>> {
        val posts = postService.getPosts(pageable)
        return ResponseEntity.ok(posts)
    }

    @GetMapping("/topic/{topic}")
    @Operation(summary = "Get posts by topic")
    fun getPostsByTopic(
        @PathVariable topic: ForumTopic,
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<Page<PostSummaryResponse>> {
        val posts = postService.getPostsByTopic(topic, pageable)
        return ResponseEntity.ok(posts)
    }

    @GetMapping("/author/{authorId}")
    @Operation(summary = "Get posts by author")
    fun getPostsByAuthor(
        @PathVariable authorId: String,
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<Page<PostSummaryResponse>> {
        val posts = postService.getPostsByAuthor(authorId, pageable)
        return ResponseEntity.ok(posts)
    }

    @GetMapping("/pinned")
    @Operation(summary = "Get pinned posts")
    fun getPinnedPosts(
        @RequestParam(required = false) topic: ForumTopic?
    ): ResponseEntity<List<PostSummaryResponse>> {
        val posts = postService.getPinnedPosts(topic)
        return ResponseEntity.ok(posts)
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular posts")
    fun getPopularPosts(
        @PageableDefault(size = 20)
        pageable: Pageable
    ): ResponseEntity<Page<PostSummaryResponse>> {
        val posts = postService.getPopularPosts(pageable)
        return ResponseEntity.ok(posts)
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending posts")
    fun getTrendingPosts(
        @PageableDefault(size = 20)
        pageable: Pageable
    ): ResponseEntity<Page<PostSummaryResponse>> {
        val posts = postService.getTrendingPosts(pageable)
        return ResponseEntity.ok(posts)
    }

    @GetMapping("/search")
    @Operation(summary = "Search posts")
    fun searchPosts(
        @RequestParam q: String,
        @PageableDefault(size = 20)
        pageable: Pageable
    ): ResponseEntity<Page<PostSummaryResponse>> {
        val posts = postService.searchPosts(q, pageable)
        return ResponseEntity.ok(posts)
    }

    @GetMapping("/tags")
    @Operation(summary = "Get posts by tags")
    fun getPostsByTags(
        @RequestParam tags: List<String>,
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<Page<PostSummaryResponse>> {
        val posts = postService.getPostsByTags(tags, pageable)
        return ResponseEntity.ok(posts)
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's posts")
    fun getMyPosts(
        @CurrentUser user: UserPrincipal,
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<Page<PostSummaryResponse>> {
        val posts = postService.getPostsByAuthor(user.id, pageable)
        return ResponseEntity.ok(posts)
    }

    // ================================
    // Like Operations
    // ================================

    @PostMapping("/{postId}/like")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Like a post")
    fun likePost(
        @PathVariable postId: String,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<LikeResponse> {
        val response = postLikeService.likePost(postId, user.id)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/{postId}/like")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Unlike a post")
    fun unlikePost(
        @PathVariable postId: String,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<LikeResponse> {
        val response = postLikeService.unlikePost(postId, user.id)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/{postId}/like/toggle")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Toggle like on a post")
    fun toggleLike(
        @PathVariable postId: String,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<LikeResponse> {
        val response = postLikeService.toggleLike(postId, user.id)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{postId}/likers")
    @Operation(summary = "Get users who liked a post")
    fun getPostLikers(
        @PathVariable postId: String,
        @PageableDefault(size = 20)
        pageable: Pageable
    ): ResponseEntity<Page<LikerResponse>> {
        val likers = postLikeService.getPostLikers(postId, pageable)
        return ResponseEntity.ok(likers)
    }

    // ================================
    // Comment Operations (nested under post)
    // ================================

    @PostMapping("/{postId}/comments")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create a comment on a post")
    fun createComment(
        @PathVariable postId: String,
        @Valid @RequestBody request: CreateCommentRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<CommentResponse> {
        val comment = commentService.createComment(postId, request, user.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(comment)
    }

    @GetMapping("/{postId}/comments")
    @Operation(summary = "Get comments for a post")
    fun getCommentsForPost(
        @PathVariable postId: String,
        @CurrentUser user: UserPrincipal?,
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.ASC)
        pageable: Pageable
    ): ResponseEntity<Page<CommentResponse>> {
        val comments = commentService.getCommentsForPost(postId, user?.id, pageable)
        return ResponseEntity.ok(comments)
    }

    // ================================
    // Statistics
    // ================================

    @GetMapping("/topics/stats")
    @Operation(summary = "Get post count for all topics")
    fun getTopicStats(): ResponseEntity<Map<ForumTopic, Long>> {
        val stats = ForumTopic.entries.associateWith { topic ->
            postService.getTopicPostCount(topic)
        }
        return ResponseEntity.ok(stats)
    }
}
