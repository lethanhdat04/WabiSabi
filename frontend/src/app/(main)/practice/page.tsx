"use client";

import Link from "next/link";
import {
  Mic,
  PenTool,
  Layers,
  BarChart3,
  Clock,
  Target,
  ChevronRight,
  Trophy,
  Flame,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Progress,
} from "@/components/ui";
import { mockPracticeStats } from "@/lib/mock-data";

const practiceModes = [
  {
    id: "shadowing",
    title: "Shadowing Practice",
    description: "Improve pronunciation by repeating after native speakers",
    icon: Mic,
    color: "yellow",
    href: "/practice/shadowing",
    stats: { sessions: 45, avgScore: 78 },
  },
  {
    id: "dictation",
    title: "Dictation Practice",
    description: "Test your listening skills by typing what you hear",
    icon: PenTool,
    color: "blue",
    href: "/practice/dictation",
    stats: { sessions: 32, avgScore: 85 },
  },
  {
    id: "flashcards",
    title: "Flashcard Review",
    description: "Review vocabulary with spaced repetition flashcards",
    icon: Layers,
    color: "green",
    href: "/practice/flashcards",
    stats: { sessions: 68, avgScore: 82 },
  },
  {
    id: "fill-in",
    title: "Fill-in-the-Blank",
    description: "Test your knowledge by filling in missing words",
    icon: PenTool,
    color: "purple",
    href: "/practice/fill-in",
    stats: { sessions: 24, avgScore: 76 },
  },
];

const recentSessions = mockPracticeStats.recentSessions;

export default function PracticePage() {
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
                {mockPracticeStats.streak}
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
                {mockPracticeStats.averageAccuracy}%
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
                {Math.round(mockPracticeStats.totalTime / 60)}h
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
                {mockPracticeStats.totalSessions}
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
                {mockPracticeStats.todayProgress.completed} of{" "}
                {mockPracticeStats.todayProgress.goal} sessions completed
              </p>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: mockPracticeStats.todayProgress.goal }).map(
                (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < mockPracticeStats.todayProgress.completed
                        ? "bg-yellow-500"
                        : "bg-neutral-700 border border-neutral-600"
                    }`}
                  />
                )
              )}
            </div>
          </div>
          <Progress
            value={
              (mockPracticeStats.todayProgress.completed /
                mockPracticeStats.todayProgress.goal) *
              100
            }
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
                        <span>{mode.stats.sessions} sessions</span>
                        <span>Avg. {mode.stats.avgScore}%</span>
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

      {/* Recent Sessions */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-neutral-200 mb-4">
          Recent Sessions
        </h2>
        <Card>
          <CardContent className="divide-y divide-neutral-700">
            {recentSessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      session.type === "shadowing"
                        ? "bg-yellow-500/10"
                        : session.type === "dictation"
                        ? "bg-blue-500/10"
                        : session.type === "flashcard"
                        ? "bg-green-500/10"
                        : "bg-purple-500/10"
                    }`}
                  >
                    {session.type === "shadowing" ? (
                      <Mic
                        className={`w-4 h-4 ${
                          session.type === "shadowing"
                            ? "text-yellow-500"
                            : ""
                        }`}
                      />
                    ) : session.type === "dictation" ? (
                      <PenTool className="w-4 h-4 text-blue-500" />
                    ) : session.type === "flashcard" ? (
                      <Layers className="w-4 h-4 text-green-500" />
                    ) : (
                      <PenTool className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-200 capitalize">
                      {session.type.replace("-", " ")}
                    </p>
                    <p className="text-xs text-neutral-400">{session.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-200">
                      {session.score}%
                    </p>
                    <p className="text-xs text-neutral-400">
                      {session.duration} min
                    </p>
                  </div>
                  <Badge
                    variant={
                      session.score >= 85
                        ? "green"
                        : session.score >= 70
                        ? "yellow"
                        : "red"
                    }
                  >
                    {session.score >= 85
                      ? "A"
                      : session.score >= 70
                      ? "B"
                      : "C"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
