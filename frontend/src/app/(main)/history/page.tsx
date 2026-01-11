"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Target,
  Mic,
  PenTool,
  Layers,
  ChevronRight,
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
  DictationAttempt,
  ShadowingAttempt,
} from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/hooks";

interface HistoryItem {
  id: string;
  type: "shadowing" | "dictation";
  title: string;
  description: string;
  date: string;
  score: number;
  details?: {
    pronunciation?: number;
    speed?: number;
    intonation?: number;
    accuracy?: number;
  };
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [dictationAttempts, setDictationAttempts] = useState<DictationAttempt[]>([]);
  const [shadowingAttempts, setShadowingAttempts] = useState<ShadowingAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // Convert attempts to history items
  const historyItems: HistoryItem[] = [
    ...dictationAttempts.map((attempt): HistoryItem => ({
      id: attempt.id,
      type: "dictation",
      title: "Dictation Practice",
      description: `Video ${attempt.videoId} - Segment ${attempt.segmentIndex + 1}`,
      date: attempt.createdAt,
      score: Math.round(attempt.evaluation?.overallScore || 0),
      details: {
        accuracy: Math.round(attempt.evaluation?.accuracyScore || 0),
      },
    })),
    ...shadowingAttempts.map((attempt): HistoryItem => ({
      id: attempt.id,
      type: "shadowing",
      title: "Shadowing Practice",
      description: `Video ${attempt.videoId} - Segment ${attempt.segmentIndex + 1}`,
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

  const filteredHistory = historyItems.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
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
        <Button variant="secondary" size="sm">
          <Calendar className="w-4 h-4" />
          Filter by Date
        </Button>
      </div>

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
                <Card key={item.id} variant="interactive">
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
                            {item.title}
                          </h4>
                          <span className="text-sm text-neutral-400">
                            {formatRelativeTime(item.date)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-400 mb-2">
                          {item.description}
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
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <EmptyState
          icon={<Clock className="w-8 h-8 text-neutral-400" />}
          title="No practice history found"
          description="Start practicing to see your history here"
        />
      )}
    </div>
  );
}
