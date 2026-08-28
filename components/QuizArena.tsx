'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Flag, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  MessageSquareCode, 
  Award,
  BarChart3,
  Bookmark,
  Check,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Quiz, QuizQuestion, UserAnswer, QuizResult } from '@/lib/types';
import { storage } from '@/lib/storage';
import { KaTeXRenderer } from './KaTeXRenderer';

interface QuizArenaProps {
  quiz: Quiz;
  onRetake: () => void;
  onNewPattern: () => void;
  onAskTutorAboutMistakes: (weakAreas: string[]) => void;
  onStudyFlashcards: () => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({
  quiz,
  onRetake,
  onNewPattern,
  onAskTutorAboutMistakes,
  onStudyFlashcards
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [isExamMode, setIsExamMode] = useState<boolean>(true); // True = Exam Mode (all at end), False = Practice Mode (instant explanation)
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  // Timer
  const totalSeconds = (quiz.pattern.timeLimitMinutes || 0) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Current active question
  const currentQuestion: QuizQuestion | undefined = quiz.questions[currentQuestionIndex];

  // Initialize timer
  useEffect(() => {
    if (totalSeconds > 0 && !isSubmitted) {
      setSecondsRemaining(totalSeconds);
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz.id, totalSeconds]);

  // Handle Option Select
  const handleSelectOption = (optionStr: string) => {
    if (isSubmitted) return;
    if (!currentQuestion) return;

    // Check correctness
    // Normalize string: e.g. "A) text" or "A" or option string
    const normalizedSelected = optionStr.trim();
    const correctAns = currentQuestion.correctAnswer.trim();
    
    // Check if starts with same letter (A/B/C/D) or exact match
    const selectedLetter = normalizedSelected.match(/^([A-D])[\)\.]/i)?.[1]?.toUpperCase();
    const correctLetter = correctAns.match(/^([A-D])[\)\.]/i)?.[1]?.toUpperCase();

    const isCorrect = (selectedLetter && correctLetter) 
      ? selectedLetter === correctLetter 
      : normalizedSelected.toLowerCase() === correctAns.toLowerCase();

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedAnswer: optionStr,
        isCorrect,
        timeSpentSeconds: Math.round((Date.now() - startTimeRef.current) / 1000)
      }
    }));
  };

  // Toggle Flag for review
  const toggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const totalQuestions = quiz.questions.length;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const weakAreasMap: Record<string, number> = {};

    quiz.questions.forEach((q) => {
      const userAns = answers[q.id];
      if (!userAns || !userAns.selectedAnswer) {
        unansweredCount++;
        if (q.topicTag) weakAreasMap[q.topicTag] = (weakAreasMap[q.topicTag] || 0) + 1;
      } else if (userAns.isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
        if (q.topicTag) weakAreasMap[q.topicTag] = (weakAreasMap[q.topicTag] || 0) + 1;
      }
    });

    // Score calculation with negative marking
    let calculatedScore = correctCount * 1.0;
    if (quiz.pattern.negativeMarking && quiz.pattern.negativeMarkValue) {
      calculatedScore -= incorrectCount * quiz.pattern.negativeMarkValue;
    }
    calculatedScore = Math.max(0, calculatedScore);
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const weakAreas = Object.keys(weakAreasMap);
    const timeSpent = totalSeconds > 0 ? totalSeconds - secondsRemaining : Math.round((Date.now() - startTimeRef.current) / 1000);

    const finalResult: QuizResult = {
      id: `res_${Date.now()}`,
      quizId: quiz.id,
      topicTitle: quiz.topic,
      totalQuestions,
      correctCount,
      incorrectCount,
      unansweredCount,
      score: Number(calculatedScore.toFixed(2)),
      maxScore: totalQuestions,
      percentage,
      timeTakenSeconds: timeSpent,
      date: new Date().toISOString(),
      answers,
      weakAreas: weakAreas.length > 0 ? weakAreas : ["Review chapter summaries"],
      feedback: percentage >= 80 
        ? "Outstanding performance! You have mastered the core definitions, edge traps, and governing principles."
        : percentage >= 50 
        ? "Solid understanding! Focus on reviewing the weak topic areas and edge boundary conditions below."
        : "Keep practicing! Review the detailed explanations and use the AI Tutor to clarify tough concepts.",
      recommendedStudyTips: [
        "Review questions you flagged or got incorrect.",
        "Use the AI Tutor to ask: 'Why is this concept tested this way?'",
        "Flip through flashcards for active recall."
      ]
    };

    setResult(finalResult);
    setIsSubmitted(true);
    storage.saveQuizResult(finalResult);

    // Trigger celebration confetti
    if (percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- RESULT VIEW ---
  if (isSubmitted && result) {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fadeIn">
        
        {/* Top Score Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-accent-600 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
                <Trophy className="h-4 w-4 text-amber-300" />
                <span>Exam Completed!</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">{quiz.topic}</h2>
              <p className="text-xs sm:text-sm text-brand-100 max-w-md">
                {result.feedback}
              </p>
            </div>

            {/* Score Ring */}
            <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[160px]">
              <span className="text-4xl font-black">{result.percentage}%</span>
              <span className="text-xs font-semibold text-brand-200 mt-1">
                Score: {result.score} / {result.maxScore}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 mt-2">
                {result.percentage >= 80 ? '🌟 Mastery (A+)' : result.percentage >= 60 ? '👍 Proficient (B)' : '📖 Needs Practice'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.correctCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Correct Answers</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{result.incorrectCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Incorrect Answers</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center">
            <div className="text-2xl font-bold text-slate-600 dark:text-slate-300">{result.unansweredCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Unanswered</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{formatTime(result.timeTakenSeconds)}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Time Taken</div>
          </div>
        </div>

        {/* Weak Areas & Action Recommendations */}
        {result.weakAreas.length > 0 && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-brand-500" />
              <span>Target Revision & Weak Areas Identified</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {result.weakAreas.map((area, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold">
                  ⚠️ {area}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onAskTutorAboutMistakes(result.weakAreas)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
              >
                <MessageSquareCode className="h-4 w-4" />
                <span>Ask AI Tutor to Explain My Weak Areas</span>
              </button>

              <button
                onClick={onStudyFlashcards}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                <Layers className="h-4 w-4 text-accent-500" />
                <span>Practice Flashcards</span>
              </button>
            </div>
          </div>
        )}

        {/* Detailed Question by Question Solution Review */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Detailed Question Review & Explanations</span>
            <span className="text-xs font-semibold text-slate-400">({quiz.questions.length} Questions)</span>
          </h3>

          <div className="space-y-4">
            {quiz.questions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns?.isCorrect;
              const isAnswered = !!userAns?.selectedAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-3xl border shadow-sm transition-all ${
                    !isAnswered
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900'
                      : isCorrect
                      ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-rose-200 dark:border-rose-800/80 bg-rose-50/30 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Q{idx + 1}
                      </span>
                      {q.topicTag && (
                        <span className="text-[11px] font-semibold text-slate-500">
                          {q.topicTag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {!isAnswered ? (
                        <span className="text-slate-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" /> Skipped
                        </span>
                      ) : isCorrect ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Correct (+1)
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <XCircle className="h-4 w-4" /> Incorrect {quiz.pattern.negativeMarking ? `(-${quiz.pattern.negativeMarkValue})` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    <KaTeXRenderer content={q.questionText} />
                  </div>

                  {/* Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt, optIdx) => {
                        const isUserChoice = userAns?.selectedAnswer === opt;
                        const isCorrectChoice = opt.trim().startsWith(q.correctAnswer.trim().slice(0, 2)) || opt === q.correctAnswer;

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl text-xs font-medium border flex items-center justify-between ${
                              isCorrectChoice
                                ? 'border-emerald-500 bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold'
                                : isUserChoice
                                ? 'border-rose-400 bg-rose-100/60 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200'
                                : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 opacity-80'
                            }`}
                          >
                            <KaTeXRenderer content={opt} />
                            {isCorrectChoice && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                            {isUserChoice && !isCorrectChoice && <XCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Detailed Explanation & Trap Analysis */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                      <span>Explanation & Correct Concept:</span>
                    </div>
                    <KaTeXRenderer content={q.explanation} className="text-slate-700 dark:text-slate-300" />

                    {/* Why other options are wrong */}
                    {q.whyOthersAreWrong && Object.keys(q.whyOthersAreWrong).length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                          Why Other Choices are Traps:
                        </div>
                        {Object.entries(q.whyOthersAreWrong).map(([optLetter, reason]) => (
                          <div key={optLetter} className="text-[11px] text-slate-600 dark:text-slate-400">
                            <span className="font-bold text-slate-800 dark:text-slate-200">Option {optLetter}: </span>
                            {reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onRetake}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retake This Quiz</span>
          </button>

          <button
            onClick={onNewPattern}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-colors flex items-center gap-1.5"
          >
            <span>Configure Another Exam Pattern</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    );
  }

  // --- LIVE QUIZ ARENA VIEW ---
  if (!currentQuestion) return null;

  const currentAnswer = answers[currentQuestion.id];
  const isAnswered = !!currentAnswer?.selectedAnswer;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      
      {/* Quiz Top Header Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Topic & Progress */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
            Q{currentQuestionIndex + 1}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {quiz.topic}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {quiz.pattern.name} • {quiz.questions.length} Questions
            </p>
          </div>
        </div>

        {/* Right Timer & Mode Controls */}
        <div className="flex items-center gap-3">
          
          {/* Mode Switcher: Exam vs Practice */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setIsExamMode(true)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                isExamMode
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Exam Mode
            </button>
            <button
              onClick={() => setIsExamMode(false)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                !isExamMode
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Practice (Instant)
            </button>
          </div>

          {/* Countdown Timer (if configured) */}
          {totalSeconds > 0 && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
                secondsRemaining <= 120
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}

        </div>

      </div>

      {/* Question Palette / Navigation Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {quiz.questions.map((q, idx) => {
          const ans = answers[q.id];
          const isFlagged = flaggedQuestions[q.id];
          const isCurrent = currentQuestionIndex === idx;

          return (
            <button
              key={q.id}
              onClick={() => {
                setCurrentQuestionIndex(idx);
                setShowHint(false);
              }}
              className={`h-8 min-w-[2rem] px-2 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center ${
                isCurrent
                  ? 'bg-brand-600 text-white ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900 shadow-md'
                  : ans?.selectedAnswer
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{idx + 1}</span>
              {isFlagged && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        {/* Question Header & Meta */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            {currentQuestion.topicTag && (
              <span className="text-xs font-medium text-slate-500">
                {currentQuestion.topicTag}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Flag for Review */}
            <button
              onClick={() => toggleFlag(currentQuestion.id)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                flaggedQuestions[currentQuestion.id]
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Review</span>
            </button>

            {/* Hint Button */}
            {currentQuestion.hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 text-xs font-semibold flex items-center gap-1"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Hint</span>
              </button>
            )}
          </div>
        </div>

        {/* Question Text */}
        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
          <KaTeXRenderer content={currentQuestion.questionText} />
        </div>

        {/* Collapsible Hint */}
        {showHint && currentQuestion.hint && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5 animate-fadeIn">
            <HelpCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Hint: </span>
              {currentQuestion.hint}
            </div>
          </div>
        )}

        {/* Options List */}
        {currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="space-y-3">
            {currentQuestion.options.map((opt, optIdx) => {
              const isSelected = currentAnswer?.selectedAnswer === opt;
              const isPracticeRevealed = !isExamMode && isAnswered;
              const isCorrectOpt = opt.trim().startsWith(currentQuestion.correctAnswer.trim().slice(0, 2)) || opt === currentQuestion.correctAnswer;

              let style = 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 text-slate-800 dark:text-slate-200 hover:border-brand-400 dark:hover:border-brand-600';
              if (isSelected) {
                style = 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/60 text-brand-900 dark:text-brand-100 ring-2 ring-brand-500/20 font-bold';
              }

              if (isPracticeRevealed) {
                if (isCorrectOpt) {
                  style = 'border-emerald-500 bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 font-bold';
                } else if (isSelected && !isCorrectOpt) {
                  style = 'border-rose-500 bg-rose-100/70 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100';
                }
              }

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 text-sm font-medium ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <KaTeXRenderer content={opt} />
                  </div>

                  {isSelected && <Check className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}

        {/* Practice Mode Instant Explanation Box */}
        {!isExamMode && isAnswered && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs animate-fadeIn">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <span>Instant Solution & Explanation:</span>
            </div>
            <KaTeXRenderer content={currentQuestion.explanation} className="text-slate-700 dark:text-slate-300" />
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-3">
          <button
            onClick={() => {
              setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
              setShowHint(false);
            }}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              onClick={() => {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setShowHint(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-colors flex items-center gap-1.5"
            >
              <span>Next Question</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5"
            >
              <Trophy className="h-4 w-4" />
              <span>Submit & View Results</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
