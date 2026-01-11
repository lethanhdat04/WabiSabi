"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Plus, Layers, ChevronRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Badge,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { mockDecks, getLevelColor } from "@/lib/mock-data";

const levels = ["All", "N5", "N4", "N3", "N2", "N1"];
const topics = [
  "All",
  "JLPT",
  "Daily Life",
  "Food",
  "Travel",
  "Business",
  "Anime & Manga",
];

export default function VocabularyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const filteredDecks = mockDecks.filter((deck) => {
    const matchesSearch =
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel =
      selectedLevel === "All" || deck.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const inProgressDecks = filteredDecks.filter(
    (d) => d.progress > 0 && d.progress < 100
  );
  const completedDecks = filteredDecks.filter((d) => d.progress === 100);
  const notStartedDecks = filteredDecks.filter((d) => d.progress === 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search decks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                selectedLevel === level
                  ? "bg-yellow-500 text-neutral-900 border-yellow-500"
                  : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All ({filteredDecks.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressDecks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedDecks.length})
          </TabsTrigger>
          <TabsTrigger value="not-started">
            Not Started ({notStartedDecks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DeckGrid decks={filteredDecks} />
        </TabsContent>
        <TabsContent value="in-progress">
          <DeckGrid decks={inProgressDecks} />
        </TabsContent>
        <TabsContent value="completed">
          <DeckGrid decks={completedDecks} />
        </TabsContent>
        <TabsContent value="not-started">
          <DeckGrid decks={notStartedDecks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DeckGrid({ decks }: { decks: typeof mockDecks }) {
  if (decks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Layers className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-heading font-semibold text-neutral-200 mb-2">
            No decks found
          </h3>
          <p className="text-neutral-400">
            Try adjusting your search or filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <Link key={deck.id} href={`/learn/vocabulary/${deck.id}`}>
          <Card variant="interactive" className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getLevelColor(deck.level) as any}>
                  {deck.level}
                </Badge>
                {deck.isOfficial && <Badge variant="yellow">Official</Badge>}
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
              <div className="mt-3 pt-3 border-t border-neutral-700 flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  by {deck.createdBy}
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
