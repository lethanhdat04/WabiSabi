"use client";

import { useState } from "react";
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
} from "@/components/ui";

interface QuizQuestion {
  id: string;
  type: "meaning_to_japanese" | "japanese_to_meaning" | "listening";
  prompt: string;
  answer: string;
  hint: string;
  japanese: string;
  reading: string;
}

const mockQuestions: QuizQuestion[] = [
  {
    id: "q1",
    type: "meaning_to_japanese",
    prompt: "To eat",
    answer: "食べる",
    hint: "た",
    japanese: "食べる",
    reading: "taberu",
  },
  {
    id: "q2",
    type: "japanese_to_meaning",
    prompt: "飲む (nomu)",
    answer: "To drink",
    hint: "T",
    japanese: "飲む",
    reading: "nomu",
  },
  {
    id: "q3",
    type: "listening",
    prompt: "Listen and type what you hear",
    answer: "大きい",
    hint: "お",
    japanese: "大きい",
    reading: "ookii",
  },
  {
    id: "q4",
    type: "meaning_to_japanese",
    prompt: "Today",
    answer: "今日",
    hint: "き",
    japanese: "今日",
    reading: "kyou",
  },
  {
    id: "q5",
    type: "japanese_to_meaning",
    prompt: "新しい (atarashii)",
    answer: "New",
    hint: "N",
    japanese: "新しい",
    reading: "atarashii",
  },
];

const mockDeckInfo = {
  id: "d1",
  name: "JLPT N5 Vocabulary",
  level: "N5",
};

interface QuizResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

export default function DeckQuizPage() {
  const params = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const questions = mockQuestions;
  const deck = mockDeckInfo;
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const checkAnswer = () => {
    const isCorrect =
      userAnswer.toLowerCase().trim() ===
      currentQuestion.answer.toLowerCase().trim();

    setResults([
      ...results,
      {
        questionId: currentQuestion.id,
        userAnswer: userAnswer,
        isCorrect,
      },
    ]);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowResult(false);
      setShowHint(false);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setUserAnswer("");
    setShowResult(false);
    setShowHint(false);
    setResults([]);
    setIsFinished(false);
  };

  const getScore = () => {
    const correct = results.filter((r) => r.isCorrect).length;
    return Math.round((correct / results.length) * 100);
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "meaning_to_japanese":
        return "Type in Japanese";
      case "japanese_to_meaning":
        return "Type the Meaning";
      case "listening":
        return "Listening";
      default:
        return "Quiz";
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "meaning_to_japanese":
        return "yellow";
      case "japanese_to_meaning":
        return "blue";
      case "listening":
        return "green";
      default:
        return "default";
    }
  };

  if (isFinished) {
    const score = getScore();
    const correctCount = results.filter((r) => r.isCorrect).length;

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
            <div className="space-y-2 mb-6 text-left">
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
                        {question.japanese} ({question.reading})
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
                          Correct: {question.answer}
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
              <Link href={`/decks/${params.deckId}`}>
                <Button>Done</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentResult = showResult
    ? results[results.length - 1]
    : null;

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
          <p className="font-medium text-neutral-200">{deck.name}</p>
          <p className="text-sm text-neutral-400">Vocabulary Quiz</p>
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardContent className="py-8">
          <Badge
            variant={getQuestionTypeColor(currentQuestion.type) as any}
            className="mb-4"
          >
            {getQuestionTypeLabel(currentQuestion.type)}
          </Badge>

          {currentQuestion.type === "listening" && (
            <div className="flex justify-center mb-6">
              <button className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center hover:bg-green-500/20 transition-colors">
                <Volume2 className="w-8 h-8 text-green-500" />
              </button>
            </div>
          )}

          <h2 className="text-xl font-heading font-semibold text-neutral-200 mb-6 text-center">
            {currentQuestion.type === "listening"
              ? "Listen and type what you hear"
              : currentQuestion.prompt}
          </h2>

          {!showResult ? (
            <div className="space-y-4">
              <div className="relative">
                <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={
                    currentQuestion.type === "meaning_to_japanese"
                      ? "Type in Japanese..."
                      : "Type your answer..."
                  }
                  className="pl-10 text-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && userAnswer.trim()) {
                      checkAnswer();
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200"
                  disabled={showHint}
                >
                  <HelpCircle className="w-4 h-4" />
                  {showHint
                    ? `Hint: starts with "${currentQuestion.hint}"`
                    : "Show hint"}
                </button>

                <Button onClick={checkAnswer} disabled={!userAnswer.trim()}>
                  Check Answer
                </Button>
              </div>
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
                      Your answer: {userAnswer}
                    </p>
                    <p className="text-neutral-200">
                      Correct answer: {currentQuestion.answer}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                <p className="text-lg text-neutral-200 mb-1">
                  {currentQuestion.japanese}
                </p>
                <p className="text-sm text-neutral-400">
                  {currentQuestion.reading}
                </p>
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
      <div className="flex justify-center gap-2">
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
