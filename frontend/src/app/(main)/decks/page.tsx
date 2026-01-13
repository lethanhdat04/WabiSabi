"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Layers,
  Users,
  Lock,
  Globe,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  LoadingPage,
  ErrorPage,
  EmptyState,
} from "@/components/ui";
import { deckApi, VocabularyDeck, PageResponse } from "@/lib/api-client";
import { getLevelColor } from "@/lib/hooks";

export default function DecksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [decks, setDecks] = useState<VocabularyDeck[]>([]);
  const [myDecks, setMyDecks] = useState<VocabularyDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const levels = ["All", "N5", "N4", "N3", "N2", "N1"];

  useEffect(() => {
    async function fetchDecks() {
      setIsLoading(true);
      setError(null);
      try {
        const emptyPage = { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0, first: true, last: true };
        const [allDecksRes, myDecksRes] = await Promise.all([
          deckApi.getAll({ size: 50 }).catch(() => emptyPage),
          deckApi.getMyDecks(0, 50).catch(() => emptyPage),
        ]);
        setDecks(allDecksRes.content || []);
        setMyDecks(myDecksRes.content || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load decks");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDecks();
  }, []);

  // Filter decks based on search, tab, and level
  const filteredDecks = decks.filter((deck) => {
    const matchesSearch =
      searchQuery === "" ||
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase());

    const isMyDeck = myDecks.some((d) => d.id === deck.id);
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "my-decks" && isMyDeck) ||
      (activeTab === "public" && deck.isPublic && !isMyDeck);

    const matchesLevel =
      selectedLevel === "All" || deck.level === selectedLevel;

    return matchesSearch && matchesTab && matchesLevel;
  });

  const myDecksCount = myDecks.length;
  const publicDecksCount = decks.filter((d) => d.isPublic && !myDecks.some((m) => m.id === d.id)).length;

  if (isLoading) {
    return <LoadingPage message="Loading vocabulary decks..." />;
  }

  if (error) {
    return <ErrorPage title="Error loading decks" message={error} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-neutral-200">
            Vocabulary Decks
          </h1>
          <p className="text-neutral-400 mt-1">
            Browse and study vocabulary collections
          </p>
        </div>
        <Button>
          <Plus className="w-5 h-5" />
          Create Deck
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {decks.length}
              </p>
              <p className="text-sm text-neutral-400">Total Decks</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {decks.reduce(
                  (acc, d) =>
                    acc +
                    (d.sections?.reduce(
                      (sAcc, s) => sAcc + (s.items?.length || 0),
                      0
                    ) || 0),
                  0
                )}
              </p>
              <p className="text-sm text-neutral-400">Total Cards</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {publicDecksCount}
              </p>
              <p className="text-sm text-neutral-400">Public Decks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({decks.length})</TabsTrigger>
            <TabsTrigger value="my-decks">My Decks ({myDecksCount})</TabsTrigger>
            <TabsTrigger value="public">Public ({publicDecksCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decks..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Level Filter */}
      <div className="flex gap-2 flex-wrap">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedLevel === level
                ? "bg-yellow-500 text-neutral-900"
                : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-neutral-200"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Decks Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDecks.map((deck) => {
          const totalCards =
            deck.sections?.reduce(
              (acc, s) => acc + (s.items?.length || 0),
              0
            ) || 0;
          const progressPercent = Math.round(deck.stats?.completionRate || 0);

          return (
            <Link key={deck.id} href={`/decks/${deck.id}`}>
              <Card variant="interactive" className="h-full">
                <CardContent className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                      <Layers className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      {deck.isPublic ? (
                        <Globe className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-neutral-400" />
                      )}
                      <Badge variant={getLevelColor(deck.level) as any}>
                        {deck.level}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-heading font-semibold text-neutral-200 mb-1">
                    {deck.title}
                  </h3>
                  <p className="text-sm text-neutral-400 line-clamp-2 mb-4 flex-1">
                    {deck.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">{totalCards} cards</span>
                      <span className="text-neutral-200">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} size="sm" />

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-700">
                      <span className="text-xs text-neutral-400">
                        {deck.isOfficial ? "Official" : "Community"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredDecks.length === 0 && (
        <EmptyState
          icon={<Layers className="w-8 h-8 text-neutral-400" />}
          title="No decks found"
          description="Try adjusting your search or filters"
        />
      )}
    </div>
  );
}
