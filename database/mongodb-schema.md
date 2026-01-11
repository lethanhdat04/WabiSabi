# Nihongo Master - MongoDB Database Schema Design

## Overview

This document defines the MongoDB database schema for the Nihongo Master Japanese learning platform. The design follows MongoDB best practices including:

- **Embedded documents** for data accessed together
- **References** for large or frequently updated data
- **Appropriate indexes** for query optimization
- **Schema validation** for data integrity

## Database Configuration

```javascript
// Database: nihongo_master
// Replica Set recommended for production
// Read Preference: primaryPreferred
// Write Concern: majority
```

---

## Collections

### 1. Users Collection

Stores user account information, preferences, and progress tracking.

```javascript
// Collection: users
{
  _id: ObjectId,

  // Authentication
  email: String,                    // Unique, indexed
  username: String,                 // Unique, indexed, 3-30 chars
  passwordHash: String,             // bcrypt hashed

  // Profile
  displayName: String,              // 1-50 chars
  avatarUrl: String,
  bio: String,                      // Max 500 chars

  // Account Settings
  role: String,                     // enum: "USER", "PREMIUM", "ADMIN"
  nativeLanguage: String,           // ISO 639-1 code (e.g., "vi", "en")
  targetLevel: String,              // enum: "N5", "N4", "N3", "N2", "N1"

  // Preferences (embedded)
  preferences: {
    notificationsEnabled: Boolean,
    emailReminders: Boolean,
    reviewTime: String,             // HH:mm format
    interfaceLanguage: String,      // "en", "vi", "ja"
    showFurigana: Boolean,
    autoPlayAudio: Boolean,
    dailyGoalMinutes: Number        // Default: 15
  },

  // Progress Summary (denormalized for quick access)
  progress: {
    listeningScore: Number,         // 0-100
    speakingScore: Number,          // 0-100
    vocabularyScore: Number,        // 0-100
    totalXP: Number,                // Gamification points
    streak: Number,                 // Consecutive days
    longestStreak: Number,
    lastPracticeDate: Date,
    totalVideosCompleted: Number,
    totalVocabMastered: Number,
    totalPracticeMinutes: Number
  },

  // Social
  followersCount: Number,
  followingCount: Number,

  // Status
  emailVerified: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  lastActiveAt: Date
}

// Indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "targetLevel": 1 });
db.users.createIndex({ "lastActiveAt": -1 });
db.users.createIndex({ "progress.totalXP": -1 });  // For leaderboards
db.users.createIndex({ "createdAt": -1 });

// Schema Validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "username", "passwordHash", "role", "createdAt"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        username: {
          bsonType: "string",
          minLength: 3,
          maxLength: 30
        },
        role: {
          enum: ["USER", "PREMIUM", "ADMIN"]
        },
        targetLevel: {
          enum: ["N5", "N4", "N3", "N2", "N1", null]
        }
      }
    }
  }
});
```

### 2. Videos Collection

Stores video content with embedded transcripts for shadowing/dictation practice.

```javascript
// Collection: videos
{
  _id: ObjectId,

  // Basic Info
  title: String,                    // Vietnamese/English title
  titleJapanese: String,            // Japanese title
  description: String,

  // Source
  youtubeId: String,                // Unique, indexed
  thumbnailUrl: String,
  duration: Number,                 // Duration in seconds

  // Classification
  category: String,                 // enum: see below
  level: String,                    // JLPT level
  tags: [String],                   // Array of tag strings

  // Transcript (embedded for atomic reads)
  transcript: {
    fullText: String,               // Complete Japanese text
    fullTextRomaji: String,         // Romanized version
    language: String,               // "ja"
    generatedAt: Date,
    segments: [
      {
        index: Number,              // Segment order
        startTime: Number,          // Seconds (e.g., 0.5)
        endTime: Number,            // Seconds (e.g., 3.2)
        text: String,               // Japanese text
        textRomaji: String,         // Romanized
        translation: String,        // Vietnamese/English
        vocabulary: [String]        // Key vocabulary words
      }
    ]
  },

  // Metadata
  uploadedBy: ObjectId,             // Reference to users
  isOfficial: Boolean,              // Admin-uploaded content
  status: String,                   // enum: "DRAFT", "PUBLISHED", "ARCHIVED", "DELETED"

  // Statistics (denormalized)
  stats: {
    viewCount: Number,
    practiceCount: Number,
    averageScore: Number,           // Average user score
    totalRatings: Number,
    averageRating: Number           // 1-5 stars
  },

  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.videos.createIndex({ "youtubeId": 1 }, { unique: true });
db.videos.createIndex({ "category": 1, "level": 1 });
db.videos.createIndex({ "level": 1, "createdAt": -1 });
db.videos.createIndex({ "tags": 1 });
db.videos.createIndex({ "status": 1, "createdAt": -1 });
db.videos.createIndex({ "stats.practiceCount": -1 });  // Popular videos
db.videos.createIndex({ "title": "text", "titleJapanese": "text", "description": "text" });  // Text search

// Category enum values
const VIDEO_CATEGORIES = [
  "DAILY_LIFE",
  "BUSINESS",
  "ANIME",
  "NEWS",
  "TRAVEL",
  "CULTURE",
  "EDUCATION",
  "MUSIC",
  "INTERVIEW",
  "OTHER"
];
```

### 3. Decks Collection

Stores vocabulary decks with embedded sections and vocabulary items.

```javascript
// Collection: decks
{
  _id: ObjectId,

  // Basic Info
  title: String,                    // Max 100 chars
  description: String,              // Max 500 chars
  coverImageUrl: String,

  // Classification
  level: String,                    // JLPT level
  category: String,                 // e.g., "Grammar", "Travel", "Business"
  tags: [String],

  // Ownership
  creatorId: ObjectId,              // Reference to users
  isPublic: Boolean,                // Visible to all users
  isOfficial: Boolean,              // Admin/curated content
  forkedFrom: ObjectId,             // Original deck if forked

  // Sections with embedded vocabulary
  sections: [
    {
      _id: ObjectId,                // Section ID
      title: String,                // e.g., "Unit 1", "Greetings"
      orderIndex: Number,
      vocabulary: [
        {
          _id: ObjectId,            // Vocabulary item ID
          word: String,             // Japanese word/kanji
          reading: String,          // Hiragana reading
          meaning: String,          // English meaning
          meaningVi: String,        // Vietnamese meaning
          partOfSpeech: String,     // e.g., "noun", "verb", "adjective"
          exampleSentence: String,  // Japanese example
          exampleReading: String,   // Example in hiragana
          exampleTranslation: String,
          audioUrl: String,         // Pronunciation audio
          imageUrl: String,         // Visual aid
          jlptLevel: String,
          notes: String,            // Additional notes
          orderIndex: Number
        }
      ]
    }
  ],

  // Statistics
  stats: {
    totalItems: Number,             // Total vocabulary count
    forkCount: Number,
    starCount: Number,
    studyCount: Number              // How many users studied
  },

  // Status
  status: String,                   // "DRAFT", "PUBLISHED", "ARCHIVED"

  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.decks.createIndex({ "creatorId": 1, "status": 1 });
db.decks.createIndex({ "isPublic": 1, "level": 1, "category": 1 });
db.decks.createIndex({ "isPublic": 1, "stats.studyCount": -1 });  // Popular decks
db.decks.createIndex({ "isOfficial": 1, "level": 1 });
db.decks.createIndex({ "tags": 1 });
db.decks.createIndex({ "title": "text", "description": "text" });  // Text search
db.decks.createIndex({ "forkedFrom": 1 });

// Note: For decks with many vocabulary items (>100), consider splitting
// vocabulary into a separate collection with deck reference
```

### 4. Practice Sessions Collection

Tracks user practice history for videos.

```javascript
// Collection: practice_sessions
{
  _id: ObjectId,

  // References
  userId: ObjectId,                 // Indexed
  videoId: ObjectId,                // Indexed

  // Session Info
  mode: String,                     // "SHADOWING", "DICTATION"
  startedAt: Date,
  completedAt: Date,                // Null if incomplete
  duration: Number,                 // Total seconds

  // Practice Attempts (embedded, typically 5-20 per session)
  attempts: [
    {
      segmentIndex: Number,
      recordingUrl: String,         // Cloud storage URL
      transcribedText: String,      // AI transcription result

      // Scores (0-100)
      pronunciationScore: Number,
      speedScore: Number,
      intonationScore: Number,
      overallScore: Number,

      // Detailed Analysis
      phonemeAnalysis: [
        {
          phoneme: String,
          expected: String,
          actual: String,
          score: Number
        }
      ],

      timestamp: Date
    }
  ],

  // Overall Results
  overallScore: Number,             // Average of all attempts
  segmentsCompleted: Number,
  totalSegments: Number,

  // AI Feedback (embedded)
  feedback: {
    overallAssessment: String,
    strengths: [String],
    improvements: [String],
    specificTips: [String],
    recommendedPractice: [String],
    generatedAt: Date
  },

  // Status
  status: String                    // "IN_PROGRESS", "COMPLETED", "ABANDONED"
}

// Indexes
db.practice_sessions.createIndex({ "userId": 1, "startedAt": -1 });
db.practice_sessions.createIndex({ "userId": 1, "videoId": 1 });
db.practice_sessions.createIndex({ "userId": 1, "status": 1 });
db.practice_sessions.createIndex({ "videoId": 1, "completedAt": -1 });
db.practice_sessions.createIndex({ "startedAt": -1 });  // For cleanup

// TTL Index for incomplete sessions (auto-delete after 7 days)
db.practice_sessions.createIndex(
  { "startedAt": 1 },
  { expireAfterSeconds: 604800, partialFilterExpression: { status: "IN_PROGRESS" } }
);
```

### 5. Review Items Collection

Stores spaced repetition data using SM-2 algorithm.

```javascript
// Collection: review_items
{
  _id: ObjectId,

  // References
  userId: ObjectId,                 // Indexed
  itemType: String,                 // "VOCABULARY", "VIDEO_SEGMENT"
  itemId: ObjectId,                 // Reference to deck vocabulary or video

  // Additional context
  deckId: ObjectId,                 // If vocabulary
  sectionId: ObjectId,              // If vocabulary
  segmentIndex: Number,             // If video segment

  // SM-2 Algorithm Fields
  easeFactor: Number,               // Default: 2.5, min: 1.3
  interval: Number,                 // Days until next review
  repetitions: Number,              // Successful reviews in a row

  // Scheduling
  nextReviewDate: Date,             // Indexed
  lastReviewDate: Date,

  // History (last 10 reviews)
  history: [
    {
      reviewDate: Date,
      quality: Number,              // 0-5 rating
      responseTimeMs: Number,       // How long to answer
      previousInterval: Number
    }
  ],

  // Status
  status: String,                   // "ACTIVE", "PAUSED", "MASTERED"

  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.review_items.createIndex({ "userId": 1, "nextReviewDate": 1 });  // Primary query
db.review_items.createIndex({ "userId": 1, "itemType": 1, "itemId": 1 }, { unique: true });
db.review_items.createIndex({ "userId": 1, "deckId": 1 });
db.review_items.createIndex({ "userId": 1, "status": 1 });
db.review_items.createIndex({ "nextReviewDate": 1 });  // For batch processing
```

### 6. Posts Collection

Forum posts for community interaction.

```javascript
// Collection: posts
{
  _id: ObjectId,

  // Author
  authorId: ObjectId,               // Reference to users

  // Content
  title: String,                    // Max 200 chars
  content: String,                  // Markdown, max 10000 chars
  contentHtml: String,              // Pre-rendered HTML

  // Classification
  category: String,                 // "jlpt-tips", "travel", "anime", etc.
  tags: [String],                   // Max 5 tags

  // Attachments
  attachments: [
    {
      type: String,                 // "image", "link", "deck", "video"
      url: String,
      fileName: String,
      fileSize: Number,
      referenceId: ObjectId         // If deck or video reference
    }
  ],

  // Engagement (denormalized)
  likeCount: Number,
  commentCount: Number,
  viewCount: Number,

  // Users who liked (for quick lookup)
  likedBy: [ObjectId],              // Store recent 1000, then use separate collection

  // Moderation
  status: String,                   // "PUBLISHED", "FLAGGED", "DELETED"
  isPinned: Boolean,
  reportCount: Number,

  // SEO
  slug: String,                     // URL-friendly title

  createdAt: Date,
  updatedAt: Date,
  lastActivityAt: Date              // Last comment or edit
}

// Indexes
db.posts.createIndex({ "authorId": 1, "createdAt": -1 });
db.posts.createIndex({ "category": 1, "status": 1, "createdAt": -1 });
db.posts.createIndex({ "category": 1, "status": 1, "likeCount": -1 });  // Popular
db.posts.createIndex({ "tags": 1, "status": 1 });
db.posts.createIndex({ "status": 1, "reportCount": -1 });  // Moderation queue
db.posts.createIndex({ "slug": 1 }, { unique: true });
db.posts.createIndex({ "title": "text", "content": "text" });  // Text search
db.posts.createIndex({ "isPinned": -1, "createdAt": -1 });
```

### 7. Comments Collection

Comments on forum posts (separate collection for scalability).

```javascript
// Collection: comments
{
  _id: ObjectId,

  // References
  postId: ObjectId,                 // Indexed
  authorId: ObjectId,
  parentId: ObjectId,               // For nested replies, null if top-level

  // Content
  content: String,                  // Max 2000 chars
  contentHtml: String,              // Pre-rendered

  // Engagement
  likeCount: Number,
  likedBy: [ObjectId],              // Users who liked

  // Moderation
  status: String,                   // "PUBLISHED", "FLAGGED", "DELETED"
  reportCount: Number,

  // Threading
  depth: Number,                    // 0 for top-level, max 3
  replyCount: Number,               // Direct replies

  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.comments.createIndex({ "postId": 1, "status": 1, "createdAt": 1 });
db.comments.createIndex({ "postId": 1, "parentId": 1, "createdAt": 1 });
db.comments.createIndex({ "authorId": 1, "createdAt": -1 });
db.comments.createIndex({ "status": 1, "reportCount": -1 });  // Moderation
```

### 8. Achievements Collection

Achievement definitions (mostly static).

```javascript
// Collection: achievements
{
  _id: ObjectId,

  // Definition
  code: String,                     // Unique identifier, e.g., "STREAK_7"
  name: String,                     // Display name
  description: String,

  // Visual
  iconUrl: String,
  badgeColor: String,               // Hex color

  // Criteria
  type: String,                     // "STREAK", "VIDEOS_COMPLETED", etc.
  threshold: Number,                // Required value to unlock

  // Rewards
  xpReward: Number,

  // Display
  isSecret: Boolean,                // Hidden until unlocked
  orderIndex: Number,               // Display order

  createdAt: Date
}

// Indexes
db.achievements.createIndex({ "code": 1 }, { unique: true });
db.achievements.createIndex({ "type": 1, "threshold": 1 });
```

### 9. User Achievements Collection

Tracks user achievement progress and unlocks.

```javascript
// Collection: user_achievements
{
  _id: ObjectId,

  userId: ObjectId,
  achievementId: ObjectId,

  // Progress
  progress: Number,                 // Current progress toward threshold
  isUnlocked: Boolean,
  unlockedAt: Date,                 // Null if not unlocked

  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.user_achievements.createIndex({ "userId": 1, "achievementId": 1 }, { unique: true });
db.user_achievements.createIndex({ "userId": 1, "isUnlocked": 1 });
db.user_achievements.createIndex({ "unlockedAt": -1 });  // Recent unlocks
```

### 10. Notifications Collection

User notifications with TTL for auto-cleanup.

```javascript
// Collection: notifications
{
  _id: ObjectId,

  userId: ObjectId,                 // Recipient

  // Content
  type: String,                     // "REVIEW_REMINDER", "ACHIEVEMENT", "COMMENT", etc.
  title: String,
  message: String,

  // Additional data
  data: {
    postId: ObjectId,               // If post-related
    commentId: ObjectId,            // If comment-related
    achievementId: ObjectId,        // If achievement
    fromUserId: ObjectId,           // If from another user
    actionUrl: String               // Deep link
  },

  // Status
  isRead: Boolean,
  readAt: Date,

  createdAt: Date
}

// Indexes
db.notifications.createIndex({ "userId": 1, "isRead": 1, "createdAt": -1 });
db.notifications.createIndex({ "userId": 1, "createdAt": -1 });

// TTL Index - auto-delete after 30 days
db.notifications.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 2592000 });
```

### 11. User Follows Collection

Social follow relationships.

```javascript
// Collection: user_follows
{
  _id: ObjectId,

  followerId: ObjectId,             // User who follows
  followingId: ObjectId,            // User being followed

  createdAt: Date
}

// Indexes
db.user_follows.createIndex({ "followerId": 1, "followingId": 1 }, { unique: true });
db.user_follows.createIndex({ "followingId": 1, "createdAt": -1 });  // Get followers
db.user_follows.createIndex({ "followerId": 1, "createdAt": -1 });   // Get following
```

### 12. Deck Stars Collection

Users starring decks (bookmarks).

```javascript
// Collection: deck_stars
{
  _id: ObjectId,

  userId: ObjectId,
  deckId: ObjectId,

  createdAt: Date
}

// Indexes
db.deck_stars.createIndex({ "userId": 1, "deckId": 1 }, { unique: true });
db.deck_stars.createIndex({ "userId": 1, "createdAt": -1 });
db.deck_stars.createIndex({ "deckId": 1 });  // Count stars per deck
```

### 13. Reports Collection

Content reports for moderation.

```javascript
// Collection: reports
{
  _id: ObjectId,

  // Reporter
  reporterId: ObjectId,

  // Target
  targetType: String,               // "POST", "COMMENT", "DECK", "USER"
  targetId: ObjectId,

  // Details
  reason: String,                   // "SPAM", "HARASSMENT", "INAPPROPRIATE", etc.
  details: String,                  // Optional description

  // Resolution
  status: String,                   // "PENDING", "REVIEWED", "RESOLVED", "DISMISSED"
  reviewedBy: ObjectId,             // Admin who reviewed
  reviewedAt: Date,
  resolution: String,               // Action taken

  createdAt: Date
}

// Indexes
db.reports.createIndex({ "status": 1, "createdAt": 1 });  // Pending reports
db.reports.createIndex({ "targetType": 1, "targetId": 1 });
db.reports.createIndex({ "reporterId": 1, "createdAt": -1 });
```

### 14. Weekly Reports Collection

Pre-generated weekly progress reports.

```javascript
// Collection: weekly_reports
{
  _id: ObjectId,

  userId: ObjectId,
  weekStartDate: Date,              // Monday of the week
  weekEndDate: Date,

  // Statistics
  stats: {
    practiceMinutes: Number,
    videosCompleted: Number,
    vocabReviewed: Number,
    newVocabLearned: Number,
    averageAccuracy: Number,
    streakDays: Number,
    xpEarned: Number
  },

  // Comparisons
  comparison: {
    practiceMinutesChange: Number,  // % change from previous week
    accuracyChange: Number
  },

  // Recommendations
  recommendations: [String],

  generatedAt: Date
}

// Indexes
db.weekly_reports.createIndex({ "userId": 1, "weekStartDate": -1 });
db.weekly_reports.createIndex({ "weekStartDate": -1 });
```

---

## Relationships Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     RELATIONSHIP DIAGRAM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  users ─────┬──< practice_sessions >── videos                   │
│      │      │                                                   │
│      │      ├──< review_items                                   │
│      │      │                                                   │
│      │      ├──< decks                                          │
│      │      │                                                   │
│      │      ├──< posts                                          │
│      │      │        │                                          │
│      │      │        └──< comments                              │
│      │      │                                                   │
│      │      ├──< notifications                                  │
│      │      │                                                   │
│      │      ├──< user_achievements >── achievements             │
│      │      │                                                   │
│      │      ├──< deck_stars >── decks                           │
│      │      │                                                   │
│      │      └──< user_follows >── users                         │
│      │                                                          │
│      └──< weekly_reports                                        │
│                                                                 │
│  reports ──> (posts | comments | decks | users)                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Legend:
  ──<  One-to-Many
  >──  Many-to-One (reference)
```

---

## Index Strategy Summary

| Collection | Primary Query Pattern | Key Indexes |
|------------|----------------------|-------------|
| users | By email/username, leaderboards | email, username, progress.totalXP |
| videos | By category/level, search | category+level, text search |
| decks | User's decks, public browse | creatorId, isPublic+level |
| practice_sessions | User history | userId+startedAt |
| review_items | Due items for user | userId+nextReviewDate |
| posts | Category listing, search | category+status+createdAt, text |
| comments | Post comments | postId+status+createdAt |
| notifications | Unread for user | userId+isRead+createdAt |

---

## Data Migration Notes

1. **Initial Setup**: Run index creation scripts before importing data
2. **Bulk Import**: Use `insertMany` with `ordered: false` for parallel processing
3. **Schema Validation**: Apply validation after initial import to avoid blocking inserts
4. **Sharding Consideration**: If scaling beyond single server:
   - Shard key for `practice_sessions`: `{ userId: "hashed" }`
   - Shard key for `review_items`: `{ userId: "hashed" }`

---

## Sample Document Examples

### Sample User Document

```javascript
{
  _id: ObjectId("64a7b8c9d1e2f3a4b5c6d7e8"),
  email: "tanaka@example.com",
  username: "tanaka_learner",
  passwordHash: "$2b$12$...",
  displayName: "Tanaka",
  avatarUrl: "https://cdn.nihongomaster.com/avatars/tanaka.jpg",
  role: "USER",
  nativeLanguage: "vi",
  targetLevel: "N3",
  preferences: {
    notificationsEnabled: true,
    emailReminders: true,
    reviewTime: "09:00",
    interfaceLanguage: "vi",
    showFurigana: true,
    autoPlayAudio: true,
    dailyGoalMinutes: 30
  },
  progress: {
    listeningScore: 72,
    speakingScore: 65,
    vocabularyScore: 78,
    totalXP: 15420,
    streak: 14,
    longestStreak: 30,
    lastPracticeDate: ISODate("2024-01-15T08:30:00Z"),
    totalVideosCompleted: 45,
    totalVocabMastered: 890,
    totalPracticeMinutes: 2340
  },
  followersCount: 23,
  followingCount: 15,
  emailVerified: true,
  isActive: true,
  createdAt: ISODate("2023-06-01T10:00:00Z"),
  updatedAt: ISODate("2024-01-15T08:30:00Z"),
  lastActiveAt: ISODate("2024-01-15T08:30:00Z")
}
```

### Sample Vocabulary Item in Deck

```javascript
{
  _id: ObjectId("64a7b8c9d1e2f3a4b5c6d7e9"),
  word: "勉強",
  reading: "べんきょう",
  meaning: "study, learning",
  meaningVi: "học tập",
  partOfSpeech: "noun, suru verb",
  exampleSentence: "毎日日本語を勉強しています。",
  exampleReading: "まいにちにほんごをべんきょうしています。",
  exampleTranslation: "I study Japanese every day.",
  audioUrl: "https://cdn.nihongomaster.com/audio/benkyo.mp3",
  imageUrl: "https://cdn.nihongomaster.com/images/study.jpg",
  jlptLevel: "N5",
  notes: "Common word used in educational contexts",
  orderIndex: 1
}
```
