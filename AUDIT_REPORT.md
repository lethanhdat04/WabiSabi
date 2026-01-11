# Nihongo Master - Full System Technical Audit Report

**Audit Date:** January 2026
**System Version:** 1.0.0
**Auditor:** Technical Review

---

## Executive Summary

The Nihongo Master system is a comprehensive Japanese language learning platform consisting of three layers: MongoDB database, Spring Boot (Kotlin) backend, and Next.js (React/TypeScript) frontend. This audit evaluates the system's technical completeness, consistency, and readiness for production/demo.

**Overall Assessment:** The system demonstrates solid architecture with well-defined patterns. Several integration gaps exist between frontend mock data and backend APIs that require attention before production deployment.

---

## 1. Database (MongoDB) Audit

### 1.1 Collections and Schemas

#### Collections Identified:
| Collection | Document Class | Status |
|------------|---------------|--------|
| `users` | User.kt | ✅ Complete |
| `refresh_tokens` | RefreshToken.kt | ✅ Complete |
| `posts` | Post.kt | ✅ Complete |
| `comments` | Comment.kt | ✅ Complete |
| `post_likes` | PostLike.kt | ✅ Complete |
| `comment_likes` | CommentLike.kt | ✅ Complete |
| `videos` | Video.kt | ✅ Complete |
| `vocabulary_decks` | VocabularyDeck.kt | ✅ Complete |
| `vocabulary_progress` | VocabularyProgress.kt | ✅ Complete |
| `dictation_attempts` | DictationAttempt.kt | ✅ Complete |
| `shadowing_attempts` | ShadowingAttempt.kt | ✅ Complete |

### 1.2 Field Consistency and Naming

✅ **Correct / Complete:**
- Consistent camelCase naming convention across all entities
- Proper use of `@Document(collection = "...")` annotations
- Standard audit fields (`createdAt`, `updatedAt`) on all entities
- Consistent ID generation using `@Id` with String type

⚠️ **Issues / Risks:**
- `User.kt` uses `lastActiveAt` while practice attempts use only `createdAt` - inconsistent activity tracking
- `VideoStats` embedded in Video lacks `lastUpdatedAt` for cache invalidation
- Some entities use nullable fields excessively (e.g., `romaji: String?` in SubtitleSegment)

🔧 **Suggested Fixes:**
- Add `lastUpdatedAt` to embedded stats classes for cache management
- Document nullable field semantics in entity comments
- Consider adding `lastActiveAt` updates on practice attempts

### 1.3 Relationships Between Collections

✅ **Correct / Complete:**
- User → Posts/Comments: One-to-Many via `authorId`
- User → Progress: One-to-Many via `userId`
- Video → Attempts: One-to-Many via `videoId`
- Deck → Progress: One-to-Many via `deckId`
- Post → Comments: One-to-Many via `postId`
- Comment → Replies: Self-referencing via `parentCommentId`

⚠️ **Issues / Risks:**
- No referential integrity enforcement (MongoDB limitation)
- Denormalized author data (`authorUsername`, `authorAvatarUrl`) requires sync on user updates
- No cascade delete implementation for orphan cleanup

🔧 **Suggested Fixes:**
- Implement event listeners for denormalized data synchronization
- Add scheduled job for orphan document cleanup
- Document denormalization strategy in architecture docs

### 1.4 Indexes and Performance

✅ **Correct / Complete:**
- Text indexes on searchable fields (posts, videos, decks)
- Compound indexes for common query patterns
- Unique constraints on email, username, youtubeId, token

**Indexes Defined:**
```
posts: [title+content (text), topic+createdAt, authorId+createdAt, status+createdAt]
comments: [postId+createdAt, authorId+createdAt, parentCommentId+createdAt]
videos: [title+titleJapanese+description (text), category+level, status+createdAt]
vocabulary_decks: [title+description (text), createdBy+status, isPublic+level, topic+level]
vocabulary_progress: [userId+deckId (unique), userId+lastStudiedAt]
dictation_attempts: [userId+videoId, userId+createdAt]
shadowing_attempts: [userId+videoId, userId+createdAt]
post_likes: [userId+postId (unique), postId+createdAt]
```

⚠️ **Issues / Risks:**
- No index on `User.email` for login lookups (implicit on unique constraint)
- Missing index on `VocabularyProgress.nextReviewAt` for spaced repetition queries
- Text search weight configuration may need tuning

🔧 **Suggested Fixes:**
- Add explicit index on frequently queried fields
- Add index on `ItemProgress.nextReviewAt` for review queue optimization
- Consider TTL index on `refresh_tokens` for automatic cleanup

### 1.5 Missing or Redundant Fields

⚠️ **Issues / Risks:**
- `User.progress` has `streak` but no `maxStreak` for achievements
- No `deletedAt` soft-delete timestamp (uses status enum instead)
- `VideoStats.averageRating` exists but no individual ratings collection
- Missing `User.timezone` for localized scheduling

🔧 **Suggested Fixes:**
- Add `maxStreak` field for achievement tracking
- Consider separate `video_ratings` collection for detailed rating analytics
- Add timezone to user preferences

---

## 2. Backend (Spring Boot – Kotlin) Audit

### 2.1 Package Structure and Layering

✅ **Correct / Complete:**
```
com.nihongomaster/
├── config/          # Spring configuration
├── controller/      # REST endpoints (9 controllers)
├── domain/          # MongoDB entities (11 documents)
├── dto/             # Request/Response DTOs (40+ classes)
├── exception/       # Custom exceptions (9 types)
├── mapper/          # Entity-DTO mappers (2 mappers)
├── repository/      # MongoDB repositories (10 repos)
├── security/        # JWT authentication
└── service/         # Business logic (9+ services)
```

- Clean separation of concerns
- Consistent package naming
- Domain-driven organization

⚠️ **Issues / Risks:**
- Missing `mapper/` classes for Video and Practice domains (inline mapping in services)
- No `validator/` package for complex business validations
- Missing `util/` package for helper functions

🔧 **Suggested Fixes:**
- Extract video and practice mapping to dedicated mapper classes
- Create validators for complex input validation (e.g., subtitle timing)

### 2.2 Authentication & Authorization Flow

✅ **Correct / Complete:**
- JWT-based stateless authentication
- Access token + Refresh token pattern
- Role-based access control (USER, PREMIUM, ADMIN)
- BCrypt password encoding (strength 12)
- CORS configuration for frontend origins
- Proper 401/403 error handling

**Security Configuration:**
- Public: `/api/auth/**`, `/api/videos/**` (GET), `/api/forum/posts/**` (GET)
- Authenticated: All other endpoints
- Admin only: `/api/admin/**`, video CRUD, post status updates

⚠️ **Issues / Risks:**
- Security config references `/api/decks/public/**` but actual path is `/api/vocabulary/decks`
- Security config references `/api/community/posts/**` but actual path is `/api/forum/posts`
- No rate limiting implementation
- No IP-based blocking for failed login attempts
- Refresh token stored in DB but no cleanup job

🔧 **Suggested Fixes:**
- Fix path mismatches in SecurityConfig
- Implement rate limiting with Spring bucket4j or similar
- Add scheduled job for expired refresh token cleanup
- Consider Redis for refresh token storage

### 2.3 DTO ↔ Entity Mappings

✅ **Correct / Complete:**
- Comprehensive DTOs for all domains
- Separate Request/Response classes
- PageResponse wrapper for pagination
- Proper null handling in mappers

⚠️ **Issues / Risks:**
- Manual mapping in services instead of MapStruct
- Some circular reference risks in nested DTOs
- Inconsistent use of `@JsonInclude(NON_NULL)` for optional fields

🔧 **Suggested Fixes:**
- Consider MapStruct for compile-time mapping safety
- Add `@JsonInclude` annotations consistently
- Document DTO inheritance patterns

### 2.4 API Endpoint Coverage vs Frontend Usage

**Backend Endpoints Available:**

| Domain | Endpoints | Frontend Usage |
|--------|-----------|----------------|
| Auth | 5 | ⚠️ Not integrated |
| Users | 4 | ⚠️ Not integrated |
| Forum Posts | 18 | ⚠️ Not integrated |
| Comments | 6 | ⚠️ Not integrated |
| Videos | 9 | ⚠️ Not integrated |
| Dictation | 8 | ⚠️ Not integrated |
| Shadowing | 8 | ⚠️ Not integrated |
| Vocabulary Decks | 17 | ⚠️ Not integrated |
| Vocabulary Practice | 11 | ⚠️ Not integrated |

⚠️ **Critical Issue:** Frontend uses mock data exclusively; no actual API integration exists.

🔧 **Suggested Fixes:**
- Create API client service layer in frontend
- Implement API hooks with React Query or SWR
- Add environment configuration for API base URL

### 2.5 Exception Handling and Error Consistency

✅ **Correct / Complete:**
- Custom `ApiException` hierarchy
- Global exception handler with `@RestControllerAdvice`
- Consistent error response format
- Validation error mapping

**Error Response Format:**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "details": {},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

⚠️ **Issues / Risks:**
- Some services throw generic `RuntimeException` instead of specific exceptions
- No request ID tracking for error correlation
- Missing error codes documentation

🔧 **Suggested Fixes:**
- Audit services for generic exception usage
- Add correlation ID to error responses
- Create error code enum/documentation

### 2.6 Potential Security Issues

⚠️ **Issues / Risks:**
- No input sanitization for XSS in user-generated content (posts, comments)
- No file upload security (for future audio uploads)
- JWT secret likely hardcoded in config (should use env vars)
- No audit logging for security events
- Password requirements not enforced in validation

🔧 **Suggested Fixes:**
- Add HTML sanitization for content fields
- Implement CSP headers
- Move secrets to environment variables
- Add security event audit logging
- Add password complexity validation

---

## 3. Frontend (Next.js + React) Audit

### 3.1 Required Pages Exist and Reachable

✅ **Complete Pages (18):**

| Route | Page | Status |
|-------|------|--------|
| `/learn` | Learning Dashboard | ✅ |
| `/learn/videos` | Video Library | ✅ |
| `/learn/vocabulary` | Vocabulary Decks | ✅ |
| `/practice` | Practice Center | ✅ |
| `/practice/shadowing` | Shadowing Practice | ✅ |
| `/practice/dictation` | Dictation Practice | ✅ |
| `/practice/flashcards` | Flashcard Review | ✅ |
| `/practice/fill-in` | Fill-in-the-Blank | ✅ |
| `/practice/[videoId]/result` | Practice Results | ✅ |
| `/decks` | Deck Library | ✅ |
| `/decks/[deckId]` | Deck Detail | ✅ |
| `/decks/[deckId]/flashcards` | Deck Flashcards | ✅ |
| `/decks/[deckId]/quiz` | Deck Quiz | ✅ |
| `/decks/review` | Spaced Repetition | ✅ |
| `/community` | Community Feed | ✅ |
| `/community/new` | Create Post | ✅ |
| `/community/[postId]` | Post Detail | ✅ |
| `/profile` | User Profile | ✅ |
| `/history` | Practice History | ✅ |
| `/progress` | Progress Dashboard | ✅ |

⚠️ **Missing Pages:**
- `/login` - Authentication page
- `/register` - Registration page
- `/settings` - User settings (referenced in sidebar)
- `/help` - Help page (referenced in sidebar)
- `/learn/videos/[videoId]` - Video detail/player
- `/learn/vocabulary/[deckId]` - Redirects needed

🔧 **Suggested Fixes:**
- Create auth pages or implement modal-based auth
- Add settings and help pages or remove from navigation
- Add video detail page for video playback

### 3.2 Routing Consistency

✅ **Correct / Complete:**
- Consistent use of App Router pattern
- Proper `(main)` route group for layout
- Dynamic routes use `[param]` convention
- Links use Next.js `Link` component

⚠️ **Issues / Risks:**
- Sidebar links to `/settings` and `/help` which don't exist
- Some internal links may 404 (e.g., video/deck detail from list pages)
- No 404 page customization
- No loading states for route transitions

🔧 **Suggested Fixes:**
- Add `not-found.tsx` for custom 404
- Add `loading.tsx` for route loading states
- Verify all Link hrefs have corresponding pages

### 3.3 UI Rule Compliance

**Design System Rules:**

| Rule | Status | Notes |
|------|--------|-------|
| Palette: neutral-900/800 bg | ✅ | Consistently applied |
| Palette: neutral-200/400 text | ✅ | Consistently applied |
| Palette: yellow-500 accent | ✅ | Consistently applied |
| Border: border-neutral-700 | ✅ | Consistently applied |
| No shadows | ✅ | No shadow classes used |
| No gradients | ✅ | No gradient classes used |
| No blur/glass effects | ✅ | No blur classes used |
| No emojis | ✅ | No emojis in UI |
| Spacing: 8/12/16 only | ⚠️ | Some variations exist |
| Fonts: Montserrat Alternates headings | ✅ | Applied via CSS |
| Fonts: Be Vietnam Pro body | ✅ | Applied via CSS |
| Border radius: rounded-lg/xl/md | ✅ | Consistent usage |
| Icons: Lucide outline w-5/w-6 | ✅ | Consistent usage |

⚠️ **Minor Issues:**
- Some spacing uses gap-3, gap-6, py-8 outside strict 8/12/16 rule
- A few instances of gap-2 and p-3

🔧 **Suggested Fixes:**
- Audit and standardize spacing values
- Create spacing utility classes for consistency

### 3.4 Component Reusability and Layout Consistency

✅ **Correct / Complete:**
- Centralized UI components in `/components/ui`
- Layout components properly abstracted
- Consistent Card, Button, Badge, Progress usage
- Index exports for clean imports

**Components:**
- `Button` - 3 variants (primary, secondary, ghost)
- `Card` - 2 variants (default, interactive)
- `Badge` - 5 variants (default, yellow, green, blue, red)
- `Progress` - 3 sizes (sm, md, lg)
- `Input` - Standard text input
- `Tabs` - Tab navigation

⚠️ **Issues / Risks:**
- No Modal/Dialog component (needed for confirmations)
- No Toast/Notification component
- No Dropdown/Select component
- No Loading/Skeleton component
- Textarea styling inconsistent (inline styles in pages)

🔧 **Suggested Fixes:**
- Add Modal component for confirmations and forms
- Add Toast component for feedback messages
- Add Select component for dropdowns
- Create Skeleton component for loading states
- Extract Textarea to UI component

### 3.5 Missing or Duplicated Pages/Components

⚠️ **Duplicated Patterns:**
- Flashcard logic duplicated in `/practice/flashcards` and `/decks/[deckId]/flashcards`
- Result display logic similar across practice types
- Form validation patterns repeated

🔧 **Suggested Fixes:**
- Extract shared practice logic to custom hooks
- Create reusable ResultDisplay component
- Create form validation hook/utilities

---

## 4. Cross-layer Integration Audit

### 4.1 Frontend ↔ Backend API Alignment

⚠️ **Critical Issue:** No actual API integration exists.

**Current State:**
- Frontend uses hardcoded mock data in `/lib/mock-data.ts`
- No API client or service layer
- No environment configuration for API URLs
- Zustand listed in dependencies but not implemented

**Required Integration Points:**

| Feature | Backend Endpoint | Frontend Status |
|---------|-----------------|-----------------|
| Login | POST /api/auth/login | ❌ Not integrated |
| Register | POST /api/auth/register | ❌ Not integrated |
| Get Videos | GET /api/videos | ❌ Mock data |
| Get Decks | GET /api/vocabulary/decks | ❌ Mock data |
| Get Posts | GET /api/forum/posts | ❌ Mock data |
| Submit Practice | POST /api/practice/* | ❌ Mock timeout |
| Get Progress | GET /api/vocabulary/practice/progress | ❌ Mock data |
| Create Post | POST /api/forum/posts | ❌ Mock timeout |

🔧 **Suggested Fixes:**
- Create `/lib/api-client.ts` with axios/fetch wrapper
- Create `/hooks/use*.ts` for data fetching (or use React Query)
- Add `.env.local` with `NEXT_PUBLIC_API_URL`
- Implement auth context with token storage
- Replace mock data with API calls

### 4.2 Data Models Consistency

**Comparison: Backend Entity vs Frontend Mock:**

| Field | Backend | Frontend Mock | Match |
|-------|---------|---------------|-------|
| Deck.id | String | string | ✅ |
| Deck.title | String | string | ✅ |
| Deck.level | JLPTLevel enum | string (N1-N5) | ⚠️ |
| Deck.topic | DeckTopic enum | string | ⚠️ |
| Deck.sections | List<Section> | Not in mock | ❌ |
| Video.duration | Int (seconds) | number | ✅ |
| Video.category | VideoCategory enum | string | ⚠️ |
| Post.topic | ForumTopic enum | category: string | ⚠️ |
| User.progress | UserProgress | Not in mock | ❌ |

⚠️ **Issues:**
- Enum values need to match exactly
- Some backend fields missing from frontend mocks
- Nested structures (sections, progress) not represented

🔧 **Suggested Fixes:**
- Generate TypeScript types from backend DTOs
- Use OpenAPI/Swagger codegen for type safety
- Ensure enum string values match

### 4.3 Missing Endpoints or Mismatched Contracts

⚠️ **Missing Backend Endpoints:**
- No endpoint for user statistics aggregation
- No endpoint for practice session summary
- No endpoint for achievement/badge listing
- No endpoint for notification management

⚠️ **Frontend Expecting but Not Available:**
- Weekly activity chart data
- Skill level breakdown
- Achievement badges list
- Notification list

🔧 **Suggested Fixes:**
- Add `/api/users/me/stats` for aggregated statistics
- Add `/api/users/me/achievements` for achievements
- Add notification endpoints if needed

### 4.4 Authentication Flow Across FE–BE

**Backend Auth Flow:**
1. POST /api/auth/register → Returns tokens + user
2. POST /api/auth/login → Returns tokens + user
3. Include `Authorization: Bearer {accessToken}` header
4. POST /api/auth/refresh → Returns new tokens
5. POST /api/auth/logout → Revokes tokens

**Frontend Auth Status:**
- ❌ No login/register pages
- ❌ No auth context/provider
- ❌ No token storage mechanism
- ❌ No authenticated API calls
- ❌ No auth state persistence
- ❌ No protected route handling

🔧 **Suggested Fixes:**
- Create AuthContext with token management
- Add login/register pages
- Implement token refresh interceptor
- Add protected route wrapper
- Store tokens in httpOnly cookies or secure storage

---

## 5. Overall System Evaluation

### 5.1 Architecture Clarity

✅ **Strengths:**
- Clear three-tier architecture (FE → BE → DB)
- Domain-driven design in backend
- Component-based frontend architecture
- Consistent naming conventions
- Well-defined API contracts (DTOs)

⚠️ **Weaknesses:**
- Missing service layer documentation
- No API documentation (Swagger UI available but needs verification)
- Missing architecture decision records (ADRs)
- No sequence diagrams for complex flows

**Score: 7/10**

### 5.2 Scalability Readiness

✅ **Strengths:**
- Stateless JWT authentication
- MongoDB indexes for query optimization
- Pagination on all list endpoints
- Soft delete patterns for data retention

⚠️ **Weaknesses:**
- No caching layer (Redis)
- No message queue for async operations
- No CDN configuration for static assets
- Database connection pooling not configured
- No horizontal scaling considerations

**Score: 5/10**

### 5.3 Maintainability

✅ **Strengths:**
- TypeScript for type safety
- Kotlin null safety
- Consistent code style
- Modular component architecture
- Centralized exception handling

⚠️ **Weaknesses:**
- No unit tests visible
- No integration tests visible
- No E2E tests visible
- Limited code comments
- No logging strategy
- Missing CI/CD configuration

**Score: 6/10**

### 5.4 Readiness for Demo / Defense

✅ **Ready:**
- Complete UI implementation
- All major features have frontend pages
- Backend APIs fully implemented
- Mock data provides realistic demo experience
- Visually polished and consistent UI

⚠️ **Not Ready:**
- No actual frontend-backend integration
- No authentication flow working end-to-end
- No data persistence in frontend demo
- No error handling for API failures

**Demo Strategy Recommendation:**
1. **Option A:** Demo frontend with mock data (current state) - Ready now
2. **Option B:** Demo backend via Swagger/Postman - Ready now
3. **Option C:** Full integration demo - Requires 2-3 days work

**Score: 7/10 (for Option A demo)**

---

## Summary of Critical Issues

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 High | No FE-BE API integration | System not functional end-to-end | High |
| 🔴 High | No authentication pages | Users cannot login | Medium |
| 🟡 Medium | Security config path mismatches | Wrong endpoints may be public | Low |
| 🟡 Medium | Missing UI components (Modal, Toast) | Poor UX for confirmations | Medium |
| 🟡 Medium | No loading/error states | Poor UX during API calls | Medium |
| 🟢 Low | Spacing inconsistencies | Minor visual issues | Low |
| 🟢 Low | Missing /settings, /help pages | Broken nav links | Low |

---

## Recommendations Summary

### Immediate (Before Demo):
1. Fix broken sidebar links (remove or add placeholder pages)
2. Verify Swagger UI accessible for backend demo
3. Document demo walkthrough script

### Short-term (1-2 weeks):
1. Create API client layer in frontend
2. Add authentication pages and context
3. Integrate critical flows (login, view videos, view decks)
4. Add loading and error states

### Medium-term (1 month):
1. Complete all API integrations
2. Add comprehensive error handling
3. Implement caching strategy
4. Add unit and integration tests
5. Set up CI/CD pipeline

---

**Report Generated:** January 2026
**Next Review:** After integration milestone
