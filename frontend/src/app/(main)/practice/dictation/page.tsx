"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Volume2,
  SkipForward,
  Check,
  X,
  RefreshCw,
  Search,
  Film,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
  Input,
  LoadingPage,
  ErrorPage,
  EmptyState,
} from "@/components/ui";
import {
  videoApi,
  dictationApi,
  Video,
  SubtitleSegment,
  PageResponse,
} from "@/lib/api-client";

type PracticeState = "select-video" | "ready" | "playing" | "typing" | "reviewing" | "finished";

interface SegmentResult {
  segmentIndex: number;
  userInput: string;
  correctText: string;
  accuracyScore: number;
}

export default function DictationPage() {
  // Video selection state
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  // Practice state
  const [currentSegment, setCurrentSegment] = useState(0);
  const [practiceState, setPracticeState] = useState<PracticeState>("select-video");
  const [userInput, setUserInput] = useState("");
  const [results, setResults] = useState<SegmentResult[]>([]);
  const [currentResult, setCurrentResult] = useState<SegmentResult | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio ref for playing video segments
  const playerRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function fetchVideos() {
      setIsLoadingVideos(true);
      try {
        const response = await videoApi.getAll({ size: 50 });
        // Only show videos that have subtitles
        const videosWithSubtitles = response.content.filter(
          (v) => v.subtitles && v.subtitles.length > 0
        );
        setVideos(videosWithSubtitles);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load videos");
      } finally {
        setIsLoadingVideos(false);
      }
    }
    fetchVideos();
  }, []);

  const segments = selectedVideo?.subtitles || [];
  const segment = segments[currentSegment];
  const progress = segments.length > 0 ? ((currentSegment + 1) / segments.length) * 100 : 0;

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.titleJapanese.includes(searchQuery)
  );

  const selectVideo = (video: Video) => {
    setSelectedVideo(video);
    setCurrentSegment(0);
    setResults([]);
    setCurrentResult(null);
    setUserInput("");
    setPlayCount(0);
    setPracticeState("ready");
  };

  const playAudio = () => {
    if (!selectedVideo || !segment) return;

    setPracticeState("playing");
    setPlayCount(playCount + 1);

    // Play segment using YouTube iframe API
    if (playerRef.current) {
      const startTime = segment.startTime;
      const endTime = segment.endTime;
      playerRef.current.src = `https://www.youtube.com/embed/${selectedVideo.youtubeId}?start=${Math.floor(startTime)}&end=${Math.floor(endTime)}&autoplay=1&enablejsapi=1`;
    }

    // Auto transition to typing after segment duration
    const duration = (segment.endTime - segment.startTime) * 1000 + 500;
    setTimeout(() => {
      setPracticeState("typing");
    }, duration);
  };

  const checkAnswer = async () => {
    if (!segment || !selectedVideo || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Submit to backend
      const response = await dictationApi.submitAttempt({
        videoId: selectedVideo.id,
        segmentIndex: currentSegment,
        userInputText: userInput.trim(),
      });

      const result: SegmentResult = {
        segmentIndex: currentSegment,
        userInput: userInput.trim(),
        correctText: segment.japaneseText,
        accuracyScore: response.evaluation?.accuracyScore ?? calculateAccuracy(userInput, segment.japaneseText),
      };

      setCurrentResult(result);
      setResults([...results, result]);
      setPracticeState("reviewing");
    } catch (err) {
      console.error("Failed to submit answer:", err);
      // Fallback to local calculation
      const accuracy = calculateAccuracy(userInput, segment.japaneseText);
      const result: SegmentResult = {
        segmentIndex: currentSegment,
        userInput: userInput.trim(),
        correctText: segment.japaneseText,
        accuracyScore: accuracy,
      };
      setCurrentResult(result);
      setResults([...results, result]);
      setPracticeState("reviewing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAccuracy = (input: string, correct: string): number => {
    const normalizedInput = input.trim();
    const normalizedCorrect = correct.trim();

    if (normalizedInput === normalizedCorrect) return 100;
    if (normalizedInput.length === 0) return 0;

    let matches = 0;
    const maxLen = Math.max(normalizedInput.length, normalizedCorrect.length);

    for (let i = 0; i < Math.min(normalizedInput.length, normalizedCorrect.length); i++) {
      if (normalizedInput[i] === normalizedCorrect[i]) {
        matches++;
      }
    }

    return Math.round((matches / maxLen) * 100);
  };

  const nextSegment = () => {
    if (currentResult) {
      // Result already added in checkAnswer
    }

    if (currentSegment < segments.length - 1) {
      setCurrentSegment(currentSegment + 1);
      setCurrentResult(null);
      setUserInput("");
      setPlayCount(0);
      setPracticeState("ready");
    } else {
      setPracticeState("finished");
    }
  };

  const resetPractice = () => {
    setCurrentSegment(0);
    setPracticeState("ready");
    setResults([]);
    setCurrentResult(null);
    setUserInput("");
    setPlayCount(0);
  };

  const backToVideoSelection = () => {
    setSelectedVideo(null);
    setPracticeState("select-video");
    setCurrentSegment(0);
    setResults([]);
    setCurrentResult(null);
    setUserInput("");
    setPlayCount(0);
  };

  const getAverageScore = () => {
    const allResults = currentResult && !results.includes(currentResult)
      ? [...results, currentResult]
      : results;
    if (allResults.length === 0) return 0;
    return Math.round(
      allResults.reduce((acc, r) => acc + r.accuracyScore, 0) / allResults.length
    );
  };

  if (isLoadingVideos) {
    return <LoadingPage message="Loading videos..." />;
  }

  if (error) {
    return <ErrorPage title="Error" message={error} />;
  }

  // Video Selection Screen
  if (practiceState === "select-video") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Practice
        </Link>

        <div>
          <h1 className="text-2xl font-heading font-semibold text-neutral-200">
            Dictation Practice
          </h1>
          <p className="text-neutral-400 mt-1">
            Select a video to start practicing your listening skills
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
            className="pl-10"
          />
        </div>

        {/* Video Grid */}
        {filteredVideos.length === 0 ? (
          <EmptyState
            icon={<Film className="w-8 h-8 text-neutral-400" />}
            title="No videos found"
            description="No videos with subtitles available for practice"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <Card
                key={video.id}
                variant="interactive"
                className="cursor-pointer"
                onClick={() => selectVideo(video)}
              >
                <CardContent className="p-0">
                  <div className="aspect-video bg-neutral-800 rounded-t-lg overflow-hidden">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="blue">{video.level}</Badge>
                      <Badge variant="default">{video.subtitles.length} segments</Badge>
                    </div>
                    <h3 className="font-medium text-neutral-200 line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="text-sm text-neutral-400 line-clamp-1">
                      {video.titleJapanese}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Finished Screen
  if (practiceState === "finished") {
    const finalResults = results;
    const avgScore = getAverageScore();

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={backToVideoSelection}
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Videos
        </button>

        <Card>
          <CardContent className="text-center py-8">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                avgScore >= 80
                  ? "bg-green-500/10"
                  : avgScore >= 60
                  ? "bg-yellow-500/10"
                  : "bg-red-500/10"
              }`}
            >
              <span
                className={`text-3xl font-heading font-semibold ${
                  avgScore >= 80
                    ? "text-green-500"
                    : avgScore >= 60
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {avgScore}%
              </span>
            </div>
            <h2 className="text-2xl font-heading font-semibold text-neutral-200 mb-2">
              Dictation Complete
            </h2>
            <p className="text-neutral-400 mb-6">
              You transcribed {segments.length} segments from "{selectedVideo?.title}"
            </p>

            <div className="space-y-2 mb-6 text-left max-h-64 overflow-y-auto">
              {finalResults.map((result, i) => (
                <div
                  key={i}
                  className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-400">
                      Segment {result.segmentIndex + 1}
                    </span>
                    <Badge
                      variant={
                        result.accuracyScore >= 80
                          ? "green"
                          : result.accuracyScore >= 60
                          ? "yellow"
                          : "red"
                      }
                    >
                      {result.accuracyScore}%
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-200 mb-1">
                    {result.correctText}
                  </p>
                  {result.userInput !== result.correctText && (
                    <p className="text-sm text-neutral-400">
                      Your answer: {result.userInput || "(empty)"}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={resetPractice}>
                <RotateCcw className="w-5 h-5" />
                Practice Again
              </Button>
              <Button onClick={backToVideoSelection}>
                Choose Another Video
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Practice Screen
  if (!selectedVideo || !segment) {
    return <ErrorPage title="Error" message="No video selected" />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hidden YouTube Player */}
      <iframe
        ref={playerRef}
        className="hidden"
        width="0"
        height="0"
        allow="autoplay"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={backToVideoSelection}
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <span className="text-sm text-neutral-400">
          Segment {currentSegment + 1} / {segments.length}
        </span>
      </div>

      {/* Progress */}
      <Progress value={progress} size="sm" />

      {/* Video Preview */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-12 bg-neutral-700 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={selectedVideo.thumbnailUrl}
                alt={selectedVideo.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-neutral-200 line-clamp-1">
                {selectedVideo.title}
              </h3>
              <p className="text-sm text-neutral-400">{selectedVideo.titleJapanese}</p>
            </div>
            <Badge variant="yellow">{selectedVideo.level}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Practice Card */}
      <Card>
        <CardContent className="py-8">
          {/* State-based UI */}
          {practiceState === "ready" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-neutral-400 mb-4">
                Listen carefully and type what you hear
              </p>
              <Button onClick={playAudio} size="lg">
                <Play className="w-5 h-5" />
                Play Audio
              </Button>
            </div>
          )}

          {practiceState === "playing" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
              <p className="text-neutral-400">Playing audio...</p>
            </div>
          )}

          {practiceState === "typing" && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-neutral-400 mb-2">
                  Type what you heard (plays: {playCount})
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={playAudio}
                  disabled={playCount >= 3}
                >
                  <RefreshCw className="w-4 h-4" />
                  Play Again {playCount >= 3 ? "(max)" : `(${3 - playCount} left)`}
                </Button>
              </div>

              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the Japanese text..."
                className="text-lg text-center"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && userInput.trim()) {
                    checkAnswer();
                  }
                }}
                disabled={isSubmitting}
              />

              <Button
                onClick={checkAnswer}
                disabled={!userInput.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Checking..." : "Check Answer"}
              </Button>
            </div>
          )}

          {practiceState === "reviewing" && currentResult && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    currentResult.accuracyScore >= 80
                      ? "bg-green-500/10"
                      : currentResult.accuracyScore >= 60
                      ? "bg-yellow-500/10"
                      : "bg-red-500/10"
                  }`}
                >
                  {currentResult.accuracyScore >= 80 ? (
                    <Check className="w-8 h-8 text-green-500" />
                  ) : currentResult.accuracyScore >= 60 ? (
                    <span className="text-2xl font-heading font-semibold text-yellow-500">
                      {currentResult.accuracyScore}%
                    </span>
                  ) : (
                    <X className="w-8 h-8 text-red-500" />
                  )}
                </div>
                <p className="text-neutral-400">
                  {currentResult.accuracyScore >= 80
                    ? "Perfect!"
                    : currentResult.accuracyScore >= 60
                    ? "Almost there!"
                    : "Keep practicing!"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-xs text-green-500 mb-1">Correct Answer</p>
                  <p className="text-lg text-neutral-200">
                    {currentResult.correctText}
                  </p>
                  <p className="text-sm text-neutral-400 mt-1">
                    {segment.romaji} - {segment.meaning}
                  </p>
                </div>

                {currentResult.userInput !== currentResult.correctText && (
                  <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                    <p className="text-xs text-neutral-400 mb-1">Your Answer</p>
                    <p className="text-lg text-neutral-200">
                      {currentResult.userInput || "(empty)"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setUserInput("");
                    setPlayCount(0);
                    setCurrentResult(null);
                    // Remove the last result since we're retrying
                    setResults(results.slice(0, -1));
                    setPracticeState("ready");
                  }}
                  className="flex-1"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </Button>
                <Button onClick={nextSegment} className="flex-1">
                  {currentSegment < segments.length - 1 ? (
                    <>
                      <SkipForward className="w-5 h-5" />
                      Next
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Finish
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segment indicators */}
      <div className="flex justify-center gap-2 flex-wrap">
        {segments.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < results.length
                ? results[i]?.accuracyScore >= 70
                  ? "bg-green-500"
                  : "bg-yellow-500"
                : i === currentSegment
                ? "bg-blue-500"
                : "bg-neutral-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
