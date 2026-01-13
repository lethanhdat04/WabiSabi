"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Target,
  Mic,
  PenTool,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  LoadingPage,
  ErrorPage,
  EmptyState,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import {
  dictationApi,
  shadowingApi,
  videoApi,
  DictationAttempt,
  ShadowingAttempt,
} from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/hooks";

interface HistoryItem {
  id: string;
  type: "shadowing" | "dictation";
  videoId: string;
  videoTitle: string;
  segmentIndex: number;
  date: string;
  score: number;
  details?: {
    pronunciation?: number;
    speed?: number;
    intonation?: number;
    accuracy?: number;
  };
}

type DateFilter = "all" | "today" | "week" | "month";

export default function HistoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [dictationAttempts, setDictationAttempts] = useState<DictationAttempt[]>([]);
  const [shadowingAttempts, setShadowingAttempts] = useState<ShadowingAttempt[]>([]);
  const [videoTitles, setVideoTitles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [showDateFilter, setShowDateFilter] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      setError(null);
      try {
        const [dictation, shadowing] = await Promise.all([
          dictationApi.getMyAttempts(0, 50).catch(() => ({ content: [] })),
          shadowingApi.getMyAttempts(0, 50).catch(() => ({ content: [] })),
        ]);
        setDictationAttempts(dictation.content || []);
        setShadowingAttempts(shadowing.content || []);

        // Fetch video titles for unique video IDs
        const allAttempts = [...(dictation.content || []), ...(shadowing.content || [])];
        const uniqueVideoIds = Array.from(new Set(allAttempts.map((a) => a.videoId)));

        const titles: Record<string, string> = {};
        await Promise.all(
          uniqueVideoIds.map(async (videoId) => {
            try {
              const video = await videoApi.getById(videoId);
              titles[videoId] = video.title;
            } catch {
              titles[videoId] = `Video ${videoId.slice(0, 8)}...`;
            }
          })
        );
        setVideoTitles(titles);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // Filter by date
  const getDateFilterRange = (filter: DateFilter): { start: Date; end: Date } | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case "today":
        return { start: today, end: now };
      case "week": {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start: weekAgo, end: now };
      }
      case "month": {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { start: monthAgo, end: now };
      }
      default:
        return null;
    }
  };

  // Convert attempts to history items
  const historyItems: HistoryItem[] = [
    ...dictationAttempts.map((attempt): HistoryItem => ({
      id: attempt.id,
      type: "dictation",
      videoId: attempt.videoId,
      videoTitle: videoTitles[attempt.videoId] || "Loading...",
      segmentIndex: attempt.segmentIndex,
      date: attempt.createdAt,
      score: Math.round(attempt.evaluation?.overallScore || 0),
      details: {
        accuracy: Math.round(attempt.evaluation?.accuracyScore || 0),
      },
    })),
    ...shadowingAttempts.map((attempt): HistoryItem => ({
      id: attempt.id,
      type: "shadowing",
      videoId: attempt.videoId,
      videoTitle: videoTitles[attempt.videoId] || "Loading...",
      segmentIndex: attempt.segmentIndex,
      date: attempt.createdAt,
      score: Math.round(attempt.evaluation?.overallScore || 0),
      details: {
        pronunciation: Math.round(attempt.evaluation?.pronunciationScore || 0),
        speed: Math.round(attempt.evaluation?.speedScore || 0),
        intonation: Math.round(attempt.evaluation?.intonationScore || 0),
      },
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "shadowing":
        return <Mic className="w-5 h-5 text-yellow-500" />;
      case "dictation":
        return <PenTool className="w-5 h-5 text-blue-500" />;
      default:
        return <Target className="w-5 h-5 text-neutral-400" />;
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case "shadowing":
        return "bg-yellow-500/10";
      case "dictation":
        return "bg-blue-500/10";
      default:
        return "bg-neutral-700";
    }
  };

  // Apply filters
  const filteredHistory = historyItems.filter((item) => {
    // Tab filter
    if (activeTab !== "all" && item.type !== activeTab) return false;

    // Date filter
    const range = getDateFilterRange(dateFilter);
    if (range) {
      const itemDate = new Date(item.date);
      if (itemDate < range.start || itemDate > range.end) return false;
    }

    return true;
  });

  // Group by date
  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = item.date.split("T")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, HistoryItem[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) {
      return "Today";
    }
    if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const getDateFilterLabel = (filter: DateFilter) => {
    switch (filter) {
      case "today":
        return "Today";
      case "week":
        return "Last 7 Days";
      case "month":
        return "Last 30 Days";
      default:
        return "All Time";
    }
  };

  if (isLoading) {
    return <LoadingPage message="Loading practice history..." />;
  }

  if (error) {
    return <ErrorPage title="Error loading history" message={error} />;
  }

  const totalSessions = historyItems.length;
  const totalTime = user?.progress?.totalPracticeMinutes || 0;
  const avgScore =
    historyItems.length > 0
      ? Math.round(
          historyItems.reduce((acc, i) => acc + i.score, 0) / historyItems.length
        )
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-neutral-200">
            Practice History
          </h1>
          <p className="text-neutral-400 mt-1">
            Track your learning progress over time
          </p>
        </div>
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDateFilter(!showDateFilter)}
          >
            <Calendar className="w-4 h-4" />
            {getDateFilterLabel(dateFilter)}
          </Button>

          {showDateFilter && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-10">
              <div className="p-2 space-y-1">
                {(["all", "today", "week", "month"] as DateFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setDateFilter(filter);
                      setShowDateFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      dateFilter === filter
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    {getDateFilterLabel(filter)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active filter indicator */}
      {dateFilter !== "all" && (
        <div className="flex items-center gap-2">
          <Badge variant="yellow">
            {getDateFilterLabel(dateFilter)}
            <button
              onClick={() => setDateFilter("all")}
              className="ml-2 hover:text-yellow-300"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
          <span className="text-sm text-neutral-400">
            {filteredHistory.length} result{filteredHistory.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-heading font-semibold text-neutral-200">
              {totalSessions}
            </p>
            <p className="text-sm text-neutral-400">Total Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-heading font-semibold text-neutral-200">
              {Math.round(totalTime / 60)}h
            </p>
            <p className="text-sm text-neutral-400">Total Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-heading font-semibold text-neutral-200">
              {avgScore}%
            </p>
            <p className="text-sm text-neutral-400">Avg. Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-heading font-semibold text-neutral-200">
              {user?.progress?.streak || 0}
            </p>
            <p className="text-sm text-neutral-400">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({historyItems.length})</TabsTrigger>
          <TabsTrigger value="shadowing">
            Shadowing ({shadowingAttempts.length})
          </TabsTrigger>
          <TabsTrigger value="dictation">
            Dictation ({dictationAttempts.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* History List */}
      <div className="space-y-6">
        {Object.entries(groupedHistory).map(([date, items]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-neutral-400 mb-3">
              {formatDate(date)}
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/learn/videos/${item.videoId}/${item.type}`}
                >
                  <Card variant="interactive" className="cursor-pointer hover:border-neutral-600">
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeBgColor(
                            item.type
                          )}`}
                        >
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-neutral-200">
                              {item.type === "shadowing" ? "Shadowing" : "Dictation"} Practice
                            </h4>
                            <span className="text-sm text-neutral-400">
                              {formatRelativeTime(item.date)}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-400 mb-2">
                            {item.videoTitle} - Segment {item.segmentIndex + 1}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge
                              variant={
                                item.score >= 80
                                  ? "green"
                                  : item.score >= 60
                                  ? "yellow"
                                  : "red"
                              }
                            >
                              {item.score}%
                            </Badge>
                          </div>

                          {/* Details */}
                          {item.details && (
                            <div className="mt-3 pt-3 border-t border-neutral-700">
                              <div className="flex flex-wrap gap-4 text-sm">
                                {item.details.accuracy !== undefined && (
                                  <div>
                                    <span className="text-neutral-400">
                                      Accuracy:{" "}
                                    </span>
                                    <span className="text-neutral-200">
                                      {item.details.accuracy}%
                                    </span>
                                  </div>
                                )}
                                {item.details.pronunciation !== undefined && (
                                  <div>
                                    <span className="text-neutral-400">
                                      Pronunciation:{" "}
                                    </span>
                                    <span className="text-neutral-200">
                                      {item.details.pronunciation}%
                                    </span>
                                  </div>
                                )}
                                {item.details.speed !== undefined && (
                                  <div>
                                    <span className="text-neutral-400">
                                      Speed:{" "}
                                    </span>
                                    <span className="text-neutral-200">
                                      {item.details.speed}%
                                    </span>
                                  </div>
                                )}
                                {item.details.intonation !== undefined && (
                                  <div>
                                    <span className="text-neutral-400">
                                      Intonation:{" "}
                                    </span>
                                    <span className="text-neutral-200">
                                      {item.details.intonation}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <EmptyState
          icon={<Clock className="w-8 h-8 text-neutral-400" />}
          title="No practice history found"
          description={
            dateFilter !== "all"
              ? `No practice sessions found for ${getDateFilterLabel(dateFilter).toLowerCase()}`
              : "Start practicing to see your history here"
          }
        />
      )}
    </div>
  );
}
