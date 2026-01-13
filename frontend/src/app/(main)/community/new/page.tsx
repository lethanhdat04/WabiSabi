"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  X,
  Plus,
  FileText,
  Tag,
  Folder,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
} from "@/components/ui";
import { forumApi } from "@/lib/api-client";

// Map to backend ForumTopic enum
const categories = [
  { label: "JLPT Tips", value: "JLPT_TIPS" },
  { label: "Learning Resources", value: "LEARNING_RESOURCES" },
  { label: "Japan Culture", value: "JAPAN_CULTURE" },
  { label: "Travel", value: "TRAVEL" },
  { label: "Grammar Questions", value: "GRAMMAR_QUESTIONS" },
  { label: "Vocabulary Help", value: "VOCABULARY_HELP" },
  { label: "Practice Partners", value: "PRACTICE_PARTNERS" },
  { label: "Success Stories", value: "SUCCESS_STORIES" },
  { label: "General Discussion", value: "GENERAL_DISCUSSION" },
  { label: "Feedback", value: "FEEDBACK" },
];

const suggestedTags = [
  "kanji",
  "grammar",
  "vocabulary",
  "listening",
  "speaking",
  "reading",
  "JLPT",
  "beginner",
  "intermediate",
  "advanced",
  "motivation",
  "resources",
];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < 5) {
      setTags([...tags, normalizedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !selectedCategory) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await forumApi.createPost({
        title: title.trim(),
        content: content.trim(),
        topic: selectedCategory,
        tags: tags.length > 0 ? tags : undefined,
      });
      router.push("/community");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
      setIsSubmitting(false);
    }
  };

  const isValid = title.trim() && content.trim() && selectedCategory;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Community
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-heading font-semibold text-neutral-200">
          Create New Post
        </h1>
        <p className="text-neutral-400 mt-1">
          Share your knowledge or ask a question
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-2">
              Title
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title..."
                className="pl-10"
                maxLength={100}
              />
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {title.length}/100 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-2">
              <Folder className="w-4 h-4 inline mr-2" />
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.value
                      ? "bg-yellow-500 text-neutral-900"
                      : "bg-neutral-900 text-neutral-400 border border-neutral-700 hover:text-neutral-200"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here... You can share tips, ask questions, or discuss Japanese learning topics."
              className="w-full h-64 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:border-yellow-500 resize-none"
            />
            <p className="text-xs text-neutral-400 mt-1">
              Markdown formatting is supported
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Tags (up to 5)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="yellow"
                  className="flex items-center gap-1"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-neutral-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  disabled={tags.length >= 5}
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => addTag(tagInput)}
                disabled={!tagInput.trim() || tags.length >= 5}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {/* Suggested Tags */}
            <div className="mt-3">
              <p className="text-xs text-neutral-400 mb-2">Suggested tags:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags
                  .filter((tag) => !tags.includes(tag))
                  .slice(0, 8)
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      disabled={tags.length >= 5}
                      className="text-xs px-2 py-1 bg-neutral-900 text-neutral-400 border border-neutral-700 rounded hover:text-neutral-200 hover:border-neutral-600 disabled:opacity-50"
                    >
                      #{tag}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {(title || content) && (
        <Card>
          <CardContent>
            <h3 className="text-sm font-medium text-neutral-400 mb-4">
              Preview
            </h3>
            <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
              {title && (
                <h2 className="text-lg font-heading font-semibold text-neutral-200 mb-2">
                  {title}
                </h2>
              )}
              <div className="flex items-center gap-2 mb-3">
                {selectedCategory && (
                  <Badge variant="default">
                    {categories.find((c) => c.value === selectedCategory)?.label || selectedCategory}
                  </Badge>
                )}
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-neutral-400 bg-neutral-800 px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              {content && (
                <p className="text-neutral-400 whitespace-pre-wrap">
                  {content}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/community" className="flex-1">
          <Button variant="secondary" className="w-full">
            Cancel
          </Button>
        </Link>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            "Publishing..."
          ) : (
            <>
              <Send className="w-5 h-5" />
              Publish Post
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
