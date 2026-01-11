"use client";

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
} from "@/components/ui";
import {
  mockDecks,
  mockVideos,
  mockPracticeStats,
  formatDuration,
  getLevelColor,
} from "@/lib/mock-data";

export default function LearnPage() {
  const recentDecks = mockDecks.slice(0, 3);
  const recentVideos = mockVideos.slice(0, 2);

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
                {mockPracticeStats.streak}
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
                {mockPracticeStats.masteryByLevel.N5.mastered +
                  mockPracticeStats.masteryByLevel.N4.mastered}
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
                {Math.round(mockPracticeStats.totalTime / 60)}h
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
                Today&apos;s Progress
              </h3>
              <p className="text-sm text-neutral-400">
                {mockPracticeStats.todayProgress.completed} of{" "}
                {mockPracticeStats.todayProgress.goal} sessions completed
              </p>
            </div>
            <Link href="/practice">
              <Button size="sm">Continue Practice</Button>
            </Link>
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

      {/* Quick Access */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/learn/vocabulary">
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
                  {mockDecks.length} decks available
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
                  {mockVideos.length} videos to practice
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-neutral-200">
            Continue Learning
          </h2>
          <Link
            href="/learn/vocabulary"
            className="text-sm text-yellow-500 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {recentDecks.map((deck) => (
            <Link key={deck.id} href={`/learn/vocabulary/${deck.id}`}>
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
                    <span>{deck.totalVocabulary} words</span>
                    <span>{deck.progress}% complete</span>
                  </div>
                  <Progress value={deck.progress} size="sm" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Videos */}
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
                        {video.segmentCount} segments
                      </span>
                    </div>
                    <h3 className="font-medium text-neutral-200 line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="text-sm text-neutral-400 line-clamp-1">
                      {video.titleJapanese}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                      <span>{video.stats.viewCount.toLocaleString()} views</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {video.stats.averageRating}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
