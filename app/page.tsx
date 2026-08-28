'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { UploadAndTopicSection } from '@/components/UploadAndTopicSection';
import { AITutorView } from '@/components/AITutorView';
import { ExamPatternConfig } from '@/components/ExamPatternConfig';
import { QuizArena } from '@/components/QuizArena';
import { FlashcardsView } from '@/components/FlashcardsView';
import { StudyNotesView } from '@/components/StudyNotesView';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { StudyMaterial, Quiz, ApiSettings } from '@/lib/types';
import { storage } from '@/lib/storage';
import { BookOpen, Sparkles, Trophy, HelpCircle, Layers, FileText, ArrowRight } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'hub' | 'tutor' | 'exam_config' | 'quiz' | 'flashcards' | 'notes'>('hub');
  const [currentMaterial, setCurrentMaterial] = useState<StudyMaterial | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<StudyMaterial[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Initialize state from storage
  useEffect(() => {
    setMounted(true);
    const mat = storage.getCurrentMaterial();
    if (mat) {
      setCurrentMaterial(mat);
    }
    setRecentMaterials(storage.getAllMaterials());
    const quiz = storage.getActiveQuiz();
    if (quiz) {
      setActiveQuiz(quiz);
    }
  }, []);

  // Sync theme class on <html>
  useEffect(() => {
    if (!mounted) return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, mounted]);

  const handleMaterialReady = (material: StudyMaterial) => {
    setCurrentMaterial(material);
    setRecentMaterials(storage.getAllMaterials());
    setActiveTab('tutor');
  };

  const handleSelectRecent = (material: StudyMaterial) => {
    setCurrentMaterial(material);
    storage.setCurrentMaterial(material);
    setActiveTab('tutor');
  };

  const handleQuizReady = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setActiveTab('quiz');
  };

  const handleAskTutorAboutMistakes = (weakAreas: string[]) => {
    setActiveTab('tutor');
  };

  const handleNewTopic = () => {
    setActiveTab('hub');
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentMaterial={currentMaterial}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onNewTopic={handleNewTopic}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        hasActiveQuiz={!!activeQuiz}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* VIEW 1: STUDY HUB (Upload / Enter Topic) */}
        {activeTab === 'hub' && (
          <UploadAndTopicSection
            onMaterialReady={handleMaterialReady}
            recentMaterials={recentMaterials}
            onSelectRecent={handleSelectRecent}
          />
        )}

        {/* VIEW 2: AI TUTOR */}
        {activeTab === 'tutor' && (
          currentMaterial ? (
            <AITutorView
              material={currentMaterial}
              onNavigateToQuiz={() => setActiveTab('exam_config')}
              onNavigateToFlashcards={() => setActiveTab('flashcards')}
            />
          ) : (
            <NoMaterialNotice onGoToHub={() => setActiveTab('hub')} />
          )
        )}

        {/* VIEW 3: EXAM PATTERN CONFIG */}
        {activeTab === 'exam_config' && (
          currentMaterial ? (
            <ExamPatternConfig
              material={currentMaterial}
              onQuizReady={handleQuizReady}
            />
          ) : (
            <NoMaterialNotice onGoToHub={() => setActiveTab('hub')} />
          )
        )}

        {/* VIEW 4: LIVE QUIZ ARENA */}
        {activeTab === 'quiz' && (
          activeQuiz ? (
            <QuizArena
              quiz={activeQuiz}
              onRetake={() => {
                setActiveQuiz({ ...activeQuiz, id: `quiz_${Date.now()}` });
              }}
              onNewPattern={() => setActiveTab('exam_config')}
              onAskTutorAboutMistakes={handleAskTutorAboutMistakes}
              onStudyFlashcards={() => setActiveTab('flashcards')}
            />
          ) : (
            <div className="max-w-md mx-auto py-20 text-center space-y-4">
              <Trophy className="h-12 w-12 text-brand-500 mx-auto" />
              <h3 className="text-lg font-bold">No Active Exam Found</h3>
              <p className="text-xs text-slate-500">
                Configure your exam pattern to generate custom test questions!
              </p>
              <button
                onClick={() => setActiveTab(currentMaterial ? 'exam_config' : 'hub')}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                Configure Exam Pattern
              </button>
            </div>
          )
        )}

        {/* VIEW 5: FLASHCARDS */}
        {activeTab === 'flashcards' && (
          currentMaterial ? (
            <FlashcardsView
              material={currentMaterial}
              onNavigateToTutor={() => setActiveTab('tutor')}
              onNavigateToQuiz={() => setActiveTab('exam_config')}
            />
          ) : (
            <NoMaterialNotice onGoToHub={() => setActiveTab('hub')} />
          )
        )}

        {/* VIEW 6: STUDY NOTES */}
        {activeTab === 'notes' && (
          currentMaterial ? (
            <StudyNotesView
              material={currentMaterial}
              onNavigateToQuiz={() => setActiveTab('exam_config')}
              onNavigateToTutor={() => setActiveTab('tutor')}
            />
          ) : (
            <NoMaterialNotice onGoToHub={() => setActiveTab('hub')} />
          )
        )}

      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaved={(settings) => {}}
      />

    </div>
  );
}

// Fallback Notice when no material has been uploaded or chosen yet
function NoMaterialNotice({ onGoToHub }: { onGoToHub: () => void }) {
  return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-4">
      <div className="h-16 w-16 mx-auto rounded-3xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-lg">
        <BookOpen className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
        No Study Material Selected Yet
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        Please upload your lecture slides or pick any study topic to activate your AI tutor and custom exam generator!
      </p>
      <button
        onClick={onGoToHub}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
      >
        <span>Upload Slides or Pick Topic</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
