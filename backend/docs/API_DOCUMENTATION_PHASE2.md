# Nihongo Master API - Phase 2: Video Library & Practice

## Overview

This document describes the REST API endpoints for the Video Library, Shadowing Practice, and Dictation Practice features.

## Base URL

- Development: `http://localhost:8080`
- Production: `https://api.nihongomaster.com`

---

## 1. Video Library API

### 1.1 Get All Videos

Returns paginated list of videos with optional filtering.

**Endpoint:** `GET /api/videos`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | String | Filter by category (DAILY_LIFE, BUSINESS, ANIME, etc.) |
| `level` | String | Filter by JLPT level (N5, N4, N3, N2, N1) |
| `tag` | String | Filter by tag |
| `official` | Boolean | Filter official content only |
| `page` | Integer | Page number (default: 0) |
| `size` | Integer | Page size (default: 12) |
| `sort` | String | Sort field (default: createdAt,desc) |

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Daily Greetings in Japanese",
      "titleJapanese": "日本語の挨拶",
      "youtubeId": "dQw4w9WgXcQ",
      "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      "duration": 180,
      "category": "DAILY_LIFE",
      "level": "N5",
      "segmentCount": 12,
      "isOfficial": true,
      "stats": {
        "viewCount": 1250,
        "practiceCount": 340,
        "shadowingCount": 200,
        "dictationCount": 140,
        "averageScore": 75.5,
        "totalRatings": 45,
        "averageRating": 4.5
      }
    }
  ],
  "page": 0,
  "size": 12,
  "totalElements": 45,
  "totalPages": 4,
  "first": true,
  "last": false,
  "hasNext": true,
  "hasPrevious": false
}
```

### 1.2 Get Video by ID

Returns full video details including all subtitle segments.

**Endpoint:** `GET /api/videos/{videoId}`

**Response (200 OK):**
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "title": "Daily Greetings in Japanese",
  "titleJapanese": "日本語の挨拶",
  "description": "Learn common Japanese greetings used in daily life.",
  "youtubeId": "dQw4w9WgXcQ",
  "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "duration": 180,
  "category": "DAILY_LIFE",
  "level": "N5",
  "tags": ["greetings", "beginner", "daily-life"],
  "subtitles": [
    {
      "index": 0,
      "japaneseText": "おはようございます",
      "romaji": "ohayou gozaimasu",
      "meaning": "Good morning (polite)",
      "startTime": 5.0,
      "endTime": 8.5,
      "duration": 3.5,
      "vocabulary": ["おはよう", "ございます"]
    },
    {
      "index": 1,
      "japaneseText": "こんにちは",
      "romaji": "konnichiwa",
      "meaning": "Hello / Good afternoon",
      "startTime": 10.0,
      "endTime": 12.5,
      "duration": 2.5,
      "vocabulary": ["こんにちは"]
    }
  ],
  "segmentCount": 12,
  "uploadedBy": "admin123",
  "isOfficial": true,
  "status": "PUBLISHED",
  "stats": {
    "viewCount": 1251,
    "practiceCount": 340,
    "shadowingCount": 200,
    "dictationCount": 140,
    "averageScore": 75.5,
    "totalRatings": 45,
    "averageRating": 4.5
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 1.3 Get Subtitle Segment

Returns a specific subtitle segment.

**Endpoint:** `GET /api/videos/{videoId}/segments/{segmentIndex}`

**Response (200 OK):**
```json
{
  "index": 0,
  "japaneseText": "おはようございます",
  "romaji": "ohayou gozaimasu",
  "meaning": "Good morning (polite)",
  "startTime": 5.0,
  "endTime": 8.5,
  "duration": 3.5,
  "vocabulary": ["おはよう", "ございます"]
}
```

### 1.4 Search Videos

Full-text search on video titles and descriptions.

**Endpoint:** `GET /api/videos/search?q={query}`

**Response:** Same as Get All Videos.

### 1.5 Create Video (Admin Only)

**Endpoint:** `POST /api/videos`

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "title": "Daily Greetings in Japanese",
  "titleJapanese": "日本語の挨拶",
  "description": "Learn common Japanese greetings.",
  "youtubeId": "dQw4w9WgXcQ",
  "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "duration": 180,
  "category": "DAILY_LIFE",
  "level": "N5",
  "tags": ["greetings", "beginner"],
  "subtitles": [
    {
      "index": 0,
      "japaneseText": "おはようございます",
      "romaji": "ohayou gozaimasu",
      "meaning": "Good morning (polite)",
      "startTime": 5.0,
      "endTime": 8.5,
      "vocabulary": ["おはよう", "ございます"]
    }
  ],
  "isOfficial": true
}
```

**Response (201 Created):** Full VideoResponse.

---

## 2. Shadowing Practice API

### 2.1 Submit Shadowing Attempt

Submit a voice recording for evaluation.

**Endpoint:** `POST /api/practice/shadowing/attempts`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "videoId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "segmentIndex": 0,
  "audioUrl": "https://storage.example.com/recordings/user123/recording.webm"
}
```

**Response (201 Created):**
```json
{
  "id": "65b2c3d4e5f6g7h8i9j0k1l2",
  "userId": "user123",
  "videoId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "segmentIndex": 0,
  "audioUrl": "https://storage.example.com/recordings/user123/recording.webm",
  "evaluation": {
    "pronunciationScore": 82.5,
    "speedScore": 78.0,
    "intonationScore": 85.0,
    "overallScore": 81.8,
    "feedbackText": "Great job! Your pronunciation is quite good. Focus on the pitch and rhythm patterns.",
    "grade": "B",
    "detailedFeedback": {
      "strengths": [
        "Clear pronunciation of most sounds",
        "Good speaking pace"
      ],
      "improvements": [
        "Pay attention to pitch accent patterns"
      ],
      "specificTips": [
        "Listen to the segment multiple times before recording",
        "Record yourself and compare with the original"
      ],
      "transcribedText": "おはようございます",
      "phonemeAnalysis": [
        {
          "phoneme": "お",
          "expected": "お",
          "actual": "お",
          "score": 95.0
        },
        {
          "phoneme": "は",
          "expected": "は",
          "actual": "は",
          "score": 88.0
        }
      ]
    }
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 2.2 Get User's Shadowing Attempts

**Endpoint:** `GET /api/practice/shadowing/attempts`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "65b2c3d4e5f6g7h8i9j0k1l2",
      "videoId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "segmentIndex": 0,
      "overallScore": 81.8,
      "grade": "B",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 15,
  "totalPages": 1,
  "first": true,
  "last": true,
  "hasNext": false,
  "hasPrevious": false
}
```

### 2.3 Get Video Progress

**Endpoint:** `GET /api/practice/shadowing/videos/{videoId}/progress`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "videoId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "totalSegments": 12,
  "attemptedSegments": 5,
  "completedSegments": 3,
  "averageScore": 78.5,
  "bestScore": 92.0,
  "totalAttempts": 10,
  "progressPercentage": 25.0
}
```

### 2.4 Get User Statistics

**Endpoint:** `GET /api/practice/shadowing/stats`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "totalAttempts": 150,
  "totalVideosAttempted": 8,
  "averageScore": 76.5,
  "bestScore": 95.0,
  "recentAttempts": [
    {
      "id": "65b2c3d4e5f6g7h8i9j0k1l2",
      "videoId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "segmentIndex": 0,
      "overallScore": 81.8,
      "grade": "B",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 3. Dictation Practice API

### 3.1 Submit Dictation Attempt

Submit typed text for evaluation.

**Endpoint:** `POST /api/practice/dictation/attempts`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "videoId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "segmentIndex": 0,
  "userInputText": "おはようございます"
}
```

**Response (201 Created):**
```json
{
  "id": "65c3d4e5f6g7h8i9j0k1l2m3",
  "userId": "user123",
  "videoId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "segmentIndex": 0,
  "userInputText": "おはようございます",
  "correctText": "おはようございます",
  "evaluation": {
    "accuracyScore": 100.0,
    "characterAccuracy": 100.0,
    "wordAccuracy": 100.0,
    "overallScore": 100.0,
    "feedbackText": "Perfect! You heard and wrote everything correctly.",
    "grade": "A",
    "mistakes": [],
    "detailedFeedback": {
      "strengths": [
        "Excellent listening comprehension",
        "Good character recognition",
        "Perfect accuracy!"
      ],
      "improvements": [],
      "specificTips": [
        "Listen to the segment at a slower speed if available",
        "Break down long sentences into smaller parts"
      ],
      "correctSegments": ["おはようございます"],
      "incorrectSegments": [],
      "similarityPercentage": 100.0
    }
  },
  "createdAt": "2024-01-15T11:00:00Z"
}
```

### 3.2 Example with Mistakes

**Request:**
```json
{
  "videoId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "segmentIndex": 0,
  "userInputText": "おはよございます"
}
```

**Response (201 Created):**
```json
{
  "id": "65c3d4e5f6g7h8i9j0k1l2m3",
  "userId": "user123",
  "videoId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "segmentIndex": 0,
  "userInputText": "おはよございます",
  "correctText": "おはようございます",
  "evaluation": {
    "accuracyScore": 88.9,
    "characterAccuracy": 88.9,
    "wordAccuracy": 85.0,
    "overallScore": 87.6,
    "feedbackText": "Great work! Just a few minor mistakes. (1 mistake found)",
    "grade": "B",
    "mistakes": [
      {
        "position": 3,
        "expected": "う",
        "actual": "",
        "type": "MISSING"
      }
    ],
    "detailedFeedback": {
      "strengths": [
        "Good character recognition"
      ],
      "improvements": [
        "Listen for all syllables - 1 characters were missed"
      ],
      "specificTips": [
        "Listen to the segment at a slower speed if available",
        "Break down long sentences into smaller parts"
      ],
      "correctSegments": ["おはよ", "ございます"],
      "incorrectSegments": ["⬜"],
      "similarityPercentage": 88.9
    }
  },
  "createdAt": "2024-01-15T11:05:00Z"
}
```

### 3.3 Get User's Dictation Attempts

**Endpoint:** `GET /api/practice/dictation/attempts`

Same format as shadowing attempts.

### 3.4 Get Video Progress

**Endpoint:** `GET /api/practice/dictation/videos/{videoId}/progress`

Same format as shadowing progress.

### 3.5 Get User Statistics

**Endpoint:** `GET /api/practice/dictation/stats`

Same format as shadowing stats.

---

## Video Categories

| Value | Description |
|-------|-------------|
| `DAILY_LIFE` | Everyday conversations |
| `BUSINESS` | Business Japanese |
| `ANIME` | Anime and manga |
| `NEWS` | News and current events |
| `TRAVEL` | Travel and tourism |
| `CULTURE` | Japanese culture |
| `EDUCATION` | Educational content |
| `MUSIC` | Songs and music |
| `INTERVIEW` | Interviews |
| `OTHER` | Miscellaneous |

## JLPT Levels

| Value | Description |
|-------|-------------|
| `N5` | Beginner (easiest) |
| `N4` | Elementary |
| `N3` | Intermediate |
| `N2` | Upper-intermediate |
| `N1` | Advanced (most difficult) |

## Grading Scale

| Grade | Score Range |
|-------|-------------|
| A | 90-100 |
| B | 80-89 |
| C | 70-79 |
| D | 60-69 |
| F | 0-59 |

---

## cURL Examples

### Create Video (Admin)
```bash
curl -X POST http://localhost:8080/api/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "title": "Basic Greetings",
    "youtubeId": "abc123xyz00",
    "thumbnailUrl": "https://img.youtube.com/vi/abc123xyz00/maxresdefault.jpg",
    "duration": 120,
    "category": "DAILY_LIFE",
    "level": "N5",
    "subtitles": [
      {
        "index": 0,
        "japaneseText": "こんにちは",
        "meaning": "Hello",
        "startTime": 0.0,
        "endTime": 2.0
      }
    ]
  }'
```

### Submit Shadowing Attempt
```bash
curl -X POST http://localhost:8080/api/practice/shadowing/attempts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "videoId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "segmentIndex": 0,
    "audioUrl": "https://storage.example.com/audio/recording.webm"
  }'
```

### Submit Dictation Attempt
```bash
curl -X POST http://localhost:8080/api/practice/dictation/attempts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "videoId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "segmentIndex": 0,
    "userInputText": "こんにちは"
  }'
```

### Get Video Progress
```bash
curl -X GET "http://localhost:8080/api/practice/shadowing/videos/65a1b2c3d4e5f6g7h8i9j0k1/progress" \
  -H "Authorization: Bearer <token>"
```
