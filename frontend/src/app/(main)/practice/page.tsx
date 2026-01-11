"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mic,
  PenTool,
  Layers,
  Clock,
  Target,
  ChevronRight,
  Trophy,
  Flame,
} from "lucide-react";
import {
  Card,
  CardContent,
  Badge,
  Progress,
  LoadingPage,
  ErrorPage,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import {
  dictationApi,
  shadowingApi,
  practiceApi,
  DictationStats,
  ShadowingStats,
  ProgressStats,
} from "@/lib/api-client";

interface PracticeMode {
  id: string;
  title: string;
  description: string;
  icon: typeof Mic;
  color: string;
  href: string;
  sessions: number;
  avgScore: number;
}

export default function PracticePage() {
  const { user } = useAuth();
  const [dictationStats, setDictationStats] = useState<DictationStats | null>(null);
  const [shadowingStats, setShadowingStats] = useState<ShadowingStats | null>(null);
  const [vocabStats, setVocabStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      setError(null);
      try {
        const [dictation, shadowing, vocab] = await Promise.all([
          dictationApi.getStats().catch(() => null),
          shadowingApi.getStats().catch(() => null),
          practiceApi.getVocabularyStats().catch(() => null),
        ]);
        setDictationStats(dictation);
        setShadowingStats(shadowing);
        setVocabStats(vocab);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return <LoadingPage message="Loading practice stats..." />;
  }

  if (error) {
    return <ErrorPage title="Error loading practice data" message={error} />;
  }

  const totalSessions =
    (dictationStats?.totalAttempts || 0) +
    (shadowingStats?.totalAttempts || 0) +
    (vocabStats?.totalAttempts || 0);

  const avgAccuracy = Math.round(
    ((dictationStats?.averageAccuracy || 0) +
      (shadowingStats?.averagePronunciation || 0) +
      (vocabStats?.averageAccuracy || 0)) /
      3
  );

  const streak = user?.progress?.streak || 0;
  const totalTime = user?.progress?.totalPracticeMinutes || 0;
  const dailyGoal = user?.preferences?.dailyGoalMinutes || 30;
  const todayCompleted = vocabStats?.totalItemsPracticed || 0;

  const practiceModes: PracticeMode[] = [
    {
      id: "shadowing",
      title: "Shadowing Practice",
      description: "Improve pronunciation by repeating after native speakers",
      icon: Mic,
      color: "yellow",
      href: "/practice/shadowing",
      sessions: shadowingStats?.totalAttempts || 0,
      avgScore: Math.round(shadowingStats?.averagePronunciation || 0),
    },
    {
      id: "dictation",
      title: "Dictation Practice",
      description: "Test your listening skills by typing what you hear",
      icon: PenTool,
      color: "blue",
      href: "/practice/dictation",
      sessions: dictationStats?.totalAttempts || 0,
      avgScore: Math.round(dictationStats?.averageAccuracy || 0),
    },
    {
      id: "flashcards",
      title: "Flashcard Review",
      description: "Review vocabulary with spaced repetition flashcards",
      icon: Layers,
      color: "green",
      href: "/decks",
      sessions: vocabStats?.totalAttempts || 0,
      avgScore: Math.round(vocabStats?.averageAccuracy || 0),
    },
    {
      id: "fill-in",
      title: "Fill-in-the-Blank",
      description: "Test your knowledge by filling in missing words",
      icon: PenTool,
      color: "purple",
      href: "/decks",
      sessions: 0,
      avgScore: 0,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-neutral-200">
          Practice Center
        </h1>
        <p className="text-neutral-400 mt-1">
          Choose a practice mode to improve your Japanese skills
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {streak}
              </p>
              <p className="text-sm text-neutral-400">Day Streak</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {avgAccuracy}%
              </p>
              <p className="text-sm text-neutral-400">Avg. Accuracy</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {Math.round(totalTime / 60)}h
              </p>
              <p className="text-sm text-neutral-400">Total Time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {totalSessions}
              </p>
              <p className="text-sm text-neutral-400">Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Goal */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-heading font-semibold text-neutral-200">
                Today&apos;s Goal
              </h3>
              <p className="text-sm text-neutral-400">
                {todayCompleted} of {dailyGoal} items practiced
              </p>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(dailyGoal, 5) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < Math.min(todayCompleted, dailyGoal)
                      ? "bg-yellow-500"
                      : "bg-neutral-700 border border-neutral-600"
                  }`}
                />
              ))}
            </div>
          </div>
          <Progress
            value={Math.min((todayCompleted / dailyGoal) * 100, 100)}
            size="md"
          />
        </CardContent>
      </Card>

      {/* Practice Modes */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-neutral-200 mb-4">
          Practice Modes
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {practiceModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link key={mode.id} href={mode.href}>
                <Card variant="interactive" className="h-full">
                  <CardContent className="flex gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        mode.color === "yellow"
                          ? "bg-yellow-500/10"
                          : mode.color === "blue"
                          ? "bg-blue-500/10"
                          : mode.color === "green"
                          ? "bg-green-500/10"
                          : "bg-purple-500/10"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          mode.color === "yellow"
                            ? "text-yellow-500"
                            : mode.color === "blue"
                            ? "text-blue-500"
                            : mode.color === "green"
                            ? "text-green-500"
                            : "text-purple-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-neutral-200 mb-1">
                        {mode.title}
                      </h3>
                      <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
                        {mode.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-neutral-400">
                        <span>{mode.sessions} sessions</span>
                        {mode.avgScore > 0 && <span>Avg. {mode.avgScore}%</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions - Show recent dictation scores */}
      {dictationStats && dictationStats.recentScores.length > 0 && (
        <div>
          <h2 className="text-lg font-heading font-semibold text-neutral-200 mb-4">
            Recent Dictation Scores
          </h2>
          <Card>
            <CardContent className="divide-y divide-neutral-700">
              {dictationStats.recentScores.slice(0, 5).map((score, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10">
                      <PenTool className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-200">
                        Dictation Practice
                      </p>
                      <p className="text-xs text-neutral-400">
                        Session {index + 1}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-200">
                        {score}%
                      </p>
                    </div>
                    <Badge
                      variant={
                        score >= 85 ? "green" : score >= 70 ? "yellow" : "red"
                      }
                    >
                      {score >= 85 ? "A" : score >= 70 ? "B" : "C"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
