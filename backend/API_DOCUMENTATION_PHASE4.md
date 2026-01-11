# Nihongo Master API - Phase 4: Community Forum System

## Overview

This document describes the REST API endpoints for the Community Forum system including posts, comments, and likes.

## Base URL

- Development: `http://localhost:8080`
- Production: `https://api.nihongomaster.com`

---

## 1. Post API

### 1.1 Create Post

Creates a new forum post.

**Endpoint:** `POST /api/forum/posts`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Tips for passing JLPT N3",
  "content": "Here are my best tips for passing the JLPT N3 exam...\n\n## Vocabulary\nFocus on the most common words...\n\n## Grammar\nPractice with real test questions...",
  "topic": "JLPT_TIPS",
  "tags": ["jlpt", "n3", "study-tips"]
}
```

**Response (201 Created):**
```json
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "title": "Tips for passing JLPT N3",
  "content": "Here are my best tips for passing the JLPT N3 exam...",
  "topic": "JLPT_TIPS",
  "authorId": "user123",
  "authorUsername": "JohnDoe",
  "authorAvatarUrl": "https://example.com/avatar.jpg",
  "likeCount": 0,
  "commentCount": 0,
  "viewCount": 0,
  "tags": ["jlpt", "n3", "study-tips"],
  "isPinned": false,
  "isLocked": false,
  "status": "ACTIVE",
  "isLikedByCurrentUser": false,
  "canEdit": true,
  "canDelete": true,
  "createdAt": "2024-01-25T10:00:00Z",
  "updatedAt": "2024-01-25T10:00:00Z"
}
```

### 1.2 Get Post

Returns a post by ID.

**Endpoint:** `GET /api/forum/posts/{postId}`

**Response (200 OK):** Same as Create Post response.

### 1.3 Get Post with Comments

Returns a post along with its comments.

**Endpoint:** `GET /api/forum/posts/{postId}/with-comments`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | Integer | Comment page number (default: 0) |
| `size` | Integer | Comment page size (default: 20) |

**Response (200 OK):**
```json
{
  "post": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Tips for passing JLPT N3",
    "content": "Here are my best tips...",
    "topic": "JLPT_TIPS",
    "authorId": "user123",
    "authorUsername": "JohnDoe",
    "authorAvatarUrl": "https://example.com/avatar.jpg",
    "likeCount": 15,
    "commentCount": 8,
    "viewCount": 234,
    "tags": ["jlpt", "n3", "study-tips"],
    "isPinned": false,
    "isLocked": false,
    "status": "ACTIVE",
    "isLikedByCurrentUser": true,
    "canEdit": false,
    "canDelete": false,
    "createdAt": "2024-01-25T10:00:00Z",
    "updatedAt": "2024-01-25T12:30:00Z"
  },
  "comments": [
    {
      "id": "65g2b3c4d5e6f7g8h9i0j1k2",
      "postId": "65f1a2b3c4d5e6f7g8h9i0j1",
      "authorId": "user456",
      "authorUsername": "JaneDoe",
      "authorAvatarUrl": null,
      "content": "Great tips! This helped me a lot.",
      "parentCommentId": null,
      "likeCount": 5,
      "replyCount": 2,
      "isEdited": false,
      "status": "ACTIVE",
      "isLikedByCurrentUser": false,
      "canEdit": false,
      "canDelete": false,
      "createdAt": "2024-01-25T11:00:00Z",
      "updatedAt": "2024-01-25T11:00:00Z",
      "replies": null
    }
  ],
  "totalComments": 8,
  "hasMoreComments": false
}
```

### 1.4 Update Post

**Endpoint:** `PUT /api/forum/posts/{postId}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated: Tips for passing JLPT N3",
  "content": "Updated content with more tips...",
  "tags": ["jlpt", "n3", "study-tips", "updated"]
}
```

### 1.5 Delete Post

Soft deletes a post.

**Endpoint:** `DELETE /api/forum/posts/{postId}`

**Headers:** `Authorization: Bearer <token>`

**Response (204 No Content)**

### 1.6 Update Post Status (Admin Only)

**Endpoint:** `PUT /api/forum/posts/{postId}/status`

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "status": "HIDDEN",
  "isPinned": true,
  "isLocked": false
}
```

---

## 2. Post Discovery API

### 2.1 Get All Posts

Returns paginated list of posts.

**Endpoint:** `GET /api/forum/posts`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | Integer | Page number (default: 0) |
| `size` | Integer | Page size (default: 20) |
| `sort` | String | Sort field (default: createdAt,desc) |

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "title": "Tips for passing JLPT N3",
      "contentPreview": "Here are my best tips for passing the JLPT N3 exam. Focus on vocabulary and grammar...",
      "topic": "JLPT_TIPS",
      "authorId": "user123",
      "authorUsername": "JohnDoe",
      "authorAvatarUrl": "https://example.com/avatar.jpg",
      "likeCount": 15,
      "commentCount": 8,
      "viewCount": 234,
      "tags": ["jlpt", "n3", "study-tips"],
      "isPinned": false,
      "isLocked": false,
      "createdAt": "2024-01-25T10:00:00Z",
      "updatedAt": "2024-01-25T12:30:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 45,
  "totalPages": 3,
  "first": true,
  "last": false,
  "hasNext": true,
  "hasPrevious": false
}
```

### 2.2 Get Posts by Topic

**Endpoint:** `GET /api/forum/posts/topic/{topic}`

**Path Parameters:**
- `topic`: Forum topic (see Forum Topics enum)

### 2.3 Get Posts by Author

**Endpoint:** `GET /api/forum/posts/author/{authorId}`

### 2.4 Get Pinned Posts

**Endpoint:** `GET /api/forum/posts/pinned`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `topic` | String | Optional topic filter |

**Response (200 OK):** List of PostSummaryResponse

### 2.5 Get Popular Posts

**Endpoint:** `GET /api/forum/posts/popular`

### 2.6 Get Trending Posts

**Endpoint:** `GET /api/forum/posts/trending`

Returns posts with high engagement in the last 7 days.

### 2.7 Search Posts

**Endpoint:** `GET /api/forum/posts/search?q={query}`

### 2.8 Get Posts by Tags

**Endpoint:** `GET /api/forum/posts/tags?tags=jlpt,n3`

### 2.9 Get My Posts

**Endpoint:** `GET /api/forum/posts/my`

**Headers:** `Authorization: Bearer <token>`

---

## 3. Like API

### 3.1 Like a Post

**Endpoint:** `POST /api/forum/posts/{postId}/like`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "postId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "isLiked": true,
  "likeCount": 16,
  "message": "Post liked successfully"
}
```

### 3.2 Unlike a Post

**Endpoint:** `DELETE /api/forum/posts/{postId}/like`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "postId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "isLiked": false,
  "likeCount": 15,
  "message": "Post unliked successfully"
}
```

### 3.3 Toggle Like

**Endpoint:** `POST /api/forum/posts/{postId}/like/toggle`

**Headers:** `Authorization: Bearer <token>`

Toggles the like status. Returns the same response as like/unlike.

### 3.4 Get Post Likers

**Endpoint:** `GET /api/forum/posts/{postId}/likers`

**Response (200 OK):**
```json
{
  "content": [
    {
      "userId": "user456",
      "username": "JaneDoe",
      "likedAt": "2024-01-25T11:30:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 15,
  "totalPages": 1
}
```

---

## 4. Comment API

### 4.1 Create Comment

**Endpoint:** `POST /api/forum/posts/{postId}/comments`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Great tips! This helped me a lot.",
  "parentCommentId": null
}
```

**For a reply:**
```json
{
  "content": "Thank you! Glad it helped.",
  "parentCommentId": "65g2b3c4d5e6f7g8h9i0j1k2"
}
```

**Response (201 Created):**
```json
{
  "id": "65g2b3c4d5e6f7g8h9i0j1k2",
  "postId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "authorId": "user456",
  "authorUsername": "JaneDoe",
  "authorAvatarUrl": null,
  "content": "Great tips! This helped me a lot.",
  "parentCommentId": null,
  "likeCount": 0,
  "replyCount": 0,
  "isEdited": false,
  "status": "ACTIVE",
  "isLikedByCurrentUser": false,
  "canEdit": true,
  "canDelete": true,
  "createdAt": "2024-01-25T11:00:00Z",
  "updatedAt": "2024-01-25T11:00:00Z",
  "replies": null
}
```

### 4.2 Get Comments for Post

**Endpoint:** `GET /api/forum/posts/{postId}/comments`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | Integer | Page number (default: 0) |
| `size` | Integer | Page size (default: 20) |

### 4.3 Get Comment by ID

**Endpoint:** `GET /api/forum/comments/{commentId}`

### 4.4 Update Comment

**Endpoint:** `PUT /api/forum/comments/{commentId}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Updated: Great tips! This really helped me pass."
}
```

### 4.5 Delete Comment

**Endpoint:** `DELETE /api/forum/comments/{commentId}`

**Headers:** `Authorization: Bearer <token>`

**Response (204 No Content)**

### 4.6 Get Replies to Comment

**Endpoint:** `GET /api/forum/comments/{commentId}/replies`

### 4.7 Like a Comment

**Endpoint:** `POST /api/forum/comments/{commentId}/like`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "commentId": "65g2b3c4d5e6f7g8h9i0j1k2",
  "isLiked": true,
  "likeCount": 6,
  "message": "Comment liked successfully"
}
```

### 4.8 Unlike a Comment

**Endpoint:** `DELETE /api/forum/comments/{commentId}/like`

### 4.9 Get User's Comments

**Endpoint:** `GET /api/forum/comments/user/{userId}`

### 4.10 Get My Comments

**Endpoint:** `GET /api/forum/comments/my`

**Headers:** `Authorization: Bearer <token>`

---

## 5. Statistics API

### 5.1 Get Topic Statistics

**Endpoint:** `GET /api/forum/posts/topics/stats`

**Response (200 OK):**
```json
{
  "JLPT_TIPS": 45,
  "LEARNING_RESOURCES": 32,
  "JAPAN_CULTURE": 28,
  "TRAVEL": 15,
  "GRAMMAR_QUESTIONS": 67,
  "VOCABULARY_HELP": 43,
  "PRACTICE_PARTNERS": 12,
  "SUCCESS_STORIES": 8,
  "GENERAL_DISCUSSION": 54,
  "ANNOUNCEMENTS": 5,
  "FEEDBACK": 11
}
```

---

## Enums Reference

### Forum Topics
| Value | Description |
|-------|-------------|
| `JLPT_TIPS` | JLPT exam preparation tips |
| `LEARNING_RESOURCES` | Study materials and resources |
| `JAPAN_CULTURE` | Japanese culture discussions |
| `TRAVEL` | Travel to Japan |
| `GRAMMAR_QUESTIONS` | Grammar help and questions |
| `VOCABULARY_HELP` | Vocabulary discussions |
| `PRACTICE_PARTNERS` | Finding study partners |
| `SUCCESS_STORIES` | Learning achievements |
| `GENERAL_DISCUSSION` | General topics |
| `ANNOUNCEMENTS` | Official announcements (admin only) |
| `FEEDBACK` | App feedback and suggestions |

### Post Status
| Value | Description |
|-------|-------------|
| `ACTIVE` | Normal, visible post |
| `HIDDEN` | Hidden by moderator |
| `DELETED` | Soft deleted |

### Comment Status
| Value | Description |
|-------|-------------|
| `ACTIVE` | Normal, visible comment |
| `HIDDEN` | Hidden by moderator |
| `DELETED` | Soft deleted |

---

## Permission Rules

### Posts
- **Create**: Any authenticated user (except ANNOUNCEMENTS topic - admin only)
- **Read**: Anyone (public posts)
- **Update**: Author or Admin
- **Delete**: Author or Admin
- **Pin/Lock**: Admin only

### Comments
- **Create**: Any authenticated user (if post is not locked)
- **Read**: Anyone
- **Update**: Author or Admin
- **Delete**: Author or Admin

### Likes
- **Like/Unlike**: Any authenticated user
- One like per user per post/comment

---

## cURL Examples

### Create Post
```bash
curl -X POST http://localhost:8080/api/forum/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "My JLPT N3 Study Plan",
    "content": "Here is my 3-month study plan for JLPT N3...",
    "topic": "JLPT_TIPS",
    "tags": ["jlpt", "n3", "study-plan"]
  }'
```

### Get Posts by Topic
```bash
curl -X GET "http://localhost:8080/api/forum/posts/topic/JLPT_TIPS?page=0&size=10"
```

### Like a Post
```bash
curl -X POST http://localhost:8080/api/forum/posts/65f1a2b3c4d5e6f7g8h9i0j1/like \
  -H "Authorization: Bearer <token>"
```

### Create Comment
```bash
curl -X POST http://localhost:8080/api/forum/posts/65f1a2b3c4d5e6f7g8h9i0j1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "content": "Thanks for sharing! Very helpful.",
    "parentCommentId": null
  }'
```

### Create Reply
```bash
curl -X POST http://localhost:8080/api/forum/posts/65f1a2b3c4d5e6f7g8h9i0j1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "content": "You are welcome!",
    "parentCommentId": "65g2b3c4d5e6f7g8h9i0j1k2"
  }'
```

### Search Posts
```bash
curl -X GET "http://localhost:8080/api/forum/posts/search?q=JLPT%20tips"
```

### Toggle Like
```bash
curl -X POST http://localhost:8080/api/forum/posts/65f1a2b3c4d5e6f7g8h9i0j1/like/toggle \
  -H "Authorization: Bearer <token>"
```

### Update Post (Admin - Pin a Post)
```bash
curl -X PUT http://localhost:8080/api/forum/posts/65f1a2b3c4d5e6f7g8h9i0j1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "status": "ACTIVE",
    "isPinned": true,
    "isLocked": false
  }'
```
