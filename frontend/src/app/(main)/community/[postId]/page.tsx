"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  LoadingPage,
  ErrorPage,
} from "@/components/ui";
import { forumApi, Post, Comment } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/hooks";

const topicLabels: Record<string, string> = {
  JLPT_TIPS: "JLPT Tips",
  LEARNING_RESOURCES: "Learning Resources",
  JAPAN_CULTURE: "Japan Culture",
  TRAVEL: "Travel",
  GRAMMAR_QUESTIONS: "Grammar Questions",
  VOCABULARY_HELP: "Vocabulary Help",
  PRACTICE_PARTNERS: "Practice Partners",
  SUCCESS_STORIES: "Success Stories",
  GENERAL_DISCUSSION: "General Discussion",
  ANNOUNCEMENTS: "Announcements",
  FEEDBACK: "Feedback",
};

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    async function fetchPostData() {
      if (!postId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await forumApi.getPostWithComments(postId);
        setPost(response.post);
        setComments(response.comments?.content || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPostData();
  }, [postId]);

  const toggleLike = async () => {
    if (!post) return;

    try {
      const response = await forumApi.likePost(post.id);
      setPost({
        ...post,
        isLikedByCurrentUser: response.isLiked,
        likeCount: response.likeCount,
      });
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const toggleCommentLike = async (commentId: string) => {
    try {
      const response = await forumApi.likeComment(commentId);
      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLikedByCurrentUser: response.isLiked,
              likeCount: response.likeCount,
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error("Failed to toggle comment like:", err);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !post) return;

    setIsSubmitting(true);

    try {
      const newCommentObj = await forumApi.createComment(post.id, {
        content: newComment.trim(),
      });
      setComments([...comments, newCommentObj]);
      setNewComment("");
      setPost({
        ...post,
        commentCount: post.commentCount + 1,
      });
    } catch (err) {
      console.error("Failed to submit comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingPage message="Loading post..." />;
  }

  if (error || !post) {
    return (
      <ErrorPage
        title="Error loading post"
        message={error || "Post not found"}
      />
    );
  }

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
              <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden">
                {post.authorAvatarUrl ? (
                  <img
                    src={post.authorAvatarUrl}
                    alt={post.authorUsername}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-neutral-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-200">
                    {post.authorUsername}
                  </span>
                </div>
                <p className="text-sm text-neutral-400">
                  {formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {post.canEdit && (
                <Link href={`/community/${post.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              )}
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
            <Badge variant="default">
              {topicLabels[post.topic] || post.topic}
            </Badge>
            {post.tags?.map((tag) => (
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
                  post.isLikedByCurrentUser
                    ? "bg-red-500/10 text-red-500"
                    : "hover:bg-neutral-800 text-neutral-400"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    post.isLikedByCurrentUser ? "fill-current" : ""
                  }`}
                />
                <span>{post.likeCount}</span>
              </button>
              <div className="flex items-center gap-2 text-neutral-400">
                <MessageSquare className="w-5 h-5" />
                <span>{post.commentCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "hover:bg-neutral-800 text-neutral-400"
                }`}
              >
                <Bookmark
                  className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
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
          Comments ({post.commentCount})
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
          {comments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-400">
                  No comments yet. Be the first to comment!
                </p>
              </CardContent>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {comment.authorAvatarUrl ? (
                        <img
                          src={comment.authorAvatarUrl}
                          alt={comment.authorUsername}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-neutral-200">
                          {comment.authorUsername}
                        </span>
                        <span className="text-sm text-neutral-400">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                        {comment.isEdited && (
                          <span className="text-xs text-neutral-500">
                            (edited)
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-300 mb-3 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleCommentLike(comment.id)}
                          className={`flex items-center gap-1 text-sm ${
                            comment.isLikedByCurrentUser
                              ? "text-yellow-500"
                              : "text-neutral-400 hover:text-neutral-200"
                          }`}
                        >
                          <ThumbsUp
                            className={`w-4 h-4 ${
                              comment.isLikedByCurrentUser ? "fill-current" : ""
                            }`}
                          />
                          {comment.likeCount}
                        </button>
                        <button className="text-sm text-neutral-400 hover:text-neutral-200">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
