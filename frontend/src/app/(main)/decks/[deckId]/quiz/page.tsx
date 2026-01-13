"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Check,
  X,
  HelpCircle,
  Volume2,
  Layers,
  Keyboard,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
  Input,
  LoadingPage,
  ErrorPage,
} from "@/components/ui";
import {
  deckApi,
  practiceApi,
  VocabularyDeck,
  FillInQuestion,
} from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { getLevelColor } from "@/lib/hooks";

interface QuizResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  feedback: string;
}

export default function DeckQuizPage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const { refreshUser } = useAuth();

  const [deck, setDeck] = useState<VocabularyDeck | null>(null);
  const [questions, setQuestions] = useState<FillInQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!deckId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [deckData, questionsData] = await Promise.all([
          deckApi.getSummary(deckId),
          practiceApi.getFillInQuestions({
            deckId,
            itemCount: 10,
          }),
        ]);

        setDeck(deckData);
        setQuestions(questionsData);

        if (questionsData.length === 0) {
          setError("No quiz questions available in this deck");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [deckId]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Accept optional answer parameter for multiple choice (fixes React async state issue)
  const checkAnswer = async (selectedAnswer?: string) => {
    if (!currentQuestion || isSubmitting) return;

    const answerToSubmit = selectedAnswer ?? userAnswer;
    if (!answerToSubmit.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await practiceApi.submitFillInAnswer({
        deckId,
        sectionIndex: currentQuestion.sectionIndex,
        itemIndex: currentQuestion.itemIndex,
        userAnswer: answerToSubmit.trim(),
        questionType: currentQuestion.questionType,
      });

      const result: QuizResult = {
        questionId: currentQuestion.questionId,
        userAnswer: answerToSubmit.trim(),
        isCorrect: response.isCorrect,
        correctAnswer: response.correctAnswer,
        feedback: response.feedback,
      };

      setUserAnswer(answerToSubmit);
      setCurrentResult(result);
      setResults([...results, result]);
      setShowResult(true);
      // Refresh user data to update progress in UI
      refreshUser?.();
    } catch (err) {
      console.error("Failed to submit answer:", err);
      // Show error when API fails - we don't have the correct answer locally
      const result: QuizResult = {
        questionId: currentQuestion.questionId,
        userAnswer: answerToSubmit.trim(),
        isCorrect: false,
        correctAnswer: "(Unable to verify - please try again)",
        feedback: "Connection error. Please check your internet and try again.",
      };

      setCurrentResult(result);
      setResults([...results, result]);
      setShowResult(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowResult(false);
      setShowHint(false);
      setCurrentResult(null);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = async () => {
    setIsLoading(true);
    try {
      const questionsData = await practiceApi.getFillInQuestions({
        deckId,
        itemCount: 10,
      });
      setQuestions(questionsData);
      setCurrentIndex(0);
      setUserAnswer("");
      setShowResult(false);
      setShowHint(false);
      setResults([]);
      setIsFinished(false);
      setCurrentResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reload quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const getScore = () => {
    if (results.length === 0) return 0;
    const correct = results.filter((r) => r.isCorrect).length;
    return Math.round((correct / results.length) * 100);
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "MEANING_TO_JAPANESE":
        return "Type in Japanese";
      case "JAPANESE_TO_MEANING":
        return "Type the Meaning";
      case "READING_TO_JAPANESE":
        return "Type the Kanji";
      case "JAPANESE_TO_READING":
        return "Type the Reading";
      default:
        return "Quiz";
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "MEANING_TO_JAPANESE":
        return "yellow";
      case "JAPANESE_TO_MEANING":
        return "blue";
      case "READING_TO_JAPANESE":
        return "green";
      case "JAPANESE_TO_READING":
        return "default";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return <LoadingPage message="Loading quiz..." />;
  }

  if (error || !deck) {
    return (
      <ErrorPage
        title="Error loading quiz"
        message={error || "Deck not found"}
      />
    );
  }

  if (isFinished) {
    const score = getScore();
    const correctCount = results.filter((r) => r.isCorrect).length;

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
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                score >= 80
                  ? "bg-green-500/10"
                  : score >= 60
                  ? "bg-yellow-500/10"
                  : "bg-red-500/10"
              }`}
            >
              <span
                className={`text-3xl font-heading font-semibold ${
                  score >= 80
                    ? "text-green-500"
                    : score >= 60
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {score}%
              </span>
            </div>
            <h2 className="text-2xl font-heading font-semibold text-neutral-200 mb-2">
              {score >= 80
                ? "Excellent!"
                : score >= 60
                ? "Good Job!"
                : "Keep Practicing!"}
            </h2>
            <p className="text-neutral-400 mb-6">
              You got {correctCount} out of {questions.length} correct
            </p>

            {/* Results breakdown */}
            <div className="space-y-2 mb-6 text-left max-h-64 overflow-y-auto">
              {results.map((result, i) => {
                const question = questions[i];
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border ${
                      result.isCorrect
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-neutral-400">
                        {question?.prompt}
                      </span>
                      {result.isCorrect ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    {!result.isCorrect && (
                      <div className="text-sm">
                        <p className="text-neutral-400">
                          Your answer: {result.userAnswer || "(empty)"}
                        </p>
                        <p className="text-neutral-200">
                          Correct: {result.correctAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={resetQuiz}>
                <RotateCcw className="w-5 h-5" />
                Try Again
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

  if (!currentQuestion) {
    return (
      <ErrorPage
        title="No questions"
        message="This deck doesn't have any quiz questions yet"
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
            {currentIndex + 1} / {questions.length}
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
          <p className="text-sm text-neutral-400">Vocabulary Quiz</p>
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardContent className="py-8">
          <Badge
            variant={getQuestionTypeColor(currentQuestion.questionType) as any}
            className="mb-4"
          >
            {getQuestionTypeLabel(currentQuestion.questionType)}
          </Badge>

          <h2 className="text-xl font-heading font-semibold text-neutral-200 mb-6 text-center">
            {currentQuestion.prompt}
          </h2>

          {!showResult ? (
            <div className="space-y-4">
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                // Multiple choice - pass answer directly to avoid React state async issue
                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.options.map((option, idx) => (
                    <Button
                      key={idx}
                      variant="secondary"
                      className="h-auto py-4 text-left justify-start"
                      onClick={() => checkAnswer(option)}
                      disabled={isSubmitting}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              ) : (
                // Free form input
                <>
                  <div className="relative">
                    <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={
                        currentQuestion.questionType === "MEANING_TO_JAPANESE" ||
                        currentQuestion.questionType === "READING_TO_JAPANESE"
                          ? "Type in Japanese..."
                          : "Type your answer..."
                      }
                      className="pl-10 text-lg"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && userAnswer.trim()) {
                          checkAnswer();
                        }
                      }}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowHint(true)}
                      className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200"
                      disabled={showHint}
                    >
                      <HelpCircle className="w-4 h-4" />
                      {showHint && currentQuestion.hint
                        ? `Hint: starts with "${currentQuestion.hint}"`
                        : "Show hint"}
                    </button>

                    <Button
                      onClick={() => checkAnswer()}
                      disabled={!userAnswer.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Checking..." : "Check Answer"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg border ${
                  currentResult?.isCorrect
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {currentResult?.isCorrect ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  <span
                    className={`font-medium ${
                      currentResult?.isCorrect
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {currentResult?.isCorrect ? "Correct!" : "Incorrect"}
                  </span>
                </div>
                {!currentResult?.isCorrect && (
                  <div className="text-sm">
                    <p className="text-neutral-400">
                      Your answer: {currentResult?.userAnswer || "(empty)"}
                    </p>
                    <p className="text-neutral-200">
                      Correct answer: {currentResult?.correctAnswer}
                    </p>
                  </div>
                )}
                {currentResult?.feedback && (
                  <p className="text-sm text-neutral-400 mt-2">
                    {currentResult.feedback}
                  </p>
                )}
              </div>

              <Button onClick={nextQuestion} className="w-full">
                {currentIndex < questions.length - 1
                  ? "Next Question"
                  : "See Results"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress indicators */}
      <div className="flex justify-center gap-2 flex-wrap">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < results.length
                ? results[i]?.isCorrect
                  ? "bg-green-500"
                  : "bg-red-500"
                : i === currentIndex
                ? "bg-yellow-500"
                : "bg-neutral-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
