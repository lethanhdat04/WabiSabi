"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Video,
  Layers,
  TrendingUp,
  Clock,
  ChevronRight,
  Play,
  Star,
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
  LoadingPage,
  ErrorPage,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import {
  deckApi,
  videoApi,
  practiceApi,
  VocabularyDeck,
  Video as VideoType,
  ProgressStats,
} from "@/lib/api-client";
import { formatDuration, getLevelColor } from "@/lib/hooks";

export default function LearnPage() {
  const { user } = useAuth();
  const [recentDecks, setRecentDecks] = useState<VocabularyDeck[]>([]);
  const [recentVideos, setRecentVideos] = useState<VideoType[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [decksRes, videosRes, statsRes] = await Promise.all([
          practiceApi.getRecentDecks().catch(() => []),
          videoApi.getAll({ size: 2 }).catch(() => ({ content: [] })),
          practiceApi.getVocabularyStats().catch(() => null),
        ]);

        setRecentDecks(decksRes.slice(0, 3));
        setRecentVideos(videosRes.content || []);
        setStats(statsRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingPage message="Loading your dashboard..." />;
  }

  if (error) {
    return <ErrorPage title="Error loading dashboard" message={error} />;
  }

  const totalMastered = stats?.itemsMastered || 0;
  const streak = user?.progress?.streak || 0;
  const totalTime = user?.progress?.totalPracticeMinutes || 0;
  const totalSessions = stats?.totalAttempts || 0;
  const todayCompleted = stats?.totalItemsPracticed || 0;
  const todayGoal = user?.preferences?.dailyGoalMinutes || 30;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-neutral-200">
          Learning Dashboard
        </h1>
        <p className="text-neutral-400 mt-1">
          Continue your Japanese learning journey
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
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
              <Star className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {totalMastered}
              </p>
              <p className="text-sm text-neutral-400">Words Mastered</p>
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
              <p className="text-sm text-neutral-400">Study Time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-500" />
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
                Today&apos;s Progress
              </h3>
              <p className="text-sm text-neutral-400">
                {todayCompleted} of {todayGoal} items practiced
              </p>
            </div>
            <Link href="/practice">
              <Button size="sm">Continue Practice</Button>
            </Link>
          </div>
          <Progress
            value={Math.min((todayCompleted / todayGoal) * 100, 100)}
            size="md"
          />
        </CardContent>
      </Card>

      {/* Quick Access */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/decks">
          <Card variant="interactive" className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-neutral-200">
                  Vocabulary Decks
                </h3>
                <p className="text-sm text-neutral-400">
                  Browse and study decks
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/learn/videos">
          <Card variant="interactive" className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-neutral-200">
                  Video Library
                </h3>
                <p className="text-sm text-neutral-400">
                  Practice with videos
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Continue Learning */}
      {recentDecks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-neutral-200">
              Continue Learning
            </h2>
            <Link
              href="/decks"
              className="text-sm text-yellow-500 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {recentDecks.map((deck) => (
              <Link key={deck.id} href={`/decks/${deck.id}`}>
                <Card variant="interactive" className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getLevelColor(deck.level) as any}>
                        {deck.level}
                      </Badge>
                      {deck.isOfficial && (
                        <Badge variant="yellow">Official</Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-1">{deck.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {deck.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-neutral-400 mb-2">
                      <span>
                        {deck.sections?.reduce(
                          (acc, s) => acc + (s.items?.length || 0),
                          0
                        ) || 0}{" "}
                        words
                      </span>
                      <span>
                        {Math.round(deck.stats?.completionRate || 0)}% complete
                      </span>
                    </div>
                    <Progress
                      value={deck.stats?.completionRate || 0}
                      size="sm"
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Videos */}
      {recentVideos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-neutral-200">
              Recent Videos
            </h2>
            <Link
              href="/learn/videos"
              className="text-sm text-yellow-500 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {recentVideos.map((video) => (
              <Link key={video.id} href={`/learn/videos/${video.id}`}>
                <Card variant="interactive" className="h-full">
                  <CardContent className="flex gap-4">
                    <div className="relative w-32 h-20 bg-neutral-700 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-neutral-900 ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-xs text-neutral-200 rounded">
                        {formatDuration(video.duration)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getLevelColor(video.level) as any}>
                          {video.level}
                        </Badge>
                        <span className="text-xs text-neutral-400">
                          {video.subtitles?.length || 0} segments
                        </span>
                      </div>
                      <h3 className="font-medium text-neutral-200 line-clamp-1">
                        {video.title}
                      </h3>
                      <p className="text-sm text-neutral-400 line-clamp-1">
                        {video.titleJapanese}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                        <span>
                          {video.stats?.viewCount?.toLocaleString() || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {video.stats?.averageRating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
