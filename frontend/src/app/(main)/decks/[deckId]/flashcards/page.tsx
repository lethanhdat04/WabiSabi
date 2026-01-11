"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Check,
  X,
  Lightbulb,
  Volume2,
  Layers,
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

const mockCards = [
  {
    id: "c1",
    japanese: "食べる",
    reading: "taberu",
    meaning: "To eat",
    partOfSpeech: "Verb",
    example: "朝ごはんを食べる",
    exampleMeaning: "To eat breakfast",
  },
  {
    id: "c2",
    japanese: "飲む",
    reading: "nomu",
    meaning: "To drink",
    partOfSpeech: "Verb",
    example: "水を飲む",
    exampleMeaning: "To drink water",
  },
  {
    id: "c3",
    japanese: "大きい",
    reading: "ookii",
    meaning: "Big / Large",
    partOfSpeech: "Adjective",
    example: "大きい家",
    exampleMeaning: "A big house",
  },
  {
    id: "c4",
    japanese: "新しい",
    reading: "atarashii",
    meaning: "New",
    partOfSpeech: "Adjective",
    example: "新しい本",
    exampleMeaning: "A new book",
  },
  {
    id: "c5",
    japanese: "今日",
    reading: "kyou",
    meaning: "Today",
    partOfSpeech: "Noun",
    example: "今日は暑い",
    exampleMeaning: "It's hot today",
  },
];

const mockDeckInfo = {
  id: "d1",
  name: "JLPT N5 Vocabulary",
  level: "N5",
};

export default function DeckFlashcardsPage() {
  const params = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState<FlashcardState>("front");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const cards = mockCards;
  const deck = mockDeckInfo;
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

  const resetPractice = () => {
    setCurrentIndex(0);
    setCardState("front");
    setAnswers([]);
    setIsFinished(false);
  };

  const getScore = () => {
    const correct = answers.filter(
      (a) => a === "easy" || a === "good"
    ).length;
    return Math.round((correct / answers.length) * 100);
  };

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
          href={`/decks/${params.deckId}`}
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Deck
        </Link>

        <Card>
          <CardContent className="text-center py-8">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-heading font-semibold text-yellow-500">
                {score}%
              </span>
            </div>
            <h2 className="text-2xl font-heading font-semibold text-neutral-200 mb-2">
              Session Complete
            </h2>
            <p className="text-neutral-400 mb-6">
              You reviewed {cards.length} cards from {deck.name}
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
              <Button variant="secondary" onClick={resetPractice}>
                <RotateCcw className="w-5 h-5" />
                Study Again
              </Button>
              <Link href={`/decks/${params.deckId}`}>
                <Button>Done</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/decks/${params.deckId}`}
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="yellow">{deck.level}</Badge>
          <span className="text-sm text-neutral-400">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} size="sm" />

      {/* Deck Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
          <Layers className="w-5 h-5 text-yellow-500" />
        </div>
        <div>
          <p className="font-medium text-neutral-200">{deck.name}</p>
          <p className="text-sm text-neutral-400">Flashcard Study</p>
        </div>
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
                {currentCard.example && (
                  <div className="mt-4 p-4 bg-neutral-900 border border-neutral-700 rounded-lg w-full">
                    <p className="text-neutral-200 mb-1">{currentCard.example}</p>
                    <p className="text-sm text-neutral-400">
                      {currentCard.exampleMeaning}
                    </p>
                  </div>
                )}
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
            </Button>
            <Button
              variant="secondary"
              className="flex-col h-auto py-3 border-yellow-500/30 hover:border-yellow-500"
              onClick={() => handleAnswer("hard")}
            >
              <Lightbulb className="w-5 h-5 text-yellow-500 mb-1" />
              <span className="text-xs">Hard</span>
            </Button>
            <Button
              variant="secondary"
              className="flex-col h-auto py-3 border-blue-500/30 hover:border-blue-500"
              onClick={() => handleAnswer("good")}
            >
              <Check className="w-5 h-5 text-blue-500 mb-1" />
              <span className="text-xs">Good</span>
            </Button>
            <Button
              variant="secondary"
              className="flex-col h-auto py-3 border-green-500/30 hover:border-green-500"
              onClick={() => handleAnswer("easy")}
            >
              <Check className="w-5 h-5 text-green-500 mb-1" />
              <span className="text-xs">Easy</span>
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
