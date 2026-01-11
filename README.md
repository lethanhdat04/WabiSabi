# Nihongo Master

A comprehensive Japanese language learning platform featuring video-based practice, vocabulary management, spaced repetition, and community features.

## Project Overview

Nihongo Master is designed to help learners improve their Japanese language skills through:

- **Video-based Learning**: Practice listening with real Japanese content
- **Shadowing Practice**: Improve pronunciation by repeating after native speakers
- **Dictation Practice**: Enhance listening comprehension by transcribing audio
- **Vocabulary Decks**: Learn and review vocabulary with flashcards and quizzes
- **Spaced Repetition**: Optimize learning with intelligent review scheduling
- **Community Forum**: Connect with other learners, share tips, and ask questions

## Tech Stack

### Backend
- **Language**: Kotlin
- **Framework**: Spring Boot 3.x
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: OpenAPI/Swagger
- **Build Tool**: Gradle

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand (configured)

### Database
- **MongoDB** with the following collections:
  - `users` - User accounts and profiles
  - `refresh_tokens` - JWT refresh token management
  - `posts` - Community forum posts
  - `comments` - Post comments
  - `post_likes` / `comment_likes` - Like tracking
  - `videos` - Learning video content
  - `vocabulary_decks` - Vocabulary deck definitions
  - `vocabulary_progress` - User learning progress
  - `dictation_attempts` - Dictation practice records
  - `shadowing_attempts` - Shadowing practice records

## Folder Structure

```
Nihongo Master/
├── backend/
│   └── src/main/kotlin/com/nihongomaster/
│       ├── config/              # Spring configuration
│       ├── controller/          # REST API controllers
│       ├── domain/              # MongoDB entities
│       │   ├── user/            # User, RefreshToken
│       │   ├── forum/           # Post, Comment, Likes
│       │   ├── video/           # Video, SubtitleSegment
│       │   ├── vocabulary/      # Deck, Progress
│       │   └── practice/        # Dictation, Shadowing attempts
│       ├── dto/                 # Request/Response DTOs
│       ├── exception/           # Custom exceptions
│       ├── mapper/              # Entity-DTO mappers
│       ├── repository/          # MongoDB repositories
│       ├── security/            # JWT authentication
│       └── service/             # Business logic
│
├── frontend/
│   └── src/
│       ├── app/                 # Next.js App Router pages
│       │   ├── (main)/          # Main app layout group
│       │   │   ├── learn/       # Learning pages
│       │   │   ├── practice/    # Practice pages
│       │   │   ├── decks/       # Vocabulary deck pages
│       │   │   ├── community/   # Community pages
│       │   │   ├── profile/     # User profile
│       │   │   ├── progress/    # Progress dashboard
│       │   │   └── history/     # Practice history
│       │   ├── globals.css      # Global styles
│       │   └── layout.tsx       # Root layout
│       ├── components/
│       │   ├── ui/              # Reusable UI components
│       │   └── layout/          # Layout components
│       └── lib/
│           └── mock-data.ts     # Mock data for development
│
├── AUDIT_REPORT.md              # Technical audit report
└── README.md                    # This file
```

## Implemented Features

### Learning Module
- **Learning Dashboard** (`/learn`) - Overview with stats, recent activity, quick access
- **Video Library** (`/learn/videos`) - Browse videos by category and JLPT level
- **Vocabulary Overview** (`/learn/vocabulary`) - Browse vocabulary decks

### Practice Module
- **Practice Center** (`/practice`) - Central hub for all practice modes
- **Shadowing** (`/practice/shadowing`) - Listen and repeat exercises
- **Dictation** (`/practice/dictation`) - Listen and transcribe exercises
- **Flashcards** (`/practice/flashcards`) - Spaced repetition review
- **Fill-in-the-Blank** (`/practice/fill-in`) - Grammar and vocabulary drills
- **Practice Results** (`/practice/[videoId]/result`) - Detailed feedback and scores

### Vocabulary Module
- **Deck Library** (`/decks`) - Browse public and personal decks
- **Deck Detail** (`/decks/[deckId]`) - View deck content and progress
- **Deck Flashcards** (`/decks/[deckId]/flashcards`) - Study specific deck
- **Deck Quiz** (`/decks/[deckId]/quiz`) - Test vocabulary knowledge
- **Spaced Repetition Review** (`/decks/review`) - Review due items across all decks

### Community Module
- **Community Feed** (`/community`) - Browse and search posts
- **Create Post** (`/community/new`) - Write new discussion posts
- **Post Detail** (`/community/[postId]`) - View post and comments

### User Module
- **Profile** (`/profile`) - User profile with stats and achievements
- **Progress Dashboard** (`/progress`) - Skill breakdown and milestones
- **Practice History** (`/history`) - Session logs and performance tracking

## Available Pages/Routes

| Route | Description |
|-------|-------------|
| `/learn` | Learning dashboard |
| `/learn/videos` | Video library |
| `/learn/vocabulary` | Vocabulary decks list |
| `/practice` | Practice mode selection |
| `/practice/shadowing` | Shadowing practice |
| `/practice/dictation` | Dictation practice |
| `/practice/flashcards` | Flashcard review |
| `/practice/fill-in` | Fill-in-the-blank |
| `/practice/[videoId]/result` | Practice results |
| `/decks` | Deck library |
| `/decks/[deckId]` | Deck detail |
| `/decks/[deckId]/flashcards` | Deck flashcard mode |
| `/decks/[deckId]/quiz` | Deck quiz mode |
| `/decks/review` | Spaced repetition review |
| `/community` | Community feed |
| `/community/new` | Create new post |
| `/community/[postId]` | Post detail |
| `/profile` | User profile |
| `/progress` | Progress dashboard |
| `/history` | Practice history |

## How to Run Locally

### Prerequisites
- Node.js 18+ (for frontend)
- JDK 17+ (for backend)
- MongoDB 6+ (local or Atlas)
- Gradle (or use wrapper)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure MongoDB connection in `application.yml`:
   ```yaml
   spring:
     data:
       mongodb:
         uri: mongodb://localhost:27017/nihongo_master

   jwt:
     secret: your-secret-key-here
     access-token-expiration: 3600000    # 1 hour
     refresh-token-expiration: 604800000  # 7 days
   ```

3. Run the application:
   ```bash
   ./gradlew bootRun
   ```

4. Backend will be available at `http://localhost:8080`
5. Swagger UI at `http://localhost:8080/swagger-ui.html`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Frontend will be available at `http://localhost:3000`

### Running Both Together

For development, run both services in separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend && ./gradlew bootRun
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
```

## UI/UX Design Rules

The frontend follows a strict, minimalist design system:

### Color Palette
| Usage | Color | Tailwind Class |
|-------|-------|----------------|
| Background | Dark gray | `bg-neutral-900` |
| Surface | Lighter gray | `bg-neutral-800` |
| Primary text | Light gray | `text-neutral-200` |
| Secondary text | Medium gray | `text-neutral-400` |
| Accent | Yellow | `text-yellow-500`, `bg-yellow-500` |
| Borders | Subtle gray | `border-neutral-700` |

### Design Principles
- **No shadows** - Flat design without box shadows
- **No gradients** - Solid colors only
- **No blur/glass effects** - Clean, sharp edges
- **No emojis** - Text-based communication only
- **Consistent borders** - Always `border border-neutral-700`
- **Restrained spacing** - Primarily 8px, 12px, 16px scale

### Typography
- **Headings**: Montserrat Alternates (font-weight: 600)
- **Body**: Be Vietnam Pro (font-weight: 400-500)

### Border Radius
- Buttons: `rounded-lg`
- Cards: `rounded-xl`
- Inputs: `rounded-md`

### Icons
- Library: Lucide React
- Style: Outline only
- Size: `w-5 h-5` or `w-6 h-6`

## Mock Data & Backend Integration

### Current State
The frontend currently uses **mock data** for development and demonstration:
- Mock data located in `/frontend/src/lib/mock-data.ts`
- Includes sample decks, videos, vocabulary, and user statistics
- Practice submissions use simulated delays

### Backend Integration Notes
When integrating with the backend:

1. **API Client**: Create a centralized API client in `/lib/api-client.ts`

2. **Authentication**:
   - Store JWT tokens securely (httpOnly cookies recommended)
   - Implement refresh token rotation
   - Add auth context for global state

3. **Data Fetching**:
   - Replace mock imports with API calls
   - Consider React Query or SWR for caching
   - Handle loading and error states

4. **Type Alignment**:
   - Backend uses enums (JLPTLevel, VideoCategory, etc.)
   - Ensure frontend types match DTO structures
   - Consider generating types from OpenAPI spec

### API Endpoints Reference

Key backend endpoints for integration:

```
# Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout

# Videos
GET  /api/videos
GET  /api/videos/{id}
GET  /api/videos/search?q=...

# Vocabulary
GET  /api/vocabulary/decks
GET  /api/vocabulary/decks/{id}
POST /api/vocabulary/practice/flashcard/cards
POST /api/vocabulary/practice/fill-in/questions

# Practice
POST /api/practice/dictation/attempts
POST /api/practice/shadowing/attempts
GET  /api/practice/dictation/stats
GET  /api/practice/shadowing/stats

# Forum
GET  /api/forum/posts
POST /api/forum/posts
GET  /api/forum/posts/{id}
POST /api/forum/posts/{id}/comments
```

## Development Notes

### Known Limitations
- Frontend-backend integration not yet implemented
- Authentication pages not yet created
- Some sidebar links (Settings, Help) lead to non-existent pages
- Mock data is static and does not persist

### Recommended Next Steps
1. Create authentication pages (`/login`, `/register`)
2. Implement API client layer
3. Add auth context and protected routes
4. Replace mock data with API calls
5. Add loading and error state components

## License

This project is developed for educational purposes.

---

**Nihongo Master** - Learn Japanese, Master the Language
