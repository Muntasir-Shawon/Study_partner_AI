'use client';

import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  MessageSquareCode, 
  HelpCircle, 
  Layers, 
  FileText, 
  Key, 
  Sparkles, 
  PlusCircle,
  Moon,
  Sun
} from 'lucide-react';
import { StudyMaterial } from '@/lib/types';

interface NavbarProps {
  activeTab: 'hub' | 'tutor' | 'exam_config' | 'quiz' | 'flashcards' | 'notes';
  setActiveTab: (tab: 'hub' | 'tutor' | 'exam_config' | 'quiz' | 'flashcards' | 'notes') => void;
  currentMaterial: StudyMaterial | null;
  onOpenApiKeyModal: () => void;
  onNewTopic: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  hasActiveQuiz: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentMaterial,
  onOpenApiKeyModal,
  onNewTopic,
  isDarkMode,
  setIsDarkMode,
  hasActiveQuiz
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('hub')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-500 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                  StudyPartner
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
                Smart Tutor & Custom Exam Simulator
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('hub')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'hub'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Study Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('tutor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'tutor'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquareCode className="h-3.5 w-3.5" />
              <span>AI Tutor</span>
            </button>

            <button
              onClick={() => setActiveTab('exam_config')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'exam_config'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Exam Pattern</span>
            </button>

            {hasActiveQuiz && (
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'quiz'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
                </span>
                <span>Quiz Arena</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Flashcards</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Study Notes</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2">
            
            {/* Active Material pill if selected */}
            {currentMaterial && (
              <div 
                onClick={() => setActiveTab('hub')}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 max-w-[200px] truncate cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title={currentMaterial.title}
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse"></div>
                <span className="truncate font-medium">{currentMaterial.title}</span>
              </div>
            )}

            {/* New Topic / Upload Button */}
            <button
              onClick={onNewTopic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 text-xs font-semibold border border-brand-200 dark:border-brand-800/80 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Topic</span>
            </button>

            {/* API Key / Settings Button */}
            <button
              onClick={onOpenApiKeyModal}
              title="API Key & AI Settings"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <Key className="h-4 w-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Theme"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-200 dark:border-slate-800 text-[11px] overflow-x-auto">
          <button onClick={() => setActiveTab('hub')} className={`px-2 py-1 rounded font-medium ${activeTab === 'hub' ? 'text-brand-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>Hub</button>
          <button onClick={() => setActiveTab('tutor')} className={`px-2 py-1 rounded font-medium ${activeTab === 'tutor' ? 'text-brand-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>Tutor</button>
          <button onClick={() => setActiveTab('exam_config')} className={`px-2 py-1 rounded font-medium ${activeTab === 'exam_config' ? 'text-brand-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>Pattern</button>
          {hasActiveQuiz && <button onClick={() => setActiveTab('quiz')} className={`px-2 py-1 rounded font-bold text-accent-500`}>Quiz</button>}
          <button onClick={() => setActiveTab('flashcards')} className={`px-2 py-1 rounded font-medium ${activeTab === 'flashcards' ? 'text-brand-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>Cards</button>
          <button onClick={() => setActiveTab('notes')} className={`px-2 py-1 rounded font-medium ${activeTab === 'notes' ? 'text-brand-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>Notes</button>
        </div>

      </div>
    </header>
  );
};
