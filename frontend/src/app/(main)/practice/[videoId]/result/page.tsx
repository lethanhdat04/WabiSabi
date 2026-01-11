"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  ChevronRight,
  Target,
  Zap,
  Music,
  Check,
  X,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
} from "@/components/ui";

const mockResultData = {
  videoId: "v1",
  videoTitle: "Daily Conversation Practice",
  videoTitleJapanese: "日常会話練習",
  practiceType: "shadowing",
  completedAt: "2024-01-15T10:30:00Z",
  duration: 12,
  scores: {
    overall: 82,
    accuracy: 85,
    speed: 78,
    intonation: 83,
  },
  sentences: [
    {
      id: 1,
      japanese: "おはようございます",
      romaji: "Ohayou gozaimasu",
      meaning: "Good morning",
      accuracy: 95,
      feedback: "Excellent pronunciation!",
      status: "correct" as const,
    },
    {
      id: 2,
      japanese: "今日は天気がいいですね",
      romaji: "Kyou wa tenki ga ii desu ne",
      meaning: "The weather is nice today, isn't it?",
      accuracy: 78,
      feedback: "Work on the intonation of 'desu ne'",
      status: "partial" as const,
    },
    {
      id: 3,
      japanese: "どこへ行きますか",
      romaji: "Doko e ikimasu ka",
      meaning: "Where are you going?",
      accuracy: 88,
      feedback: "Good! Keep the rising intonation at the end.",
      status: "correct" as const,
    },
    {
      id: 4,
      japanese: "ちょっと待ってください",
      romaji: "Chotto matte kudasai",
      meaning: "Please wait a moment",
      accuracy: 45,
      feedback: "The 'tt' sound needs more emphasis",
      status: "incorrect" as const,
    },
    {
      id: 5,
      japanese: "ありがとうございます",
      romaji: "Arigatou gozaimasu",
      meaning: "Thank you very much",
      accuracy: 92,
      feedback: "Great pronunciation!",
      status: "correct" as const,
    },
  ],
  improvements: [
    "Practice double consonant sounds (っ)",
    "Work on sentence-ending particles",
    "Maintain consistent speech speed",
  ],
};

export default function PracticeResultPage() {
  const params = useParams();
  const result = mockResultData;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "correct":
        return <Check className="w-4 h-4 text-green-500" />;
      case "partial":
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      default:
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "correct":
        return <Badge variant="green">Correct</Badge>;
      case "partial":
        return <Badge variant="yellow">Partial</Badge>;
      default:
        return <Badge variant="red">Needs Work</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Practice
        </Link>
        <Badge variant="yellow" className="capitalize">
          {result.practiceType}
        </Badge>
      </div>

      {/* Video Info */}
      <Card>
        <CardContent>
          <h1 className="text-xl font-heading font-semibold text-neutral-200 mb-1">
            {result.videoTitle}
          </h1>
          <p className="text-neutral-400">{result.videoTitleJapanese}</p>
          <p className="text-sm text-neutral-400 mt-2">
            Completed in {result.duration} minutes
          </p>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card>
        <CardContent className="text-center py-8">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${getScoreBgColor(
              result.scores.overall
            )}`}
          >
            <span
              className={`text-4xl font-heading font-semibold ${getScoreColor(
                result.scores.overall
              )}`}
            >
              {result.scores.overall}%
            </span>
          </div>
          <h2 className="text-2xl font-heading font-semibold text-neutral-200 mb-2">
            {result.scores.overall >= 80
              ? "Excellent Work!"
              : result.scores.overall >= 60
              ? "Good Progress!"
              : "Keep Practicing!"}
          </h2>
          <p className="text-neutral-400">
            You completed {result.sentences.length} sentences
          </p>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <p
              className={`text-2xl font-heading font-semibold ${getScoreColor(
                result.scores.accuracy
              )}`}
            >
              {result.scores.accuracy}%
            </p>
            <p className="text-sm text-neutral-400">Accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
            <p
              className={`text-2xl font-heading font-semibold ${getScoreColor(
                result.scores.speed
              )}`}
            >
              {result.scores.speed}%
            </p>
            <p className="text-sm text-neutral-400">Speed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Music className="w-6 h-6 text-purple-500" />
            </div>
            <p
              className={`text-2xl font-heading font-semibold ${getScoreColor(
                result.scores.intonation
              )}`}
            >
              {result.scores.intonation}%
            </p>
            <p className="text-sm text-neutral-400">Intonation</p>
          </CardContent>
        </Card>
      </div>

      {/* Sentence Feedback */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-neutral-200 mb-4">
          Sentence-by-Sentence Feedback
        </h3>
        <div className="space-y-3">
          {result.sentences.map((sentence) => (
            <Card key={sentence.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        sentence.status === "correct"
                          ? "bg-green-500/10"
                          : sentence.status === "partial"
                          ? "bg-yellow-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {getStatusIcon(sentence.status)}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-200">
                        {sentence.japanese}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {sentence.romaji}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(sentence.status)}
                </div>
                <div className="ml-11">
                  <p className="text-sm text-neutral-400 mb-2">
                    {sentence.meaning}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-400">
                      {sentence.feedback}
                    </p>
                    <span
                      className={`text-sm font-medium ${getScoreColor(
                        sentence.accuracy
                      )}`}
                    >
                      {sentence.accuracy}%
                    </span>
                  </div>
                  <Progress value={sentence.accuracy} size="sm" className="mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Improvement Tips */}
      <Card>
        <CardContent>
          <h3 className="font-heading font-semibold text-neutral-200 mb-4">
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {result.improvements.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-yellow-500">
                    {index + 1}
                  </span>
                </div>
                <span className="text-neutral-400">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Link href={`/practice/shadowing`} className="flex-1">
          <Button variant="secondary" className="w-full">
            <RotateCcw className="w-5 h-5" />
            Practice Again
          </Button>
        </Link>
        <Link href="/practice" className="flex-1">
          <Button className="w-full">
            Next Practice
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
