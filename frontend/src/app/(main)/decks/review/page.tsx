"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Check,
  X,
  Lightbulb,
  Volume2,
  Clock,
  Layers,
  Calendar,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
} from "@/components/ui";

type FlashcardState = "front" | "back";
type Answer = "easy" | "good" | "hard" | "forgot";

interface ReviewCard {
  id: string;
  japanese: string;
  reading: string;
  meaning: string;
  partOfSpeech: string;
  deckName: string;
  dueDate: string;
  interval: number;
  easeFactor: number;
}

const mockReviewQueue: ReviewCard[] = [
  {
    id: "r1",
    japanese: "食べる",
    reading: "taberu",
    meaning: "To eat",
    partOfSpeech: "Verb",
    deckName: "JLPT N5 Vocabulary",
    dueDate: "2024-01-15",
    interval: 1,
    easeFactor: 2.5,
  },
  {
    id: "r2",
    japanese: "飲む",
    reading: "nomu",
    meaning: "To drink",
    partOfSpeech: "Verb",
    deckName: "JLPT N5 Vocabulary",
    dueDate: "2024-01-15",
    interval: 3,
    easeFactor: 2.3,
  },
  {
    id: "r3",
    japanese: "ありがとう",
    reading: "arigatou",
    meaning: "Thank you",
    partOfSpeech: "Expression",
    deckName: "Daily Conversation",
    dueDate: "2024-01-15",
    interval: 7,
    easeFactor: 2.8,
  },
  {
    id: "r4",
    japanese: "大きい",
    reading: "ookii",
    meaning: "Big / Large",
    partOfSpeech: "Adjective",
    deckName: "JLPT N5 Vocabulary",
    dueDate: "2024-01-14",
    interval: 1,
    easeFactor: 2.1,
  },
  {
    id: "r5",
    japanese: "会議",
    reading: "kaigi",
    meaning: "Meeting / Conference",
    partOfSpeech: "Noun",
    deckName: "Business Japanese",
    dueDate: "2024-01-15",
    interval: 5,
    easeFactor: 2.6,
  },
];

const mockReviewStats = {
  dueToday: 12,
  dueNow: 5,
  newToday: 8,
  reviewsToday: 25,
  streak: 7,
};

export default function ReviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState<FlashcardState>("front");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const cards = mockReviewQueue;
  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const flipCard = () => {
    setCardState(cardState === "front" ? "back" : "front");
  };

  const handleAnswer = (answer: Answer) => {
    setAnswers([...answers, answer]);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCardState("front");
    } else {
      setIsFinished(true);
    }
  };

  const resetReview = () => {
    setCurrentIndex(0);
    setCardState("front");
    setAnswers([]);
    setIsFinished(false);
    setIsStarted(false);
  };

  const getScore = () => {
    const correct = answers.filter(
      (a) => a === "easy" || a === "good"
    ).length;
    return Math.round((correct / answers.length) * 100);
  };

  const getNextInterval = (answer: Answer) => {
    switch (answer) {
      case "easy":
        return "4 days";
      case "good":
        return "2 days";
      case "hard":
        return "1 day";
      case "forgot":
        return "10 min";
    }
  };

  // Review Queue Overview
  if (!isStarted) {
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
        </div>

        <div>
          <h1 className="text-2xl font-heading font-semibold text-neutral-200">
            Spaced Repetition Review
          </h1>
          <p className="text-neutral-400 mt-1">
            Review cards that are due for revision
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {mockReviewStats.dueNow}
                </p>
                <p className="text-sm text-neutral-400">Due Now</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {mockReviewStats.dueToday}
                </p>
                <p className="text-sm text-neutral-400">Due Today</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {mockReviewStats.newToday}
                </p>
                <p className="text-sm text-neutral-400">New Cards</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {mockReviewStats.streak}
                </p>
                <p className="text-sm text-neutral-400">Day Streak</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Queue */}
        <Card>
          <CardContent>
            <h3 className="font-heading font-semibold text-neutral-200 mb-4">
              Review Queue ({cards.length} cards)
            </h3>
            <div className="space-y-2 mb-6">
              {cards.slice(0, 5).map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                      <Volume2 className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-200">
                        {card.japanese}
                      </p>
                      <p className="text-sm text-neutral-400">{card.reading}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">{card.deckName}</Badge>
                    <p className="text-xs text-neutral-400 mt-1">
                      Interval: {card.interval}d
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => setIsStarted(true)} className="w-full" size="lg">
              Start Review Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Finished State
  if (isFinished) {
    const score = getScore();
    const stats = {
      easy: answers.filter((a) => a === "easy").length,
      good: answers.filter((a) => a === "good").length,
      hard: answers.filter((a) => a === "hard").length,
      forgot: answers.filter((a) => a === "forgot").length,
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/decks"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Decks
        </Link>

        <Card>
          <CardContent className="text-center py-8">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-heading font-semibold text-yellow-500">
                {score}%
              </span>
            </div>
            <h2 className="text-2xl font-heading font-semibold text-neutral-200 mb-2">
              Review Complete
            </h2>
            <p className="text-neutral-400 mb-6">
              You reviewed {cards.length} cards
            </p>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-500">
                  {stats.easy}
                </div>
                <div className="text-xs text-neutral-400">Easy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-500">
                  {stats.good}
                </div>
                <div className="text-xs text-neutral-400">Good</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-yellow-500">
                  {stats.hard}
                </div>
                <div className="text-xs text-neutral-400">Hard</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-red-500">
                  {stats.forgot}
                </div>
                <div className="text-xs text-neutral-400">Forgot</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={resetReview}>
                <RotateCcw className="w-5 h-5" />
                Review Again
              </Button>
              <Link href="/decks">
                <Button>Done</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active Review
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/decks/review"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
          onClick={(e) => {
            e.preventDefault();
            setIsStarted(false);
          }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <span className="text-sm text-neutral-400">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Progress */}
      <Progress value={progress} size="sm" />

      {/* Deck Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="font-medium text-neutral-200">Spaced Repetition</p>
            <p className="text-sm text-neutral-400">{currentCard.deckName}</p>
          </div>
        </div>
        <Badge variant="default">Interval: {currentCard.interval}d</Badge>
      </div>

      {/* Flashcard */}
      <div className="cursor-pointer" onClick={flipCard}>
        <Card className="min-h-[320px] flex flex-col">
          <CardContent className="flex-1 flex flex-col items-center justify-center text-center py-8">
            {cardState === "front" ? (
              <>
                <Badge variant="yellow" className="mb-4">
                  {currentCard.partOfSpeech}
                </Badge>
                <h2 className="text-4xl font-heading font-semibold text-neutral-200 mb-2">
                  {currentCard.japanese}
                </h2>
                <p className="text-xl text-neutral-400 mb-4">
                  {currentCard.reading}
                </p>
                <button className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center hover:bg-yellow-500/20 transition-colors mb-4">
                  <Volume2 className="w-5 h-5 text-yellow-500" />
                </button>
                <p className="text-sm text-neutral-400">Tap to reveal meaning</p>
              </>
            ) : (
              <>
                <Badge variant="green" className="mb-4">
                  Meaning
                </Badge>
                <h2 className="text-2xl font-heading font-semibold text-neutral-200 mb-4">
                  {currentCard.meaning}
                </h2>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      {cardState === "back" && (
        <div className="space-y-3">
          <p className="text-center text-sm text-neutral-400">
            How well did you know this?
          </p>
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="secondary"
              className="flex-col h-auto py-3 border-red-500/30 hover:border-red-500"
              onClick={() => handleAnswer("forgot")}
            >
              <X className="w-5 h-5 text-red-500 mb-1" />
              <span className="text-xs">Forgot</span>
              <span className="text-xs text-neutral-400">10m</span>
            </Button>
            <Button
              variant="secondary"
              className="flex-col h-auto py-3 border-yellow-500/30 hover:border-yellow-500"
              onClick={() => handleAnswer("hard")}
            >
              <Lightbulb className="w-5 h-5 text-yellow-500 mb-1" />
              <span className="text-xs">Hard</span>
              <span className="text-xs text-neutral-400">1d</span>
            </Button>
            <Button
              variant="secondary"
              className="flex-col h-auto py-3 border-blue-500/30 hover:border-blue-500"
              onClick={() => handleAnswer("good")}
            >
              <Check className="w-5 h-5 text-blue-500 mb-1" />
              <span className="text-xs">Good</span>
              <span className="text-xs text-neutral-400">2d</span>
            </Button>
            <Button
              variant="secondary"
              className="flex-col h-auto py-3 border-green-500/30 hover:border-green-500"
              onClick={() => handleAnswer("easy")}
            >
              <Check className="w-5 h-5 text-green-500 mb-1" />
              <span className="text-xs">Easy</span>
              <span className="text-xs text-neutral-400">4d</span>
            </Button>
          </div>
        </div>
      )}

      {/* Navigation hint */}
      {cardState === "front" && (
        <div className="flex items-center justify-center gap-4 text-sm text-neutral-400">
          <span>Tap card to flip</span>
        </div>
      )}
    </div>
  );
}
