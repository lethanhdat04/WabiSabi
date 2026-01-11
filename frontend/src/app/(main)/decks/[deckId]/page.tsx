"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Layers,
  Play,
  PenTool,
  Settings,
  Globe,
  Lock,
  Clock,
  Target,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Volume2,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
} from "@/components/ui";

const mockDeckDetail = {
  id: "d1",
  name: "JLPT N5 Vocabulary",
  description:
    "Essential vocabulary for JLPT N5 exam preparation. This deck covers all the words you need to know to pass the N5 level of the Japanese Language Proficiency Test.",
  cardCount: 800,
  learnedCount: 320,
  masteredCount: 180,
  level: "N5",
  isPublic: true,
  author: "Nihongo Master",
  createdAt: "2024-01-01",
  lastStudied: "2024-01-14",
  estimatedTime: "40 hours",
  sections: [
    {
      id: "s1",
      name: "Greetings & Common Phrases",
      description: "Basic greetings and everyday expressions",
      cardCount: 50,
      learnedCount: 45,
      words: [
        { japanese: "おはよう", reading: "ohayou", meaning: "Good morning (casual)" },
        { japanese: "こんにちは", reading: "konnichiwa", meaning: "Hello / Good afternoon" },
        { japanese: "こんばんは", reading: "konbanwa", meaning: "Good evening" },
        { japanese: "さようなら", reading: "sayounara", meaning: "Goodbye" },
        { japanese: "ありがとう", reading: "arigatou", meaning: "Thank you" },
      ],
    },
    {
      id: "s2",
      name: "Numbers & Counting",
      description: "Numbers, counters, and counting systems",
      cardCount: 80,
      learnedCount: 60,
      words: [
        { japanese: "一", reading: "ichi", meaning: "One" },
        { japanese: "二", reading: "ni", meaning: "Two" },
        { japanese: "三", reading: "san", meaning: "Three" },
        { japanese: "百", reading: "hyaku", meaning: "Hundred" },
        { japanese: "千", reading: "sen", meaning: "Thousand" },
      ],
    },
    {
      id: "s3",
      name: "Time & Dates",
      description: "Days, months, and time expressions",
      cardCount: 70,
      learnedCount: 50,
      words: [
        { japanese: "今日", reading: "kyou", meaning: "Today" },
        { japanese: "明日", reading: "ashita", meaning: "Tomorrow" },
        { japanese: "昨日", reading: "kinou", meaning: "Yesterday" },
        { japanese: "月曜日", reading: "getsuyoubi", meaning: "Monday" },
        { japanese: "一月", reading: "ichigatsu", meaning: "January" },
      ],
    },
    {
      id: "s4",
      name: "Basic Verbs",
      description: "Common verbs in dictionary form",
      cardCount: 100,
      learnedCount: 45,
      words: [
        { japanese: "食べる", reading: "taberu", meaning: "To eat" },
        { japanese: "飲む", reading: "nomu", meaning: "To drink" },
        { japanese: "行く", reading: "iku", meaning: "To go" },
        { japanese: "来る", reading: "kuru", meaning: "To come" },
        { japanese: "する", reading: "suru", meaning: "To do" },
      ],
    },
    {
      id: "s5",
      name: "Adjectives",
      description: "い-adjectives and な-adjectives",
      cardCount: 80,
      learnedCount: 40,
      words: [
        { japanese: "大きい", reading: "ookii", meaning: "Big" },
        { japanese: "小さい", reading: "chiisai", meaning: "Small" },
        { japanese: "新しい", reading: "atarashii", meaning: "New" },
        { japanese: "古い", reading: "furui", meaning: "Old" },
        { japanese: "きれい", reading: "kirei", meaning: "Beautiful / Clean" },
      ],
    },
  ],
};

export default function DeckDetailPage() {
  const params = useParams();
  const deck = mockDeckDetail;
  const [expandedSections, setExpandedSections] = useState<string[]>(["s1"]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const overallProgress = Math.round((deck.learnedCount / deck.cardCount) * 100);
  const masteryProgress = Math.round((deck.masteredCount / deck.cardCount) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/decks"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Decks
        </Link>
        <Button variant="secondary" size="sm">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* Deck Info */}
      <Card>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Layers className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-heading font-semibold text-neutral-200">
                  {deck.name}
                </h1>
                {deck.isPublic ? (
                  <Globe className="w-5 h-5 text-neutral-400" />
                ) : (
                  <Lock className="w-5 h-5 text-neutral-400" />
                )}
              </div>
              <p className="text-neutral-400 mb-4">{deck.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                <Badge variant="yellow">{deck.level}</Badge>
                <span>by {deck.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {deck.estimatedTime}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-2xl font-heading font-semibold text-neutral-200">
              {deck.cardCount}
            </p>
            <p className="text-sm text-neutral-400">Total Cards</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-2xl font-heading font-semibold text-neutral-200">
              {deck.learnedCount}
            </p>
            <p className="text-sm text-neutral-400">Learned</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-2xl font-heading font-semibold text-neutral-200">
              {deck.masteredCount}
            </p>
            <p className="text-sm text-neutral-400">Mastered</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bars */}
      <Card>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-400">Learning Progress</span>
              <span className="text-neutral-200">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} size="md" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-400">Mastery Progress</span>
              <span className="text-neutral-200">{masteryProgress}%</span>
            </div>
            <Progress value={masteryProgress} size="md" />
          </div>
        </CardContent>
      </Card>

      {/* Study Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href={`/decks/${deck.id}/flashcards`}>
          <Button className="w-full h-14 text-base">
            <Play className="w-5 h-5" />
            Study Flashcards
          </Button>
        </Link>
        <Link href={`/decks/${deck.id}/quiz`}>
          <Button variant="secondary" className="w-full h-14 text-base">
            <PenTool className="w-5 h-5" />
            Take Quiz
          </Button>
        </Link>
      </div>

      {/* Sections */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-neutral-200 mb-4">
          Sections ({deck.sections.length})
        </h2>
        <div className="space-y-3">
          {deck.sections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            const sectionProgress = Math.round(
              (section.learnedCount / section.cardCount) * 100
            );

            return (
              <Card key={section.id}>
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-heading font-semibold text-neutral-200">
                          {section.name}
                        </h3>
                        <Badge variant="default">
                          {section.cardCount} cards
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-400">
                        {section.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Progress
                          value={sectionProgress}
                          size="sm"
                          className="w-32"
                        />
                        <span className="text-xs text-neutral-400">
                          {section.learnedCount} / {section.cardCount} learned
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-neutral-700 p-4">
                      <div className="space-y-2">
                        {section.words.map((word, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <button className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center hover:bg-yellow-500/20 transition-colors">
                                <Volume2 className="w-4 h-4 text-yellow-500" />
                              </button>
                              <div>
                                <p className="font-medium text-neutral-200">
                                  {word.japanese}
                                </p>
                                <p className="text-sm text-neutral-400">
                                  {word.reading}
                                </p>
                              </div>
                            </div>
                            <p className="text-neutral-400">{word.meaning}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-neutral-400 text-center mt-4">
                        Showing 5 of {section.cardCount} cards
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
