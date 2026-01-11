# Nihongo Master API - Phase 3: Vocabulary Deck & Practice System

## Overview

This document describes the REST API endpoints for the Vocabulary Deck management, Fill-in-the-Blank practice, Flashcard practice, and Learning Progress tracking features.

## Base URL

- Development: `http://localhost:8080`
- Production: `https://api.nihongomaster.com`

---

## 1. Vocabulary Deck API

### 1.1 Create Deck

Creates a new vocabulary deck.

**Endpoint:** `POST /api/vocabulary/decks`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "JLPT N5 Essential Vocabulary",
  "description": "Core vocabulary for JLPT N5 preparation",
  "coverImageUrl": "https://example.com/cover.jpg",
  "languageDirection": "JP_EN",
  "level": "N5",
  "topic": "JLPT_N5",
  "tags": ["jlpt", "beginner", "essential"],
  "isPublic": true,
  "sections": [
    {
      "title": "Greetings",
      "description": "Common greeting expressions",
      "items": [
        {
          "japaneseWord": "おはよう",
          "reading": "ohayou",
          "meaning": "Good morning (casual)",
          "partOfSpeech": "EXPRESSION",
          "exampleSentence": "おはよう、元気？",
          "exampleMeaning": "Good morning, how are you?",
          "notes": "Use おはようございます for polite form"
        }
      ]
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "65d1e2f3g4h5i6j7k8l9m0n1",
  "title": "JLPT N5 Essential Vocabulary",
  "description": "Core vocabulary for JLPT N5 preparation",
  "coverImageUrl": "https://example.com/cover.jpg",
  "languageDirection": "JP_EN",
  "level": "N5",
  "topic": "JLPT_N5",
  "tags": ["jlpt", "beginner", "essential"],
  "isPublic": true,
  "isOfficial": false,
  "createdBy": "user123",
  "creatorName": "John Doe",
  "sections": [
    {
      "index": 0,
      "title": "Greetings",
      "description": "Common greeting expressions",
      "items": [
        {
          "index": 0,
          "japaneseWord": "おはよう",
          "reading": "ohayou",
          "meaning": "Good morning (casual)",
          "partOfSpeech": "EXPRESSION",
          "exampleSentence": "おはよう、元気？",
          "exampleMeaning": "Good morning, how are you?",
          "imageUrl": null,
          "audioUrl": null,
          "notes": "Use おはようございます for polite form",
          "hasImage": false,
          "hasAudio": false,
          "hasExample": true
        }
      ],
      "itemCount": 1
    }
  ],
  "totalVocabulary": 1,
  "stats": {
    "viewCount": 0,
    "studyCount": 0,
    "starCount": 0,
    "forkCount": 0,
    "averageScore": 0.0,
    "completionRate": 0.0
  },
  "status": "ACTIVE",
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

### 1.2 Get Deck

Returns full deck with all sections and items.

**Endpoint:** `GET /api/vocabulary/decks/{deckId}`

**Response (200 OK):** Same as Create Deck response.

### 1.3 Get Deck Summary

Returns deck summary without full content.

**Endpoint:** `GET /api/vocabulary/decks/{deckId}/summary`

**Response (200 OK):**
```json
{
  "id": "65d1e2f3g4h5i6j7k8l9m0n1",
  "title": "JLPT N5 Essential Vocabulary",
  "description": "Core vocabulary for JLPT N5 preparation",
  "coverImageUrl": "https://example.com/cover.jpg",
  "languageDirection": "JP_EN",
  "level": "N5",
  "topic": "JLPT_N5",
  "tags": ["jlpt", "beginner", "essential"],
  "isPublic": true,
  "isOfficial": false,
  "createdBy": "user123",
  "creatorName": "John Doe",
  "totalVocabulary": 50,
  "sectionCount": 5,
  "stats": {
    "viewCount": 1250,
    "studyCount": 340,
    "starCount": 45,
    "forkCount": 12,
    "averageScore": 78.5,
    "completionRate": 65.0
  },
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-25T15:30:00Z"
}
```

### 1.4 Update Deck

**Endpoint:** `PUT /api/vocabulary/decks/{deckId}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "isPublic": false
}
```

### 1.5 Delete Deck

Soft deletes a deck.

**Endpoint:** `DELETE /api/vocabulary/decks/{deckId}`

**Headers:** `Authorization: Bearer <token>`

**Response (204 No Content)**

### 1.6 Get Public Decks

Returns paginated list of public decks.

**Endpoint:** `GET /api/vocabulary/decks`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `level` | String | Filter by JLPT level (N5, N4, N3, N2, N1) |
| `topic` | String | Filter by topic |
| `page` | Integer | Page number (default: 0) |
| `size` | Integer | Page size (default: 12) |
| `sort` | String | Sort field (default: createdAt,desc) |

### 1.7 Get My Decks

**Endpoint:** `GET /api/vocabulary/decks/my`

**Headers:** `Authorization: Bearer <token>`

### 1.8 Search Decks

**Endpoint:** `GET /api/vocabulary/decks/search?q={query}`

---

## 2. Section Management API

### 2.1 Add Section

**Endpoint:** `POST /api/vocabulary/decks/{deckId}/sections`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Food & Drinks",
  "description": "Vocabulary related to food and beverages",
  "items": [
    {
      "japaneseWord": "ごはん",
      "reading": "gohan",
      "meaning": "rice / meal",
      "partOfSpeech": "NOUN"
    }
  ]
}
```

### 2.2 Update Section

**Endpoint:** `PUT /api/vocabulary/decks/{deckId}/sections/{sectionIndex}`

### 2.3 Delete Section

**Endpoint:** `DELETE /api/vocabulary/decks/{deckId}/sections/{sectionIndex}`

---

## 3. Vocabulary Item Management API

### 3.1 Add Items to Section

**Endpoint:** `POST /api/vocabulary/decks/{deckId}/sections/{sectionIndex}/items`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
[
  {
    "japaneseWord": "水",
    "reading": "mizu",
    "meaning": "water",
    "partOfSpeech": "NOUN",
    "exampleSentence": "水をください。",
    "exampleMeaning": "Please give me water."
  },
  {
    "japaneseWord": "お茶",
    "reading": "ocha",
    "meaning": "tea",
    "partOfSpeech": "NOUN"
  }
]
```

### 3.2 Update Item

**Endpoint:** `PUT /api/vocabulary/decks/{deckId}/sections/{sectionIndex}/items/{itemIndex}`

### 3.3 Delete Item

**Endpoint:** `DELETE /api/vocabulary/decks/{deckId}/sections/{sectionIndex}/items/{itemIndex}`

---

## 4. Fill-in-the-Blank Practice API

### 4.1 Generate Questions

**Endpoint:** `POST /api/vocabulary/practice/fill-in/questions`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "deckId": "65d1e2f3g4h5i6j7k8l9m0n1",
  "sectionIndex": null,
  "itemCount": 10,
  "shuffleItems": true
}
```

**Response (200 OK):**
```json
[
  {
    "questionId": "0-2-MEANING_TO_JAPANESE",
    "sectionIndex": 0,
    "itemIndex": 2,
    "questionType": "MEANING_TO_JAPANESE",
    "prompt": "What is the Japanese word for: water",
    "blankPosition": 0,
    "hint": "み",
    "options": ["水", "火", "土", "木"],
    "audioUrl": null,
    "imageUrl": null
  },
  {
    "questionId": "1-0-JAPANESE_TO_MEANING",
    "sectionIndex": 1,
    "itemIndex": 0,
    "questionType": "JAPANESE_TO_MEANING",
    "prompt": "What is the meaning of: 食べる (taberu)",
    "blankPosition": 0,
    "hint": "t",
    "options": null,
    "audioUrl": null,
    "imageUrl": null
  }
]
```

### 4.2 Submit Answer

**Endpoint:** `POST /api/vocabulary/practice/fill-in/answer`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "deckId": "65d1e2f3g4h5i6j7k8l9m0n1",
  "sectionIndex": 0,
  "itemIndex": 2,
  "userAnswer": "水",
  "questionType": "MEANING_TO_JAPANESE"
}
```

**Response (200 OK):**
```json
{
  "isCorrect": true,
  "userAnswer": "水",
  "correctAnswer": "水",
  "similarity": 1.0,
  "feedback": "Perfect! Exactly right!",
  "itemProgress": {
    "sectionIndex": 0,
    "itemIndex": 2,
    "correctAttempts": 5,
    "incorrectAttempts": 1,
    "totalAttempts": 6,
    "masteryLevel": "FAMILIAR",
    "accuracyPercentage": 83.3,
    "streakCount": 3,
    "bestStreak": 4,
    "lastAttemptAt": "2024-01-25T16:00:00Z",
    "nextReviewAt": "2024-01-26T16:00:00Z",
    "isMastered": true
  },
  "pointsEarned": 15
}
```

### Question Types

| Type | Description |
|------|-------------|
| `MEANING_TO_JAPANESE` | Show meaning, answer with Japanese |
| `JAPANESE_TO_MEANING` | Show Japanese, answer with meaning |
| `READING_TO_JAPANESE` | Show reading, answer with kanji |
| `JAPANESE_TO_READING` | Show Japanese, answer with reading |

---

## 5. Flashcard Practice API

### 5.1 Generate Flashcards

**Endpoint:** `POST /api/vocabulary/practice/flashcard/cards`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "deckId": "65d1e2f3g4h5i6j7k8l9m0n1",
  "sectionIndex": null,
  "itemCount": 20,
  "shuffleItems": true,
  "showFront": "JAPANESE"
}
```

**Response (200 OK):**
```json
[
  {
    "cardId": "0-2",
    "sectionIndex": 0,
    "itemIndex": 2,
    "front": {
      "primaryText": "水",
      "secondaryText": "mizu",
      "label": "Japanese"
    },
    "back": {
      "primaryText": "water",
      "secondaryText": null,
      "label": "Meaning"
    },
    "audioUrl": null,
    "imageUrl": null,
    "exampleSentence": "水をください。",
    "exampleMeaning": "Please give me water.",
    "notes": null
  }
]
```

### 5.2 Submit Self-Assessment

**Endpoint:** `POST /api/vocabulary/practice/flashcard/result`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "deckId": "65d1e2f3g4h5i6j7k8l9m0n1",
  "sectionIndex": 0,
  "itemIndex": 2,
  "result": "GOOD"
}
```

**Response (200 OK):**
```json
{
  "recorded": true,
  "isCorrect": true,
  "itemProgress": {
    "sectionIndex": 0,
    "itemIndex": 2,
    "correctAttempts": 6,
    "incorrectAttempts": 1,
    "totalAttempts": 7,
    "masteryLevel": "FAMILIAR",
    "accuracyPercentage": 85.7,
    "streakCount": 4,
    "bestStreak": 4,
    "lastAttemptAt": "2024-01-25T16:05:00Z",
    "nextReviewAt": "2024-01-27T16:05:00Z",
    "isMastered": true
  },
  "nextReviewAt": "2024-01-27T16:05:00Z",
  "pointsEarned": 10
}
```

### Self-Assessment Options

| Value | Description | Points |
|-------|-------------|--------|
| `EASY` | Knew immediately | 15 |
| `GOOD` | Knew after thinking | 10 |
| `HARD` | Struggled but got it | 5 |
| `FORGOT` | Didn't remember | 2 |

---

## 6. Review Mode API (Spaced Repetition)

### 6.1 Get Items for Review

**Endpoint:** `GET /api/vocabulary/practice/review/decks/{deckId}`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | Integer | Max items (default: 20) |

**Response (200 OK):** List of FlashcardResponse

### 6.2 Get Review Count

**Endpoint:** `GET /api/vocabulary/practice/review/decks/{deckId}/count`

**Response (200 OK):**
```json
{
  "count": 15
}
```

### 6.3 Get All Items Needing Review

**Endpoint:** `GET /api/vocabulary/practice/review/all`

**Response (200 OK):**
```json
[
  {
    "sectionIndex": 0,
    "itemIndex": 5,
    "japaneseWord": "電車",
    "reading": "densha",
    "meaning": "train",
    "lastAttemptAt": "2024-01-20T10:00:00Z",
    "nextReviewAt": "2024-01-25T10:00:00Z",
    "masteryLevel": "LEARNING"
  }
]
```

---

## 7. Progress Tracking API

### 7.1 Get Deck Progress

**Endpoint:** `GET /api/vocabulary/decks/{deckId}/progress`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "deckId": "65d1e2f3g4h5i6j7k8l9m0n1",
  "deckTitle": "JLPT N5 Essential Vocabulary",
  "userId": "user123",
  "sectionProgress": [
    {
      "sectionIndex": 0,
      "sectionTitle": "Greetings",
      "totalItems": 15,
      "practicedItems": 12,
      "masteredItems": 8,
      "averageAccuracy": 78.5,
      "completionPercentage": 53.3,
      "lastStudiedAt": "2024-01-25T15:00:00Z"
    }
  ],
  "overallStats": {
    "totalItemsPracticed": 35,
    "totalCorrectAttempts": 120,
    "totalIncorrectAttempts": 30,
    "totalAttempts": 150,
    "itemsMastered": 25,
    "itemsLearning": 10,
    "averageAccuracy": 80.0,
    "totalStudyTimeMinutes": 45,
    "sessionsCompleted": 5,
    "overallCompletionPercentage": 50.0
  },
  "studyStreak": 3,
  "lastStudiedAt": "2024-01-25T15:00:00Z",
  "itemsNeedingReview": 8,
  "nextReviewItems": [
    {
      "sectionIndex": 0,
      "itemIndex": 3,
      "japaneseWord": "ありがとう",
      "reading": "arigatou",
      "meaning": "thank you",
      "lastAttemptAt": "2024-01-23T10:00:00Z",
      "nextReviewAt": "2024-01-25T10:00:00Z",
      "masteryLevel": "FAMILIAR"
    }
  ],
  "createdAt": "2024-01-15T08:00:00Z",
  "updatedAt": "2024-01-25T15:00:00Z"
}
```

### 7.2 Get User Progress Across All Decks

**Endpoint:** `GET /api/vocabulary/practice/progress`

**Headers:** `Authorization: Bearer <token>`

### 7.3 Get User Vocabulary Statistics

**Endpoint:** `GET /api/vocabulary/practice/stats`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "userId": "user123",
  "totalDecksStudied": 5,
  "totalItemsPracticed": 250,
  "totalItemsMastered": 180,
  "overallAccuracy": 82.5,
  "currentStreak": 7,
  "longestStreak": 14,
  "totalStudyTimeMinutes": 320,
  "recentDecks": [
    {
      "deckId": "65d1e2f3g4h5i6j7k8l9m0n1",
      "deckTitle": "JLPT N5 Essential Vocabulary",
      "lastStudiedAt": "2024-01-25T15:00:00Z",
      "completionPercentage": 72.0,
      "itemsMastered": 36,
      "totalItems": 50
    }
  ],
  "itemsToReviewToday": 23
}
```

### 7.4 Reset Deck Progress

**Endpoint:** `DELETE /api/vocabulary/decks/{deckId}/progress`

**Headers:** `Authorization: Bearer <token>`

**Response (204 No Content)**

### 7.5 Reset Section Progress

**Endpoint:** `DELETE /api/vocabulary/decks/{deckId}/sections/{sectionIndex}/progress`

**Headers:** `Authorization: Bearer <token>`

---

## Enums Reference

### Language Direction
| Value | Description |
|-------|-------------|
| `JP_EN` | Japanese → English |
| `JP_VI` | Japanese → Vietnamese |
| `EN_JP` | English → Japanese |
| `VI_JP` | Vietnamese → Japanese |

### Deck Topic
| Value | Description |
|-------|-------------|
| `GENERAL` | General vocabulary |
| `GRAMMAR` | Grammar-focused |
| `KANJI` | Kanji learning |
| `DAILY_LIFE` | Everyday life |
| `TRAVEL` | Travel & tourism |
| `BUSINESS` | Business Japanese |
| `FOOD` | Food & drinks |
| `CULTURE` | Japanese culture |
| `ANIME_MANGA` | Anime & manga |
| `JLPT_N5` | JLPT N5 level |
| `JLPT_N4` | JLPT N4 level |
| `JLPT_N3` | JLPT N3 level |
| `JLPT_N2` | JLPT N2 level |
| `JLPT_N1` | JLPT N1 level |
| `OTHER` | Other topics |

### Part of Speech
| Value | Description |
|-------|-------------|
| `NOUN` | Noun (名詞) |
| `VERB` | Verb (動詞) |
| `I_ADJECTIVE` | い-adjective (い形容詞) |
| `NA_ADJECTIVE` | な-adjective (な形容詞) |
| `ADVERB` | Adverb (副詞) |
| `PARTICLE` | Particle (助詞) |
| `CONJUNCTION` | Conjunction (接続詞) |
| `EXPRESSION` | Expression (表現) |
| `COUNTER` | Counter (助数詞) |
| `PREFIX` | Prefix (接頭辞) |
| `SUFFIX` | Suffix (接尾辞) |
| `OTHER` | Other |

### Mastery Level
| Value | Description | Requirements |
|-------|-------------|--------------|
| `NEW` | Never practiced | 0 attempts |
| `LEARNING` | Currently learning | 1-2 attempts |
| `FAMILIAR` | Becoming familiar | 3+ attempts, 70%+ accuracy |
| `MASTERED` | Fully mastered | 5+ attempts, 90%+ accuracy |

### Deck Status
| Value | Description |
|-------|-------------|
| `ACTIVE` | Normal, accessible |
| `ARCHIVED` | Hidden from lists |
| `DELETED` | Soft deleted |

---

## cURL Examples

### Create Deck
```bash
curl -X POST http://localhost:8080/api/vocabulary/decks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Daily Japanese",
    "level": "N5",
    "topic": "DAILY_LIFE",
    "isPublic": true,
    "sections": [
      {
        "title": "Greetings",
        "items": [
          {
            "japaneseWord": "おはよう",
            "reading": "ohayou",
            "meaning": "Good morning"
          }
        ]
      }
    ]
  }'
```

### Generate Fill-in Questions
```bash
curl -X POST http://localhost:8080/api/vocabulary/practice/fill-in/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "deckId": "65d1e2f3g4h5i6j7k8l9m0n1",
    "itemCount": 10,
    "shuffleItems": true
  }'
```

### Submit Fill-in Answer
```bash
curl -X POST http://localhost:8080/api/vocabulary/practice/fill-in/answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "deckId": "65d1e2f3g4h5i6j7k8l9m0n1",
    "sectionIndex": 0,
    "itemIndex": 0,
    "userAnswer": "おはよう",
    "questionType": "MEANING_TO_JAPANESE"
  }'
```

### Generate Flashcards
```bash
curl -X POST http://localhost:8080/api/vocabulary/practice/flashcard/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "deckId": "65d1e2f3g4h5i6j7k8l9m0n1",
    "itemCount": 20,
    "showFront": "JAPANESE"
  }'
```

### Submit Flashcard Result
```bash
curl -X POST http://localhost:8080/api/vocabulary/practice/flashcard/result \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "deckId": "65d1e2f3g4h5i6j7k8l9m0n1",
    "sectionIndex": 0,
    "itemIndex": 0,
    "result": "GOOD"
  }'
```

### Get Deck Progress
```bash
curl -X GET "http://localhost:8080/api/vocabulary/decks/65d1e2f3g4h5i6j7k8l9m0n1/progress" \
  -H "Authorization: Bearer <token>"
```

### Get Review Items
```bash
curl -X GET "http://localhost:8080/api/vocabulary/practice/review/decks/65d1e2f3g4h5i6j7k8l9m0n1?limit=20" \
  -H "Authorization: Bearer <token>"
```
