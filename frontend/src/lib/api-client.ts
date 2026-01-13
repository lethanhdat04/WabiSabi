/**
 * Centralized API client for Nihongo Master backend integration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'nihongo_access_token';
const REFRESH_TOKEN_KEY = 'nihongo_refresh_token';

// Token management
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasTokens: (): boolean => {
    return !!tokenManager.getAccessToken();
  }
};

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public errorCode: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with auth
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = tokenManager.getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, { ...options, headers });

  // Handle 401 - try to refresh token
  if (response.status === 401 && tokenManager.getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry with new token
      (headers as Record<string, string>)['Authorization'] = `Bearer ${tokenManager.getAccessToken()}`;
      response = await fetch(url, { ...options, headers });
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.errorCode || 'UNKNOWN_ERROR',
      errorData.message || 'An error occurred',
      errorData.details
    );
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;

  return JSON.parse(text);
}

// Refresh access token
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      tokenManager.clearTokens();
      return false;
    }

    const data = await response.json();
    tokenManager.setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    tokenManager.clearTokens();
    return false;
  }
}

// ============ AUTH API ============

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  nativeLanguage?: string;
  targetLevel?: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
}

export interface UserSummary {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetchWithAuth<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    tokenManager.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetchWithAuth<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    tokenManager.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    } finally {
      tokenManager.clearTokens();
    }
  },

  logoutAll: async (): Promise<void> => {
    try {
      await fetchWithAuth('/auth/logout-all', { method: 'POST' });
    } finally {
      tokenManager.clearTokens();
    }
  },
};

// ============ USER API ============

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  role: string;
  nativeLanguage?: string;
  targetLevel?: string;
  preferences: UserPreferences;
  progress: UserProgress;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export interface UserPreferences {
  notifications: boolean;
  emailReminders: boolean;
  reviewTime?: string;
  interfaceLanguage: string;
  showFurigana: boolean;
  autoPlayAudio: boolean;
  dailyGoalMinutes: number;
}

export interface UserProgress {
  listeningScore: number;
  speakingScore: number;
  vocabularyScore: number;
  totalXP: number;
  streak: number;
  maxStreak: number;
  totalPracticeMinutes: number;
  videosCompleted: number;
  vocabMastered: number;
}

export const userApi = {
  getMe: (): Promise<User> => fetchWithAuth('/users/me'),

  getProfile: (username: string): Promise<User> =>
    fetchWithAuth(`/users/profile/${username}`),

  updateProfile: (data: Partial<User>): Promise<User> =>
    fetchWithAuth('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updatePreferences: (data: Partial<UserPreferences>): Promise<UserPreferences> =>
    fetchWithAuth('/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ============ VIDEO API ============

export interface Video {
  id: string;
  title: string;
  titleJapanese: string;
  description: string;
  youtubeId: string;
  thumbnailUrl: string;
  duration: number;
  category: string;
  level: string;
  tags: string[];
  subtitles: SubtitleSegment[];
  isOfficial: boolean;
  status: string;
  stats: VideoStats;
  createdAt: string;
}

export interface SubtitleSegment {
  index: number;
  japaneseText: string;
  romaji?: string;
  meaning: string;
  startTime: number;
  endTime: number;
  duration?: number;
  vocabulary: VocabularyReference[];
}

export interface VocabularyReference {
  word: string;
  reading: string;
  meaning: string;
  partOfSpeech?: string;
}

export interface VideoStats {
  viewCount: number;
  practiceCount: number;
  shadowingCount: number;
  dictationCount: number;
  averageScore: number;
  totalRatings: number;
  averageRating: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const videoApi = {
  getAll: (params?: {
    category?: string;
    level?: string;
    tag?: string;
    official?: boolean;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Video>> => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.level) query.set('level', params.level);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.official !== undefined) query.set('official', String(params.official));
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size) query.set('size', String(params.size));
    return fetchWithAuth(`/videos?${query.toString()}`);
  },

  getById: (id: string): Promise<Video> => fetchWithAuth(`/videos/${id}`),

  search: (query: string, page = 0, size = 12): Promise<PageResponse<Video>> =>
    fetchWithAuth(`/videos/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`),

  getSegment: (videoId: string, segmentIndex: number): Promise<SubtitleSegment> =>
    fetchWithAuth(`/videos/${videoId}/segments/${segmentIndex}`),
};

// ============ VOCABULARY API ============

export interface VocabularyDeck {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  languageDirection: string;
  level: string;
  topic: string;
  tags: string[];
  isPublic: boolean;
  isOfficial: boolean;
  createdBy: string;
  sections: VocabularySection[];
  stats: DeckStats;
  status: string;
  createdAt: string;
}

export interface VocabularySection {
  index: number;
  title: string;
  description: string;
  items: VocabularyItem[];
}

export interface VocabularyItem {
  index: number;
  japaneseWord: string;
  reading: string;
  meaning: string;
  partOfSpeech: string;
  exampleSentence?: string;
  exampleMeaning?: string;
  imageUrl?: string;
  audioUrl?: string;
  notes?: string;
}

export interface DeckStats {
  viewCount: number;
  studyCount: number;
  starCount: number;
  forkCount: number;
  averageScore: number;
  completionRate: number;
}

export interface DeckProgress {
  id: string;
  userId: string;
  deckId: string;
  itemProgress: Record<string, ItemProgress>;
  overallStats: ProgressStats;
  lastStudiedAt?: string;
  studyStreak: number;
}

export interface ItemProgress {
  sectionIndex: number;
  itemIndex: number;
  correctAttempts: number;
  incorrectAttempts: number;
  totalAttempts: number;
  masteryLevel: string;
  lastAttemptAt?: string;
  nextReviewAt?: string;
  streakCount: number;
}

export interface ProgressStats {
  totalItemsPracticed: number;
  totalCorrectAttempts: number;
  totalIncorrectAttempts: number;
  totalAttempts: number;
  itemsMastered: number;
  itemsLearning: number;
  averageAccuracy: number;
}

export const deckApi = {
  getAll: (params?: {
    level?: string;
    topic?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<VocabularyDeck>> => {
    const query = new URLSearchParams();
    if (params?.level) query.set('level', params.level);
    if (params?.topic) query.set('topic', params.topic);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size) query.set('size', String(params.size));
    return fetchWithAuth(`/vocabulary/decks?${query.toString()}`);
  },

  getById: (id: string): Promise<VocabularyDeck> =>
    fetchWithAuth(`/vocabulary/decks/${id}`),

  getSummary: (id: string): Promise<VocabularyDeck> =>
    fetchWithAuth(`/vocabulary/decks/${id}/summary`),

  getMyDecks: (page = 0, size = 12): Promise<PageResponse<VocabularyDeck>> =>
    fetchWithAuth(`/vocabulary/decks/my?page=${page}&size=${size}`),

  getOfficial: (page = 0, size = 12): Promise<PageResponse<VocabularyDeck>> =>
    fetchWithAuth(`/vocabulary/decks/official?page=${page}&size=${size}`),

  getPopular: (page = 0, size = 12): Promise<PageResponse<VocabularyDeck>> =>
    fetchWithAuth(`/vocabulary/decks/popular?page=${page}&size=${size}`),

  search: (query: string, page = 0, size = 12): Promise<PageResponse<VocabularyDeck>> =>
    fetchWithAuth(`/vocabulary/decks/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`),

  getProgress: (deckId: string): Promise<DeckProgress> =>
    fetchWithAuth(`/vocabulary/decks/${deckId}/progress`),

  create: (data: CreateDeckRequest): Promise<VocabularyDeck> =>
    fetchWithAuth('/vocabulary/decks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Request type for creating a new deck
export interface CreateDeckRequest {
  title: string;
  description?: string;
  coverImageUrl?: string;
  languageDirection?: string;
  level: string;
  topic: string;
  tags?: string[];
  isPublic?: boolean;
  sections?: CreateSectionRequest[];
}

export interface CreateSectionRequest {
  title: string;
  description?: string;
  items?: CreateVocabularyItemRequest[];
}

export interface CreateVocabularyItemRequest {
  japaneseWord: string;
  reading: string;
  meaning: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  exampleMeaning?: string;
  imageUrl?: string;
  audioUrl?: string;
  notes?: string;
}

// ============ VOCABULARY PRACTICE API ============

export interface FlashcardRequest {
  deckId: string;
  sectionIndex?: number;
  itemCount?: number;
  shuffleItems?: boolean;
  showFront?: string;
}

export interface Flashcard {
  cardId: string;
  sectionIndex: number;
  itemIndex: number;
  front: FlashcardSide;
  back: FlashcardSide;
  audioUrl?: string;
  imageUrl?: string;
  exampleSentence?: string;
  exampleMeaning?: string;
}

export interface FlashcardSide {
  primaryText: string;
  secondaryText?: string;
  label: string;
}

export interface FlashcardResult {
  deckId: string;
  sectionIndex: number;
  itemIndex: number;
  result: 'FORGOT' | 'HARD' | 'GOOD' | 'EASY';
}

export interface FillInQuestion {
  questionId: string;
  sectionIndex: number;
  itemIndex: number;
  questionType: string;
  prompt: string;
  blankPosition?: number;
  hint?: string;
  options?: string[];
}

export interface FillInAnswer {
  deckId: string;
  sectionIndex: number;
  itemIndex: number;
  userAnswer: string;
  questionType: string;
}

export interface ReviewItem {
  deckId: string;
  deckTitle: string;
  sectionIndex: number;
  itemIndex: number;
  japaneseWord: string;
  reading: string;
  meaning: string;
  nextReviewAt: string;
  masteryLevel: string;
}

export const practiceApi = {
  // Flashcards
  getFlashcards: (data: FlashcardRequest): Promise<Flashcard[]> =>
    fetchWithAuth('/vocabulary/practice/flashcard/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitFlashcardResult: (data: FlashcardResult): Promise<{ recorded: boolean; pointsEarned: number }> =>
    fetchWithAuth('/vocabulary/practice/flashcard/result', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Fill-in-the-blank
  getFillInQuestions: (data: { deckId: string; sectionIndex?: number; itemCount?: number }): Promise<FillInQuestion[]> =>
    fetchWithAuth('/vocabulary/practice/fill-in/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitFillInAnswer: (data: FillInAnswer): Promise<{ isCorrect: boolean; correctAnswer: string; feedback: string }> =>
    fetchWithAuth('/vocabulary/practice/fill-in/answer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Review (Spaced Repetition)
  getReviewItems: (deckId: string): Promise<ReviewItem[]> =>
    fetchWithAuth(`/vocabulary/practice/review/decks/${deckId}`),

  getReviewCount: (deckId: string): Promise<{ count: number }> =>
    fetchWithAuth(`/vocabulary/practice/review/decks/${deckId}/count`),

  getAllReviewItems: (): Promise<ReviewItem[]> =>
    fetchWithAuth('/vocabulary/practice/review/all'),

  // Stats
  getVocabularyStats: (): Promise<ProgressStats> =>
    fetchWithAuth('/vocabulary/practice/stats'),

  getRecentDecks: (): Promise<VocabularyDeck[]> =>
    fetchWithAuth('/vocabulary/practice/recent'),
};

// ============ DICTATION API ============

export interface DictationAttempt {
  id: string;
  userId: string;
  videoId: string;
  segmentIndex: number;
  userInputText: string;
  correctText: string;
  evaluation: DictationEvaluation;
  createdAt: string;
}

export interface DictationEvaluation {
  accuracyScore: number;
  characterAccuracy: number;
  wordAccuracy: number;
  overallScore: number;
  feedbackText: string;
  grade: string;
  mistakes: DictationMistake[];
}

export interface DictationMistake {
  position: number;
  expected: string;
  actual: string;
  type: string;
}

export interface DictationStats {
  totalAttempts: number;
  averageAccuracy: number;
  totalVideos: number;
  totalSegments: number;
  bestScore: number;
  recentScores: number[];
}

export const dictationApi = {
  submitAttempt: (data: { videoId: string; segmentIndex: number; userInputText: string }): Promise<DictationAttempt> =>
    fetchWithAuth('/practice/dictation/attempts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAttempt: (attemptId: string): Promise<DictationAttempt> =>
    fetchWithAuth(`/practice/dictation/attempts/${attemptId}`),

  getMyAttempts: (page = 0, size = 20): Promise<PageResponse<DictationAttempt>> =>
    fetchWithAuth(`/practice/dictation/attempts?page=${page}&size=${size}`),

  getVideoAttempts: (videoId: string, page = 0, size = 20): Promise<PageResponse<DictationAttempt>> =>
    fetchWithAuth(`/practice/dictation/videos/${videoId}/attempts?page=${page}&size=${size}`),

  getBestAttempt: (videoId: string, segmentIndex: number): Promise<DictationAttempt | null> =>
    fetchWithAuth(`/practice/dictation/videos/${videoId}/segments/${segmentIndex}/best`),

  getVideoProgress: (videoId: string): Promise<{ completedSegments: number; totalSegments: number; averageScore: number }> =>
    fetchWithAuth(`/practice/dictation/videos/${videoId}/progress`),

  getStats: (): Promise<DictationStats> =>
    fetchWithAuth('/practice/dictation/stats'),
};

// ============ SHADOWING API ============

export interface ShadowingAttempt {
  id: string;
  userId: string;
  videoId: string;
  segmentIndex: number;
  audioUrl: string;
  evaluation: ShadowingEvaluation;
  createdAt: string;
}

export interface ShadowingEvaluation {
  pronunciationScore: number;
  speedScore: number;
  intonationScore: number;
  overallScore: number;
  feedbackText: string;
  detailedFeedback: {
    strengths: string[];
    improvements: string[];
    specificTips: string[];
  };
}

export interface ShadowingStats {
  totalAttempts: number;
  averagePronunciation: number;
  averageSpeed: number;
  averageIntonation: number;
  totalVideos: number;
  totalSegments: number;
  bestScore: number;
}

export const shadowingApi = {
  submitAttempt: (data: { videoId: string; segmentIndex: number; audioUrl: string }): Promise<ShadowingAttempt> =>
    fetchWithAuth('/practice/shadowing/attempts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAttempt: (attemptId: string): Promise<ShadowingAttempt> =>
    fetchWithAuth(`/practice/shadowing/attempts/${attemptId}`),

  getMyAttempts: (page = 0, size = 20): Promise<PageResponse<ShadowingAttempt>> =>
    fetchWithAuth(`/practice/shadowing/attempts?page=${page}&size=${size}`),

  getVideoAttempts: (videoId: string, page = 0, size = 20): Promise<PageResponse<ShadowingAttempt>> =>
    fetchWithAuth(`/practice/shadowing/videos/${videoId}/attempts?page=${page}&size=${size}`),

  getBestAttempt: (videoId: string, segmentIndex: number): Promise<ShadowingAttempt | null> =>
    fetchWithAuth(`/practice/shadowing/videos/${videoId}/segments/${segmentIndex}/best`),

  getVideoProgress: (videoId: string): Promise<{ completedSegments: number; totalSegments: number; averageScore: number }> =>
    fetchWithAuth(`/practice/shadowing/videos/${videoId}/progress`),

  getStats: (): Promise<ShadowingStats> =>
    fetchWithAuth('/practice/shadowing/stats'),
};

// ============ FORUM API ============

export interface Post {
  id: string;
  title: string;
  content?: string;
  contentPreview?: string;
  topic: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  isLikedByCurrentUser?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  content: string;
  parentCommentId?: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  isLikedByCurrentUser?: boolean;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  topic: string;
  tags?: string[];
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}

export const forumApi = {
  // Posts
  getPosts: (params?: {
    topic?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<Post>> => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size) query.set('size', String(params.size));
    if (params?.sort) query.set('sort', params.sort);

    // Use topic-specific endpoint if topic is provided
    if (params?.topic) {
      return fetchWithAuth(`/forum/posts/topic/${params.topic}?${query.toString()}`);
    }
    return fetchWithAuth(`/forum/posts?${query.toString()}`);
  },

  getPost: (id: string): Promise<Post> =>
    fetchWithAuth(`/forum/posts/${id}`),

  getPostWithComments: (id: string, page = 0, size = 20): Promise<{
    post: Post;
    comments: Comment[];
    totalComments: number;
    hasMoreComments: boolean;
  }> =>
    fetchWithAuth(`/forum/posts/${id}/with-comments?page=${page}&size=${size}`),

  createPost: (data: CreatePostRequest): Promise<Post> =>
    fetchWithAuth('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePost: (id: string, data: Partial<CreatePostRequest>): Promise<Post> =>
    fetchWithAuth(`/forum/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePost: (id: string): Promise<void> =>
    fetchWithAuth(`/forum/posts/${id}`, { method: 'DELETE' }),

  likePost: (id: string): Promise<{ isLiked: boolean; likeCount: number }> =>
    fetchWithAuth(`/forum/posts/${id}/like/toggle`, { method: 'POST' }),

  searchPosts: (query: string, page = 0, size = 12): Promise<PageResponse<Post>> =>
    fetchWithAuth(`/forum/posts/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`),

  getPopularPosts: (page = 0, size = 12): Promise<PageResponse<Post>> =>
    fetchWithAuth(`/forum/posts/popular?page=${page}&size=${size}`),

  getTrendingPosts: (page = 0, size = 12): Promise<PageResponse<Post>> =>
    fetchWithAuth(`/forum/posts/trending?page=${page}&size=${size}`),

  getMyPosts: (page = 0, size = 12): Promise<PageResponse<Post>> =>
    fetchWithAuth(`/forum/posts/my?page=${page}&size=${size}`),

  // Comments
  getComments: (postId: string, page = 0, size = 20): Promise<PageResponse<Comment>> =>
    fetchWithAuth(`/forum/posts/${postId}/comments?page=${page}&size=${size}`),

  createComment: (postId: string, data: CreateCommentRequest): Promise<Comment> =>
    fetchWithAuth(`/forum/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateComment: (commentId: string, content: string): Promise<Comment> =>
    fetchWithAuth(`/forum/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  deleteComment: (commentId: string): Promise<void> =>
    fetchWithAuth(`/forum/comments/${commentId}`, { method: 'DELETE' }),

  likeComment: (commentId: string): Promise<{ isLiked: boolean; likeCount: number }> =>
    fetchWithAuth(`/forum/comments/${commentId}/like/toggle`, { method: 'POST' }),

  getReplies: (commentId: string, page = 0, size = 10): Promise<PageResponse<Comment>> =>
    fetchWithAuth(`/forum/comments/${commentId}/replies?page=${page}&size=${size}`),
};
