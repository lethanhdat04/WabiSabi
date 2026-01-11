"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Check, X, HelpCircle } from "lucide-react";
import { Card, CardContent, Button, Badge, Progress, Input } from "@/components/ui";
import { mockVocabularyItems } from "@/lib/mock-data";

interface Question {
  id: string;
  prompt: string;
  answer: string;
  hint: string;
  type: "meaning_to_japanese" | "japanese_to_meaning";
}

function generateQuestions(): Question[] {
  return mockVocabularyItems.slice(0, 5).map((item, index) => {
    const isJapaneseToMeaning = index % 2 === 0;
    return {
      id: item.id,
      prompt: isJapaneseToMeaning
        ? `What is the meaning of: ${item.japaneseWord} (${item.reading})`
        : `What is the Japanese word for: ${item.meaning}`,
      answer: isJapaneseToMeaning ? item.meaning : item.japaneseWord,
      hint: isJapaneseToMeaning
        ? item.meaning.charAt(0)
        : item.japaneseWord.charAt(0),
      type: isJapaneseToMeaning ? "japanese_to_meaning" : "meaning_to_japanese",
    };
  });
}

export default function FillInPage() {
  const [questions] = useState<Question[]>(generateQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const checkAnswer = () => {
    const correct =
      userAnswer.toLowerCase().trim() ===
      currentQuestion.answer.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    setAnswers([...answers, correct]);
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

  const resetPractice = () => {
    setCurrentIndex(0);
    setUserAnswer("");
    setShowResult(false);
    setShowHint(false);
    setAnswers([]);
    setIsFinished(false);
  };

  const getScore = () => {
    const correct = answers.filter(Boolean).length;
    return Math.round((correct / answers.length) * 100);
  };

  if (isFinished) {
    const score = getScore();
    const correctCount = answers.filter(Boolean).length;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Practice
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
              {score >= 80 ? "Excellent!" : score >= 60 ? "Good Job!" : "Keep Practicing!"}
            </h2>
            <p className="text-neutral-400 mb-6">
              You got {correctCount} out of {questions.length} correct
            </p>

            <div className="flex gap-2 justify-center mb-6">
              {answers.map((correct, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    correct ? "bg-green-500/10" : "bg-red-500/10"
                  }`}
                >
                  {correct ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={resetPractice}>
                <RotateCcw className="w-5 h-5" />
                Try Again
              </Button>
              <Link href="/practice">
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
          href="/practice"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <span className="text-sm text-neutral-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress */}
      <Progress value={progress} size="sm" />

      {/* Question Card */}
      <Card>
        <CardContent className="py-8">
          <Badge
            variant={
              currentQuestion.type === "japanese_to_meaning" ? "yellow" : "blue"
            }
            className="mb-4"
          >
            {currentQuestion.type === "japanese_to_meaning"
              ? "Japanese to Meaning"
              : "Meaning to Japanese"}
          </Badge>

          <h2 className="text-xl font-heading font-semibold text-neutral-200 mb-6">
            {currentQuestion.prompt}
          </h2>

          {!showResult ? (
            <div className="space-y-4">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && userAnswer.trim()) {
                    checkAnswer();
                  }
                }}
              />

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
                  isCorrect
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  <span
                    className={`font-medium ${
                      isCorrect ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </span>
                </div>
                {!isCorrect && (
                  <div className="text-sm">
                    <p className="text-neutral-400">Your answer: {userAnswer}</p>
                    <p className="text-neutral-200">
                      Correct answer: {currentQuestion.answer}
                    </p>
                  </div>
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
      <div className="flex justify-center gap-2">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < currentIndex
                ? answers[i]
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
