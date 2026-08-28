'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Shuffle, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  BookOpen,
  Loader2,
  Trophy
} from 'lucide-react';
import { StudyMaterial, Flashcard } from '@/lib/types';
import { generateFlashcards } from '@/lib/gemini';
import { storage } from '@/lib/storage';
import { KaTeXRenderer } from './KaTeXRenderer';

interface FlashcardsViewProps {
  material: StudyMaterial;
  onNavigateToTutor: () => void;
  onNavigateToQuiz: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  material,
  onNavigateToTutor,
  onNavigateToQuiz
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing flashcards or generate new deck
  useEffect(() => {
    const loadDeck = async () => {
      const saved = storage.getFlashcards();
      if (saved && saved.length > 0) {
        setFlashcards(saved);
      } else {
        setIsLoading(true);
        try {
          const generated = await generateFlashcards(material);
          setFlashcards(generated);
          storage.saveFlashcards(generated);
        } catch (e) {
          console.error("Error loading flashcards:", e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadDeck();
  }, [material.id, material.title]);

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const markCard = (status: 'learning' | 'mastered') => {
    if (!currentCard) return;
    const updated = flashcards.map((fc, i) =>
      i === currentIndex ? { ...fc, masteryLevel: status } : fc
    );
    setFlashcards(updated);
    storage.saveFlashcards(updated);
    handleNext();
  };

  const shuffleDeck = () => {
    setIsFlipped(false);
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    setIsFlipped(false);
    try {
      const generated = await generateFlashcards(material, 10);
      setFlashcards(generated);
      storage.saveFlashcards(generated);
      setCurrentIndex(0);
    } catch (e) {
      console.error("Error regenerating flashcards:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const masteredCount = flashcards.filter((f) => f.masteryLevel === 'mastered').length;
  const learningCount = flashcards.filter((f) => f.masteryLevel === 'learning').length;

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          AI is generating high-yield study flashcards...
        </h3>
        <p className="text-xs text-slate-500">
          Synthesizing key formulas, exam traps, and core definitions for active recall.
        </p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Layers className="h-12 w-12 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold">No flashcards found for this topic</h3>
        <button
          onClick={handleRegenerate}
          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
        >
          Generate Deck
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">
            <Layers className="h-4 w-4" />
            <span>Active Recall Deck</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-md">
            {material.title}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={shuffleDeck}
            title="Shuffle Cards"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
          >
            <Shuffle className="h-4 w-4" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <button
            onClick={handleRegenerate}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
          >
            <Sparkles className="h-4 w-4 text-accent-500" />
            <span className="hidden sm:inline">Refresh Deck</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs font-semibold">
        <div className="flex items-center gap-3">
          <span className="text-slate-600 dark:text-slate-300">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          {currentCard?.category && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold">
              {currentCard.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-600 dark:text-emerald-400">
            ✓ Mastered: {masteredCount}
          </span>
          <span className="text-amber-600 dark:text-amber-400">
            ⏳ Learning: {learningCount}
          </span>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 sm:h-96 rounded-3xl cursor-pointer perspective-1000 group relative transition-all"
      >
        <div
          className={`w-full h-full rounded-3xl p-8 sm:p-12 shadow-xl border flex flex-col justify-between transition-all duration-500 transform-style-3d ${
            isFlipped
              ? 'bg-gradient-to-br from-brand-900 via-slate-900 to-indigo-950 text-white border-brand-700 shadow-brand-500/10'
              : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-brand-400'
          }`}
        >
          {/* Card Top Pill */}
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold px-3 py-1 rounded-full ${
              isFlipped ? 'bg-white/20 text-brand-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              {isFlipped ? 'Answer & Explanation' : 'Question / Concept'}
            </span>

            <span className={`text-[11px] flex items-center gap-1 font-medium ${isFlipped ? 'text-brand-300' : 'text-slate-400'}`}>
              <RotateCw className="h-3.5 w-3.5" />
              <span>Click card to flip</span>
            </span>
          </div>

          {/* Card Body Text */}
          <div className="text-center my-auto overflow-y-auto max-h-48 py-2">
            <div className={`font-bold leading-relaxed ${isFlipped ? 'text-sm sm:text-base text-brand-50' : 'text-base sm:text-lg text-slate-900 dark:text-white'}`}>
              <KaTeXRenderer content={isFlipped ? currentCard.back : currentCard.front} />
            </div>
          </div>

          {/* Card Footer Status */}
          <div className="flex items-center justify-between text-[11px] pt-4 border-t border-slate-200/40 dark:border-slate-800">
            <span className="opacity-60 font-mono">#{currentCard.id}</span>
            <span className={`font-semibold capitalize ${
              currentCard.masteryLevel === 'mastered' ? 'text-emerald-500 font-bold' : 'text-slate-400'
            }`}>
              Status: {currentCard.masteryLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation & Spaced Repetition Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrev}
          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => markCard('learning')}
            className="px-5 py-3 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 transition-all flex items-center gap-2"
          >
            <XCircle className="h-4 w-4 text-amber-600" />
            <span>Still Learning</span>
          </button>

          <button
            onClick={() => markCard('mastered')}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Got It! (Mastered)</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom Shortcuts */}
      <div className="flex justify-center gap-4 pt-4 text-xs font-semibold text-brand-600 dark:text-brand-400">
        <button onClick={onNavigateToTutor} className="hover:underline flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          <span>Ask AI Tutor About This Deck</span>
        </button>
        <span>•</span>
        <button onClick={onNavigateToQuiz} className="hover:underline flex items-center gap-1">
          <Trophy className="h-4 w-4" />
          <span>Take Quiz on This Topic</span>
        </button>
      </div>

    </div>
  );
};
