"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  SkipForward,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
  Input,
} from "@/components/ui";
import { mockSubtitleSegments, mockVideos } from "@/lib/mock-data";

type PracticeState = "ready" | "playing" | "typing" | "reviewing" | "finished";

interface SegmentResult {
  segmentIndex: number;
  userInput: string;
  correctText: string;
  accuracyScore: number;
}

export default function DictationPage() {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [practiceState, setPracticeState] = useState<PracticeState>("ready");
  const [userInput, setUserInput] = useState("");
  const [results, setResults] = useState<SegmentResult[]>([]);
  const [currentResult, setCurrentResult] = useState<SegmentResult | null>(null);
  const [playCount, setPlayCount] = useState(0);

  const segments = mockSubtitleSegments;
  const segment = segments[currentSegment];
  const video = mockVideos[0];
  const progress = ((currentSegment + 1) / segments.length) * 100;

  const playAudio = () => {
    setPracticeState("playing");
    setPlayCount(playCount + 1);
    // Simulate audio playback
    setTimeout(() => {
      setPracticeState("typing");
    }, 2000);
  };

  const checkAnswer = () => {
    const accuracy = calculateAccuracy(userInput, segment.japaneseText);
    const result: SegmentResult = {
      segmentIndex: currentSegment,
      userInput: userInput,
      correctText: segment.japaneseText,
      accuracyScore: accuracy,
    };
    setCurrentResult(result);
    setPracticeState("reviewing");
  };

  const calculateAccuracy = (input: string, correct: string): number => {
    const normalizedInput = input.trim().toLowerCase();
    const normalizedCorrect = correct.trim().toLowerCase();

    if (normalizedInput === normalizedCorrect) return 100;
    if (normalizedInput.length === 0) return 0;

    // Simple character-based similarity
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
      setResults([...results, currentResult]);
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

  const getAverageScore = () => {
    const allResults = currentResult ? [...results, currentResult] : results;
    if (allResults.length === 0) return 0;
    return Math.round(
      allResults.reduce((acc, r) => acc + r.accuracyScore, 0) / allResults.length
    );
  };

  if (practiceState === "finished") {
    const finalResults = currentResult ? [...results, currentResult] : results;
    const avgScore = getAverageScore();

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
              You transcribed {segments.length} segments
            </p>

            <div className="space-y-2 mb-6 text-left">
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
          <div className="flex items-center gap-4">
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
              />

              <Button
                onClick={checkAnswer}
                disabled={!userInput.trim()}
                className="w-full"
              >
                Check Answer
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
      <div className="flex justify-center gap-2">
        {segments.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < currentSegment
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
