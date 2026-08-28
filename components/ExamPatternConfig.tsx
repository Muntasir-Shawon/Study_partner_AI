'use client';

import React, { useState } from 'react';
import { 
  Settings2, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  ShieldAlert, 
  CheckSquare, 
  Sliders, 
  ArrowRight, 
  Loader2,
  BookOpen,
  Award,
  Zap,
  Target
} from 'lucide-react';
import { StudyMaterial, QuestionPattern, QuestionType, ExamPreset, DifficultyLevel, Quiz } from '@/lib/types';
import { EXAM_PRESETS } from '@/lib/presets';
import { generateQuizQuestions } from '@/lib/gemini';
import { storage } from '@/lib/storage';

interface ExamPatternConfigProps {
  material: StudyMaterial;
  onQuizReady: (quiz: Quiz) => void;
}

export const ExamPatternConfig: React.FC<ExamPatternConfigProps> = ({
  material,
  onQuizReady
}) => {
  const [selectedPreset, setSelectedPreset] = useState<ExamPreset>('university');
  const [patternName, setPatternName] = useState('University Midterm Pattern');
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['mcq', 'true_false']);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [totalQuestions, setTotalQuestions] = useState<number>(5);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(10);
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);
  const [negativeMarkValue, setNegativeMarkValue] = useState<number>(0.25);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Apply Preset
  const handleSelectPreset = (presetKey: ExamPreset) => {
    setSelectedPreset(presetKey);
    const preset = EXAM_PRESETS[presetKey];
    if (preset) {
      if (preset.name) setPatternName(preset.name);
      if (preset.questionTypes) setQuestionTypes(preset.questionTypes);
      if (preset.difficulty) setDifficulty(preset.difficulty);
      if (preset.totalQuestions) setTotalQuestions(preset.totalQuestions);
      if (preset.timeLimitMinutes !== undefined) setTimeLimitMinutes(preset.timeLimitMinutes);
      if (preset.negativeMarking !== undefined) setNegativeMarking(preset.negativeMarking);
      if (preset.negativeMarkValue !== undefined) setNegativeMarkValue(preset.negativeMarkValue);
      if (preset.customInstructions) setCustomInstructions(preset.customInstructions);
    }
  };

  const toggleQuestionType = (type: QuestionType) => {
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) {
        setQuestionTypes(questionTypes.filter((t) => t !== type));
      }
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const handleGenerateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const pattern: QuestionPattern = {
        id: `pat_${Date.now()}`,
        name: patternName,
        examPreset: selectedPreset,
        questionTypes,
        difficulty,
        totalQuestions,
        timeLimitMinutes,
        negativeMarking,
        negativeMarkValue: negativeMarking ? negativeMarkValue : 0,
        customInstructions
      };

      const questions = await generateQuizQuestions(material, pattern);

      const quiz: Quiz = {
        id: `quiz_${Date.now()}`,
        title: `${material.title} - ${patternName}`,
        topic: material.title,
        pattern,
        questions,
        createdAt: new Date().toISOString()
      };

      storage.setActiveQuiz(quiz);
      onQuizReady(quiz);
    } catch (err: any) {
      console.error("Error generating quiz:", err);
      alert(`Could not generate quiz: ${err.message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Exam Pattern & Question Generator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the exact question structure, timer, and difficulty for <span className="font-semibold text-slate-700 dark:text-slate-300">"{material.title}"</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <BookOpen className="h-3.5 w-3.5 text-brand-500" />
          <span>{material.keyConcepts.length} Topics Ready</span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleGenerateExam} className="space-y-6">
        
        {/* 1. Exam Presets */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Target className="h-4 w-4 text-brand-500" />
            <span>Step 1: Choose Exam Preset or Custom Format</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'university', label: 'University Final / Midterm', desc: 'MCQ & Conceptual Problem solving' },
              { key: 'bcs', label: 'BCS & Civil Services', desc: 'Fast MCQs with negative marking' },
              { key: 'sat', label: 'SAT / College Board', desc: 'Standardized analytical 4-choice' },
              { key: 'ap', label: 'AP Exam Standard', desc: 'Advanced Placement college-level' },
              { key: 'gre', label: 'GRE / Grad Assessment', desc: 'Multi-select & quantitative logic' },
              { key: 'highschool', label: 'Quick Chapter Quiz', desc: 'Foundational 5 questions' },
            ].map((item) => (
              <button
                type="button"
                key={item.key}
                onClick={() => handleSelectPreset(item.key as ExamPreset)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedPreset === item.key
                    ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 shadow-sm ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{item.label}</span>
                  {selectedPreset === item.key && (
                    <span className="h-2 w-2 rounded-full bg-brand-600"></span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Detailed Custom Pattern Settings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sliders className="h-4 w-4 text-brand-500" />
            <span>Step 2: Customize Question Formats & Rules</span>
          </label>

          {/* Question Formats Checkboxes */}
          <div>
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Include Question Formats:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { type: 'mcq' as QuestionType, label: 'Multiple Choice (4 Options)', desc: 'Standard single-choice questions with trap analysis' },
                { type: 'true_false' as QuestionType, label: 'True / False Statements', desc: 'Conceptual validity tests' },
                { type: 'multi_select' as QuestionType, label: 'Multi-Select (Choose all that apply)', desc: 'Tests deeper mastery with multiple right choices' },
                { type: 'short_answer' as QuestionType, label: 'Short Conceptual Question', desc: 'Free-form answer with model answer scoring criteria' },
                { type: 'math_derivation' as QuestionType, label: 'Math / Formula Derivations', desc: 'Quantitative questions with step-by-step resolution' },
              ].map((fmt) => {
                const checked = questionTypes.includes(fmt.type);
                return (
                  <div
                    key={fmt.type}
                    onClick={() => toggleQuestionType(fmt.type)}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      checked
                        ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {fmt.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {fmt.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty & Question Count */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              >
                <option value="easy">🟢 Easy (Foundational & Definitions)</option>
                <option value="medium">🟡 Medium (Standard Exam Level)</option>
                <option value="hard">🔴 Hard (Advanced & Analytical)</option>
                <option value="adaptive">⚡ Adaptive (Gradually Increases)</option>
              </select>
            </div>

            {/* Total Questions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Number of Questions</span>
                <span className="font-bold text-brand-600">{totalQuestions} Qs</span>
              </label>
              <input
                type="range"
                min={3}
                max={20}
                step={1}
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>3 Qs (Quick)</span>
                <span>10 Qs</span>
                <span>20 Qs (Full)</span>
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>Time Limit</span>
              </label>
              <select
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              >
                <option value={0}>♾️ Untimed / Practice at own pace</option>
                <option value={5}>⏱️ 5 Minutes (Blitz)</option>
                <option value={10}>⏱️ 10 Minutes</option>
                <option value={15}>⏱️ 15 Minutes</option>
                <option value={20}>⏱️ 20 Minutes</option>
                <option value={30}>⏱️ 30 Minutes</option>
              </select>
            </div>
          </div>

          {/* Negative Marking Configuration */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Negative Marking Penalty
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Deduct points for incorrect guesses (simulates real competitive exams like BCS/SAT)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {negativeMarking && (
                <select
                  value={negativeMarkValue}
                  onChange={(e) => setNegativeMarkValue(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value={0.25}>-0.25 mark per error</option>
                  <option value={0.5}>-0.50 mark per error</option>
                  <option value={1}>-1.00 mark per error</option>
                </select>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>
          </div>

          {/* Custom Exam Prompt / Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Specific Question Pattern Instructions (Optional)</span>
              <span className="text-[11px] text-slate-400">Add any custom pattern prompt</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 'Focus 60% of questions on Slide 3 process states and include 1 question on edge boundary conditions'..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition-all disabled:opacity-50 group"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Synthesizing Custom Exam Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Generate Exam & Enter Quiz Arena</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
