# Nihongo Master - Frontend Architecture (Next.js)

## Overview

This document outlines the frontend architecture for Nihongo Master using **Next.js 14** with the App Router, **TypeScript**, **Tailwind CSS**, and modern React patterns.

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand + React Query |
| Authentication | NextAuth.js |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| Media | React Player, Web Audio API |
| i18n | next-intl |

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (main)/                   # Main app route group
│   │   ├── layout.tsx            # Main layout with navbar/sidebar
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx          # User dashboard
│   │   │
│   │   ├── library/              # Video library
│   │   │   ├── page.tsx          # Video listing
│   │   │   ├── [videoId]/
│   │   │   │   ├── page.tsx      # Video detail
│   │   │   │   └── practice/
│   │   │   │       └── page.tsx  # Practice session
│   │   │   └── loading.tsx
│   │   │
│   │   ├── decks/                # Vocabulary decks
│   │   │   ├── page.tsx          # Public decks browse
│   │   │   ├── my/
│   │   │   │   └── page.tsx      # User's decks
│   │   │   ├── create/
│   │   │   │   └── page.tsx      # Create new deck
│   │   │   ├── [deckId]/
│   │   │   │   ├── page.tsx      # Deck detail
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx  # Edit deck
│   │   │   │   └── study/
│   │   │   │       └── page.tsx  # Study session
│   │   │   └── loading.tsx
│   │   │
│   │   ├── review/               # Spaced repetition review
│   │   │   ├── page.tsx          # Review session
│   │   │   └── history/
│   │   │       └── page.tsx      # Review history
│   │   │
│   │   ├── community/            # Forum
│   │   │   ├── page.tsx          # Forum home
│   │   │   ├── [category]/
│   │   │   │   └── page.tsx      # Category listing
│   │   │   ├── post/
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx  # Create post
│   │   │   │   └── [postId]/
│   │   │   │       └── page.tsx  # Post detail
│   │   │   └── loading.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── page.tsx          # Current user profile
│   │   │   ├── settings/
│   │   │   │   └── page.tsx      # User settings
│   │   │   └── [username]/
│   │   │       └── page.tsx      # Public profile
│   │   │
│   │   └── leaderboard/
│   │       └── page.tsx          # XP leaderboard
│   │
│   ├── (admin)/                  # Admin route group
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   ├── videos/
│   │   │   │   └── page.tsx      # Video management
│   │   │   ├── decks/
│   │   │   │   └── page.tsx      # Deck management
│   │   │   ├── moderation/
│   │   │   │   └── page.tsx      # Content moderation
│   │   │   └── users/
│   │   │       └── page.tsx      # User management
│   │   └── middleware.ts         # Admin auth check
│   │
│   ├── api/                      # API routes (if needed)
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── not-found.tsx
│   ├── error.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── progress.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   └── UserMenu.tsx
│   │
│   ├── video/                    # Video-related components
│   │   ├── VideoPlayer.tsx
│   │   ├── VideoCard.tsx
│   │   ├── VideoGrid.tsx
│   │   ├── TranscriptDisplay.tsx
│   │   ├── SegmentHighlighter.tsx
│   │   └── VideoFilters.tsx
│   │
│   ├── practice/                 # Practice components
│   │   ├── ShadowingPlayer.tsx
│   │   ├── DictationPlayer.tsx
│   │   ├── AudioRecorder.tsx
│   │   ├── WaveformVisualizer.tsx
│   │   ├── ScoreDisplay.tsx
│   │   ├── FeedbackPanel.tsx
│   │   ├── SegmentProgress.tsx
│   │   └── PracticeResults.tsx
│   │
│   ├── deck/                     # Deck components
│   │   ├── DeckCard.tsx
│   │   ├── DeckGrid.tsx
│   │   ├── DeckEditor.tsx
│   │   ├── VocabularyForm.tsx
│   │   ├── SectionManager.tsx
│   │   └── ImportModal.tsx
│   │
│   ├── study/                    # Study session components
│   │   ├── Flashcard.tsx
│   │   ├── FlashcardStack.tsx
│   │   ├── FillInCard.tsx
│   │   ├── StudyProgress.tsx
│   │   └── SessionSummary.tsx
│   │
│   ├── review/                   # Review components
│   │   ├── ReviewCard.tsx
│   │   ├── QualityRating.tsx
│   │   ├── ReviewQueue.tsx
│   │   ├── ReviewStats.tsx
│   │   └── WeeklyReport.tsx
│   │
│   ├── community/                # Forum components
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   ├── PostEditor.tsx
│   │   ├── CommentSection.tsx
│   │   ├── CommentForm.tsx
│   │   ├── LikeButton.tsx
│   │   └── CategoryNav.tsx
│   │
│   ├── profile/                  # Profile components
│   │   ├── ProfileHeader.tsx
│   │   ├── ProgressChart.tsx
│   │   ├── SkillRadar.tsx
│   │   ├── AchievementBadge.tsx
│   │   ├── AchievementGrid.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── StreakCalendar.tsx
│   │
│   └── common/                   # Shared components
│       ├── Logo.tsx
│       ├── Avatar.tsx
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       ├── Pagination.tsx
│       ├── SearchBar.tsx
│       ├── TagInput.tsx
│       ├── LevelBadge.tsx
│       ├── XPCounter.tsx
│       └── Notification.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useVideos.ts
│   ├── useDecks.ts
│   ├── usePractice.ts
│   ├── useReview.ts
│   ├── useCommunity.ts
│   ├── useAudioRecorder.ts
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   └── useInfiniteScroll.ts
│
├── lib/                          # Utility libraries
│   ├── api/                      # API client
│   │   ├── client.ts             # Axios/fetch instance
│   │   ├── auth.ts
│   │   ├── videos.ts
│   │   ├── decks.ts
│   │   ├── practice.ts
│   │   ├── review.ts
│   │   └── community.ts
│   │
│   ├── utils/
│   │   ├── cn.ts                 # classnames utility
│   │   ├── date.ts               # Date formatting
│   │   ├── format.ts             # Number/string formatting
│   │   └── validation.ts         # Zod schemas
│   │
│   └── constants/
│       ├── routes.ts
│       ├── jlptLevels.ts
│       └── categories.ts
│
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   ├── practiceStore.ts
│   ├── reviewStore.ts
│   ├── uiStore.ts
│   └── notificationStore.ts
│
├── types/                        # TypeScript types
│   ├── user.ts
│   ├── video.ts
│   ├── deck.ts
│   ├── practice.ts
│   ├── review.ts
│   ├── community.ts
│   └── api.ts
│
├── providers/                    # Context providers
│   ├── QueryProvider.tsx         # React Query
│   ├── AuthProvider.tsx          # NextAuth
│   ├── ThemeProvider.tsx
│   └── ToastProvider.tsx
│
├── messages/                     # i18n translations
│   ├── en.json
│   ├── vi.json
│   └── ja.json
│
├── public/
│   ├── images/
│   ├── icons/
│   └── sounds/
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Key Components

### 1. VideoPlayer Component

```tsx
// components/video/VideoPlayer.tsx
'use client';

import { useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import { TranscriptSegment } from '@/types/video';

interface VideoPlayerProps {
  youtubeId: string;
  segments: TranscriptSegment[];
  currentSegment: number;
  onSegmentChange: (index: number) => void;
  onProgress: (progress: { played: number; playedSeconds: number }) => void;
}

export function VideoPlayer({
  youtubeId,
  segments,
  currentSegment,
  onSegmentChange,
  onProgress,
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const seekToSegment = useCallback((index: number) => {
    const segment = segments[index];
    if (segment && playerRef.current) {
      playerRef.current.seekTo(segment.startTime, 'seconds');
      onSegmentChange(index);
    }
  }, [segments, onSegmentChange]);

  const playSegment = useCallback((index: number) => {
    seekToSegment(index);
    setPlaying(true);
  }, [seekToSegment]);

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
      <ReactPlayer
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${youtubeId}`}
        playing={playing}
        playbackRate={playbackRate}
        onProgress={onProgress}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        width="100%"
        height="100%"
        controls
        config={{
          youtube: {
            playerVars: {
              modestbranding: 1,
              rel: 0,
            },
          },
        }}
      />

      {/* Playback controls */}
      <div className="absolute bottom-16 left-4 flex gap-2">
        <button
          onClick={() => setPlaybackRate(0.75)}
          className={cn(
            "px-2 py-1 rounded text-sm",
            playbackRate === 0.75 ? "bg-primary text-white" : "bg-white/80"
          )}
        >
          0.75x
        </button>
        <button
          onClick={() => setPlaybackRate(1)}
          className={cn(
            "px-2 py-1 rounded text-sm",
            playbackRate === 1 ? "bg-primary text-white" : "bg-white/80"
          )}
        >
          1x
        </button>
      </div>
    </div>
  );
}
```

### 2. AudioRecorder Component

```tsx
// components/practice/AudioRecorder.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaveformVisualizer } from './WaveformVisualizer';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number; // seconds
  disabled?: boolean;
}

export function AudioRecorder({
  onRecordingComplete,
  maxDuration = 60,
  disabled = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);

      // Duration timer
      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d >= maxDuration) {
            stopRecording();
            return d;
          }
          return d + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
  }, []);

  const submitRecording = useCallback(() => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-muted rounded-lg">
      {/* Waveform visualization */}
      <WaveformVisualizer
        isRecording={isRecording}
        audioUrl={audioUrl}
        className="w-full h-24"
      />

      {/* Timer */}
      <div className="text-2xl font-mono">
        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!isRecording && !audioBlob && (
          <Button
            size="lg"
            onClick={startRecording}
            disabled={disabled}
            className="rounded-full w-16 h-16"
          >
            <Mic className="w-8 h-8" />
          </Button>
        )}

        {isRecording && (
          <Button
            size="lg"
            variant="destructive"
            onClick={stopRecording}
            className="rounded-full w-16 h-16"
          >
            <Square className="w-8 h-8" />
          </Button>
        )}

        {audioBlob && !isRecording && (
          <>
            <Button variant="outline" onClick={resetRecording}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button onClick={submitRecording}>
              Submit Recording
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
```

### 3. Flashcard Component

```tsx
// components/study/Flashcard.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { VocabularyItem } from '@/types/deck';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface FlashcardProps {
  item: VocabularyItem;
  showFurigana?: boolean;
  onAnswer?: (correct: boolean) => void;
}

export function Flashcard({ item, showFurigana = true, onAnswer }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const playAudio = () => {
    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      audio.play();
    }
  };

  return (
    <div
      className="perspective-1000 w-full max-w-md mx-auto cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-80 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        {/* Front */}
        <div className={cn(
          "absolute inset-0 backface-hidden",
          "bg-white rounded-xl shadow-lg p-8",
          "flex flex-col items-center justify-center"
        )}>
          <div className="text-sm text-muted-foreground mb-4">
            {item.partOfSpeech}
          </div>

          {showFurigana && (
            <div className="text-lg text-muted-foreground mb-2">
              {item.reading}
            </div>
          )}

          <div className="text-5xl font-bold mb-4">
            {item.word}
          </div>

          {item.audioUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                playAudio();
              }}
            >
              <Volume2 className="w-5 h-5" />
            </Button>
          )}

          <div className="text-sm text-muted-foreground mt-4">
            Tap to reveal meaning
          </div>
        </div>

        {/* Back */}
        <div className={cn(
          "absolute inset-0 backface-hidden rotate-y-180",
          "bg-primary text-primary-foreground rounded-xl shadow-lg p-8",
          "flex flex-col items-center justify-center"
        )}>
          <div className="text-3xl font-semibold mb-4">
            {item.meaning}
          </div>

          <div className="text-xl opacity-80 mb-6">
            {item.meaningVi}
          </div>

          {item.exampleSentence && (
            <div className="text-center border-t border-primary-foreground/20 pt-4 mt-4">
              <div className="text-lg mb-2">{item.exampleSentence}</div>
              <div className="text-sm opacity-70">{item.exampleTranslation}</div>
            </div>
          )}

          {onAnswer && (
            <div className="flex gap-4 mt-6" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="secondary"
                onClick={() => onAnswer(false)}
              >
                Didn't Know
              </Button>
              <Button
                variant="secondary"
                onClick={() => onAnswer(true)}
              >
                Got It!
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
```

### 4. ReviewCard Component (SRS)

```tsx
// components/review/ReviewCard.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ReviewItem } from '@/types/review';
import { QualityRating } from './QualityRating';
import { cn } from '@/lib/utils/cn';

interface ReviewCardProps {
  item: ReviewItem;
  onSubmit: (quality: number) => void;
}

export function ReviewCard({ item, onSubmit }: ReviewCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);

  const handleReveal = () => setIsRevealed(true);

  const handleSubmit = (quality: number) => {
    setSelectedQuality(quality);
    setTimeout(() => onSubmit(quality), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden max-w-lg mx-auto"
    >
      {/* Question side */}
      <div className="p-8 text-center">
        <div className="text-sm text-muted-foreground mb-2">
          {item.itemType === 'VOCABULARY' ? 'Vocabulary' : 'Video Segment'}
        </div>

        <div className="text-4xl font-bold mb-4">
          {item.content.word || item.content.text}
        </div>

        {item.content.context && (
          <div className="text-muted-foreground">
            {item.content.context}
          </div>
        )}
      </div>

      {/* Answer section */}
      <div className={cn(
        "border-t transition-all duration-300",
        isRevealed ? "bg-muted p-8" : "p-4"
      )}>
        {!isRevealed ? (
          <button
            onClick={handleReveal}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium"
          >
            Show Answer
          </button>
        ) : (
          <div className="space-y-6">
            {/* Answer content */}
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">
                {item.content.reading && (
                  <span className="text-lg text-muted-foreground mr-2">
                    {item.content.reading}
                  </span>
                )}
                {item.content.meaning}
              </div>
              {item.content.example && (
                <div className="text-muted-foreground text-sm mt-4">
                  {item.content.example}
                </div>
              )}
            </div>

            {/* Quality rating */}
            <div className="border-t pt-6">
              <div className="text-sm text-center text-muted-foreground mb-4">
                How well did you remember?
              </div>
              <QualityRating
                onSelect={handleSubmit}
                selected={selectedQuality}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

---

## API Integration

### API Client Setup

```typescript
// lib/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.client.interceptors.request.use(async (config) => {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
      return config;
    });

    // Response interceptor for errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle token refresh or redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  get instance() {
    return this.client;
  }
}

export const apiClient = new ApiClient().instance;
```

### Video API

```typescript
// lib/api/videos.ts
import { apiClient } from './client';
import { Video, VideoSearchParams, PaginatedResponse } from '@/types';

export const videosApi = {
  getAll: async (params: VideoSearchParams): Promise<PaginatedResponse<Video>> => {
    const response = await apiClient.get('/videos', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Video> => {
    const response = await apiClient.get(`/videos/${id}`);
    return response.data;
  },

  search: async (query: string, params?: VideoSearchParams): Promise<PaginatedResponse<Video>> => {
    const response = await apiClient.get('/videos/search', {
      params: { q: query, ...params },
    });
    return response.data;
  },

  getRecommendations: async (): Promise<Video[]> => {
    const response = await apiClient.get('/videos/recommendations');
    return response.data;
  },
};
```

### React Query Hooks

```typescript
// hooks/useVideos.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { videosApi } from '@/lib/api/videos';
import { VideoSearchParams } from '@/types';

export function useVideos(params: VideoSearchParams) {
  return useInfiniteQuery({
    queryKey: ['videos', params],
    queryFn: ({ pageParam = 0 }) =>
      videosApi.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: ['video', id],
    queryFn: () => videosApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useVideoRecommendations() {
  return useQuery({
    queryKey: ['videos', 'recommendations'],
    queryFn: videosApi.getRecommendations,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
```

---

## State Management

### Practice Store (Zustand)

```typescript
// stores/practiceStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PracticeSession, PracticeAttempt } from '@/types';

interface PracticeState {
  // Current session
  session: PracticeSession | null;
  currentSegmentIndex: number;
  attempts: PracticeAttempt[];
  isRecording: boolean;

  // Actions
  startSession: (session: PracticeSession) => void;
  setCurrentSegment: (index: number) => void;
  addAttempt: (attempt: PracticeAttempt) => void;
  setRecording: (recording: boolean) => void;
  completeSession: () => void;
  resetSession: () => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      session: null,
      currentSegmentIndex: 0,
      attempts: [],
      isRecording: false,

      startSession: (session) => set({
        session,
        currentSegmentIndex: 0,
        attempts: [],
      }),

      setCurrentSegment: (index) => set({ currentSegmentIndex: index }),

      addAttempt: (attempt) => set((state) => ({
        attempts: [...state.attempts, attempt],
      })),

      setRecording: (isRecording) => set({ isRecording }),

      completeSession: () => {
        const { session, attempts } = get();
        if (session) {
          // Calculate final scores
          const overallScore = attempts.reduce(
            (sum, a) => sum + a.overallScore, 0
          ) / attempts.length;

          set({
            session: {
              ...session,
              status: 'COMPLETED',
              overallScore,
            },
          });
        }
      },

      resetSession: () => set({
        session: null,
        currentSegmentIndex: 0,
        attempts: [],
        isRecording: false,
      }),
    }),
    {
      name: 'practice-session',
      partialize: (state) => ({
        session: state.session,
        currentSegmentIndex: state.currentSegmentIndex,
        attempts: state.attempts,
      }),
    }
  )
);
```

---

## Page Examples

### Video Library Page

```tsx
// app/(main)/library/page.tsx
import { Suspense } from 'react';
import { VideoGrid } from '@/components/video/VideoGrid';
import { VideoFilters } from '@/components/video/VideoFilters';
import { SearchBar } from '@/components/common/SearchBar';
import { Skeleton } from '@/components/ui/skeleton';

interface LibraryPageProps {
  searchParams: {
    category?: string;
    level?: string;
    q?: string;
    page?: string;
  };
}

export default function LibraryPage({ searchParams }: LibraryPageProps) {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Video Library</h1>
        <p className="text-muted-foreground">
          Practice shadowing and dictation with Japanese videos
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="lg:w-64 shrink-0">
          <VideoFilters
            selectedCategory={searchParams.category}
            selectedLevel={searchParams.level}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="mb-6">
            <SearchBar
              placeholder="Search videos..."
              defaultValue={searchParams.q}
            />
          </div>

          <Suspense fallback={<VideoGridSkeleton />}>
            <VideoGrid
              category={searchParams.category}
              level={searchParams.level}
              search={searchParams.q}
              page={parseInt(searchParams.page || '0')}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function VideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="aspect-video rounded-lg" />
      ))}
    </div>
  );
}
```

### Practice Session Page

```tsx
// app/(main)/library/[videoId]/practice/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVideo } from '@/hooks/useVideos';
import { usePractice } from '@/hooks/usePractice';
import { ShadowingPlayer } from '@/components/practice/ShadowingPlayer';
import { AudioRecorder } from '@/components/practice/AudioRecorder';
import { ScoreDisplay } from '@/components/practice/ScoreDisplay';
import { FeedbackPanel } from '@/components/practice/FeedbackPanel';
import { SegmentProgress } from '@/components/practice/SegmentProgress';
import { PracticeResults } from '@/components/practice/PracticeResults';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface PracticePageProps {
  params: { videoId: string };
  searchParams: { mode?: 'shadowing' | 'dictation' };
}

export default function PracticePage({ params, searchParams }: PracticePageProps) {
  const router = useRouter();
  const mode = searchParams.mode || 'shadowing';

  const { data: video, isLoading: videoLoading } = useVideo(params.videoId);
  const {
    session,
    currentSegment,
    attempts,
    startSession,
    submitAttempt,
    completeSession,
    isSubmitting,
  } = usePractice();

  const [lastAttemptScore, setLastAttemptScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (video && !session) {
      startSession(video.id, mode);
    }
  }, [video, session, startSession, mode]);

  if (videoLoading || !video || !session) {
    return <LoadingSpinner fullScreen />;
  }

  if (showResults && session.status === 'COMPLETED') {
    return (
      <PracticeResults
        session={session}
        onClose={() => router.push(`/library/${params.videoId}`)}
        onRetry={() => {
          setShowResults(false);
          startSession(video.id, mode);
        }}
      />
    );
  }

  const segment = video.transcript.segments[currentSegment];

  const handleRecordingComplete = async (audioBlob: Blob) => {
    const result = await submitAttempt({
      segmentIndex: currentSegment,
      audioBlob,
      referenceText: segment.text,
    });
    setLastAttemptScore(result.overallScore);
  };

  const handleNextSegment = () => {
    setLastAttemptScore(null);
    if (currentSegment === video.transcript.segments.length - 1) {
      completeSession();
      setShowResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <SegmentProgress
        current={currentSegment}
        total={video.transcript.segments.length}
        attempts={attempts}
      />

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main practice area */}
          <div className="lg:col-span-2 space-y-6">
            <ShadowingPlayer
              video={video}
              currentSegment={currentSegment}
              onSegmentComplete={() => {}}
            />

            {/* Current segment display */}
            <div className="bg-card rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">
                Segment {currentSegment + 1} of {video.transcript.segments.length}
              </div>
              <div className="text-2xl font-medium mb-2">{segment.text}</div>
              <div className="text-muted-foreground">{segment.translation}</div>
            </div>

            {/* Recording interface */}
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              disabled={isSubmitting}
              maxDuration={30}
            />

            {/* Score display after attempt */}
            {lastAttemptScore !== null && (
              <ScoreDisplay
                score={lastAttemptScore}
                onContinue={handleNextSegment}
              />
            )}
          </div>

          {/* Sidebar with feedback */}
          <aside className="space-y-6">
            <FeedbackPanel
              attempts={attempts.filter((a) => a.segmentIndex === currentSegment)}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
```

---

## Environment Configuration

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Analytics (optional)
NEXT_PUBLIC_GA_ID=
```

---

## Performance Optimizations

1. **Image Optimization**: Use `next/image` with blur placeholders
2. **Code Splitting**: Dynamic imports for heavy components
3. **Caching**: React Query with appropriate stale times
4. **Prefetching**: Link prefetch for common navigation paths
5. **Bundle Analysis**: Regular analysis with `@next/bundle-analyzer`

```tsx
// Dynamic import example
const VideoPlayer = dynamic(
  () => import('@/components/video/VideoPlayer'),
  {
    loading: () => <Skeleton className="aspect-video" />,
    ssr: false
  }
);
```
