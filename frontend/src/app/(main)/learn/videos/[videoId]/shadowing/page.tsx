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
  MicOff,
  SkipBack,
  SkipForward,
  Settings,
  Maximize2,
  Minimize2,
  Check,
  ChevronDown,
  RotateCcw,
  BookOpen,
  Clock,
  Star,
  Eye,
  Video,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
  LoadingSpinner,
} from "@/components/ui";
import { useYouTubePlayer, PlayerState } from "@/lib/use-youtube-player";
import { formatDuration, getLevelColor } from "@/lib/mock-data";
import { videoApi, shadowingApi, Video as VideoType, VocabularyReference } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
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

interface ShadowingState {
  hasRecorded: boolean;
  recordingCount: number;
  score: number | null;
}

// Playback speed options
const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function ShadowingPage() {
  const params = useParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const videoId = params.videoId as string;

  // Data fetching state
  const [video, setVideo] = useState<VideoType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player state
  const [autoStop, setAutoStop] = useState(true);
  const [isLargeVideo, setIsLargeVideo] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
  const [showVideoThumbnail, setShowVideoThumbnail] = useState(true);

  // Shadowing state
  const [isRecording, setIsRecording] = useState(false);
  const [shadowingStates, setShadowingStates] = useState<Map<number, ShadowingState>>(new Map());
  const [currentRecordingTime, setCurrentRecordingTime] = useState(0);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs
  const transcriptRef = useRef<HTMLDivElement>(null);
  const autoStopTriggeredRef = useRef<Set<number>>(new Set());

  // Fetch video data from API
  useEffect(() => {
    async function fetchVideo() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await videoApi.getById(videoId);
        setVideo(data);

        // Initialize shadowing states for all subtitles
        const initialStates = new Map<number, ShadowingState>();
        data.subtitles?.forEach((_, index) => {
          initialStates.set(index, {
            hasRecorded: false,
            recordingCount: 0,
            score: null,
          });
        });
        setShadowingStates(initialStates);
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

  // Get subtitles from video
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
        }
      }
    },
    [findActiveSubtitle, activeSubtitleIndex, autoStop, subtitles]
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

  // Update shadowing state for a subtitle
  const updateShadowingState = (index: number, updates: Partial<ShadowingState>) => {
    setShadowingStates((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(index) || {
        hasRecorded: false,
        recordingCount: 0,
        score: null,
      };
      newMap.set(index, { ...current, ...updates });
      return newMap;
    });
  };

  // Start recording
  const startRecording = async () => {
    if (activeSubtitleIndex === null) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());

        // Simulate scoring (in real app, would send to backend for analysis)
        const score = 60 + Math.random() * 35;
        const state = shadowingStates.get(activeSubtitleIndex);

        updateShadowingState(activeSubtitleIndex, {
          hasRecorded: true,
          recordingCount: (state?.recordingCount || 0) + 1,
          score: Math.round(score),
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCurrentRecordingTime(0);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setCurrentRecordingTime(t => t + 100);
      }, 100);

      // Auto stop after segment duration + buffer
      const currentSubtitle = subtitles[activeSubtitleIndex];
      const duration = (currentSubtitle.endTime - currentSubtitle.startTime) * 1000 + 1000;
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording();
        }
      }, duration);
    } catch (err) {
      console.error("Failed to start recording:", err);
      // Simulate recording without actual audio
      setIsRecording(true);
      setCurrentRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setCurrentRecordingTime(t => t + 100);
      }, 100);

      setTimeout(() => {
        stopRecording();
      }, 3000);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else if (activeSubtitleIndex !== null && video) {
      // Fallback for simulated recording
      const score = 60 + Math.random() * 35;
      const state = shadowingStates.get(activeSubtitleIndex);

      updateShadowingState(activeSubtitleIndex, {
        hasRecorded: true,
        recordingCount: (state?.recordingCount || 0) + 1,
        score: Math.round(score),
      });

      // Submit to API for progress tracking (with placeholder audioUrl since we don't have real audio)
      try {
        await shadowingApi.submitAttempt({
          videoId: video.id,
          segmentIndex: activeSubtitleIndex,
          audioUrl: "simulated://local-recording", // Placeholder - backend will use mock evaluation
        });
        // Refresh user data to update progress in UI
        refreshUser?.();
      } catch (err) {
        console.error("Failed to submit shadowing attempt:", err);
      }
    }

    setIsRecording(false);
    setCurrentRecordingTime(0);
  };

  // Reset current subtitle
  const handleReset = () => {
    if (activeSubtitleIndex !== null) {
      updateShadowingState(activeSubtitleIndex, {
        hasRecorded: false,
        recordingCount: 0,
        score: null,
      });
      autoStopTriggeredRef.current.delete(activeSubtitleIndex);
    }
  };

  // Get current subtitle and state
  const currentSubtitle =
    activeSubtitleIndex !== null && activeSubtitleIndex >= 0
      ? subtitles[activeSubtitleIndex]
      : null;

  const currentState = activeSubtitleIndex !== null
    ? shadowingStates.get(activeSubtitleIndex)
    : null;

  // Calculate overall progress
  const completedCount = Array.from(shadowingStates.values()).filter(
    (s) => s.hasRecorded && (s.score ?? 0) >= 70
  ).length;
  const overallProgress = subtitles.length > 0 ? completedCount / subtitles.length : 0;

  // Get average score
  const scores = Array.from(shadowingStates.values())
    .filter(s => s.score !== null)
    .map(s => s.score!);
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

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
        href={`/learn/videos/${videoId}`}
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Video</span>
      </Link>

      {/* Mode Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="yellow" className="text-sm">
          Shadowing Mode
        </Badge>
        <span className="text-sm text-neutral-400">
          Listen and repeat after the speaker
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
                  >
                    {isLargeVideo ? (
                      <Maximize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shadowing Practice Area */}
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

                  {/* Current Subtitle Display */}
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-neutral-100 mb-2">
                      {currentSubtitle.japaneseText}
                    </p>
                    {currentSubtitle.romaji && (
                      <p className="text-lg text-neutral-400 italic mb-2">
                        {currentSubtitle.romaji}
                      </p>
                    )}
                    <p className="text-base text-neutral-300">
                      {currentSubtitle.meaning}
                    </p>
                  </div>

                  {/* Recording Section */}
                  <div className="flex flex-col items-center gap-4 py-4">
                    {isRecording ? (
                      <>
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                          <Mic className="w-10 h-10 text-red-500" />
                        </div>
                        <p className="text-neutral-400">
                          Recording... {(currentRecordingTime / 1000).toFixed(1)}s
                        </p>
                        <Button variant="secondary" onClick={stopRecording}>
                          <MicOff className="w-4 h-4" />
                          Stop Recording
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="lg"
                          onClick={startRecording}
                          className="bg-yellow-500 hover:bg-yellow-400 text-neutral-900"
                        >
                          <Mic className="w-5 h-5" />
                          Start Recording
                        </Button>
                        <p className="text-sm text-neutral-400">
                          Press to record your pronunciation
                        </p>
                      </>
                    )}
                  </div>

                  {/* Score Display */}
                  {currentState?.hasRecorded && currentState.score !== null && (
                    <div className="p-4 bg-neutral-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-400">
                          Pronunciation Score
                        </span>
                        <span className="text-sm text-neutral-400">
                          Attempts: {currentState.recordingCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "text-3xl font-bold",
                          currentState.score >= 80 ? "text-green-400" :
                          currentState.score >= 60 ? "text-yellow-400" :
                          "text-red-400"
                        )}>
                          {currentState.score}%
                        </div>
                        <Progress
                          value={currentState.score}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-sm text-neutral-400 mt-2">
                        {currentState.score >= 80 ? "Excellent pronunciation!" :
                         currentState.score >= 60 ? "Good job! Keep practicing." :
                         "Try again for better results."}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button variant="ghost" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </Button>
                    <Button variant="secondary" onClick={goToNextSubtitle}>
                      <SkipForward className="w-4 h-4" />
                      Next Segment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400">
                    Play the video to start shadowing practice
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Listen to each segment and repeat after the speaker
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
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-heading font-semibold text-neutral-200">
                  Progress
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">
                    {completedCount}/{subtitles.length} completed
                  </span>
                </div>
              </div>
              <Progress value={overallProgress * 100} size="sm" />
              {scores.length > 0 && (
                <p className="text-xs text-neutral-500 mt-2">
                  Average score: {averageScore}%
                </p>
              )}
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
                  const state = shadowingStates.get(subtitle.index);
                  const isActive = activeSubtitleIndex === subtitle.index;
                  const isCompleted = state?.hasRecorded && (state.score ?? 0) >= 70;

                  return (
                    <div
                      key={subtitle.index}
                      data-subtitle-index={subtitle.index}
                      onClick={() => handleSubtitleClick(subtitle)}
                      className={clsx(
                        "p-4 border-b border-neutral-700/50 cursor-pointer transition-all",
                        isActive
                          ? "bg-yellow-500/10 border-l-4 border-l-yellow-500"
                          : "hover:bg-neutral-800/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Status Badge */}
                        <span
                          className={clsx(
                            "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium",
                            isActive
                              ? "bg-yellow-500 text-neutral-900"
                              : isCompleted
                              ? "bg-green-500 text-white"
                              : state?.hasRecorded
                              ? "bg-yellow-500/50 text-neutral-900"
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
                          <p className="text-base font-medium text-neutral-200">
                            {subtitle.japaneseText}
                          </p>
                          {subtitle.romaji && (
                            <p className="text-sm text-neutral-400 italic mt-0.5">
                              {subtitle.romaji}
                            </p>
                          )}
                          <p className="text-sm text-neutral-500 mt-0.5">
                            {subtitle.meaning}
                          </p>

                          {/* Show score if recorded */}
                          {state?.hasRecorded && state.score !== null && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className={clsx(
                                "text-xs font-medium",
                                state.score >= 70 ? "text-green-400" : "text-yellow-400"
                              )}>
                                {state.score}%
                              </span>
                              <span className="text-xs text-neutral-500">
                                ({state.recordingCount} attempts)
                              </span>
                            </div>
                          )}
                        </div>
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
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">Space</kbd>{" "}
            Play/Pause
          </span>
          <span>
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">↑</kbd>{" "}
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">↓</kbd>{" "}
            Prev/Next
          </span>
        </span>
      </div>
    </div>
  );
}
