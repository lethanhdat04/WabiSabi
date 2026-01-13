"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Target,
  BookOpen,
  Mic,
  Headphones,
  PenLine,
  ChevronRight,
  Flame,
  Award,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  LoadingPage,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { getLevelColor } from "@/lib/hooks";
import { practiceApi, ProgressStats } from "@/lib/api-client";

export default function ProgressPage() {
  const { user, isLoading: userLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [vocabStats, setVocabStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const stats = await practiceApi.getVocabularyStats().catch(() => null);
        setVocabStats(stats);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (userLoading || isLoading || !user) {
    return <LoadingPage message="Loading progress data..." />;
  }

  const skillsData = [
    {
      id: "listening",
      name: "Listening",
      icon: Headphones,
      level: user.progress?.listeningScore || 0,
      color: "blue",
    },
    {
      id: "speaking",
      name: "Speaking",
      icon: Mic,
      level: user.progress?.speakingScore || 0,
      color: "green",
    },
    {
      id: "vocabulary",
      name: "Vocabulary",
      icon: BookOpen,
      level: user.progress?.vocabularyScore || 0,
      color: "yellow",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "yellow":
        return { bg: "bg-yellow-500/10", text: "text-yellow-500" };
      case "blue":
        return { bg: "bg-blue-500/10", text: "text-blue-500" };
      case "green":
        return { bg: "bg-green-500/10", text: "text-green-500" };
      case "purple":
        return { bg: "bg-purple-500/10", text: "text-purple-500" };
      default:
        return { bg: "bg-neutral-700", text: "text-neutral-400" };
    }
  };

  const overallProgress = Math.round(
    skillsData.reduce((acc, s) => acc + s.level, 0) / skillsData.length
  );

  const targetLevel = user.targetLevel || "N5";
  const nextLevels: Record<string, string> = {
    N5: "N4",
    N4: "N3",
    N3: "N2",
    N2: "N1",
    N1: "Mastery",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-semibold text-neutral-200">
          Progress Dashboard
        </h1>
        <p className="text-neutral-400 mt-1">
          Track your Japanese learning journey
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-neutral-200">
                Overall Progress
              </h3>
              <p className="text-sm text-neutral-400">
                Working towards {nextLevels[targetLevel] || "Mastery"}
              </p>
            </div>
            <Badge variant={getLevelColor(targetLevel) as any} className="text-lg px-4 py-1">
              {targetLevel}
            </Badge>
          </div>
          <Progress value={overallProgress} size="lg" />
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-neutral-400">
              {overallProgress}% to {nextLevels[targetLevel] || "Mastery"}
            </span>
            <span className="text-neutral-400">
              {user.progress?.totalXP || 0} XP earned
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="text-center">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Flame className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {user.progress?.streak || 0}
                </p>
                <p className="text-sm text-neutral-400">Day Streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {user.progress?.longestStreak || 0}
                </p>
                <p className="text-sm text-neutral-400">Max Streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {user.progress?.totalVocabMastered || 0}
                </p>
                <p className="text-sm text-neutral-400">Words Mastered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {Math.round((user.progress?.totalPracticeMinutes || 0) / 60)}h
                </p>
                <p className="text-sm text-neutral-400">Study Time</p>
              </CardContent>
            </Card>
          </div>

          {/* Skill Summary */}
          <div className="grid sm:grid-cols-3 gap-4">
            {skillsData.map((skill) => {
              const Icon = skill.icon;
              const colors = getColorClasses(skill.color);
              return (
                <Card key={skill.id} variant="interactive">
                  <CardContent>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg}`}
                      >
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-200">{skill.name}</h4>
                      </div>
                    </div>
                    <Progress value={skill.level} size="sm" />
                    <p className="text-sm text-neutral-400 mt-2">
                      {skill.level}% proficiency
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Vocabulary Stats */}
          {vocabStats && (
            <Card>
              <CardContent>
                <h3 className="font-heading font-semibold text-neutral-200 mb-4">
                  Vocabulary Progress
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-center">
                    <p className="text-lg font-semibold text-neutral-200">
                      {vocabStats.totalItemsPracticed}
                    </p>
                    <p className="text-xs text-neutral-400">Items Practiced</p>
                  </div>
                  <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-center">
                    <p className="text-lg font-semibold text-neutral-200">
                      {vocabStats.itemsMastered}
                    </p>
                    <p className="text-xs text-neutral-400">Items Mastered</p>
                  </div>
                  <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-center">
                    <p className="text-lg font-semibold text-neutral-200">
                      {Math.round(vocabStats.averageAccuracy)}%
                    </p>
                    <p className="text-xs text-neutral-400">Avg Accuracy</p>
                  </div>
                  <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-center">
                    <p className="text-lg font-semibold text-neutral-200">
                      {vocabStats.totalAttempts}
                    </p>
                    <p className="text-xs text-neutral-400">Total Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "skills" && (
        <div className="space-y-4">
          {skillsData.map((skill) => {
            const Icon = skill.icon;
            const colors = getColorClasses(skill.color);
            const isExpanded = expandedSkill === skill.id;

            return (
              <Card key={skill.id}>
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}
                      >
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-neutral-200">
                          {skill.name}
                        </h4>
                        <div className="flex items-center gap-4 mt-1">
                          <Progress value={skill.level} size="sm" className="w-32" />
                          <span className="text-sm text-neutral-400">
                            {skill.level}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-neutral-400 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-neutral-700 pt-4">
                      <p className="text-sm text-neutral-400 mb-3">
                        Keep practicing to improve your {skill.name.toLowerCase()} skills.
                        Consistent practice is the key to mastery.
                      </p>
                      <Link href="/learn/videos">
                        <Button variant="secondary" size="sm">
                          Practice {skill.name}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="space-y-4">
          <Card>
            <CardContent>
              <h3 className="font-heading font-semibold text-neutral-200 mb-4">
                Detailed Statistics
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <p className="text-sm text-neutral-400 mb-1">Total Practice Time</p>
                  <p className="text-2xl font-heading font-semibold text-neutral-200">
                    {Math.floor((user.progress?.totalPracticeMinutes || 0) / 60)}h{" "}
                    {(user.progress?.totalPracticeMinutes || 0) % 60}m
                  </p>
                </div>
                <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <p className="text-sm text-neutral-400 mb-1">Total XP</p>
                  <p className="text-2xl font-heading font-semibold text-neutral-200">
                    {user.progress?.totalXP || 0}
                  </p>
                </div>
                <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <p className="text-sm text-neutral-400 mb-1">Videos Completed</p>
                  <p className="text-2xl font-heading font-semibold text-neutral-200">
                    {user.progress?.totalVideosCompleted || 0}
                  </p>
                </div>
                <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <p className="text-sm text-neutral-400 mb-1">Vocabulary Mastered</p>
                  <p className="text-2xl font-heading font-semibold text-neutral-200">
                    {user.progress?.totalVocabMastered || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="font-heading font-semibold text-neutral-200 mb-2">
                Keep Going!
              </h3>
              <p className="text-neutral-400 mb-4">
                You&apos;re making great progress. Continue practicing to reach
                your goals.
              </p>
              <Link href="/decks">
                <Button>
                  <Target className="w-5 h-5" />
                  Continue Practice
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
