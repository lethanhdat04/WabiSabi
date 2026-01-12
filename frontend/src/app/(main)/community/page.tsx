"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MessageSquare,
  Heart,
  Eye,
  User,
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
  LoadingPage,
  ErrorPage,
  EmptyState,
} from "@/components/ui";
import { forumApi, Post, PageResponse } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/hooks";

const topics = [
  "All",
  "GENERAL",
  "STUDY_TIPS",
  "GRAMMAR",
  "RESOURCES",
  "JOURNEY",
  "QUESTIONS",
];

const topicLabels: Record<string, string> = {
  All: "All",
  GENERAL: "General",
  STUDY_TIPS: "Study Tips",
  GRAMMAR: "Grammar",
  RESOURCES: "Resources",
  JOURNEY: "Journey",
  QUESTIONS: "Questions",
};

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("latest");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      setError(null);
      try {
        let postsRes: PageResponse<Post>;

        if (activeTab === "popular") {
          postsRes = await forumApi.getPopularPosts(0, 20);
        } else if (activeTab === "trending") {
          postsRes = await forumApi.getTrendingPosts(0, 20);
        } else {
          postsRes = await forumApi.getPosts({
            topic: selectedTopic !== "All" ? selectedTopic : undefined,
            size: 20,
            sort: "createdAt,desc",
          });
        }

        setPosts(postsRes.content || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, [activeTab, selectedTopic]);

  // Filter by search query locally
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    return (
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) {
    return <LoadingPage message="Loading community posts..." />;
  }

  if (error) {
    return <ErrorPage title="Error loading posts" message={error} />;
  }

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
                {posts.length}
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
                {new Set(posts.map((p) => p.authorId)).size}
              </p>
              <p className="text-sm text-neutral-400">Authors</p>
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
                {posts.reduce((acc, p) => acc + p.commentCount, 0)}
              </p>
              <p className="text-sm text-neutral-400">Comments</p>
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

      {/* Topic Filter */}
      <div className="flex gap-2 flex-wrap">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedTopic === topic
                ? "bg-yellow-500 text-neutral-900"
                : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-neutral-200"
            }`}
          >
            {topicLabels[topic] || topic}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Link key={post.id} href={`/community/${post.id}`}>
            <Card variant="interactive">
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {post.authorAvatarUrl ? (
                      <img
                        src={post.authorAvatarUrl}
                        alt={post.authorUsername}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-neutral-200">
                        {post.authorUsername}
                      </span>
                      <span className="text-sm text-neutral-400">
                        {formatRelativeTime(post.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-neutral-200 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
                      {post.contentPreview || post.content || ""}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">
                          {topicLabels[post.topic] || post.topic}
                        </Badge>
                        {post.tags?.slice(0, 2).map((tag) => (
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
                              post.isLikedByCurrentUser
                                ? "fill-red-500 text-red-500"
                                : ""
                            }`}
                          />
                          {post.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {post.commentCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.viewCount}
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

      {filteredPosts.length === 0 && (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8 text-neutral-400" />}
          title="No posts found"
          description="Be the first to start a discussion!"
          action={
            <Link href="/community/new">
              <Button>
                <Plus className="w-5 h-5" />
                Create Post
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
