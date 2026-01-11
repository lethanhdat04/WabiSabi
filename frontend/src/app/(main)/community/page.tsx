"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MessageSquare,
  Heart,
  Eye,
  Clock,
  User,
  Filter,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
    level: string;
  };
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  isLiked: boolean;
}

const mockPosts: Post[] = [
  {
    id: "p1",
    title: "Tips for memorizing kanji radicals effectively",
    excerpt:
      "I've been studying kanji for about 6 months now and wanted to share some techniques that really helped me remember radicals...",
    author: {
      name: "TanakaYuki",
      avatar: "",
      level: "N3",
    },
    category: "Study Tips",
    tags: ["kanji", "memorization", "radicals"],
    likes: 124,
    comments: 32,
    views: 1520,
    createdAt: "2 hours ago",
    isLiked: true,
  },
  {
    id: "p2",
    title: "Question about て-form conjugation",
    excerpt:
      "I'm confused about when to use って vs いて for the て-form. Can someone explain the rules? For example, why is 書く → 書いて but...",
    author: {
      name: "JapanLearner42",
      avatar: "",
      level: "N5",
    },
    category: "Grammar",
    tags: ["grammar", "conjugation", "verbs"],
    likes: 45,
    comments: 18,
    views: 680,
    createdAt: "5 hours ago",
    isLiked: false,
  },
  {
    id: "p3",
    title: "My 1 year Japanese learning journey - From zero to N4",
    excerpt:
      "Today marks exactly one year since I started learning Japanese. I wanted to share my experience, resources I used, and tips for beginners...",
    author: {
      name: "MikeFromUS",
      avatar: "",
      level: "N4",
    },
    category: "Journey",
    tags: ["motivation", "progress", "beginner"],
    likes: 256,
    comments: 67,
    views: 3420,
    createdAt: "1 day ago",
    isLiked: true,
  },
  {
    id: "p4",
    title: "Best anime for Japanese learners (with subtitles recommendations)",
    excerpt:
      "I've compiled a list of anime that are great for learning Japanese, organized by difficulty level. Starting with slice-of-life anime which tend to use...",
    author: {
      name: "AnimeStudier",
      avatar: "",
      level: "N3",
    },
    category: "Resources",
    tags: ["anime", "listening", "resources"],
    likes: 189,
    comments: 45,
    views: 2150,
    createdAt: "2 days ago",
    isLiked: false,
  },
  {
    id: "p5",
    title: "Difference between は and が - Finally understood!",
    excerpt:
      "After struggling with this for months, I think I finally get the difference between は (topic marker) and が (subject marker). Let me try to explain...",
    author: {
      name: "GrammarGeek",
      avatar: "",
      level: "N4",
    },
    category: "Grammar",
    tags: ["grammar", "particles", "explanation"],
    likes: 312,
    comments: 89,
    views: 4520,
    createdAt: "3 days ago",
    isLiked: true,
  },
];

const categories = [
  "All",
  "Study Tips",
  "Grammar",
  "Resources",
  "Journey",
  "Questions",
];

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = mockPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (activeTab === "popular") {
      return b.likes - a.likes;
    }
    if (activeTab === "trending") {
      return b.views - a.views;
    }
    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-neutral-200">
            Community
          </h1>
          <p className="text-neutral-400 mt-1">
            Share knowledge and learn together
          </p>
        </div>
        <Link href="/community/new">
          <Button>
            <Plus className="w-5 h-5" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {mockPosts.length}
              </p>
              <p className="text-sm text-neutral-400">Posts</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                1.2k
              </p>
              <p className="text-sm text-neutral-400">Members</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                89
              </p>
              <p className="text-sm text-neutral-400">Active Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
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

      {/* Posts */}
      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <Link key={post.id} href={`/community/${post.id}`}>
            <Card variant="interactive">
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-neutral-200">
                        {post.author.name}
                      </span>
                      <Badge variant="yellow">{post.author.level}</Badge>
                      <span className="text-sm text-neutral-400">
                        {post.createdAt}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-neutral-200 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{post.category}</Badge>
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-neutral-400 bg-neutral-900 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Heart
                            className={`w-4 h-4 ${
                              post.isLiked ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {post.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {sortedPosts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-400">No posts found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
