"use client";

import { useState, useEffect } from "react";
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
  LoadingPage,
  ErrorPage,
} from "@/components/ui";
import { deckApi, VocabularyDeck, DeckProgress } from "@/lib/api-client";
import { getLevelColor } from "@/lib/hooks";

export default function DeckDetailPage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const [deck, setDeck] = useState<VocabularyDeck | null>(null);
  const [progress, setProgress] = useState<DeckProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);

  useEffect(() => {
    async function fetchDeck() {
      if (!deckId) return;
      setIsLoading(true);
      setError(null);
      try {
        const [deckData, progressData] = await Promise.all([
          deckApi.getById(deckId),
          deckApi.getProgress(deckId).catch(() => null),
        ]);
        setDeck(deckData);
        setProgress(progressData);
        if (deckData.sections?.length > 0) {
          setExpandedSections([0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load deck");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDeck();
  }, [deckId]);

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionIndex)
        ? prev.filter((idx) => idx !== sectionIndex)
        : [...prev, sectionIndex]
    );
  };

  if (isLoading) {
    return <LoadingPage message="Loading deck..." />;
  }

  if (error || !deck) {
    return <ErrorPage title="Error loading deck" message={error || "Deck not found"} />;
  }

  const totalCards =
    deck.sections?.reduce((acc, s) => acc + (s.items?.length || 0), 0) || 0;
  const learnedCount = progress?.overallStats?.totalItemsPracticed || 0;
  const masteredCount = progress?.overallStats?.itemsMastered || 0;
  const overallProgress = totalCards > 0 ? Math.round((learnedCount / totalCards) * 100) : 0;
  const masteryProgress = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

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
                  {deck.title}
                </h1>
                {deck.isPublic ? (
                  <Globe className="w-5 h-5 text-neutral-400" />
                ) : (
                  <Lock className="w-5 h-5 text-neutral-400" />
                )}
              </div>
              <p className="text-neutral-400 mb-4">{deck.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                <Badge variant={getLevelColor(deck.level) as any}>{deck.level}</Badge>
                <span>{deck.isOfficial ? "Official" : "Community"}</span>
                {deck.topic && <span>{deck.topic}</span>}
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
              {totalCards}
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
              {learnedCount}
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
              {masteredCount}
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
      {deck.sections && deck.sections.length > 0 && (
        <div>
          <h2 className="text-lg font-heading font-semibold text-neutral-200 mb-4">
            Sections ({deck.sections.length})
          </h2>
          <div className="space-y-3">
            {deck.sections.map((section, sectionIndex) => {
              const isExpanded = expandedSections.includes(sectionIndex);
              const sectionCardCount = section.items?.length || 0;
              const sectionProgress = progress?.itemProgress
                ? Object.values(progress.itemProgress).filter(
                    (p) => p.sectionIndex === sectionIndex && p.masteryLevel !== "NEW"
                  ).length
                : 0;
              const sectionProgressPercent =
                sectionCardCount > 0
                  ? Math.round((sectionProgress / sectionCardCount) * 100)
                  : 0;

              return (
                <Card key={sectionIndex}>
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleSection(sectionIndex)}
                      className="w-full p-4 flex items-center justify-between text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-heading font-semibold text-neutral-200">
                            {section.title}
                          </h3>
                          <Badge variant="default">{sectionCardCount} cards</Badge>
                        </div>
                        <p className="text-sm text-neutral-400">{section.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Progress
                            value={sectionProgressPercent}
                            size="sm"
                            className="w-32"
                          />
                          <span className="text-xs text-neutral-400">
                            {sectionProgress} / {sectionCardCount} learned
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && section.items && section.items.length > 0 && (
                      <div className="border-t border-neutral-700 p-4">
                        <div className="space-y-2">
                          {section.items.slice(0, 5).map((word, index) => (
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
                                    {word.japaneseWord}
                                  </p>
                                  <p className="text-sm text-neutral-400">{word.reading}</p>
                                </div>
                              </div>
                              <p className="text-neutral-400">{word.meaning}</p>
                            </div>
                          ))}
                        </div>
                        {section.items.length > 5 && (
                          <p className="text-sm text-neutral-400 text-center mt-4">
                            Showing 5 of {section.items.length} cards
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
