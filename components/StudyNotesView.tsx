'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Layers, 
  Sparkles, 
  Check, 
  Copy,
  BookOpen,
  ListOrdered,
  Sigma
} from 'lucide-react';
import { StudyMaterial } from '@/lib/types';
import { KaTeXRenderer } from './KaTeXRenderer';

interface StudyNotesViewProps {
  material: StudyMaterial;
  onNavigateToQuiz: () => void;
  onNavigateToTutor: () => void;
}

export const StudyNotesView: React.FC<StudyNotesViewProps> = ({
  material,
  onNavigateToQuiz,
  onNavigateToTutor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const handleExportMarkdown = () => {
    let md = `# ${material.title}\n\n`;
    md += `## Executive Summary\n${material.summary}\n\n`;
    md += `## Core Concepts\n${material.keyConcepts.map((c) => `- ${c}`).join('\n')}\n\n`;

    if (material.keyFormulas && material.keyFormulas.length > 0) {
      md += `## Key Formulas & Equations\n${material.keyFormulas.map((f) => `- ${f}`).join('\n')}\n\n`;
    }

    if (material.slides && material.slides.length > 0) {
      md += `## Slide-by-Slide Detailed Notes\n`;
      material.slides.forEach((s) => {
        md += `\n### Slide ${s.slideNumber}: ${s.title}\n${s.content}\n`;
        if (s.keyTakeaways) {
          md += `Key Takeaways:\n${s.keyTakeaways.map((k) => `* ${k}`).join('\n')}\n`;
        }
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${material.title.replace(/\s+/g, '_')}_StudyNotes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(`${material.title}\n\nSummary:\n${material.summary}\n\nConcepts:\n${material.keyConcepts.join('\n')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredConcepts = material.keyConcepts.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 print:p-0">
      
      {/* Header Actions */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">
            <FileText className="h-4 w-4" />
            <span>Master Study Notes & Cheat Sheet</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {material.title}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyNotes}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export .MD</span>
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-brand-500" />
          <span>Executive Chapter Summary</span>
        </h3>
        <KaTeXRenderer content={material.summary} className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed" />
      </div>

      {/* Key Formulas & Equations Sheet */}
      {material.keyFormulas && material.keyFormulas.length > 0 && (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-brand-950/30 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
            <Sigma className="h-4 w-4" />
            <span>Formulas & Governing Theorems Sheet</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {material.keyFormulas.map((formula, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
                <KaTeXRenderer content={formula} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Key Concepts Breakdown */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ListOrdered className="h-4 w-4 text-brand-500" />
            <span>Key Concepts & Principles ({material.keyConcepts.length})</span>
          </h3>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredConcepts.map((concept, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs leading-relaxed"
            >
              <KaTeXRenderer content={concept} className="text-slate-800 dark:text-slate-200 font-medium" />
            </div>
          ))}
        </div>
      </div>

      {/* Slide-by-Slide Outline (if slides present) */}
      {material.slides && material.slides.length > 0 && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-brand-500" />
            <span>Slide-by-Slide Breakdown ({material.slides.length} Slides)</span>
          </h3>

          <div className="space-y-4">
            {material.slides.map((s) => (
              <div
                key={s.slideNumber}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold px-2 py-0.5 rounded-md bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    Slide {s.slideNumber}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {s.title}
                  </span>
                </div>
                <KaTeXRenderer content={s.content} className="text-slate-700 dark:text-slate-300" />
                {s.keyTakeaways && s.keyTakeaways.length > 0 && (
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 pt-2 space-y-1">
                    {s.keyTakeaways.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
