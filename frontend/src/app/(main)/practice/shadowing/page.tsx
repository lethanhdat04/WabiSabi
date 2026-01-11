"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Mic,
  MicOff,
  SkipForward,
  Volume2,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
} from "@/components/ui";
import { mockSubtitleSegments, mockVideos } from "@/lib/mock-data";

type PracticeState = "ready" | "playing" | "recording" | "reviewing" | "finished";

interface SegmentResult {
  segmentIndex: number;
  pronunciationScore: number;
  overallScore: number;
}

export default function ShadowingPage() {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [practiceState, setPracticeState] = useState<PracticeState>("ready");
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState<SegmentResult[]>([]);
  const [currentResult, setCurrentResult] = useState<SegmentResult | null>(null);

  const segments = mockSubtitleSegments;
  const segment = segments[currentSegment];
  const video = mockVideos[0];
  const progress = ((currentSegment + 1) / segments.length) * 100;

  const playSegment = () => {
    setPracticeState("playing");
    // Simulate audio playback
    setTimeout(() => {
      setPracticeState("recording");
    }, 2000);
  };

  const startRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      stopRecording();
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate evaluation
    const mockResult: SegmentResult = {
      segmentIndex: currentSegment,
      pronunciationScore: 70 + Math.random() * 25,
      overallScore: 70 + Math.random() * 25,
    };
    setCurrentResult(mockResult);
    setPracticeState("reviewing");
  };

  const nextSegment = () => {
    if (currentResult) {
      setResults([...results, currentResult]);
    }

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

  const getAverageScore = () => {
    if (results.length === 0) return 0;
    return Math.round(
      results.reduce((acc, r) => acc + r.overallScore, 0) / results.length
    );
  };

  if (practiceState === "finished") {
    const avgScore = getAverageScore();
    const finalResult = currentResult
      ? [...results, currentResult]
      : results;
    const finalAvg = Math.round(
      finalResult.reduce((acc, r) => acc + r.overallScore, 0) / finalResult.length
    );

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Practice
        </Link>

        <Card>
          <CardContent className="text-center py-8">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                finalAvg >= 80
                  ? "bg-green-500/10"
                  : finalAvg >= 60
                  ? "bg-yellow-500/10"
                  : "bg-red-500/10"
              }`}
            >
              <span
                className={`text-3xl font-heading font-semibold ${
                  finalAvg >= 80
                    ? "text-green-500"
                    : finalAvg >= 60
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {finalAvg}%
              </span>
            </div>
            <h2 className="text-2xl font-heading font-semibold text-neutral-200 mb-2">
              Shadowing Complete
            </h2>
            <p className="text-neutral-400 mb-6">
              You practiced {segments.length} segments
            </p>

            <div className="space-y-2 mb-6">
              {finalResult.map((result, i) => (
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
              <Link href="/practice">
                <Button>Done</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
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
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-neutral-200 line-clamp-1">
                {video.title}
              </h3>
              <p className="text-sm text-neutral-400">{video.titleJapanese}</p>
            </div>
            <Badge variant="yellow">{video.level}</Badge>
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
                  <Button onClick={startRecording} size="lg">
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
                  onClick={() => setPracticeState("ready")}
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
      <div className="flex justify-center gap-2">
        {segments.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < currentSegment
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
