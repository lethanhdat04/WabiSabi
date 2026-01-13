"use client";

import { useState, useEffect } from "react";
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
  LoadingPage,
  ErrorPage,
} from "@/components/ui";
import {
  deckApi,
  practiceApi,
  VocabularyDeck,
  Flashcard,
  FlashcardResult,
} from "@/lib/api-client";
import { getLevelColor } from "@/lib/hooks";

type FlashcardState = "front" | "back";
type Answer = "EASY" | "GOOD" | "HARD" | "FORGOT";

export default function DeckFlashcardsPage() {
  const params = useParams();
  const deckId = params.deckId as string;

  const [deck, setDeck] = useState<VocabularyDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState<FlashcardState>("front");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!deckId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [deckData, flashcards] = await Promise.all([
          deckApi.getSummary(deckId),
          practiceApi.getFlashcards({
            deckId,
            shuffleItems: true,
          }),
        ]);

        setDeck(deckData);
        setCards(flashcards);

        if (flashcards.length === 0) {
          setError("No flashcards available in this deck");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load flashcards");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [deckId]);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  const flipCard = () => {
    setCardState(cardState === "front" ? "back" : "front");
  };

  const handleAnswer = async (answer: Answer) => {
    if (!currentCard || isSubmitting) return;

    setIsSubmitting(true);

    // Submit result to backend
    try {
      await practiceApi.submitFlashcardResult({
        deckId,
        sectionIndex: currentCard.sectionIndex,
        itemIndex: currentCard.itemIndex,
        result: answer,
      });
    } catch (err) {
      console.error("Failed to submit flashcard result:", err);
    }

    setAnswers([...answers, answer]);
    setIsSubmitting(false);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCardState("front");
    } else {
      setIsFinished(true);
    }
  };

  const resetPractice = async () => {
    setIsLoading(true);
    try {
      const flashcards = await practiceApi.getFlashcards({
        deckId,
        shuffleItems: true,
      });
      setCards(flashcards);
      setCurrentIndex(0);
      setCardState("front");
      setAnswers([]);
      setIsFinished(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reload flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  const getScore = () => {
    if (answers.length === 0) return 0;
    const correct = answers.filter((a) => a === "EASY" || a === "GOOD").length;
    return Math.round((correct / answers.length) * 100);
  };

  const playAudio = (audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    }
  };

  if (isLoading) {
    return <LoadingPage message="Loading flashcards..." />;
  }

  if (error || !deck) {
    return (
      <ErrorPage
        title="Error loading flashcards"
        message={error || "Deck not found"}
      />
    );
  }

  if (isFinished) {
    const score = getScore();
    const stats = {
      easy: answers.filter((a) => a === "EASY").length,
      good: answers.filter((a) => a === "GOOD").length,
      hard: answers.filter((a) => a === "HARD").length,
      forgot: answers.filter((a) => a === "FORGOT").length,
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href={`/decks/${deckId}`}
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
              You reviewed {cards.length} cards from {deck.title}
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
              <Link href={`/decks/${deckId}`}>
                <Button>Done</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <ErrorPage
        title="No flashcards"
        message="This deck doesn't have any flashcards yet"
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/decks/${deckId}`}
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant={getLevelColor(deck.level) as any}>{deck.level}</Badge>
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
          <p className="font-medium text-neutral-200">{deck.title}</p>
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
                  {currentCard.front.label}
                </Badge>
                <h2 className="text-4xl font-heading font-semibold text-neutral-200 mb-2">
                  {currentCard.front.primaryText}
                </h2>
                {currentCard.front.secondaryText && (
                  <p className="text-xl text-neutral-400 mb-4">
                    {currentCard.front.secondaryText}
                  </p>
                )}
                {currentCard.audioUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(currentCard.audioUrl);
                    }}
                    className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center hover:bg-yellow-500/20 transition-colors mb-4"
                  >
                    <Volume2 className="w-5 h-5 text-yellow-500" />
                  </button>
                )}
                <p className="text-sm text-neutral-400">Tap to reveal meaning</p>
              </>
            ) : (
              <>
                <Badge variant="green" className="mb-4">
                  {currentCard.back.label}
                </Badge>
                <h2 className="text-2xl font-heading font-semibold text-neutral-200 mb-4">
                  {currentCard.back.primaryText}
                </h2>
                {currentCard.back.secondaryText && (
                  <p className="text-lg text-neutral-400 mb-4">
                    {currentCard.back.secondaryText}
                  </p>
                )}
                {currentCard.exampleSentence && (
                  <div className="mt-4 p-4 bg-neutral-900 border border-neutral-700 rounded-lg w-full">
                    <p className="text-neutral-200 mb-1">
                      {currentCard.exampleSentence}
                    </p>
                    {currentCard.exampleMeaning && (
                      <p className="text-sm text-neutral-400">
                        {currentCard.exampleMeaning}
                      </p>
                    )}
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
              onClick={() => handleAnswer("FORGOT")}
              disabled={isSubmitting}
            >
              <X className="w-5 h-5 text-red-500 mb-1" />
              <span className="text-xs">Forgot</span>
            </Button>
            <Button
              variant="secondary"
              className="flex-col h-auto py-3 border-yellow-500/30 hover:border-yellow-500"
              onClick={() => handleAnswer("HARD")}
              disabled={isSubmitting}
            >
              <Lightbulb className="w-5 h-5 text-yellow-500 mb-1" />
              <span className="text-xs">Hard</span>
            </Button>
            <Button
              variant="secondary"
              className="flex-col h-auto py-3 border-blue-500/30 hover:border-blue-500"
              onClick={() => handleAnswer("GOOD")}
              disabled={isSubmitting}
            >
              <Check className="w-5 h-5 text-blue-500 mb-1" />
              <span className="text-xs">Good</span>
            </Button>
            <Button
              variant="secondary"
              className="flex-col h-auto py-3 border-green-500/30 hover:border-green-500"
              onClick={() => handleAnswer("EASY")}
              disabled={isSubmitting}
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
