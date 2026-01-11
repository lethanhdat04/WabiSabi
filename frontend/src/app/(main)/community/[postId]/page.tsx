"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  User,
  Send,
  ThumbsUp,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
} from "@/components/ui";

interface Comment {
  id: string;
  author: {
    name: string;
    level: string;
  };
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

const mockPost = {
  id: "p1",
  title: "Tips for memorizing kanji radicals effectively",
  content: `I've been studying kanji for about 6 months now and wanted to share some techniques that really helped me remember radicals. These methods have significantly improved my kanji retention and I hope they help you too!

## 1. Create Stories

The most effective technique I've found is creating vivid, memorable stories for each radical. The more absurd or emotional the story, the better it sticks.

For example, the radical 木 (tree) combined with 林 (grove) and 森 (forest) can be remembered as: "One tree (木) is lonely, two trees (林) make a grove where they can chat, and three trees (森) form a forest where they throw parties!"

## 2. Use Mnemonics Apps

Apps like Wanikani and Kanji Garden have built-in mnemonics that are really helpful. Even if their stories don't work for you, they can inspire your own.

## 3. Draw the Radicals

Physical writing helps a lot. I spend about 10 minutes each day just drawing radicals. The muscle memory really helps during recognition.

## 4. Group Similar Radicals

I made a spreadsheet grouping radicals that look similar (like 力 and 刀) so I can practice distinguishing them specifically.

## 5. Review Daily

Consistency is key. Even just 5 minutes of radical review each day is better than one hour once a week.

What techniques work best for you? I'd love to hear other methods!`,
  author: {
    name: "TanakaYuki",
    level: "N3",
    joinedAt: "2023-06",
    posts: 24,
  },
  category: "Study Tips",
  tags: ["kanji", "memorization", "radicals"],
  likes: 124,
  comments: 32,
  views: 1520,
  createdAt: "2 hours ago",
  isLiked: true,
  isBookmarked: false,
};

const mockComments: Comment[] = [
  {
    id: "c1",
    author: {
      name: "KanjiMaster",
      level: "N2",
    },
    content:
      "Great tips! I especially agree with the story method. I've been using it for years and it works wonderfully. One addition - try to connect the stories to your personal experiences if possible. Makes them even more memorable!",
    likes: 18,
    isLiked: true,
    createdAt: "1 hour ago",
    replies: [
      {
        id: "c1r1",
        author: {
          name: "TanakaYuki",
          level: "N3",
        },
        content:
          "That's a great point! Personal connections do make the stories stick better. Thanks for adding that!",
        likes: 5,
        isLiked: false,
        createdAt: "45 min ago",
      },
    ],
  },
  {
    id: "c2",
    author: {
      name: "BeginnerLearner",
      level: "N5",
    },
    content:
      "Thank you so much for this! I just started learning kanji and was feeling overwhelmed. The grouping similar radicals tip is genius - I'll definitely try that!",
    likes: 8,
    isLiked: false,
    createdAt: "30 min ago",
  },
  {
    id: "c3",
    author: {
      name: "StudyBuddy",
      level: "N4",
    },
    content:
      "I've been using the RTK (Remembering the Kanji) method which is similar to what you describe. The key insight for me was realizing that radicals are like LEGO blocks - once you know the pieces, building kanji becomes much easier.",
    likes: 12,
    isLiked: false,
    createdAt: "20 min ago",
  },
];

export default function PostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState(mockPost);
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleLike = () => {
    setPost({
      ...post,
      isLiked: !post.isLiked,
      likes: post.isLiked ? post.likes - 1 : post.likes + 1,
    });
  };

  const toggleBookmark = () => {
    setPost({
      ...post,
      isBookmarked: !post.isBookmarked,
    });
  };

  const toggleCommentLike = (commentId: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        return comment;
      })
    );
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newCommentObj: Comment = {
      id: `c${comments.length + 1}`,
      author: {
        name: "You",
        level: "N4",
      },
      content: newComment,
      likes: 0,
      isLiked: false,
      createdAt: "Just now",
    };

    setComments([...comments, newCommentObj]);
    setNewComment("");
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Link
        href="/community"
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Community
      </Link>

      {/* Post */}
      <Card>
        <CardContent>
          {/* Author Info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-neutral-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-200">
                    {post.author.name}
                  </span>
                  <Badge variant="yellow">{post.author.level}</Badge>
                </div>
                <p className="text-sm text-neutral-400">
                  {post.author.posts} posts · Joined {post.author.joinedAt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">{post.createdAt}</span>
              <button className="p-2 hover:bg-neutral-800 rounded-lg">
                <MoreHorizontal className="w-5 h-5 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Title and Tags */}
          <h1 className="text-2xl font-heading font-semibold text-neutral-200 mb-3">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="default">{post.category}</Badge>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-neutral-400 bg-neutral-900 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-6">
            <div className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  post.isLiked
                    ? "bg-red-500/10 text-red-500"
                    : "hover:bg-neutral-800 text-neutral-400"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`}
                />
                <span>{post.likes}</span>
              </button>
              <div className="flex items-center gap-2 text-neutral-400">
                <MessageSquare className="w-5 h-5" />
                <span>{comments.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  post.isBookmarked
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "hover:bg-neutral-800 text-neutral-400"
                }`}
              >
                <Bookmark
                  className={`w-5 h-5 ${post.isBookmarked ? "fill-current" : ""}`}
                />
              </button>
              <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-neutral-200 mb-4">
          Comments ({comments.length})
        </h3>

        {/* New Comment */}
        <Card className="mb-4">
          <CardContent>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full h-24 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:border-yellow-500 resize-none mb-3"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={submitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-neutral-200">
                        {comment.author.name}
                      </span>
                      <Badge variant="yellow">{comment.author.level}</Badge>
                      <span className="text-sm text-neutral-400">
                        {comment.createdAt}
                      </span>
                    </div>
                    <p className="text-neutral-300 mb-3">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleCommentLike(comment.id)}
                        className={`flex items-center gap-1 text-sm ${
                          comment.isLiked
                            ? "text-yellow-500"
                            : "text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        <ThumbsUp
                          className={`w-4 h-4 ${
                            comment.isLiked ? "fill-current" : ""
                          }`}
                        />
                        {comment.likes}
                      </button>
                      <button className="text-sm text-neutral-400 hover:text-neutral-200">
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 space-y-4 pl-4 border-l-2 border-neutral-700">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-neutral-200 text-sm">
                                  {reply.author.name}
                                </span>
                                <Badge variant="yellow">{reply.author.level}</Badge>
                                <span className="text-xs text-neutral-400">
                                  {reply.createdAt}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-300">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
