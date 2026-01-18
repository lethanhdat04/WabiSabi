# Nihongo Master

A comprehensive Japanese language learning platform with video-based practice, vocabulary management, and community features.

## Tech Stack

### Backend
- **Framework:** Spring Boot 3.2.2 + Kotlin 1.9.22
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT (jjwt 0.12.3)
- **Build:** Gradle 8.5, JDK 21
- **Docs:** OpenAPI/Swagger

### Frontend
- **Framework:** Next.js 14.2.0 + React 18
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.4.1
- **State:** Zustand 4.5.0

### Deployment
- **Proxy:** Nginx (Alpine)
- **Container:** Docker + Docker Compose
- **SSL:** Let's Encrypt

## Features

### Learning
- **Video Practice:** Shadowing and Dictation modes with YouTube integration
- **Vocabulary Decks:** Flashcards, quizzes, spaced repetition (SM-2 algorithm)
- **Progress Tracking:** XP, streaks, skill breakdown, achievements

### Community
- **Forum:** Posts, comments, likes, content moderation
- **Profiles:** Follow users, leaderboards

### User Management
- JWT authentication with refresh tokens
- User preferences and learning settings
- JLPT level filtering (N5-N1)

## Project Structure

```
.
├── backend/                    # Spring Boot API
│   ├── src/main/kotlin/        # Kotlin source
│   │   └── com/nihongomaster/
│   │       ├── config/         # Security, JWT, MongoDB config
│   │       ├── controller/     # REST endpoints
│   │       ├── domain/         # MongoDB entities
│   │       ├── dto/            # Request/Response objects
│   │       ├── repository/     # Data access
│   │       ├── service/        # Business logic
│   │       └── security/       # JWT filter
│   ├── Dockerfile
│   └── build.gradle.kts
│
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── app/                # Pages (App Router)
│   │   │   ├── (auth)/         # Login, Register
│   │   │   └── (main)/         # Learn, Decks, Community
│   │   ├── components/         # UI components
│   │   └── lib/                # API client, hooks
│   ├── Dockerfile
│   └── package.json
│
├── nginx/                      # Reverse proxy
│   ├── nginx.conf
│   ├── conf.d/default.conf
│   └── ssl/                    # Certificates
│
├── database/                   # Schema docs
├── docker-compose.yml
├── deploy.sh                   # Deployment script
└── .env.example                # Environment template
```

## API Endpoints

### Authentication
```
POST /api/auth/register         # Create account
POST /api/auth/login            # Get tokens
POST /api/auth/refresh          # Refresh token
POST /api/auth/logout           # Invalidate tokens
```

### Resources
```
GET  /api/videos                # List videos
GET  /api/videos/{id}           # Video details
GET  /api/vocabulary/decks      # List decks
GET  /api/vocabulary/decks/{id} # Deck details
GET  /api/forum/posts           # List posts
POST /api/forum/posts           # Create post
```

### Practice
```
POST /api/practice/dictation/attempts   # Submit dictation
POST /api/practice/shadowing/attempts   # Submit shadowing
GET  /api/practice/dictation/stats      # User stats
```

### Documentation
```
GET  /swagger-ui/               # API documentation
GET  /actuator/health           # Health check
```

## Quick Start

### Development

```bash
# Backend
cd backend
./gradlew bootRun

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Access: http://localhost:3000

### Production (Docker)

```bash
# Configure environment
cp .env.example .env
nano .env  # Set MONGODB_URI, JWT_SECRET, DOMAIN

# Deploy
./deploy.sh init    # Setup SSL
./deploy.sh build   # Build images
./deploy.sh deploy  # Start services
```

## Environment Variables

```env
# MongoDB Atlas connection
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# JWT secret (generate: openssl rand -base64 32)
JWT_SECRET=your-256-bit-secret

# API URL for frontend
NEXT_PUBLIC_API_URL=/api

# Domain for SSL
DOMAIN=your-domain.com

# Spring profile
SPRING_PROFILES_ACTIVE=prod
```

## Deployment Commands

| Command | Description |
|---------|-------------|
| `./deploy.sh init` | First-time setup (SSL) |
| `./deploy.sh build` | Build Docker images |
| `./deploy.sh deploy` | Start all services |
| `./deploy.sh stop` | Stop services |
| `./deploy.sh restart` | Restart services |
| `./deploy.sh logs` | View logs |
| `./deploy.sh logs backend` | Backend logs only |
| `./deploy.sh status` | Container status |
| `./deploy.sh health` | Health checks |

## SSL Setup (Let's Encrypt)

```bash
# Stop nginx
docker compose stop nginx

# Get certificate
certbot certonly --standalone -d your-domain.com

# Copy to nginx
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/

# Start nginx
docker compose up -d nginx
```

## Database

MongoDB with 14 collections:
- `users` - Accounts, profiles, preferences
- `videos` - Content with transcripts
- `vocabularyDecks` - Vocabulary items
- `vocabularyProgress` - User progress
- `dictationAttempts` - Practice history
- `shadowingAttempts` - Practice history
- `posts` - Forum posts
- `comments` - Forum comments
- `postLikes` - Like records

## Default Credentials

After initial setup with DataSeeder:
- **Admin:** admin / admin123
- **User:** testuser / test123

## Architecture

```
┌─────────────────────────────────────────┐
│              Nginx (80/443)             │
│           Reverse Proxy + SSL           │
└──────────────┬──────────────┬───────────┘
               │              │
               ▼              ▼
┌──────────────────────┐  ┌──────────────────────┐
│   Frontend (3000)    │  │   Backend (8080)     │
│      Next.js 14      │  │    Spring Boot       │
└──────────────────────┘  └──────────┬───────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │    MongoDB Atlas     │
                          └──────────────────────┘
```

## License

MIT License
