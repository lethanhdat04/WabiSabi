"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Play, Star, Clock, Video } from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";

const categories = [
  { value: "ALL", label: "All" },
  { value: "ANIME", label: "Anime" },
  { value: "DAILY_LIFE", label: "Daily Life" },
  { value: "FOOD", label: "Food" },
  { value: "TRAVEL", label: "Travel" },
  { value: "BUSINESS", label: "Business" },
];

const levels = ["All", "N5", "N4", "N3", "N2", "N1"];

interface VideoStats {
  viewCount: number;
  practiceCount: number;
  shadowingCount: number;
  dictationCount: number;
  averageScore: number;
  totalRatings: number;
  averageRating: number;
}

interface VideoData {
  id: string;
  title: string;
  titleJapanese: string;
  youtubeId: string;
  thumbnailUrl: string;
  duration: number;
  category: string;
  level: string;
  segmentCount: number;
  isOfficial: boolean;
  stats: VideoStats;
}

interface ApiResponse {
  content: VideoData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    N5: "green",
    N4: "blue",
    N3: "yellow",
    N2: "orange",
    N1: "red",
  };
  return colors[level] || "default";
};

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchVideos();
  }, [page, selectedLevel, selectedCategory]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        size: "12",
      });

      if (selectedLevel !== "All") {
        params.append("level", selectedLevel);
      }

      if (selectedCategory !== "ALL") {
        params.append("category", selectedCategory);
      }

      const response = await fetch(
        `http://localhost:8080/api/videos?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data: ApiResponse = await response.json();
      setVideos(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.titleJapanese.includes(searchQuery);
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-neutral-200">
          Video Library
        </h1>
        <p className="text-neutral-400 mt-1">
          Practice Japanese with real video content
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />

        <div className="flex flex-wrap gap-2">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => {
                setSelectedLevel(level);
                setPage(0);
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
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

      {/* Category Tabs */}
      <Tabs defaultValue="ALL">
        <TabsList>
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              onClick={() => {
                setSelectedCategory(cat.value);
                setPage(0);
              }}
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.value} value={cat.value}>
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-neutral-400">Loading videos...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-heading font-semibold text-neutral-200 mb-2">
                    Error loading videos
                  </h3>
                  <p className="text-neutral-400 mb-4">{error}</p>
                  <Button onClick={fetchVideos}>Retry</Button>
                </CardContent>
              </Card>
            ) : filteredVideos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-heading font-semibold text-neutral-200 mb-2">
                    No videos found
                  </h3>
                  <p className="text-neutral-400">
                    Try adjusting your search or filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <span className="text-neutral-400 px-4">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={page >= totalPages - 1}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function VideoCard({ video }: { video: VideoData }) {
  return (
    <Link href={`/learn/videos/${video.id}`}>
      <Card variant="interactive" className="h-full overflow-hidden">
        <div className="relative aspect-video bg-neutral-700">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-neutral-900 ml-0.5" />
            </div>
          </div>
          <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-xs text-neutral-200 rounded">
            {formatDuration(video.duration)}
          </span>
          <div className="absolute top-2 left-2 flex gap-1">
            <Badge variant={getLevelColor(video.level) as any}>
              {video.level}
            </Badge>
            {video.isOfficial && <Badge variant="yellow">Official</Badge>}
          </div>
        </div>
        <CardContent className="pt-3">
          <h3 className="font-medium text-neutral-200 line-clamp-1 mb-1">
            {video.title}
          </h3>
          <p className="text-sm text-neutral-400 line-clamp-1 mb-3">
            {video.titleJapanese}
          </p>
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {video.segmentCount} segments
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>{video.stats.viewCount.toLocaleString()} views</span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {video.stats.averageRating.toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}