'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  History, 
  Trash2,
  HelpCircle,
  FileCheck,
  Zap,
  Lightbulb
} from 'lucide-react';
import { StudyMaterial } from '@/lib/types';
import { extractTextFromFile } from '@/lib/pdfParser';
import { analyzeStudyMaterial } from '@/lib/gemini';
import { storage } from '@/lib/storage';
import { POPULAR_STUDY_TOPICS } from '@/lib/presets';

interface UploadAndTopicSectionProps {
  onMaterialReady: (material: StudyMaterial) => void;
  recentMaterials: StudyMaterial[];
  onSelectRecent: (material: StudyMaterial) => void;
}

export const UploadAndTopicSection: React.FC<UploadAndTopicSectionProps> = ({
  onMaterialReady,
  recentMaterials,
  onSelectRecent
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'topic'>('upload');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDetails, setTopicDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process File Upload
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadedFileName(file.name);
    setProcessingStep('Extracting text & slides from document...');

    try {
      const { text, pageCount, slideTitles } = await extractTextFromFile(file);
      setProcessingStep('AI is analyzing key concepts, formulas & chapter outlines...');

      const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const analysis = await analyzeStudyMaterial(title, text, 'slides');

      const material: StudyMaterial = {
        id: `mat_${Date.now()}`,
        title,
        type: 'slides',
        rawText: text,
        summary: analysis.summary,
        keyConcepts: analysis.keyConcepts,
        keyFormulas: analysis.keyFormulas || [],
        slides: analysis.slides || (slideTitles ? slideTitles.map((t, i) => ({
          slideNumber: i + 1,
          title: t,
          content: `Content of slide ${i + 1}`,
          keyTakeaways: [`Key takeaway from slide ${i + 1}`]
        })) : []),
        createdAt: new Date().toISOString()
      };

      storage.setCurrentMaterial(material);
      onMaterialReady(material);
    } catch (err: any) {
      console.error("Error processing document:", err);
      alert(`Could not process document: ${err.message || 'Please try uploading a text/markdown or standard PDF file.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Topic Input
  const handleTopicSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicTitle.trim()) return;

    setIsProcessing(true);
    setProcessingStep(`Curating comprehensive study material on "${topicTitle}"...`);

    try {
      const fullPrompt = `${topicTitle}\n\nFocus Areas / Specific Syllabus:\n${topicDetails}`;
      setProcessingStep('Structuring lecture modules, core formulas & key definitions...');

      const analysis = await analyzeStudyMaterial(topicTitle.trim(), fullPrompt, 'topic');

      const material: StudyMaterial = {
        id: `mat_${Date.now()}`,
        title: topicTitle.trim(),
        type: 'topic',
        rawText: fullPrompt,
        summary: analysis.summary,
        keyConcepts: analysis.keyConcepts,
        keyFormulas: analysis.keyFormulas || [],
        slides: analysis.slides || [],
        createdAt: new Date().toISOString()
      };

      storage.setCurrentMaterial(material);
      onMaterialReady(material);
    } catch (err: any) {
      console.error("Error generating topic material:", err);
      alert(`Error generating topic: ${err.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePickPopularTopic = (topic: { title: string; summary: string }) => {
    setTopicTitle(topic.title);
    setTopicDetails(topic.summary);
    setActiveTab('topic');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-accent-600 p-8 sm:p-10 text-white shadow-xl shadow-brand-500/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Adaptive Learning & Exam Simulator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
            Master Any Subject with Your Personal AI Study Partner
          </h1>
          <p className="text-sm sm:text-base text-brand-100 font-normal leading-relaxed">
            Upload your lecture slides, textbooks, or simply name any topic. Your AI partner will teach you step-by-step, explain complex formulas, and generate tailored quizzes matching your exact exam pattern.
          </p>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-20 -bottom-16 h-48 w-48 rounded-full bg-accent-400/20 blur-3xl pointer-events-none" />
      </div>

      {/* Main Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Upload Slides or Documents (PDF, PPTX, Text)</span>
          </button>

          <button
            onClick={() => setActiveTab('topic')}
            className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'topic'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Enter Any Topic or Syllabus</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {activeTab === 'upload' ? (
            <div className="space-y-6">
              
              {/* Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 scale-[0.99]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.pptx,.txt,.md,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-inner">
                  {isProcessing ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8" />
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {isProcessing ? 'Analyzing your study material...' : 'Click to upload or drag and drop your lecture slides'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Supports PDF lecture slides, PowerPoint (.pptx), Markdown notes (.md), and plain text (.txt)
                </p>

                {/* File format badges */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {['PDF Slides', 'PowerPoint', 'Markdown', 'Text Notes'].map((tag) => (
                    <span key={tag} className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <form onSubmit={handleTopicSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject or Topic Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems: Process Scheduling & Deadlocks"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Optional: Specific Syllabus / Subtopics / Notes</span>
                  <span className="text-[11px] text-slate-400 font-normal">Add key points or past exam focuses</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Include Round Robin, SJF, Priority scheduling, Banker's algorithm, and mutual exclusion conditions..."
                  value={topicDetails}
                  onChange={(e) => setTopicDetails(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isProcessing || !topicTitle.trim()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Study Hub...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Learning This Topic</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Processing status banner */}
          {isProcessing && (
            <div className="mt-6 p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800 flex items-center gap-3 animate-pulse">
              <Loader2 className="h-5 w-5 animate-spin text-brand-600 dark:text-brand-400 flex-shrink-0" />
              <div className="text-xs text-brand-900 dark:text-brand-200">
                <p className="font-semibold">{processingStep}</p>
                <p className="text-[11px] text-brand-600/80 dark:text-brand-400/80">
                  Building structured concept cards, key formulas, and exam question templates.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Popular Subjects 1-Click Starter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Popular Pre-Loaded Study Modules (1-Click Try)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {POPULAR_STUDY_TOPICS.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handlePickPopularTopic(item)}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-400 dark:hover:border-brand-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-2 inline-block">
                  {item.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {item.summary}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-brand-600 dark:text-brand-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Load Topic</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous Study Sessions / History */}
      {recentMaterials.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-brand-500" />
            <span>Recent Study Materials</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentMaterials.map((mat) => (
              <div
                key={mat.id}
                onClick={() => onSelectRecent(mat)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-400 dark:hover:border-brand-600 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex-shrink-0">
                    {mat.type === 'slides' ? <FileCheck className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {mat.title}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {mat.keyConcepts.length} concepts • {new Date(mat.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button className="px-3 py-1 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 group-hover:bg-brand-600 group-hover:text-white transition-colors flex-shrink-0">
                  Resume
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
