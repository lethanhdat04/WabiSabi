"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  SkipBack,
  SkipForward,
  Settings,
  Maximize2,
  Minimize2,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Send,
  RotateCcw,
  BookOpen,
  Clock,
  Star,
  Loader2,
  Video,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  LoadingSpinner,
} from "@/components/ui";
import { useYouTubePlayer, PlayerState } from "@/lib/use-youtube-player";
import { formatDuration, getLevelColor } from "@/lib/mock-data";
import { videoApi, Video as VideoType, VocabularyReference } from "@/lib/api-client";
import { clsx } from "clsx";

interface SubtitleSegment {
  index: number;
  japaneseText: string;
  romaji?: string;
  meaning: string;
  startTime: number;
  endTime: number;
  duration?: number;
  vocabulary?: VocabularyReference[];
}

interface DictationState {
  userInput: string;
  isRevealed: boolean;
  isChecked: boolean;
  accuracy: number;
  comparisonResult: ComparisonChar[];
}

interface ComparisonChar {
  char: string;
  isCorrect: boolean;
  isMissing?: boolean;
  isExtra?: boolean;
}

// Playback speed options
const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Compare two strings and return character-by-character comparison
function compareStrings(original: string, userInput: string): { result: ComparisonChar[]; accuracy: number } {
  const normalizedOriginal = original.replace(/\s+/g, "").toLowerCase();
  const normalizedInput = userInput.replace(/\s+/g, "").toLowerCase();

  const result: ComparisonChar[] = [];
  let correctCount = 0;

  const maxLen = Math.max(normalizedOriginal.length, normalizedInput.length);

  for (let i = 0; i < maxLen; i++) {
    const origChar = normalizedOriginal[i];
    const inputChar = normalizedInput[i];

    if (origChar && inputChar) {
      const isCorrect = origChar === inputChar;
      if (isCorrect) correctCount++;
      result.push({ char: inputChar, isCorrect });
    } else if (origChar && !inputChar) {
      result.push({ char: origChar, isCorrect: false, isMissing: true });
    } else if (!origChar && inputChar) {
      result.push({ char: inputChar, isCorrect: false, isExtra: true });
    }
  }

  const accuracy = normalizedOriginal.length > 0
    ? Math.round((correctCount / normalizedOriginal.length) * 100)
    : 0;

  return { result, accuracy };
}

export default function DictationPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;

  // Data fetching state
  const [video, setVideo] = useState<VideoType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player state
  const [autoStop, setAutoStop] = useState(true); // Default ON for dictation
  const [isLargeVideo, setIsLargeVideo] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
  const [showVideoThumbnail, setShowVideoThumbnail] = useState(true);

  // Dictation state for each subtitle
  const [dictationStates, setDictationStates] = useState<Map<number, DictationState>>(new Map());
  const [currentInput, setCurrentInput] = useState("");

  // Refs
  const transcriptRef = useRef<HTMLDivElement>(null);
  const autoStopTriggeredRef = useRef<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch video data from API
  useEffect(() => {
    async function fetchVideo() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await videoApi.getById(videoId);
        setVideo(data);

        // Initialize dictation states for all subtitles
        const initialStates = new Map<number, DictationState>();
        data.subtitles?.forEach((_, index) => {
          initialStates.set(index, {
            userInput: "",
            isRevealed: false,
            isChecked: false,
            accuracy: 0,
            comparisonResult: [],
          });
        });
        setDictationStates(initialStates);
      } catch (err: any) {
        console.error("Failed to fetch video:", err);
        if (err.status === 404) {
          setError("Video not found");
        } else {
          setError(err.message || "Failed to load video");
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  // Get subtitles from video (with safe fallback)
  const subtitles: SubtitleSegment[] = video?.subtitles ?? [];

  // Find current subtitle based on time
  const findActiveSubtitle = useCallback(
    (currentTime: number) => {
      return subtitles.findIndex(
        (subtitle) =>
          currentTime >= subtitle.startTime && currentTime < subtitle.endTime
      );
    },
    [subtitles]
  );

  // Handle time updates from YouTube player
  const handleTimeUpdate = useCallback(
    (currentTime: number) => {
      const newActiveIndex = findActiveSubtitle(currentTime);

      if (newActiveIndex !== activeSubtitleIndex) {
        setActiveSubtitleIndex(newActiveIndex >= 0 ? newActiveIndex : null);

        // Update current input from dictation state when changing subtitle
        if (newActiveIndex >= 0) {
          const state = dictationStates.get(newActiveIndex);
          setCurrentInput(state?.userInput || "");
        }
      }

      // Auto-stop logic
      if (autoStop && activeSubtitleIndex !== null && activeSubtitleIndex >= 0) {
        const currentSubtitle = subtitles[activeSubtitleIndex];
        if (
          currentTime >= currentSubtitle.endTime - 0.1 &&
          !autoStopTriggeredRef.current.has(activeSubtitleIndex)
        ) {
          autoStopTriggeredRef.current.add(activeSubtitleIndex);
          player.pause();
          // Focus input after auto-stop
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }
    },
    [findActiveSubtitle, activeSubtitleIndex, autoStop, subtitles, dictationStates]
  );

  // Handle player state changes
  const handleStateChange = useCallback((state: PlayerState) => {
    if (state === "playing") {
      setShowVideoThumbnail(false);
    }
  }, []);

  // Initialize YouTube player
  const player = useYouTubePlayer("youtube-player", {
    videoId: video?.youtubeId ?? "",
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

  // Handle subtitle click - seek to timestamp
  const handleSubtitleClick = (subtitle: SubtitleSegment) => {
    player.seekTo(subtitle.startTime);
    autoStopTriggeredRef.current.delete(subtitle.index);
    player.play();
  };

  // Replay current subtitle
  const replayCurrentSubtitle = () => {
    if (activeSubtitleIndex !== null && activeSubtitleIndex >= 0) {
      const subtitle = subtitles[activeSubtitleIndex];
      autoStopTriggeredRef.current.delete(activeSubtitleIndex);
      player.seekTo(subtitle.startTime);
      player.play();
    }
  };

  // Navigate to previous/next subtitle
  const goToPrevSubtitle = () => {
    const currentIndex = activeSubtitleIndex ?? 0;
    if (currentIndex > 0) {
      handleSubtitleClick(subtitles[currentIndex - 1]);
    }
  };

  const goToNextSubtitle = () => {
    const currentIndex = activeSubtitleIndex ?? -1;
    if (currentIndex < subtitles.length - 1) {
      handleSubtitleClick(subtitles[currentIndex + 1]);
    }
  };

  // Update dictation state for a subtitle
  const updateDictationState = (index: number, updates: Partial<DictationState>) => {
    setDictationStates((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(index) || {
        userInput: "",
        isRevealed: false,
        isChecked: false,
        accuracy: 0,
        comparisonResult: [],
      };
      newMap.set(index, { ...current, ...updates });
      return newMap;
    });
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setCurrentInput(value);
    if (activeSubtitleIndex !== null) {
      updateDictationState(activeSubtitleIndex, { userInput: value });
    }
  };

  // Check answer
  const handleCheckAnswer = () => {
    if (activeSubtitleIndex === null || !currentInput.trim()) return;

    const subtitle = subtitles[activeSubtitleIndex];
    const { result, accuracy } = compareStrings(subtitle.japaneseText, currentInput);

    updateDictationState(activeSubtitleIndex, {
      isChecked: true,
      accuracy,
      comparisonResult: result,
    });
  };

  // Reveal answer
  const handleReveal = (index: number) => {
    updateDictationState(index, { isRevealed: true });
  };

  // Reset current subtitle
  const handleReset = () => {
    if (activeSubtitleIndex !== null) {
      setCurrentInput("");
      updateDictationState(activeSubtitleIndex, {
        userInput: "",
        isChecked: false,
        isRevealed: false,
        accuracy: 0,
        comparisonResult: [],
      });
      autoStopTriggeredRef.current.delete(activeSubtitleIndex);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCheckAnswer();
    }
  };

  // Get current subtitle and state
  const currentSubtitle =
    activeSubtitleIndex !== null && activeSubtitleIndex >= 0
      ? subtitles[activeSubtitleIndex]
      : null;

  const currentState = activeSubtitleIndex !== null
    ? dictationStates.get(activeSubtitleIndex)
    : null;

  // Calculate overall progress
  const completedCount = Array.from(dictationStates.values()).filter(
    (s) => s.isChecked && s.accuracy >= 80
  ).length;
  const progress = subtitles.length > 0 ? completedCount / subtitles.length : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Link
          href="/learn/videos"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Videos</span>
        </Link>
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="text-neutral-400 mt-4">Loading video...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !video) {
    return (
      <div className="max-w-7xl mx-auto">
        <Link
          href="/learn/videos"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Videos</span>
        </Link>
        <Card>
          <CardContent className="py-16 text-center">
            <Video className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold text-neutral-200 mb-2">
              {error === "Video not found" ? "Video Not Found" : "Error Loading Video"}
            </h2>
            <p className="text-neutral-400 mb-6">
              {error === "Video not found"
                ? "The video you're looking for doesn't exist or has been removed."
                : error || "An unexpected error occurred while loading the video."}
            </p>
            <Button onClick={() => router.push("/learn/videos")}>
              Browse Videos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Mode Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="blue" className="text-sm">
          Dictation Mode
        </Badge>
        <span className="text-sm text-neutral-400">
          Listen and type what you hear
        </span>
      </div>

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
                {video.titleJapanese && (
                  <p className="text-lg text-neutral-400 mt-1">
                    {video.titleJapanese}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getLevelColor(video.level) as any}>
                  {video.level}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-400">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {video.stats.viewCount.toLocaleString()} views
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {video.stats.averageRating.toFixed(1)}
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
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors">
                      <Play className="w-8 h-8 lg:w-10 lg:h-10 text-white ml-1" />
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
                      activeSubtitleIndex >= subtitles.length - 1
                    }
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
                        ? "bg-blue-500 text-white border-blue-500"
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
                                ? "text-blue-500"
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

          {/* Dictation Input Area */}
          <Card className="mt-4">
            <CardContent>
              {currentSubtitle ? (
                <div className="space-y-4">
                  {/* Segment Info */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">
                      Segment {activeSubtitleIndex! + 1} of {subtitles.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={replayCurrentSubtitle}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Replay</span>
                    </Button>
                  </div>

                  {/* Answer Display (when checked or revealed) */}
                  {(currentState?.isChecked || currentState?.isRevealed) && (
                    <div className="p-4 bg-neutral-800/50 rounded-lg">
                      {currentState.isChecked && !currentState.isRevealed && (
                        <>
                          {/* Show comparison result */}
                          <div className="mb-2">
                            <span className="text-sm text-neutral-400">Your answer:</span>
                            <div className="text-xl font-medium mt-1">
                              {currentState.comparisonResult.map((char, i) => (
                                <span
                                  key={i}
                                  className={clsx(
                                    char.isCorrect && "text-green-400",
                                    !char.isCorrect && !char.isMissing && "text-red-400",
                                    char.isMissing && "text-yellow-400 opacity-50"
                                  )}
                                >
                                  {char.char}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {currentState.accuracy >= 80 ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400" />
                            )}
                            <span className={clsx(
                              "font-medium",
                              currentState.accuracy >= 80 ? "text-green-400" : "text-red-400"
                            )}>
                              {currentState.accuracy}% accurate
                            </span>
                          </div>
                        </>
                      )}

                      {/* Show correct answer when revealed */}
                      {currentState.isRevealed && (
                        <div>
                          <span className="text-sm text-neutral-400">Correct answer:</span>
                          <p className="text-2xl font-bold text-neutral-100 mt-1">
                            {currentSubtitle.japaneseText}
                          </p>
                          {currentSubtitle.romaji && (
                            <p className="text-base text-neutral-400 italic mt-1">
                              {currentSubtitle.romaji}
                            </p>
                          )}
                          <p className="text-sm text-neutral-500 mt-1">
                            {currentSubtitle.meaning}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input Field */}
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={currentInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type what you hear in Japanese..."
                        disabled={currentState?.isRevealed}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-lg placeholder-neutral-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        onClick={handleCheckAnswer}
                        disabled={!currentInput.trim() || currentState?.isRevealed}
                        className="flex-1"
                      >
                        <Send className="w-4 h-4" />
                        <span>Check Answer</span>
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => handleReveal(activeSubtitleIndex!)}
                        disabled={currentState?.isRevealed}
                      >
                        <Eye className="w-4 h-4" />
                        <span>Reveal</span>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={handleReset}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Hint: English meaning (always visible) */}
                  <div className="pt-2 border-t border-neutral-700">
                    <span className="text-xs text-neutral-500 uppercase tracking-wide">Hint</span>
                    <p className="text-neutral-300 mt-1">{currentSubtitle.meaning}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400">
                    Play the video to start dictation practice
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Listen carefully and type what you hear
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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
                  Progress
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">
                    {completedCount}/{subtitles.length} completed
                  </span>
                  <div className="w-24 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
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
              {subtitles.length === 0 ? (
                <div className="p-8 text-center">
                  <BookOpen className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400">No subtitles available</p>
                </div>
              ) : (
                subtitles.map((subtitle) => {
                  const state = dictationStates.get(subtitle.index);
                  const isActive = activeSubtitleIndex === subtitle.index;
                  const isCompleted = state?.isChecked && state.accuracy >= 80;

                  return (
                    <div
                      key={subtitle.index}
                      data-subtitle-index={subtitle.index}
                      onClick={() => handleSubtitleClick(subtitle)}
                      className={clsx(
                        "p-4 border-b border-neutral-700/50 cursor-pointer transition-all",
                        isActive
                          ? "bg-blue-500/10 border-l-4 border-l-blue-500"
                          : "hover:bg-neutral-800/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Status Badge */}
                        <span
                          className={clsx(
                            "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium",
                            isActive
                              ? "bg-blue-500 text-white"
                              : isCompleted
                              ? "bg-green-500 text-white"
                              : state?.isRevealed
                              ? "bg-yellow-500 text-neutral-900"
                              : "bg-neutral-700 text-neutral-400"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            subtitle.index + 1
                          )}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Hidden or revealed subtitle */}
                          {state?.isRevealed || state?.isChecked ? (
                            <>
                              <p className="text-base font-medium text-neutral-200">
                                {subtitle.japaneseText}
                              </p>
                              {subtitle.romaji && (
                                <p className="text-sm text-neutral-400 italic mt-0.5">
                                  {subtitle.romaji}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-base text-neutral-500 italic">
                              [Hidden - listen to reveal]
                            </p>
                          )}
                          <p className="text-sm text-neutral-500 mt-0.5">
                            {subtitle.meaning}
                          </p>

                          {/* Show accuracy if checked */}
                          {state?.isChecked && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className={clsx(
                                "text-xs font-medium",
                                state.accuracy >= 80 ? "text-green-400" : "text-red-400"
                              )}>
                                {state.accuracy}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Reveal button for non-active items */}
                        {!isActive && !state?.isRevealed && !state?.isChecked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReveal(subtitle.index);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors"
                            title="Reveal answer"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="mt-2 ml-10 text-xs text-neutral-500">
                        {formatDuration(Math.floor(subtitle.startTime))} -{" "}
                        {formatDuration(Math.floor(subtitle.endTime))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-center text-sm text-neutral-500 py-4">
        <span className="inline-flex items-center gap-4">
          <span>
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">Enter</kbd>{" "}
            Check answer
          </span>
          <span>
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">Space</kbd>{" "}
            Play/Pause (when not typing)
          </span>
        </span>
      </div>
    </div>
  );
}
