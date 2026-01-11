# Nihongo Master - Backend Architecture (Spring Boot)

## Overview

This document outlines the backend architecture for Nihongo Master using **Spring Boot 3.x**, **Java 21**, **MongoDB**, and modern microservices patterns.

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Spring Boot 3.2+ |
| Language | Java 21 (LTS) |
| Database | MongoDB 7.x |
| Cache | Redis 7.x |
| Message Queue | RabbitMQ / Apache Kafka |
| Search | MongoDB Atlas Search / Elasticsearch |
| Security | Spring Security + JWT |
| API Documentation | SpringDoc OpenAPI 3 |
| Testing | JUnit 5, Mockito, Testcontainers |
| Build Tool | Gradle 8.x (Kotlin DSL) |
| Containerization | Docker + Docker Compose |

---

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── nihongomaster/
│   │   │           ├── NihongoMasterApplication.java
│   │   │           │
│   │   │           ├── config/                    # Configuration
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── MongoConfig.java
│   │   │           │   ├── RedisConfig.java
│   │   │           │   ├── WebConfig.java
│   │   │           │   ├── AsyncConfig.java
│   │   │           │   ├── OpenApiConfig.java
│   │   │           │   └── SchedulerConfig.java
│   │   │           │
│   │   │           ├── security/                  # Security components
│   │   │           │   ├── jwt/
│   │   │           │   │   ├── JwtTokenProvider.java
│   │   │           │   │   ├── JwtAuthenticationFilter.java
│   │   │           │   │   └── JwtProperties.java
│   │   │           │   ├── oauth2/
│   │   │           │   │   ├── OAuth2SuccessHandler.java
│   │   │           │   │   └── CustomOAuth2UserService.java
│   │   │           │   ├── UserPrincipal.java
│   │   │           │   └── CurrentUser.java
│   │   │           │
│   │   │           ├── domain/                    # Domain entities
│   │   │           │   ├── user/
│   │   │           │   │   ├── User.java
│   │   │           │   │   ├── UserPreferences.java
│   │   │           │   │   ├── UserProgress.java
│   │   │           │   │   └── UserRole.java
│   │   │           │   ├── video/
│   │   │           │   │   ├── Video.java
│   │   │           │   │   ├── Transcript.java
│   │   │           │   │   ├── TranscriptSegment.java
│   │   │           │   │   └── VideoCategory.java
│   │   │           │   ├── deck/
│   │   │           │   │   ├── Deck.java
│   │   │           │   │   ├── DeckSection.java
│   │   │           │   │   └── VocabularyItem.java
│   │   │           │   ├── practice/
│   │   │           │   │   ├── PracticeSession.java
│   │   │           │   │   ├── PracticeAttempt.java
│   │   │           │   │   ├── AIFeedback.java
│   │   │           │   │   └── PracticeMode.java
│   │   │           │   ├── review/
│   │   │           │   │   ├── ReviewItem.java
│   │   │           │   │   └── ReviewHistory.java
│   │   │           │   ├── community/
│   │   │           │   │   ├── Post.java
│   │   │           │   │   ├── Comment.java
│   │   │           │   │   └── Report.java
│   │   │           │   ├── achievement/
│   │   │           │   │   ├── Achievement.java
│   │   │           │   │   └── UserAchievement.java
│   │   │           │   └── notification/
│   │   │           │       └── Notification.java
│   │   │           │
│   │   │           ├── repository/                # Data access layer
│   │   │           │   ├── UserRepository.java
│   │   │           │   ├── VideoRepository.java
│   │   │           │   ├── DeckRepository.java
│   │   │           │   ├── PracticeSessionRepository.java
│   │   │           │   ├── ReviewItemRepository.java
│   │   │           │   ├── PostRepository.java
│   │   │           │   ├── CommentRepository.java
│   │   │           │   ├── AchievementRepository.java
│   │   │           │   └── NotificationRepository.java
│   │   │           │
│   │   │           ├── service/                   # Business logic
│   │   │           │   ├── auth/
│   │   │           │   │   ├── AuthService.java
│   │   │           │   │   └── AuthServiceImpl.java
│   │   │           │   ├── user/
│   │   │           │   │   ├── UserService.java
│   │   │           │   │   └── UserServiceImpl.java
│   │   │           │   ├── video/
│   │   │           │   │   ├── VideoService.java
│   │   │           │   │   └── VideoServiceImpl.java
│   │   │           │   ├── deck/
│   │   │           │   │   ├── DeckService.java
│   │   │           │   │   └── DeckServiceImpl.java
│   │   │           │   ├── practice/
│   │   │           │   │   ├── PracticeService.java
│   │   │           │   │   └── PracticeServiceImpl.java
│   │   │           │   ├── ai/
│   │   │           │   │   ├── AIService.java
│   │   │           │   │   ├── AIServiceImpl.java
│   │   │           │   │   ├── SpeechAnalysisClient.java
│   │   │           │   │   └── TranscriptionClient.java
│   │   │           │   ├── review/
│   │   │           │   │   ├── ReviewService.java
│   │   │           │   │   ├── ReviewServiceImpl.java
│   │   │           │   │   └── SM2Algorithm.java
│   │   │           │   ├── community/
│   │   │           │   │   ├── CommunityService.java
│   │   │           │   │   ├── CommunityServiceImpl.java
│   │   │           │   │   └── ModerationService.java
│   │   │           │   ├── achievement/
│   │   │           │   │   ├── AchievementService.java
│   │   │           │   │   └── AchievementServiceImpl.java
│   │   │           │   ├── notification/
│   │   │           │   │   ├── NotificationService.java
│   │   │           │   │   └── NotificationServiceImpl.java
│   │   │           │   └── storage/
│   │   │           │       ├── StorageService.java
│   │   │           │       └── S3StorageServiceImpl.java
│   │   │           │
│   │   │           ├── controller/                # REST controllers
│   │   │           │   ├── AuthController.java
│   │   │           │   ├── UserController.java
│   │   │           │   ├── VideoController.java
│   │   │           │   ├── DeckController.java
│   │   │           │   ├── PracticeController.java
│   │   │           │   ├── ReviewController.java
│   │   │           │   ├── CommunityController.java
│   │   │           │   ├── NotificationController.java
│   │   │           │   └── admin/
│   │   │           │       ├── AdminVideoController.java
│   │   │           │       ├── AdminDeckController.java
│   │   │           │       ├── AdminUserController.java
│   │   │           │       └── ModerationController.java
│   │   │           │
│   │   │           ├── dto/                       # Data transfer objects
│   │   │           │   ├── request/
│   │   │           │   │   ├── LoginRequest.java
│   │   │           │   │   ├── RegisterRequest.java
│   │   │           │   │   ├── CreateDeckRequest.java
│   │   │           │   │   ├── AddVocabularyRequest.java
│   │   │           │   │   ├── StartPracticeRequest.java
│   │   │           │   │   ├── SubmitAttemptRequest.java
│   │   │           │   │   ├── CreatePostRequest.java
│   │   │           │   │   └── CommentRequest.java
│   │   │           │   ├── response/
│   │   │           │   │   ├── AuthResponse.java
│   │   │           │   │   ├── UserResponse.java
│   │   │           │   │   ├── VideoResponse.java
│   │   │           │   │   ├── DeckResponse.java
│   │   │           │   │   ├── PracticeSessionResponse.java
│   │   │           │   │   ├── AttemptResultResponse.java
│   │   │           │   │   ├── ReviewItemResponse.java
│   │   │           │   │   ├── PostResponse.java
│   │   │           │   │   └── PageResponse.java
│   │   │           │   └── mapper/
│   │   │           │       ├── UserMapper.java
│   │   │           │       ├── VideoMapper.java
│   │   │           │       ├── DeckMapper.java
│   │   │           │       └── PostMapper.java
│   │   │           │
│   │   │           ├── event/                     # Domain events
│   │   │           │   ├── UserRegisteredEvent.java
│   │   │           │   ├── PracticeCompletedEvent.java
│   │   │           │   ├── ReviewCompletedEvent.java
│   │   │           │   └── AchievementUnlockedEvent.java
│   │   │           │
│   │   │           ├── listener/                  # Event listeners
│   │   │           │   ├── UserEventListener.java
│   │   │           │   ├── PracticeEventListener.java
│   │   │           │   └── AchievementEventListener.java
│   │   │           │
│   │   │           ├── scheduler/                 # Scheduled tasks
│   │   │           │   ├── ReviewReminderScheduler.java
│   │   │           │   ├── WeeklyReportScheduler.java
│   │   │           │   └── DataCleanupScheduler.java
│   │   │           │
│   │   │           ├── exception/                 # Exception handling
│   │   │           │   ├── GlobalExceptionHandler.java
│   │   │           │   ├── ResourceNotFoundException.java
│   │   │           │   ├── BadRequestException.java
│   │   │           │   ├── UnauthorizedException.java
│   │   │           │   └── ForbiddenException.java
│   │   │           │
│   │   │           └── util/                      # Utilities
│   │   │               ├── SlugGenerator.java
│   │   │               ├── DateUtils.java
│   │   │               └── ValidationUtils.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── messages/
│   │           ├── messages.properties
│   │           ├── messages_vi.properties
│   │           └── messages_ja.properties
│   │
│   └── test/
│       └── java/
│           └── com/
│               └── nihongomaster/
│                   ├── integration/
│                   ├── service/
│                   └── controller/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── build.gradle.kts
├── settings.gradle.kts
└── README.md
```

---

## Key Components

### 1. Security Configuration

```java
// config/SecurityConfig.java
package com.nihongomaster.config;

import com.nihongomaster.security.jwt.JwtAuthenticationFilter;
import com.nihongomaster.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/videos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/decks/public/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/community/posts/**").permitAll()

                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(
                new JwtAuthenticationFilter(jwtTokenProvider),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

### 2. JWT Token Provider

```java
// security/jwt/JwtTokenProvider.java
package com.nihongomaster.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenValidityMs;
    private final long refreshTokenValidityMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-validity}") long accessTokenValidity,
            @Value("${jwt.refresh-token-validity}") long refreshTokenValidity) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenValidityMs = accessTokenValidity * 1000;
        this.refreshTokenValidityMs = refreshTokenValidity * 1000;
    }

    public String createAccessToken(String userId, String email, List<String> roles) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityMs);

        return Jwts.builder()
                .setSubject(userId)
                .claim("email", email)
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    public String createRefreshToken(String userId) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidityMs);

        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        @SuppressWarnings("unchecked")
        List<String> roles = claims.get("roles", List.class);

        var authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());

        UserPrincipal principal = new UserPrincipal(
                claims.getSubject(),
                claims.get("email", String.class),
                roles
        );

        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public String getUserIdFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
```

### 3. User Domain Entity

```java
// domain/user/User.java
package com.nihongomaster.domain.user;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String username;

    private String passwordHash;
    private String displayName;
    private String avatarUrl;
    private String bio;

    @Builder.Default
    private UserRole role = UserRole.USER;

    private String nativeLanguage;
    private JLPTLevel targetLevel;

    @Builder.Default
    private UserPreferences preferences = new UserPreferences();

    @Builder.Default
    private UserProgress progress = new UserProgress();

    @Builder.Default
    private Integer followersCount = 0;

    @Builder.Default
    private Integer followingCount = 0;

    @Builder.Default
    private Boolean emailVerified = false;

    @Builder.Default
    private Boolean isActive = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastActiveAt;

    // Helper methods
    public void addXP(long points) {
        this.progress.setTotalXP(this.progress.getTotalXP() + points);
    }

    public void incrementStreak() {
        int newStreak = this.progress.getStreak() + 1;
        this.progress.setStreak(newStreak);
        if (newStreak > this.progress.getLongestStreak()) {
            this.progress.setLongestStreak(newStreak);
        }
    }

    public void resetStreak() {
        this.progress.setStreak(0);
    }

    public boolean hasRole(UserRole requiredRole) {
        return this.role.ordinal() >= requiredRole.ordinal();
    }
}
```

### 4. Practice Service Implementation

```java
// service/practice/PracticeServiceImpl.java
package com.nihongomaster.service.practice;

import com.nihongomaster.domain.practice.*;
import com.nihongomaster.domain.video.Video;
import com.nihongomaster.dto.request.StartPracticeRequest;
import com.nihongomaster.dto.request.SubmitAttemptRequest;
import com.nihongomaster.dto.response.AttemptResultResponse;
import com.nihongomaster.dto.response.PracticeSessionResponse;
import com.nihongomaster.event.PracticeCompletedEvent;
import com.nihongomaster.exception.ResourceNotFoundException;
import com.nihongomaster.repository.PracticeSessionRepository;
import com.nihongomaster.service.ai.AIService;
import com.nihongomaster.service.review.ReviewService;
import com.nihongomaster.service.storage.StorageService;
import com.nihongomaster.service.user.UserService;
import com.nihongomaster.service.video.VideoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PracticeServiceImpl implements PracticeService {

    private final PracticeSessionRepository sessionRepository;
    private final VideoService videoService;
    private final AIService aiService;
    private final StorageService storageService;
    private final UserService userService;
    private final ReviewService reviewService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public PracticeSession startSession(String userId, StartPracticeRequest request) {
        Video video = videoService.getById(request.getVideoId());

        PracticeSession session = PracticeSession.builder()
                .userId(userId)
                .videoId(video.getId())
                .mode(request.getMode())
                .startedAt(LocalDateTime.now())
                .attempts(new ArrayList<>())
                .status(PracticeStatus.IN_PROGRESS)
                .totalSegments(video.getTranscript().getSegments().size())
                .segmentsCompleted(0)
                .build();

        return sessionRepository.save(session);
    }

    @Override
    @Transactional
    public AttemptResultResponse submitAttempt(
            String sessionId,
            String userId,
            SubmitAttemptRequest request,
            MultipartFile audioFile) {

        PracticeSession session = getSessionById(sessionId);
        validateSessionOwnership(session, userId);

        // Upload audio to cloud storage
        String audioUrl = storageService.uploadAudio(
                audioFile,
                String.format("practice/%s/%s", userId, sessionId)
        );

        // Get video for reference text
        Video video = videoService.getById(session.getVideoId());
        String referenceText = video.getTranscript()
                .getSegments()
                .get(request.getSegmentIndex())
                .getText();

        // Analyze with AI
        AIAnalysisResult analysis = aiService.analyzeRecording(
                audioUrl,
                referenceText,
                session.getMode()
        );

        // Create attempt record
        PracticeAttempt attempt = PracticeAttempt.builder()
                .segmentIndex(request.getSegmentIndex())
                .recordingUrl(audioUrl)
                .transcribedText(analysis.getTranscribedText())
                .pronunciationScore(analysis.getPronunciationScore())
                .speedScore(analysis.getSpeedScore())
                .intonationScore(analysis.getIntonationScore())
                .overallScore(analysis.getOverallScore())
                .phonemeAnalysis(analysis.getPhonemeAnalysis())
                .timestamp(LocalDateTime.now())
                .build();

        // Update session
        session.getAttempts().add(attempt);
        session.setSegmentsCompleted(
                (int) session.getAttempts().stream()
                        .map(PracticeAttempt::getSegmentIndex)
                        .distinct()
                        .count()
        );
        sessionRepository.save(session);

        return AttemptResultResponse.builder()
                .pronunciationScore(attempt.getPronunciationScore())
                .speedScore(attempt.getSpeedScore())
                .intonationScore(attempt.getIntonationScore())
                .overallScore(attempt.getOverallScore())
                .transcribedText(attempt.getTranscribedText())
                .feedback(analysis.getImmediateFeedback())
                .build();
    }

    @Override
    @Transactional
    public PracticeSession completeSession(String sessionId, String userId) {
        PracticeSession session = getSessionById(sessionId);
        validateSessionOwnership(session, userId);

        // Calculate overall score
        double overallScore = session.getAttempts().stream()
                .mapToDouble(PracticeAttempt::getOverallScore)
                .average()
                .orElse(0.0);

        // Generate comprehensive AI feedback
        AIFeedback feedback = aiService.generateSessionFeedback(session.getAttempts());

        // Update session
        session.setCompletedAt(LocalDateTime.now());
        session.setDuration((int) java.time.Duration.between(
                session.getStartedAt(), session.getCompletedAt()).getSeconds());
        session.setOverallScore(overallScore);
        session.setFeedback(feedback);
        session.setStatus(PracticeStatus.COMPLETED);

        PracticeSession completedSession = sessionRepository.save(session);

        // Schedule video for review
        reviewService.scheduleItem(userId, "VIDEO_SEGMENT", session.getVideoId());

        // Award XP and update progress
        int xpEarned = calculateXP(completedSession);
        userService.addXP(userId, xpEarned);
        userService.updatePracticeProgress(userId, completedSession);

        // Publish event for achievement checking
        eventPublisher.publishEvent(new PracticeCompletedEvent(this, completedSession));

        return completedSession;
    }

    @Override
    public Page<PracticeSession> getUserHistory(String userId, Pageable pageable) {
        return sessionRepository.findByUserIdOrderByStartedAtDesc(userId, pageable);
    }

    @Override
    public PracticeSession getSessionById(String sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Practice session not found: " + sessionId));
    }

    private void validateSessionOwnership(PracticeSession session, String userId) {
        if (!session.getUserId().equals(userId)) {
            throw new ForbiddenException("You don't have access to this session");
        }
    }

    private int calculateXP(PracticeSession session) {
        int baseXP = 10;
        int bonusXP = (int) (session.getOverallScore() / 10); // Up to 10 bonus XP
        int completionBonus = session.getSegmentsCompleted() == session.getTotalSegments() ? 15 : 0;
        return baseXP + bonusXP + completionBonus;
    }
}
```

### 5. SM-2 Spaced Repetition Algorithm

```java
// service/review/SM2Algorithm.java
package com.nihongomaster.service.review;

import com.nihongomaster.domain.review.ReviewItem;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Implementation of the SM-2 (SuperMemo 2) spaced repetition algorithm.
 *
 * Quality ratings:
 * 0 - Complete blackout, wrong response
 * 1 - Incorrect response, but upon seeing the correct one, remembered
 * 2 - Incorrect response, but the correct one seemed easy to recall
 * 3 - Correct response with serious difficulty
 * 4 - Correct response after hesitation
 * 5 - Perfect response
 */
@Component
public class SM2Algorithm {

    private static final double MIN_EASE_FACTOR = 1.3;
    private static final double DEFAULT_EASE_FACTOR = 2.5;

    /**
     * Calculate the next review schedule based on user's recall quality.
     *
     * @param item    The review item to update
     * @param quality Quality of recall (0-5)
     * @return Updated review item with new scheduling
     */
    public ReviewItem calculateNextReview(ReviewItem item, int quality) {
        quality = Math.max(0, Math.min(5, quality)); // Clamp to 0-5

        double easeFactor = item.getEaseFactor();
        int repetitions = item.getRepetitions();
        int interval = item.getInterval();

        if (quality >= 3) {
            // Successful recall
            if (repetitions == 0) {
                interval = 1; // First successful review: 1 day
            } else if (repetitions == 1) {
                interval = 6; // Second successful review: 6 days
            } else {
                interval = (int) Math.round(interval * easeFactor);
            }
            repetitions++;
        } else {
            // Failed recall - reset
            repetitions = 0;
            interval = 1;
        }

        // Update ease factor
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

        // Calculate next review date
        LocalDate nextReviewDate = LocalDate.now().plusDays(interval);

        return item.toBuilder()
                .easeFactor(easeFactor)
                .interval(interval)
                .repetitions(repetitions)
                .nextReviewDate(nextReviewDate)
                .lastReviewDate(LocalDate.now())
                .build();
    }

    /**
     * Initialize a new review item with default SM-2 values.
     */
    public ReviewItem initializeItem(String userId, String itemType, String itemId) {
        return ReviewItem.builder()
                .userId(userId)
                .itemType(itemType)
                .itemId(itemId)
                .easeFactor(DEFAULT_EASE_FACTOR)
                .interval(0)
                .repetitions(0)
                .nextReviewDate(LocalDate.now()) // Due immediately
                .status("ACTIVE")
                .build();
    }

    /**
     * Check if an item is due for review.
     */
    public boolean isDue(ReviewItem item) {
        return !item.getNextReviewDate().isAfter(LocalDate.now());
    }

    /**
     * Calculate priority for review queue.
     * Lower values = higher priority.
     */
    public double calculatePriority(ReviewItem item) {
        long daysOverdue = LocalDate.now().toEpochDay() - item.getNextReviewDate().toEpochDay();
        double overdueWeight = Math.max(0, daysOverdue) * 2.0;
        double easeWeight = (2.5 - item.getEaseFactor()) * 10; // Lower ease = higher priority
        return -(overdueWeight + easeWeight); // Negative for ascending sort
    }
}
```

### 6. Practice Controller

```java
// controller/PracticeController.java
package com.nihongomaster.controller;

import com.nihongomaster.domain.practice.PracticeSession;
import com.nihongomaster.dto.request.StartPracticeRequest;
import com.nihongomaster.dto.request.SubmitAttemptRequest;
import com.nihongomaster.dto.response.AttemptResultResponse;
import com.nihongomaster.dto.response.PageResponse;
import com.nihongomaster.dto.response.PracticeSessionResponse;
import com.nihongomaster.dto.mapper.PracticeMapper;
import com.nihongomaster.security.CurrentUser;
import com.nihongomaster.security.UserPrincipal;
import com.nihongomaster.service.practice.PracticeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/practice")
@RequiredArgsConstructor
@Tag(name = "Practice", description = "Shadowing and dictation practice endpoints")
@SecurityRequirement(name = "bearerAuth")
public class PracticeController {

    private final PracticeService practiceService;
    private final PracticeMapper mapper;

    @PostMapping("/sessions")
    @Operation(summary = "Start a new practice session")
    public ResponseEntity<PracticeSessionResponse> startSession(
            @CurrentUser UserPrincipal user,
            @Valid @RequestBody StartPracticeRequest request) {

        PracticeSession session = practiceService.startSession(user.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapper.toResponse(session));
    }

    @PostMapping(
            path = "/sessions/{sessionId}/attempts",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Submit a practice attempt with audio recording")
    public ResponseEntity<AttemptResultResponse> submitAttempt(
            @CurrentUser UserPrincipal user,
            @PathVariable String sessionId,
            @RequestParam("segmentIndex") int segmentIndex,
            @RequestParam("audio") MultipartFile audioFile) {

        SubmitAttemptRequest request = new SubmitAttemptRequest();
        request.setSegmentIndex(segmentIndex);

        AttemptResultResponse result = practiceService.submitAttempt(
                sessionId, user.getId(), request, audioFile);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/sessions/{sessionId}/complete")
    @Operation(summary = "Complete a practice session")
    public ResponseEntity<PracticeSessionResponse> completeSession(
            @CurrentUser UserPrincipal user,
            @PathVariable String sessionId) {

        PracticeSession session = practiceService.completeSession(sessionId, user.getId());
        return ResponseEntity.ok(mapper.toResponse(session));
    }

    @GetMapping("/sessions/{sessionId}")
    @Operation(summary = "Get a practice session by ID")
    public ResponseEntity<PracticeSessionResponse> getSession(
            @CurrentUser UserPrincipal user,
            @PathVariable String sessionId) {

        PracticeSession session = practiceService.getSessionById(sessionId);
        return ResponseEntity.ok(mapper.toResponse(session));
    }

    @GetMapping("/history")
    @Operation(summary = "Get user's practice history")
    public ResponseEntity<PageResponse<PracticeSessionResponse>> getHistory(
            @CurrentUser UserPrincipal user,
            Pageable pageable) {

        Page<PracticeSession> sessions = practiceService.getUserHistory(user.getId(), pageable);
        Page<PracticeSessionResponse> response = sessions.map(mapper::toResponse);

        return ResponseEntity.ok(PageResponse.from(response));
    }
}
```

---

## AI Service Integration

```java
// service/ai/AIServiceImpl.java
package com.nihongomaster.service.ai;

import com.nihongomaster.domain.practice.AIFeedback;
import com.nihongomaster.domain.practice.PracticeAttempt;
import com.nihongomaster.domain.practice.PracticeMode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final WebClient speechApiClient;
    private final WebClient llmApiClient;

    @Value("${ai.speech.api-key}")
    private String speechApiKey;

    @Value("${ai.llm.api-key}")
    private String llmApiKey;

    @Override
    public AIAnalysisResult analyzeRecording(
            String audioUrl,
            String referenceText,
            PracticeMode mode) {

        // Step 1: Transcribe audio using Speech-to-Text API
        String transcribedText = transcribeAudio(audioUrl);

        // Step 2: Analyze pronunciation using specialized API
        PronunciationAnalysis pronunciationResult = analyzePronunciation(
                audioUrl, referenceText);

        // Step 3: Calculate scores
        double pronunciationScore = pronunciationResult.getScore();
        double speedScore = calculateSpeedScore(
                pronunciationResult.getDuration(),
                referenceText.length());
        double intonationScore = pronunciationResult.getIntonationScore();
        double overallScore = (pronunciationScore * 0.5) +
                              (speedScore * 0.25) +
                              (intonationScore * 0.25);

        // Step 4: Generate immediate feedback
        String immediateFeedback = generateImmediateFeedback(
                pronunciationScore, speedScore, intonationScore);

        return AIAnalysisResult.builder()
                .transcribedText(transcribedText)
                .pronunciationScore(pronunciationScore)
                .speedScore(speedScore)
                .intonationScore(intonationScore)
                .overallScore(overallScore)
                .phonemeAnalysis(pronunciationResult.getPhonemeDetails())
                .immediateFeedback(immediateFeedback)
                .build();
    }

    @Override
    public AIFeedback generateSessionFeedback(List<PracticeAttempt> attempts) {
        // Aggregate attempt data
        String promptContext = buildFeedbackContext(attempts);

        // Call LLM API for comprehensive feedback
        LLMResponse response = llmApiClient.post()
                .uri("/v1/chat/completions")
                .header("Authorization", "Bearer " + llmApiKey)
                .bodyValue(buildFeedbackPrompt(promptContext))
                .retrieve()
                .bodyToMono(LLMResponse.class)
                .block();

        return parseFeedbackResponse(response);
    }

    private String transcribeAudio(String audioUrl) {
        TranscriptionResponse response = speechApiClient.post()
                .uri("/v1/audio/transcriptions")
                .header("Authorization", "Bearer " + speechApiKey)
                .bodyValue(new TranscriptionRequest(audioUrl, "ja"))
                .retrieve()
                .bodyToMono(TranscriptionResponse.class)
                .block();

        return response != null ? response.getText() : "";
    }

    private PronunciationAnalysis analyzePronunciation(
            String audioUrl,
            String referenceText) {
        // Call pronunciation analysis API (e.g., Azure Speech, Google Cloud)
        return speechApiClient.post()
                .uri("/v1/pronunciation/assessment")
                .header("Authorization", "Bearer " + speechApiKey)
                .bodyValue(new PronunciationRequest(audioUrl, referenceText, "ja-JP"))
                .retrieve()
                .bodyToMono(PronunciationAnalysis.class)
                .block();
    }

    private double calculateSpeedScore(double duration, int textLength) {
        // Average Japanese speaking rate: ~7-8 characters per second
        double expectedDuration = textLength / 7.5;
        double ratio = duration / expectedDuration;

        // Score based on how close to natural speed
        if (ratio >= 0.8 && ratio <= 1.2) {
            return 100 - (Math.abs(1 - ratio) * 50);
        } else if (ratio < 0.8) {
            return Math.max(0, 60 - (0.8 - ratio) * 100);
        } else {
            return Math.max(0, 60 - (ratio - 1.2) * 50);
        }
    }

    private String generateImmediateFeedback(
            double pronunciation,
            double speed,
            double intonation) {
        StringBuilder feedback = new StringBuilder();

        if (pronunciation >= 80) {
            feedback.append("Great pronunciation! ");
        } else if (pronunciation >= 60) {
            feedback.append("Good effort on pronunciation. ");
        } else {
            feedback.append("Keep practicing pronunciation. ");
        }

        if (speed < 70) {
            feedback.append("Try to speak at a more natural pace. ");
        }

        if (intonation < 70) {
            feedback.append("Focus on matching the intonation patterns.");
        }

        return feedback.toString().trim();
    }

    private String buildFeedbackContext(List<PracticeAttempt> attempts) {
        // Build context string from attempts for LLM
        StringBuilder context = new StringBuilder();
        for (PracticeAttempt attempt : attempts) {
            context.append(String.format(
                "Segment %d: Pronunciation %.0f%%, Speed %.0f%%, Intonation %.0f%%\n",
                attempt.getSegmentIndex(),
                attempt.getPronunciationScore(),
                attempt.getSpeedScore(),
                attempt.getIntonationScore()
            ));
        }
        return context.toString();
    }
}
```

---

## Configuration

### Application Configuration

```yaml
# application.yml
spring:
  application:
    name: nihongo-master

  data:
    mongodb:
      uri: ${MONGODB_URI:mongodb://localhost:27017/nihongo_master}
      auto-index-creation: true

  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}

  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

server:
  port: ${PORT:8080}

# JWT Configuration
jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-here-at-least-32-chars}
  access-token-validity: 3600      # 1 hour in seconds
  refresh-token-validity: 2592000  # 30 days in seconds

# AI Services
ai:
  speech:
    base-url: ${SPEECH_API_URL:https://api.openai.com}
    api-key: ${SPEECH_API_KEY}
  llm:
    base-url: ${LLM_API_URL:https://api.openai.com}
    api-key: ${LLM_API_KEY}

# AWS S3 for storage
aws:
  s3:
    bucket: ${S3_BUCKET:nihongo-master-assets}
    region: ${AWS_REGION:ap-southeast-1}

# Logging
logging:
  level:
    com.nihongomaster: DEBUG
    org.springframework.security: INFO
    org.springframework.data.mongodb: INFO

# OpenAPI Documentation
springdoc:
  api-docs:
    path: /api/v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    operationsSorter: method
```

---

## Docker Configuration

```dockerfile
# docker/Dockerfile
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Add non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy JAR
COPY --chown=spring:spring build/libs/*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - MONGODB_URI=mongodb://mongo:27017/nihongo_master
      - REDIS_HOST=redis
      - JWT_SECRET=${JWT_SECRET}
      - SPEECH_API_KEY=${SPEECH_API_KEY}
      - LLM_API_KEY=${LLM_API_KEY}
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mongo-express:
    image: mongo-express
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongo
    depends_on:
      - mongo

volumes:
  mongo_data:
  redis_data:
```

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Auth** |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/refresh` | Refresh token | No |
| **Users** |
| GET | `/api/users/me` | Get current user | Yes |
| PUT | `/api/users/me` | Update profile | Yes |
| GET | `/api/users/me/progress` | Get progress | Yes |
| GET | `/api/users/{username}` | Get public profile | No |
| **Videos** |
| GET | `/api/videos` | List videos | No |
| GET | `/api/videos/{id}` | Get video | No |
| GET | `/api/videos/search` | Search videos | No |
| **Decks** |
| GET | `/api/decks/public` | List public decks | No |
| GET | `/api/decks/my` | List user's decks | Yes |
| POST | `/api/decks` | Create deck | Yes |
| PUT | `/api/decks/{id}` | Update deck | Yes |
| POST | `/api/decks/{id}/fork` | Fork deck | Yes |
| **Practice** |
| POST | `/api/practice/sessions` | Start session | Yes |
| POST | `/api/practice/sessions/{id}/attempts` | Submit attempt | Yes |
| POST | `/api/practice/sessions/{id}/complete` | Complete session | Yes |
| GET | `/api/practice/history` | Get history | Yes |
| **Review** |
| GET | `/api/reviews/due` | Get due items | Yes |
| POST | `/api/reviews/{id}/submit` | Submit review | Yes |
| GET | `/api/reviews/report/weekly` | Weekly report | Yes |
| **Community** |
| GET | `/api/community/posts` | List posts | No |
| POST | `/api/community/posts` | Create post | Yes |
| POST | `/api/community/posts/{id}/like` | Like post | Yes |
| POST | `/api/community/posts/{id}/comments` | Add comment | Yes |

---

## Security Best Practices

1. **Password Hashing**: BCrypt with cost factor 12
2. **JWT**: Short-lived access tokens (1 hour), long-lived refresh tokens (30 days)
3. **Rate Limiting**: Implement using Redis for API endpoints
4. **Input Validation**: Bean Validation (JSR-380) on all DTOs
5. **CORS**: Configured for frontend domain only
6. **HTTPS**: Enforced in production
7. **Secrets Management**: Environment variables, not in code
8. **SQL Injection**: N/A (MongoDB), but use parameterized queries
9. **XSS Prevention**: Sanitize user content before storage
10. **File Upload**: Validate file types, scan for malware
