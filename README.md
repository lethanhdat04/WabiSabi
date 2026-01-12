# Nihongo Master

A comprehensive Japanese language learning platform featuring video-based practice, vocabulary management, spaced repetition, and community features.

## Current Status

**Phase: End-to-End Integration Complete**

| Component | Status |
|-----------|--------|
| Backend API | Done |
| MongoDB Models | Done |
| Frontend UI | Done |
| Authentication | Done |
| API Integration | Done |
| Protected Routes | Done |
| Testing | Pending |

---

## Quick Start

### Prerequisites

#### Node.js 18+
```bash
# Ubuntu/WSL
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v
npm -v
```

#### JDK 17+
```bash
# Ubuntu/WSL
sudo apt update
sudo apt install -y openjdk-17-jdk

# Verify
java -version
```

#### MongoDB 6+
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:6

# Or install locally - see https://www.mongodb.com/docs/manual/installation/
```

---

### 1. Start MongoDB
```bash
# If using Docker
docker start mongodb

# Or if container doesn't exist yet
docker run -d -p 27017:27017 --name mongodb mongo:6
```

### 2. Start Backend
```bash
cd backend

# Configure (edit src/main/resources/application.yml)
# Set: spring.data.mongodb.uri, jwt.secret

./gradlew bootRun
# Runs on http://localhost:8080
```

### 3. Start Frontend
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local

npm run dev
# Runs on http://localhost:3000
```

### 4. Test the App
1. Open http://localhost:3000
2. Click "Sign up" to create account
3. Login and explore!

---

## Features

### Completed Features

#### Authentication
- User registration with validation
- Login with email or username
- JWT token authentication
- Automatic token refresh
- Protected routes
- Logout functionality

#### Learning Dashboard (`/learn`)
- Daily progress overview
- Recent vocabulary decks
- Recent videos
- Quick access to practice modes

#### Practice Center (`/practice`)
- Practice mode selection
- Session statistics
- Score tracking
- Practice history

#### Vocabulary (`/decks`)
- Browse all decks
- Filter by JLPT level
- Search decks
- View deck details
- Flashcard study mode
- Quiz mode

#### Community (`/community`)
- Browse forum posts
- Filter by topic
- Like/comment counts
- Create new posts

#### User Profile (`/profile`)
- User statistics
- Skill levels
- Learning preferences
- Account settings

#### Progress Tracking (`/progress`, `/history`)
- Overall progress dashboard
- Skill breakdown
- Practice history log
- Session details

### Pending Features
- Video player with subtitle sync
- Audio recording for shadowing
- Real-time practice submission
- Rich text editor for posts
- Global search

---

## Project Structure

```
Nihongo Master/
├── backend/                    # Spring Boot + Kotlin
│   └── src/main/kotlin/com/nihongomaster/
│       ├── config/             # Spring & Security config
│       ├── controller/         # REST API endpoints
│       ├── domain/             # MongoDB entities
│       ├── dto/                # Request/Response DTOs
│       ├── repository/         # Data access
│       ├── security/           # JWT authentication
│       └── service/            # Business logic
│
├── frontend/                   # Next.js 14 + TypeScript
│   └── src/
│       ├── app/                # App Router pages
│       │   ├── (auth)/         # Login, Register
│       │   └── (main)/         # Main app pages
│       ├── components/         # React components
│       │   ├── ui/             # Reusable UI
│       │   └── layout/         # Layout components
│       └── lib/                # Utilities
│           ├── api-client.ts   # API functions
│           └── auth-context.tsx # Auth state
│
├── .claude/                    # Development context
│   ├── context.md              # Session history
│   └── next-steps.md           # Todo list
│
├── INTEGRATION_CHECKLIST.md    # Testing checklist
├── AUDIT_REPORT.md             # Technical audit
└── README.md                   # This file
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Kotlin | Language |
| Spring Boot 3 | Framework |
| MongoDB | Database |
| JWT | Authentication |
| Gradle | Build tool |

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | Framework |
| React 18 | UI Library |
| TypeScript | Language |
| Tailwind CSS | Styling |
| Lucide React | Icons |

---

## API Endpoints

### Authentication
```
POST /api/auth/register    # Create account
POST /api/auth/login       # Get tokens
POST /api/auth/refresh     # Refresh access token
POST /api/auth/logout      # Invalidate tokens
```

### Users
```
GET  /api/users/me         # Current user profile
PUT  /api/users/me         # Update profile
GET  /api/users/profile/{username}  # Public profile
```

### Videos
```
GET  /api/videos           # List videos
GET  /api/videos/{id}      # Video details
GET  /api/videos/search    # Search videos
```

### Vocabulary
```
GET  /api/vocabulary/decks           # List decks
GET  /api/vocabulary/decks/{id}      # Deck details
GET  /api/vocabulary/decks/{id}/progress  # User progress
POST /api/vocabulary/decks/{id}/practice/start  # Start session
```

### Practice
```
POST /api/practice/dictation/attempts    # Submit dictation
POST /api/practice/shadowing/attempts    # Submit shadowing
GET  /api/practice/dictation/stats       # User stats
GET  /api/practice/shadowing/stats       # User stats
```

### Forum
```
GET  /api/forum/posts          # List posts
POST /api/forum/posts          # Create post
GET  /api/forum/posts/{id}     # Post details
POST /api/forum/posts/{id}/like    # Like post
POST /api/forum/posts/{id}/comments  # Add comment
```

---

## Configuration

### Backend (`application.yml`)
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/nihongo_master

jwt:
  secret: your-secure-secret-key-at-least-32-chars
  access-token-expiration: 3600000     # 1 hour
  refresh-token-expiration: 604800000  # 7 days
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## UI Design System

### Colors
| Element | Color |
|---------|-------|
| Background | `neutral-900` |
| Surface | `neutral-800` |
| Primary Text | `neutral-200` |
| Secondary Text | `neutral-400` |
| Accent | `yellow-500` |
| Borders | `neutral-700` |

### Typography
- Headings: Montserrat Alternates
- Body: Be Vietnam Pro

### Components
- Cards: `rounded-xl border border-neutral-700`
- Buttons: `rounded-lg`
- Inputs: `rounded-md`

---

## Development

### Run Tests
```bash
# Backend
cd backend
./gradlew test

# Frontend
cd frontend
npm run lint
npm run build
```

### Build for Production
```bash
# Backend
cd backend
./gradlew build
java -jar build/libs/nihongo-master.jar

# Frontend
cd frontend
npm run build
npm start
```

---

## Contributing

1. Check `.claude/next-steps.md` for tasks
2. Follow existing code patterns
3. Test your changes
4. Update documentation

---

## License

This project is developed for educational purposes.

---

**Nihongo Master** - Learn Japanese, Master the Language
