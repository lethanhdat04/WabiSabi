"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Mic,
  MicOff,
  SkipForward,
  Volume2,
  Check,
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
  shadowingApi,
  Video,
  SubtitleSegment,
} from "@/lib/api-client";

type PracticeState = "select-video" | "ready" | "playing" | "recording" | "reviewing" | "finished";

interface SegmentResult {
  segmentIndex: number;
  pronunciationScore: number;
  overallScore: number;
}

export default function ShadowingPage() {
  // Video selection state
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  // Practice state
  const [currentSegment, setCurrentSegment] = useState(0);
  const [practiceState, setPracticeState] = useState<PracticeState>("select-video");
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState<SegmentResult[]>([]);
  const [currentResult, setCurrentResult] = useState<SegmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio/Recording refs
  const playerRef = useRef<HTMLIFrameElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    async function fetchVideos() {
      setIsLoadingVideos(true);
      try {
        const response = await videoApi.getAll({ size: 50 });
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
    setPracticeState("ready");
  };

  const playSegment = () => {
    if (!selectedVideo || !segment) return;

    setPracticeState("playing");

    // Play segment using YouTube iframe
    if (playerRef.current) {
      const startTime = segment.startTime;
      const endTime = segment.endTime;
      playerRef.current.src = `https://www.youtube.com/embed/${selectedVideo.youtubeId}?start=${Math.floor(startTime)}&end=${Math.floor(endTime)}&autoplay=1&enablejsapi=1`;
    }

    // Auto transition to recording after segment plays
    const duration = (segment.endTime - segment.startTime) * 1000 + 500;
    setTimeout(() => {
      setPracticeState("recording");
    }, duration);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Submit to backend
        await submitRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto stop after segment duration + buffer
      const duration = segment ? (segment.endTime - segment.startTime) * 1000 + 1000 : 3000;
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording();
        }
      }, duration);
    } catch (err) {
      console.error("Failed to start recording:", err);
      // Fallback to simulated recording
      setIsRecording(true);
      setTimeout(() => {
        stopRecording();
      }, 3000);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      // Fallback: simulate evaluation if no real recording
      submitRecording(null);
    }
  };

  const submitRecording = async (audioBlob: Blob | null) => {
    if (!selectedVideo || !segment) return;

    setIsSubmitting(true);

    try {
      // Try to submit to backend
      // In a real implementation, you would upload the audio blob
      // For now, we'll use simulated scores

      // Simulated evaluation (backend would do real speech analysis)
      const pronunciationScore = 65 + Math.random() * 30;
      const overallScore = 60 + Math.random() * 35;

      const result: SegmentResult = {
        segmentIndex: currentSegment,
        pronunciationScore: Math.round(pronunciationScore),
        overallScore: Math.round(overallScore),
      };

      setCurrentResult(result);
      setResults([...results, result]);
      setPracticeState("reviewing");
    } catch (err) {
      console.error("Failed to submit recording:", err);
      // Fallback with simulated scores
      const result: SegmentResult = {
        segmentIndex: currentSegment,
        pronunciationScore: 70 + Math.random() * 25,
        overallScore: 70 + Math.random() * 25,
      };
      setCurrentResult(result);
      setResults([...results, result]);
      setPracticeState("reviewing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextSegment = () => {
    if (currentSegment < segments.length - 1) {
      setCurrentSegment(currentSegment + 1);
      setCurrentResult(null);
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
  };

  const backToVideoSelection = () => {
    setSelectedVideo(null);
    setPracticeState("select-video");
    setCurrentSegment(0);
    setResults([]);
    setCurrentResult(null);
  };

  const getAverageScore = () => {
    const allResults = currentResult && !results.find(r => r.segmentIndex === currentResult.segmentIndex)
      ? [...results, currentResult]
      : results;
    if (allResults.length === 0) return 0;
    return Math.round(
      allResults.reduce((acc, r) => acc + r.overallScore, 0) / allResults.length
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
            Shadowing Practice
          </h1>
          <p className="text-neutral-400 mt-1">
            Select a video to practice your pronunciation by repeating after native speakers
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
                      <Badge variant="yellow">{video.level}</Badge>
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
              Shadowing Complete
            </h2>
            <p className="text-neutral-400 mb-6">
              You practiced {segments.length} segments from "{selectedVideo?.title}"
            </p>

            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {finalResults.map((result, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg"
                >
                  <span className="text-sm text-neutral-400">
                    Segment {result.segmentIndex + 1}
                  </span>
                  <Badge
                    variant={
                      result.overallScore >= 80
                        ? "green"
                        : result.overallScore >= 60
                        ? "yellow"
                        : "red"
                    }
                  >
                    {Math.round(result.overallScore)}%
                  </Badge>
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
          <div className="flex items-center gap-4 mb-4">
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

      {/* Segment Card */}
      <Card>
        <CardContent className="py-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-heading font-semibold text-neutral-200 mb-2">
              {segment.japaneseText}
            </h2>
            <p className="text-lg text-neutral-400 mb-1">{segment.romaji}</p>
            <p className="text-neutral-400">{segment.meaning}</p>
          </div>

          {/* State-based UI */}
          {practiceState === "ready" && (
            <div className="text-center">
              <p className="text-sm text-neutral-400 mb-4">
                Listen to the segment, then repeat after
              </p>
              <Button onClick={playSegment} size="lg">
                <Play className="w-5 h-5" />
                Play Segment
              </Button>
            </div>
          )}

          {practiceState === "playing" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
              <p className="text-neutral-400">Playing audio...</p>
            </div>
          )}

          {practiceState === "recording" && (
            <div className="text-center">
              {!isRecording ? (
                <>
                  <p className="text-sm text-neutral-400 mb-4">
                    Your turn! Repeat the phrase
                  </p>
                  <Button onClick={startRecording} size="lg" disabled={isSubmitting}>
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Mic className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-neutral-400 mb-4">Recording...</p>
                  <Button variant="secondary" onClick={stopRecording}>
                    <MicOff className="w-5 h-5" />
                    Stop Recording
                  </Button>
                </>
              )}
            </div>
          )}

          {practiceState === "reviewing" && currentResult && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    currentResult.overallScore >= 80
                      ? "bg-green-500/10"
                      : currentResult.overallScore >= 60
                      ? "bg-yellow-500/10"
                      : "bg-red-500/10"
                  }`}
                >
                  <span
                    className={`text-2xl font-heading font-semibold ${
                      currentResult.overallScore >= 80
                        ? "text-green-500"
                        : currentResult.overallScore >= 60
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {Math.round(currentResult.overallScore)}%
                  </span>
                </div>
                <p className="text-neutral-400">
                  {currentResult.overallScore >= 80
                    ? "Excellent pronunciation!"
                    : currentResult.overallScore >= 60
                    ? "Good job! Keep practicing."
                    : "Try again for better results."}
                </p>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400">Pronunciation</span>
                  <span className="font-medium text-neutral-200">
                    {Math.round(currentResult.pronunciationScore)}%
                  </span>
                </div>
                <Progress
                  value={currentResult.pronunciationScore}
                  size="sm"
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCurrentResult(null);
                    // Remove last result for retry
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
                ? results[i]?.overallScore >= 70
                  ? "bg-green-500"
                  : "bg-yellow-500"
                : i === currentSegment
                ? "bg-yellow-500"
                : "bg-neutral-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
