# Nihongo Master API - Phase 1: Authentication

## Overview

This document describes the REST API endpoints for the authentication system implemented in Phase 1.

## Base URL

- Development: `http://localhost:8080`
- Production: `https://api.nihongomaster.com`

## Authentication

Most endpoints require authentication via JWT Bearer token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-access-token>
```

---

## Endpoints

### 1. Register User

Creates a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "nihongo_learner",
  "password": "securepassword123",
  "displayName": "Tanaka",
  "nativeLanguage": "en",
  "targetLevel": "N3"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `username`: Required, 3-30 characters, alphanumeric and underscores only
- `password`: Required, 8-100 characters
- `displayName`: Required, 1-50 characters
- `nativeLanguage`: Optional, defaults to "en"
- `targetLevel`: Optional, one of: N5, N4, N3, N2, N1

**Success Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "user@example.com",
    "username": "nihongo_learner",
    "displayName": "Tanaka",
    "avatarUrl": null,
    "role": "USER"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation errors
```json
{
  "status": 400,
  "error": "Validation Failed",
  "message": "One or more fields have validation errors",
  "errorCode": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be between 8 and 100 characters"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

- `409 Conflict` - Email/username already exists
```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Email already registered",
  "errorCode": "EMAIL_EXISTS",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 2. Login

Authenticates user and returns tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "emailOrUsername": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "user@example.com",
    "username": "nihongo_learner",
    "displayName": "Tanaka",
    "avatarUrl": null,
    "role": "USER"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email/username or password",
  "errorCode": "INVALID_CREDENTIALS",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 3. Refresh Token

Generates new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "user@example.com",
    "username": "nihongo_learner",
    "displayName": "Tanaka",
    "avatarUrl": null,
    "role": "USER"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "errorCode": "INVALID_TOKEN",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 4. Logout

Revokes current session's refresh token.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Success Response (204 No Content):** Empty body

---

### 5. Logout All Devices

Revokes all refresh tokens for the user.

**Endpoint:** `POST /api/auth/logout-all`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Success Response (204 No Content):** Empty body

---

### 6. Get Current User

Returns the authenticated user's full profile.

**Endpoint:** `GET /api/users/me`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Success Response (200 OK):**
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "email": "user@example.com",
  "username": "nihongo_learner",
  "displayName": "Tanaka",
  "avatarUrl": null,
  "bio": null,
  "role": "USER",
  "nativeLanguage": "en",
  "targetLevel": "N3",
  "preferences": {
    "notificationsEnabled": true,
    "emailReminders": true,
    "reviewTime": "09:00",
    "interfaceLanguage": "en",
    "showFurigana": true,
    "autoPlayAudio": true,
    "dailyGoalMinutes": 15
  },
  "progress": {
    "listeningScore": 0.0,
    "speakingScore": 0.0,
    "vocabularyScore": 0.0,
    "totalXP": 0,
    "streak": 0,
    "longestStreak": 0,
    "lastPracticeDate": null,
    "totalVideosCompleted": 0,
    "totalVocabMastered": 0,
    "totalPracticeMinutes": 0
  },
  "followersCount": 0,
  "followingCount": 0,
  "emailVerified": false,
  "createdAt": "2024-01-15T10:00:00Z",
  "lastActiveAt": "2024-01-15T10:30:00Z"
}
```

---

### 7. Get Public Profile

Returns a user's public profile by username.

**Endpoint:** `GET /api/users/profile/{username}`

**Success Response (200 OK):**
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "username": "nihongo_learner",
  "displayName": "Tanaka",
  "avatarUrl": null,
  "bio": null,
  "targetLevel": "N3",
  "progress": {
    "totalXP": 1500,
    "streak": 7,
    "longestStreak": 14,
    "totalVideosCompleted": 10,
    "totalVocabMastered": 150
  },
  "followersCount": 5,
  "followingCount": 12,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### 8. Update Profile

Updates the authenticated user's profile.

**Endpoint:** `PUT /api/users/me`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "displayName": "Tanaka San",
  "bio": "Learning Japanese for fun!",
  "avatarUrl": "https://example.com/avatar.jpg",
  "nativeLanguage": "vi",
  "targetLevel": "N2"
}
```

All fields are optional. Only provided fields will be updated.

**Success Response (200 OK):** Returns full UserResponse (same as GET /api/users/me)

---

### 9. Update Preferences

Updates the authenticated user's preferences.

**Endpoint:** `PUT /api/users/me/preferences`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "notificationsEnabled": false,
  "emailReminders": true,
  "reviewTime": "20:00",
  "interfaceLanguage": "vi",
  "showFurigana": true,
  "autoPlayAudio": false,
  "dailyGoalMinutes": 30
}
```

All fields are optional. Only provided fields will be updated.

**Success Response (200 OK):** Returns full UserResponse (same as GET /api/users/me)

---

## Security Flow

### JWT Token Structure

**Access Token Claims:**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "username": "nihongo_learner",
  "role": "USER",
  "iat": 1705312200,
  "exp": 1705315800
}
```

**Refresh Token Claims:**
```json
{
  "sub": "user-id",
  "type": "refresh",
  "iat": 1705312200,
  "exp": 1707904200
}
```

### Token Lifecycle

1. **Registration/Login**: Client receives access token (1 hour) and refresh token (30 days)
2. **API Requests**: Client includes access token in Authorization header
3. **Token Expiry**: When access token expires, client calls `/api/auth/refresh`
4. **Refresh**: Server validates refresh token, issues new token pair
5. **Logout**: Client calls logout endpoint to revoke refresh token

### Password Security

- Passwords are hashed using BCrypt with cost factor 12
- Minimum password length: 8 characters
- Maximum password length: 100 characters

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Human-readable error message",
  "errorCode": "MACHINE_READABLE_CODE",
  "details": {
    "field1": "Field-specific error",
    "field2": "Field-specific error"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `INVALID_TOKEN` | 401 | Token expired/invalid |
| `UNAUTHORIZED` | 401 | Authentication required |
| `ACCESS_DENIED` | 403 | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Resource doesn't exist |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `USERNAME_EXISTS` | 409 | Username already taken |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Running the Application

### Prerequisites

- Java 21+
- MongoDB 7+
- Gradle 8+

### Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/nihongo_master
JWT_SECRET=your-secret-key-at-least-256-bits
JWT_ACCESS_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=2592000000
```

### Start the Application

```bash
cd backend
./gradlew bootRun
```

### Access Swagger UI

Open `http://localhost:8080/swagger-ui.html` in your browser.

---

## cURL Examples

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "displayName": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <access-token>"
```

### Update Profile
```bash
curl -X PUT http://localhost:8080/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access-token>" \
  -d '{
    "displayName": "Updated Name",
    "bio": "Learning Japanese!"
  }'
```
