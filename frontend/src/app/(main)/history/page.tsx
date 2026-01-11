"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  Mic,
  PenTool,
  Layers,
  PlayCircle,
  Filter,
  ChevronRight,
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
} from "@/components/ui";

interface HistoryItem {
  id: string;
  type: "shadowing" | "dictation" | "flashcard" | "fill-in" | "video";
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  score?: number;
  details?: {
    accuracy?: number;
    speed?: number;
    intonation?: number;
    cardsReviewed?: number;
    wordsLearned?: number;
  };
}

const mockHistory: HistoryItem[] = [
  {
    id: "h1",
    type: "shadowing",
    title: "Shadowing Practice",
    description: "Daily Conversation - Episode 5",
    date: "2024-01-15",
    time: "10:30 AM",
    duration: 12,
    score: 85,
    details: {
      accuracy: 88,
      speed: 82,
      intonation: 85,
    },
  },
  {
    id: "h2",
    type: "flashcard",
    title: "Flashcard Review",
    description: "JLPT N4 Vocabulary",
    date: "2024-01-15",
    time: "9:15 AM",
    duration: 8,
    score: 92,
    details: {
      cardsReviewed: 25,
      wordsLearned: 5,
    },
  },
  {
    id: "h3",
    type: "dictation",
    title: "Dictation Practice",
    description: "News Headlines - Easy",
    date: "2024-01-14",
    time: "8:00 PM",
    duration: 15,
    score: 78,
    details: {
      accuracy: 78,
    },
  },
  {
    id: "h4",
    type: "video",
    title: "Video Lesson",
    description: "Business Japanese Basics",
    date: "2024-01-14",
    time: "6:30 PM",
    duration: 20,
  },
  {
    id: "h5",
    type: "fill-in",
    title: "Fill-in-the-Blank",
    description: "Grammar Practice - N4",
    date: "2024-01-14",
    time: "2:00 PM",
    duration: 10,
    score: 88,
  },
  {
    id: "h6",
    type: "shadowing",
    title: "Shadowing Practice",
    description: "Anime Dialogue - Slice of Life",
    date: "2024-01-13",
    time: "7:00 PM",
    duration: 18,
    score: 72,
    details: {
      accuracy: 75,
      speed: 68,
      intonation: 73,
    },
  },
  {
    id: "h7",
    type: "flashcard",
    title: "Flashcard Review",
    description: "Kanji Radicals",
    date: "2024-01-13",
    time: "9:00 AM",
    duration: 12,
    score: 85,
    details: {
      cardsReviewed: 40,
      wordsLearned: 8,
    },
  },
  {
    id: "h8",
    type: "dictation",
    title: "Dictation Practice",
    description: "Podcast Excerpt - Intermediate",
    date: "2024-01-12",
    time: "5:00 PM",
    duration: 20,
    score: 65,
    details: {
      accuracy: 65,
    },
  },
];

const mockStats = {
  totalSessions: 156,
  totalTime: 2340,
  averageScore: 82,
  thisWeek: {
    sessions: 12,
    time: 180,
    avgScore: 84,
  },
};

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "shadowing":
        return <Mic className="w-5 h-5 text-yellow-500" />;
      case "dictation":
        return <PenTool className="w-5 h-5 text-blue-500" />;
      case "flashcard":
        return <Layers className="w-5 h-5 text-green-500" />;
      case "fill-in":
        return <PenTool className="w-5 h-5 text-purple-500" />;
      case "video":
        return <PlayCircle className="w-5 h-5 text-red-500" />;
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
      case "flashcard":
        return "bg-green-500/10";
      case "fill-in":
        return "bg-purple-500/10";
      case "video":
        return "bg-red-500/10";
      default:
        return "bg-neutral-700";
    }
  };

  const filteredHistory = mockHistory.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = item.date;
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
              {mockStats.totalSessions}
            </p>
            <p className="text-sm text-neutral-400">Total Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-heading font-semibold text-neutral-200">
              {Math.round(mockStats.totalTime / 60)}h
            </p>
            <p className="text-sm text-neutral-400">Total Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-heading font-semibold text-neutral-200">
              {mockStats.averageScore}%
            </p>
            <p className="text-sm text-neutral-400">Avg. Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-heading font-semibold text-neutral-200">
              {mockStats.thisWeek.sessions}
            </p>
            <p className="text-sm text-neutral-400">This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="shadowing">Shadowing</TabsTrigger>
          <TabsTrigger value="dictation">Dictation</TabsTrigger>
          <TabsTrigger value="flashcard">Flashcards</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
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
                            {item.time}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-400 mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-neutral-400">
                            <Clock className="w-4 h-4" />
                            {item.duration} min
                          </span>
                          {item.score !== undefined && (
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
                          )}
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
                              {item.details.cardsReviewed !== undefined && (
                                <div>
                                  <span className="text-neutral-400">
                                    Cards:{" "}
                                  </span>
                                  <span className="text-neutral-200">
                                    {item.details.cardsReviewed}
                                  </span>
                                </div>
                              )}
                              {item.details.wordsLearned !== undefined && (
                                <div>
                                  <span className="text-neutral-400">
                                    New Words:{" "}
                                  </span>
                                  <span className="text-neutral-200">
                                    {item.details.wordsLearned}
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
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-400">No practice history found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
