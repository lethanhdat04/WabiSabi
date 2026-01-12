"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  Mic,
  SkipBack,
  SkipForward,
  Settings,
  Maximize2,
  Minimize2,
  Check,
  ChevronDown,
  Edit3,
  AlertCircle,
  BookOpen,
  Clock,
  Star,
  Eye,
} from "lucide-react";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { useYouTubePlayer, PlayerState } from "@/lib/use-youtube-player";
import { formatDuration, getLevelColor } from "@/lib/mock-data";
import { clsx } from "clsx";

// Extended subtitle segment with vocabulary
interface VocabularyWord {
  word: string;
  reading: string;
  meaning: string;
  partOfSpeech?: string;
}

interface SubtitleSegment {
  index: number;
  japaneseText: string;
  romaji: string;
  meaning: string;
  startTime: number;
  endTime: number;
  vocabulary?: VocabularyWord[];
}

interface VideoData {
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
  stats: {
    viewCount: number;
    practiceCount: number;
    shadowingCount: number;
    dictationCount: number;
    averageRating: number;
    totalRatings: number;
  };
}

// Mock video data with full subtitles
const mockVideoDetail: VideoData = {
  id: "1",
  title: "Daily Greetings in Japanese",
  titleJapanese: "日本語の挨拶",
  description:
    "Learn essential Japanese greetings used in everyday conversation. Perfect for beginners!",
  youtubeId: "UUtCLFtlytU", // A sample Japanese learning video
  thumbnailUrl:
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=450&fit=crop",
  duration: 180,
  category: "DAILY_LIFE",
  level: "N5",
  tags: ["greetings", "basics", "conversation"],
  isOfficial: true,
  stats: {
    viewCount: 1250,
    practiceCount: 340,
    shadowingCount: 215,
    dictationCount: 125,
    averageRating: 4.5,
    totalRatings: 89,
  },
  subtitles: [
    {
      index: 0,
      japaneseText: "おはようございます",
      romaji: "Ohayou gozaimasu",
      meaning: "Good morning (polite)",
      startTime: 0,
      endTime: 3,
      vocabulary: [
        {
          word: "おはよう",
          reading: "ohayou",
          meaning: "Good morning (casual)",
          partOfSpeech: "Expression",
        },
        {
          word: "ございます",
          reading: "gozaimasu",
          meaning: "Polite form of existence verb",
          partOfSpeech: "Auxiliary verb",
        },
      ],
    },
    {
      index: 1,
      japaneseText: "こんにちは",
      romaji: "Konnichiwa",
      meaning: "Hello / Good afternoon",
      startTime: 3,
      endTime: 6,
      vocabulary: [
        {
          word: "今日",
          reading: "こんにち",
          meaning: "Today / This day",
          partOfSpeech: "Noun",
        },
      ],
    },
    {
      index: 2,
      japaneseText: "こんばんは",
      romaji: "Konbanwa",
      meaning: "Good evening",
      startTime: 6,
      endTime: 9,
      vocabulary: [
        {
          word: "今晩",
          reading: "こんばん",
          meaning: "This evening / Tonight",
          partOfSpeech: "Noun",
        },
      ],
    },
    {
      index: 3,
      japaneseText: "お元気ですか",
      romaji: "Ogenki desu ka",
      meaning: "How are you?",
      startTime: 9,
      endTime: 12,
      vocabulary: [
        {
          word: "元気",
          reading: "げんき",
          meaning: "Healthy / Energetic / Well",
          partOfSpeech: "Na-adjective",
        },
        {
          word: "です",
          reading: "desu",
          meaning: "Polite copula (is/am/are)",
          partOfSpeech: "Auxiliary verb",
        },
        {
          word: "か",
          reading: "ka",
          meaning: "Question particle",
          partOfSpeech: "Particle",
        },
      ],
    },
    {
      index: 4,
      japaneseText: "はい、元気です",
      romaji: "Hai, genki desu",
      meaning: "Yes, I'm fine",
      startTime: 12,
      endTime: 15,
      vocabulary: [
        {
          word: "はい",
          reading: "hai",
          meaning: "Yes",
          partOfSpeech: "Interjection",
        },
      ],
    },
    {
      index: 5,
      japaneseText: "ありがとうございます",
      romaji: "Arigatou gozaimasu",
      meaning: "Thank you (polite)",
      startTime: 15,
      endTime: 18,
      vocabulary: [
        {
          word: "ありがとう",
          reading: "arigatou",
          meaning: "Thank you (casual)",
          partOfSpeech: "Expression",
        },
      ],
    },
    {
      index: 6,
      japaneseText: "どういたしまして",
      romaji: "Dou itashimashite",
      meaning: "You're welcome",
      startTime: 18,
      endTime: 21,
      vocabulary: [
        {
          word: "どういたしまして",
          reading: "dou itashimashite",
          meaning: "You're welcome / Don't mention it",
          partOfSpeech: "Expression",
        },
      ],
    },
    {
      index: 7,
      japaneseText: "すみません",
      romaji: "Sumimasen",
      meaning: "Excuse me / I'm sorry",
      startTime: 21,
      endTime: 24,
      vocabulary: [
        {
          word: "すみません",
          reading: "sumimasen",
          meaning: "Excuse me / Sorry / Thank you",
          partOfSpeech: "Expression",
        },
      ],
    },
    {
      index: 8,
      japaneseText: "ごめんなさい",
      romaji: "Gomen nasai",
      meaning: "I'm sorry (apologetic)",
      startTime: 24,
      endTime: 27,
      vocabulary: [
        {
          word: "ごめん",
          reading: "gomen",
          meaning: "Sorry (casual)",
          partOfSpeech: "Expression",
        },
      ],
    },
    {
      index: 9,
      japaneseText: "おやすみなさい",
      romaji: "Oyasumi nasai",
      meaning: "Good night",
      startTime: 27,
      endTime: 30,
      vocabulary: [
        {
          word: "休む",
          reading: "やすむ",
          meaning: "To rest / To take a break",
          partOfSpeech: "Verb",
        },
      ],
    },
    {
      index: 10,
      japaneseText: "さようなら",
      romaji: "Sayounara",
      meaning: "Goodbye (formal)",
      startTime: 30,
      endTime: 33,
      vocabulary: [
        {
          word: "さようなら",
          reading: "sayounara",
          meaning: "Goodbye (formal/long farewell)",
          partOfSpeech: "Expression",
        },
      ],
    },
    {
      index: 11,
      japaneseText: "じゃあね",
      romaji: "Jaa ne",
      meaning: "See you! (casual)",
      startTime: 33,
      endTime: 36,
      vocabulary: [
        {
          word: "じゃあ",
          reading: "jaa",
          meaning: "Well then / So",
          partOfSpeech: "Conjunction",
        },
        {
          word: "ね",
          reading: "ne",
          meaning: "Right? / Isn't it?",
          partOfSpeech: "Particle",
        },
      ],
    },
  ],
};

// Playback speed options
const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;

  // In a real app, fetch video data based on videoId
  const video = mockVideoDetail;

  // Player state
  const [autoStop, setAutoStop] = useState(false);
  const [isLargeVideo, setIsLargeVideo] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
  const [selectedVocabulary, setSelectedVocabulary] = useState<VocabularyWord | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showVideoThumbnail, setShowVideoThumbnail] = useState(true);

  // Refs
  const transcriptRef = useRef<HTMLDivElement>(null);
  const autoStopTriggeredRef = useRef<Set<number>>(new Set());

  // Find current subtitle based on time
  const findActiveSubtitle = useCallback(
    (currentTime: number) => {
      return video.subtitles.findIndex(
        (subtitle) =>
          currentTime >= subtitle.startTime && currentTime < subtitle.endTime
      );
    },
    [video.subtitles]
  );

  // Handle time updates from YouTube player
  const handleTimeUpdate = useCallback(
    (currentTime: number) => {
      const newActiveIndex = findActiveSubtitle(currentTime);

      if (newActiveIndex !== activeSubtitleIndex) {
        setActiveSubtitleIndex(newActiveIndex >= 0 ? newActiveIndex : null);
      }

      // Auto-stop logic
      if (autoStop && activeSubtitleIndex !== null && activeSubtitleIndex >= 0) {
        const currentSubtitle = video.subtitles[activeSubtitleIndex];
        if (
          currentTime >= currentSubtitle.endTime - 0.1 &&
          !autoStopTriggeredRef.current.has(activeSubtitleIndex)
        ) {
          autoStopTriggeredRef.current.add(activeSubtitleIndex);
          player.pause();
        }
      }
    },
    [findActiveSubtitle, activeSubtitleIndex, autoStop, video.subtitles]
  );

  // Handle player state changes
  const handleStateChange = useCallback((state: PlayerState) => {
    if (state === "playing") {
      setShowVideoThumbnail(false);
    }
  }, []);

  // Initialize YouTube player
  const player = useYouTubePlayer("youtube-player", {
    videoId: video.youtubeId,
    onTimeUpdate: handleTimeUpdate,
    onStateChange: handleStateChange,
  });

  // Auto-scroll transcript to active subtitle
  useEffect(() => {
    if (activeSubtitleIndex !== null && transcriptRef.current) {
      const activeElement = transcriptRef.current.querySelector(
        `[data-subtitle-index="${activeSubtitleIndex}"]`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeSubtitleIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (player.playerState === "playing") {
            player.pause();
          } else {
            player.play();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          player.seekTo(Math.max(0, player.currentTime - 5));
          break;
        case "ArrowRight":
          e.preventDefault();
          player.seekTo(Math.min(player.duration, player.currentTime + 5));
          break;
        case "ArrowUp":
          e.preventDefault();
          if (activeSubtitleIndex !== null && activeSubtitleIndex > 0) {
            handleSubtitleClick(video.subtitles[activeSubtitleIndex - 1]);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (
            activeSubtitleIndex !== null &&
            activeSubtitleIndex < video.subtitles.length - 1
          ) {
            handleSubtitleClick(video.subtitles[activeSubtitleIndex + 1]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player, activeSubtitleIndex, video.subtitles]);

  // Handle subtitle click - seek to timestamp
  const handleSubtitleClick = (subtitle: SubtitleSegment) => {
    player.seekTo(subtitle.startTime);
    autoStopTriggeredRef.current.delete(subtitle.index);
    // if (player.playerState !== "playing") {
    //   player.play();
    // }
    player.play();
  };

  // Replay current subtitle
  const replayCurrentSubtitle = () => {
    if (activeSubtitleIndex !== null && activeSubtitleIndex >= 0) {
      const subtitle = video.subtitles[activeSubtitleIndex];
      autoStopTriggeredRef.current.delete(activeSubtitleIndex);
      player.seekTo(subtitle.startTime);
      player.play();
    }
  };

  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, implement Web Audio API recording here
  };

  // Navigate to previous/next subtitle
  const goToPrevSubtitle = () => {
    const currentIndex = activeSubtitleIndex ?? 0;
    if (currentIndex > 0) {
      handleSubtitleClick(video.subtitles[currentIndex - 1]);
    }
  };

  const goToNextSubtitle = () => {
    const currentIndex = activeSubtitleIndex ?? -1;
    if (currentIndex < video.subtitles.length - 1) {
      handleSubtitleClick(video.subtitles[currentIndex + 1]);
    }
  };

  // Get current subtitle
  const currentSubtitle =
    activeSubtitleIndex !== null && activeSubtitleIndex >= 0
      ? video.subtitles[activeSubtitleIndex]
      : null;

  // Calculate progress
  const progress = video.subtitles.length > 0
    ? ((activeSubtitleIndex ?? 0) + 1) / video.subtitles.length
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Back Navigation */}
      <Link
        href="/learn/videos"
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Videos</span>
      </Link>

      {/* Main Content - Split Layout */}
      <div
        className={clsx(
          "flex flex-col lg:flex-row gap-4",
          isLargeVideo && "lg:flex-col"
        )}
      >
        {/* Left Side - Video Player (60% on desktop) */}
        <div className={clsx("w-full", !isLargeVideo && "lg:w-[60%]")}>
          {/* Video Title Section */}
          <div className="mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-heading font-semibold text-neutral-200">
                  {video.title}
                </h1>
                <p className="text-lg text-neutral-400 mt-1">
                  {video.titleJapanese}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getLevelColor(video.level) as any}>
                  {video.level}
                </Badge>
                {video.isOfficial && <Badge variant="yellow">Official</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-400">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {video.stats.viewCount.toLocaleString()} views
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {video.stats.averageRating} ({video.stats.totalRatings})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(video.duration)}
              </span>
            </div>
          </div>

          {/* Video Player Container */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-neutral-800">
              {/* Thumbnail overlay before play */}
              {showVideoThumbnail && (
                <div
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={() => {
                    setShowVideoThumbnail(false);
                    player.play();
                  }}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors">
                      <Play className="w-8 h-8 lg:w-10 lg:h-10 text-neutral-900 ml-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* YouTube Player */}
              <div id="youtube-player" className="w-full h-full" />
            </div>

            {/* Player Controls */}
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPrevSubtitle}
                    disabled={activeSubtitleIndex === null || activeSubtitleIndex <= 0}
                    title="Previous subtitle (↑)"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  <Button
                    variant={player.playerState === "playing" ? "secondary" : "primary"}
                    size="sm"
                    onClick={() =>
                      player.playerState === "playing"
                        ? player.pause()
                        : player.play()
                    }
                    title="Play/Pause (Space)"
                  >
                    {player.playerState === "playing" ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="ml-1">
                      {player.playerState === "playing" ? "Pause" : "Play"}
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNextSubtitle}
                    disabled={
                      activeSubtitleIndex === null ||
                      activeSubtitleIndex >= video.subtitles.length - 1
                    }
                    title="Next subtitle (↓)"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                {/* Center Controls */}
                <div className="flex items-center gap-2">
                  {/* Auto Stop Toggle */}
                  <button
                    onClick={() => {
                      setAutoStop(!autoStop);
                      autoStopTriggeredRef.current.clear();
                    }}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors",
                      autoStop
                        ? "bg-yellow-500 text-neutral-900 border-yellow-500"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200"
                    )}
                  >
                    {autoStop && <Check className="w-4 h-4" />}
                    Auto Stop
                  </button>

                  {/* Playback Speed */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      {player.playbackRate}x
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showSpeedMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden z-20">
                        {playbackSpeeds.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => {
                              player.setPlaybackRate(speed);
                              setShowSpeedMenu(false);
                            }}
                            className={clsx(
                              "w-full px-4 py-2 text-sm text-left hover:bg-neutral-700 transition-colors",
                              player.playbackRate === speed
                                ? "text-yellow-500"
                                : "text-neutral-200"
                            )}
                          >
                            {speed}x
                            {speed === 1 && " (Normal)"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLargeVideo(!isLargeVideo)}
                    title={isLargeVideo ? "Normal size" : "Large size"}
                  >
                    {isLargeVideo ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Subtitle Display */}
          <Card className="mt-4">
            <CardContent>
              {currentSubtitle ? (
                <div className="space-y-3">
                  {/* Japanese Text */}
                  <p className="text-2xl lg:text-3xl font-bold text-neutral-100 text-center">
                    {currentSubtitle.japaneseText}
                  </p>

                  {/* Romaji */}
                  <p className="text-lg text-neutral-400 italic text-center">
                    {currentSubtitle.romaji}
                  </p>

                  {/* English Meaning */}
                  <p className="text-base text-neutral-300 text-center">
                    {currentSubtitle.meaning}
                  </p>

                  {/* Vocabulary Words */}
                  {currentSubtitle.vocabulary &&
                    currentSubtitle.vocabulary.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {currentSubtitle.vocabulary.map((vocab, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedVocabulary(vocab)}
                            className="px-3 py-1 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-full transition-colors"
                          >
                            <span className="mr-1">{vocab.word}</span>
                            <span className="text-neutral-400">
                              ({vocab.reading})
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-3 pt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={replayCurrentSubtitle}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Play Audio</span>
                    </Button>

                    <Button
                      variant={isRecording ? "primary" : "secondary"}
                      size="sm"
                      onClick={toggleRecording}
                    >
                      <Mic className={clsx("w-4 h-4", isRecording && "animate-pulse")} />
                      <span>{isRecording ? "Stop" : "Record"}</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400">
                    Play the video to see subtitles
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Click on any subtitle in the transcript to jump to that
                    moment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vocabulary Popup */}
          {selectedVocabulary && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={() => setSelectedVocabulary(null)}
            >
              <Card
                className="max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-100">
                        {selectedVocabulary.word}
                      </h3>
                      <p className="text-neutral-400">
                        {selectedVocabulary.reading}
                      </p>
                    </div>
                    {selectedVocabulary.partOfSpeech && (
                      <Badge variant="default">
                        {selectedVocabulary.partOfSpeech}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-neutral-200">
                    {selectedVocabulary.meaning}
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full mt-4"
                    onClick={() => setSelectedVocabulary(null)}
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Side - Transcript Panel (40% on desktop) */}
        <div
          className={clsx(
            "w-full",
            !isLargeVideo && "lg:w-[40%]",
            isLargeVideo && "lg:max-w-2xl lg:mx-auto"
          )}
        >
          <Card className="h-full">
            {/* Transcript Header */}
            <div className="p-4 border-b border-neutral-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-heading font-semibold text-neutral-200">
                  Transcript
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">
                    {activeSubtitleIndex !== null
                      ? `${activeSubtitleIndex + 1}/${video.subtitles.length}`
                      : `0/${video.subtitles.length}`}
                  </span>
                  <div className="w-24 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all duration-300"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript List */}
            <div
              ref={transcriptRef}
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 350px)", minHeight: "400px" }}
            >
              {video.subtitles.map((subtitle) => (
                <div
                  key={subtitle.index}
                  data-subtitle-index={subtitle.index}
                  onClick={() => handleSubtitleClick(subtitle)}
                  className={clsx(
                    "p-4 border-b border-neutral-700/50 cursor-pointer transition-all",
                    activeSubtitleIndex === subtitle.index
                      ? "bg-yellow-500/10 border-l-4 border-l-yellow-500"
                      : "hover:bg-neutral-800/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Index Badge */}
                    <span
                      className={clsx(
                        "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium",
                        activeSubtitleIndex === subtitle.index
                          ? "bg-yellow-500 text-neutral-900"
                          : "bg-neutral-700 text-neutral-400"
                      )}
                    >
                      {subtitle.index + 1}
                    </span>

                    {/* Subtitle Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={clsx(
                          "text-base font-medium",
                          activeSubtitleIndex === subtitle.index
                            ? "text-neutral-100"
                            : "text-neutral-200"
                        )}
                      >
                        {subtitle.japaneseText}
                      </p>
                      <p className="text-sm text-neutral-400 italic mt-0.5">
                        {subtitle.romaji}
                      </p>
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {subtitle.meaning}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit functionality
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors"
                        title="Report"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Report functionality
                        }}
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="mt-2 ml-10 text-xs text-neutral-500">
                    {formatDuration(Math.floor(subtitle.startTime))} -{" "}
                    {formatDuration(Math.floor(subtitle.endTime))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-center text-sm text-neutral-500 py-4">
        <span className="inline-flex items-center gap-4">
          <span>
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">Space</kbd>{" "}
            Play/Pause
          </span>
          <span>
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">←</kbd>{" "}
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">→</kbd>{" "}
            ±5 sec
          </span>
          <span>
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">↑</kbd>{" "}
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">↓</kbd>{" "}
            Prev/Next subtitle
          </span>
        </span>
      </div>
    </div>
  );
}
