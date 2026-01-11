"use client";

import { useState } from "react";
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
} from "@/components/ui";

const mockDecks = [
  {
    id: "d1",
    name: "JLPT N5 Vocabulary",
    description: "Essential vocabulary for JLPT N5 exam preparation",
    cardCount: 800,
    learnedCount: 320,
    level: "N5",
    isPublic: true,
    author: "Nihongo Master",
    category: "JLPT",
  },
  {
    id: "d2",
    name: "Daily Conversation",
    description: "Common phrases for everyday Japanese conversations",
    cardCount: 250,
    learnedCount: 180,
    level: "Beginner",
    isPublic: true,
    author: "Nihongo Master",
    category: "Conversation",
  },
  {
    id: "d3",
    name: "My Custom Deck",
    description: "Personal vocabulary collection from anime",
    cardCount: 45,
    learnedCount: 12,
    level: "Mixed",
    isPublic: false,
    author: "You",
    category: "Custom",
  },
  {
    id: "d4",
    name: "Business Japanese",
    description: "Professional vocabulary for workplace communication",
    cardCount: 300,
    learnedCount: 0,
    level: "Intermediate",
    isPublic: true,
    author: "Nihongo Master",
    category: "Business",
  },
  {
    id: "d5",
    name: "Kanji Radicals",
    description: "Learn the building blocks of kanji characters",
    cardCount: 214,
    learnedCount: 50,
    level: "Beginner",
    isPublic: true,
    author: "Community",
    category: "Kanji",
  },
  {
    id: "d6",
    name: "Anime Vocabulary",
    description: "Popular words and phrases from anime series",
    cardCount: 150,
    learnedCount: 75,
    level: "Mixed",
    isPublic: true,
    author: "Community",
    category: "Entertainment",
  },
];

const categories = ["All", "JLPT", "Conversation", "Business", "Kanji", "Custom"];

export default function DecksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredDecks = mockDecks.filter((deck) => {
    const matchesSearch =
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "my-decks" && deck.author === "You") ||
      (activeTab === "public" && deck.isPublic && deck.author !== "You");
    const matchesCategory =
      selectedCategory === "All" || deck.category === selectedCategory;
    return matchesSearch && matchesTab && matchesCategory;
  });

  const myDecksCount = mockDecks.filter((d) => d.author === "You").length;
  const publicDecksCount = mockDecks.filter(
    (d) => d.isPublic && d.author !== "You"
  ).length;

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
                {mockDecks.length}
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
                {mockDecks.reduce((acc, d) => acc + d.learnedCount, 0)}
              </p>
              <p className="text-sm text-neutral-400">Cards Learned</p>
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
            <TabsTrigger value="all">All ({mockDecks.length})</TabsTrigger>
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

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedCategory === category
                ? "bg-yellow-500 text-neutral-900"
                : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-neutral-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Decks Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDecks.map((deck) => {
          const progressPercent =
            deck.cardCount > 0
              ? Math.round((deck.learnedCount / deck.cardCount) * 100)
              : 0;

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
                      <Badge variant="yellow">{deck.level}</Badge>
                    </div>
                  </div>

                  <h3 className="font-heading font-semibold text-neutral-200 mb-1">
                    {deck.name}
                  </h3>
                  <p className="text-sm text-neutral-400 line-clamp-2 mb-4 flex-1">
                    {deck.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">
                        {deck.learnedCount} / {deck.cardCount} cards
                      </span>
                      <span className="text-neutral-200">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} size="sm" />

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-700">
                      <span className="text-xs text-neutral-400">
                        by {deck.author}
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
        <Card>
          <CardContent className="text-center py-12">
            <Layers className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-400">No decks found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
