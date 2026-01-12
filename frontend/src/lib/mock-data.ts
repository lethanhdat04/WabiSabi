// Mock data for the Learning & Practice pages

export interface VocabularyDeck {
  id: string;
  title: string;
  description: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  topic: string;
  totalVocabulary: number;
  progress: number;
  isOfficial: boolean;
  createdBy: string;
}

export interface Video {
  id: string;
  title: string;
  titleJapanese: string;
  thumbnailUrl: string;
  duration: number;
  category: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  segmentCount: number;
  isOfficial: boolean;
  stats: {
    viewCount: number;
    practiceCount: number;
    averageRating: number;
  };
}

export interface VocabularyItem {
  id: string;
  japaneseWord: string;
  reading: string;
  meaning: string;
  partOfSpeech: string;
  exampleSentence?: string;
  exampleMeaning?: string;
}

export interface PracticeSession {
  id: string;
  type: "shadowing" | "dictation" | "flashcard" | "fill-in";
  videoId?: string;
  deckId?: string;
  totalQuestions: number;
  completedQuestions: number;
  correctAnswers: number;
  startedAt: string;
}

// Mock Vocabulary Decks
export const mockDecks: VocabularyDeck[] = [
  {
    id: "1",
    title: "JLPT N5 Essential Vocabulary",
    description: "Core vocabulary for JLPT N5 preparation",
    level: "N5",
    topic: "JLPT_N5",
    totalVocabulary: 150,
    progress: 72,
    isOfficial: true,
    createdBy: "Nihongo Master",
  },
  {
    id: "2",
    title: "Daily Greetings & Expressions",
    description: "Common greetings used in everyday conversation",
    level: "N5",
    topic: "DAILY_LIFE",
    totalVocabulary: 45,
    progress: 100,
    isOfficial: true,
    createdBy: "Nihongo Master",
  },
  {
    id: "3",
    title: "Food & Restaurant Vocabulary",
    description: "Learn how to order food and discuss cuisine",
    level: "N4",
    topic: "FOOD",
    totalVocabulary: 80,
    progress: 35,
    isOfficial: true,
    createdBy: "Nihongo Master",
  },
  {
    id: "4",
    title: "Travel & Transportation",
    description: "Essential words for traveling in Japan",
    level: "N4",
    topic: "TRAVEL",
    totalVocabulary: 65,
    progress: 0,
    isOfficial: true,
    createdBy: "Nihongo Master",
  },
  {
    id: "5",
    title: "Business Japanese Basics",
    description: "Professional vocabulary for the workplace",
    level: "N3",
    topic: "BUSINESS",
    totalVocabulary: 120,
    progress: 15,
    isOfficial: true,
    createdBy: "Nihongo Master",
  },
  {
    id: "6",
    title: "Anime & Manga Expressions",
    description: "Popular phrases from anime and manga",
    level: "N4",
    topic: "ANIME_MANGA",
    totalVocabulary: 55,
    progress: 88,
    isOfficial: false,
    createdBy: "TakaUser123",
  },
];

// Mock Videos
export const mockVideos: Video[] = [
  {
    id: "1",
    title: "Daily Greetings in Japanese",
    titleJapanese: "日本語の挨拶",
    thumbnailUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=225&fit=crop",
    duration: 180,
    category: "DAILY_LIFE",
    level: "N5",
    segmentCount: 12,
    isOfficial: true,
    stats: {
      viewCount: 1250,
      practiceCount: 340,
      averageRating: 4.5,
    },
  },
  {
    id: "2",
    title: "Ordering Food at a Restaurant",
    titleJapanese: "レストランで注文する",
    thumbnailUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=225&fit=crop",
    duration: 240,
    category: "FOOD",
    level: "N4",
    segmentCount: 15,
    isOfficial: true,
    stats: {
      viewCount: 890,
      practiceCount: 215,
      averageRating: 4.7,
    },
  },
  {
    id: "3",
    title: "Asking for Directions",
    titleJapanese: "道を聞く",
    thumbnailUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop",
    duration: 195,
    category: "TRAVEL",
    level: "N4",
    segmentCount: 10,
    isOfficial: true,
    stats: {
      viewCount: 675,
      practiceCount: 180,
      averageRating: 4.3,
    },
  },
  {
    id: "4",
    title: "Self Introduction in Business",
    titleJapanese: "ビジネスの自己紹介",
    thumbnailUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=225&fit=crop",
    duration: 300,
    category: "BUSINESS",
    level: "N3",
    segmentCount: 18,
    isOfficial: true,
    stats: {
      viewCount: 420,
      practiceCount: 95,
      averageRating: 4.6,
    },
  },
];

// Mock Vocabulary Items for Flashcards/Practice
export const mockVocabularyItems: VocabularyItem[] = [
  {
    id: "1",
    japaneseWord: "おはよう",
    reading: "ohayou",
    meaning: "Good morning (casual)",
    partOfSpeech: "Expression",
    exampleSentence: "おはよう、元気？",
    exampleMeaning: "Good morning, how are you?",
  },
  {
    id: "2",
    japaneseWord: "ありがとう",
    reading: "arigatou",
    meaning: "Thank you (casual)",
    partOfSpeech: "Expression",
    exampleSentence: "手伝ってくれてありがとう。",
    exampleMeaning: "Thank you for helping me.",
  },
  {
    id: "3",
    japaneseWord: "水",
    reading: "mizu",
    meaning: "Water",
    partOfSpeech: "Noun",
    exampleSentence: "水をください。",
    exampleMeaning: "Please give me water.",
  },
  {
    id: "4",
    japaneseWord: "食べる",
    reading: "taberu",
    meaning: "To eat",
    partOfSpeech: "Verb",
    exampleSentence: "朝ごはんを食べる。",
    exampleMeaning: "I eat breakfast.",
  },
  {
    id: "5",
    japaneseWord: "大きい",
    reading: "ookii",
    meaning: "Big, large",
    partOfSpeech: "i-adjective",
    exampleSentence: "この家は大きい。",
    exampleMeaning: "This house is big.",
  },
  {
    id: "6",
    japaneseWord: "静か",
    reading: "shizuka",
    meaning: "Quiet, peaceful",
    partOfSpeech: "na-adjective",
    exampleSentence: "図書館は静かです。",
    exampleMeaning: "The library is quiet.",
  },
  {
    id: "7",
    japaneseWord: "駅",
    reading: "eki",
    meaning: "Station",
    partOfSpeech: "Noun",
    exampleSentence: "駅はどこですか？",
    exampleMeaning: "Where is the station?",
  },
  {
    id: "8",
    japaneseWord: "行く",
    reading: "iku",
    meaning: "To go",
    partOfSpeech: "Verb",
    exampleSentence: "学校に行く。",
    exampleMeaning: "I go to school.",
  },
];

// Mock Practice Statistics
export const mockPracticeStats = {
  totalSessions: 45,
  totalTime: 1250, // minutes
  averageAccuracy: 78.5,
  streak: 7,
  todayProgress: {
    completed: 3,
    goal: 5,
  },
  recentSessions: [
    { date: "2024-01-25", type: "flashcard", score: 85, duration: 15 },
    { date: "2024-01-25", type: "shadowing", score: 72, duration: 20 },
    { date: "2024-01-24", type: "dictation", score: 90, duration: 12 },
    { date: "2024-01-24", type: "fill-in", score: 78, duration: 18 },
    { date: "2024-01-23", type: "flashcard", score: 82, duration: 10 },
  ],
  masteryByLevel: {
    N5: { total: 200, mastered: 145 },
    N4: { total: 150, mastered: 65 },
    N3: { total: 120, mastered: 18 },
    N2: { total: 0, mastered: 0 },
    N1: { total: 0, mastered: 0 },
  },
};

// Mock Subtitle Segment for Practice
export interface SubtitleSegment {
  index: number;
  japaneseText: string;
  romaji: string;
  meaning: string;
  startTime: number;
  endTime: number;
}

export const mockSubtitleSegments: SubtitleSegment[] = [
  {
    index: 0,
    japaneseText: "おはようございます",
    romaji: "ohayou gozaimasu",
    meaning: "Good morning (polite)",
    startTime: 5.0,
    endTime: 8.5,
  },
  {
    index: 1,
    japaneseText: "こんにちは",
    romaji: "konnichiwa",
    meaning: "Hello / Good afternoon",
    startTime: 10.0,
    endTime: 12.5,
  },
  {
    index: 2,
    japaneseText: "こんばんは",
    romaji: "konbanwa",
    meaning: "Good evening",
    startTime: 15.0,
    endTime: 17.5,
  },
  {
    index: 3,
    japaneseText: "お元気ですか",
    romaji: "ogenki desu ka",
    meaning: "How are you?",
    startTime: 20.0,
    endTime: 23.0,
  },
];

// Helper function to format duration
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Helper function to get level color
export function getLevelColor(level: string): string {
  switch (level) {
    case "N5":
      return "green";
    case "N4":
      return "blue";
    case "N3":
      return "yellow";
    case "N2":
      return "red";
    case "N1":
      return "red";
    default:
      return "default";
  }
}
