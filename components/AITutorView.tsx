'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Lightbulb, 
  AlertTriangle, 
  ListOrdered, 
  Layers, 
  HelpCircle, 
  RefreshCw,
  BookOpen,
  User,
  Bot,
  ArrowUpRight
} from 'lucide-react';
import { StudyMaterial, ChatMessage, TutorPersona } from '@/lib/types';
import { chatWithAITutor } from '@/lib/gemini';
import { storage } from '@/lib/storage';
import { KaTeXRenderer } from './KaTeXRenderer';

interface AITutorViewProps {
  material: StudyMaterial;
  onNavigateToQuiz: () => void;
  onNavigateToFlashcards: () => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  material,
  onNavigateToQuiz,
  onNavigateToFlashcards
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState<TutorPersona>('friendly');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showOutline, setShowOutline] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history or initialize welcome message
  useEffect(() => {
    const saved = storage.getChatHistory(material.id);
    if (saved && saved.length > 0) {
      setMessages(saved);
    } else {
      // Welcome message
      const initialMessage: ChatMessage = {
        id: `msg_welcome_${Date.now()}`,
        sender: 'tutor',
        text: `👋 **Welcome to your AI Tutoring session on "${material.title}"!**\n\nI have thoroughly reviewed your study material. Here is our roadmap to ace this:\n\n1. **Core Concept Mastery**: Ask me about any slide, mechanism, or definition.\n2. **Intuitive Intuition**: If a formula or concept feels dense, ask me for an everyday analogy.\n3. **Exam Readiness**: I can highlight high-frequency exam questions and trap choices.\n\nWhat would you like to explore first?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          `Explain the foundational concept in simple terms`,
          `What are the most common exam traps in this topic?`,
          `Give me an everyday analogy for this`,
          `Show me the core formulas and how they are used`
        ],
        keyPoints: material.keyConcepts.slice(0, 3)
      };
      setMessages([initialMessage]);
      storage.saveChatHistory(material.id, [initialMessage]);
    }
  }, [material.id, material.title]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatWithAITutor(text, updatedHistory, material, persona);

      const tutorMessage: ChatMessage = {
        id: `msg_tutor_${Date.now()}`,
        sender: 'tutor',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.suggestions,
        formulas: response.formulas,
        keyPoints: response.keyPoints
      };

      const finalMessages = [...updatedHistory, tutorMessage];
      setMessages(finalMessages);
      storage.saveChatHistory(material.id, finalMessages);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Text to Speech
  const toggleSpeech = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking && speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown and LaTeX tags for clean speech
    const cleanText = text
      .replace(/\$\$[\s\S]*?\$\$/g, ' mathematical equation ')
      .replace(/\$[^\$]+?\$/g, ' formula ')
      .replace(/[#*`_~]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    setIsSpeaking(true);
    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 py-4 h-[calc(100vh-5rem)]">
      
      {/* Left / Main Chat Area (3 columns on large screens) */}
      <div className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden h-full">
        
        {/* Header with Persona & Topic */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>AI Study Partner</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                Topic: {material.title}
              </p>
            </div>
          </div>

          {/* Persona selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Persona:</span>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as TutorPersona)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="friendly">🤝 Friendly Partner</option>
              <option value="socratic">🤔 Socratic Guide</option>
              <option value="professor">🎓 Professor</option>
              <option value="cram">⚡ Exam Cram Coach</option>
              <option value="eli5">🐣 ELI5 (Super Simple)</option>
            </select>

            {/* Outline toggle button for mobile/compact */}
            <button
              onClick={() => setShowOutline(!showOutline)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              <BookOpen className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                    isUser
                      ? 'bg-slate-700 dark:bg-slate-600'
                      : 'bg-gradient-to-tr from-brand-600 to-accent-600 shadow-md shadow-brand-500/20'
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-2 overflow-hidden">
                  <div
                    className={`p-4 rounded-2xl text-sm ${
                      isUser
                        ? 'bg-brand-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-tl-sm border border-slate-200/80 dark:border-slate-700/60'
                    }`}
                  >
                    <KaTeXRenderer content={msg.text} />

                    {/* Formula highlights if any */}
                    {msg.formulas && msg.formulas.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                          Formulas to Remember:
                        </div>
                        {msg.formulas.map((f, i) => (
                          <div key={i} className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800 text-xs">
                            <KaTeXRenderer content={f} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Actions / Meta */}
                  <div className={`flex items-center gap-2 px-1 text-[11px] text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => toggleSpeech(msg.id, msg.text)}
                          title={isSpeaking && speakingMessageId === msg.id ? "Stop voice" : "Read aloud"}
                          className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors"
                        >
                          {isSpeaking && speakingMessageId === msg.id ? (
                            <VolumeX className="h-3.5 w-3.5 text-rose-500" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                          <span>{isSpeaking && speakingMessageId === msg.id ? 'Stop' : 'Listen'}</span>
                        </button>

                        <span>•</span>
                        <button
                          onClick={() => copyToClipboard(msg.id, msg.text)}
                          className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(sug)}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/80 transition-all text-left flex items-center gap-1 group"
                        >
                          <span>{sug}</span>
                          <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-500/20">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
                <span>AI Tutor is thinking and preparing your explanation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Helper Bar */}
        <div className="px-4 py-2 bg-slate-50/90 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] flex-shrink-0">
          <span className="text-slate-400 font-semibold flex items-center gap-1 flex-shrink-0">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Quick:
          </span>
          <button
            onClick={() => handleSendMessage("Explain this with an intuitive everyday analogy.")}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0"
          >
            💡 Everyday Analogy
          </button>
          <button
            onClick={() => handleSendMessage("What are the most common mistakes or exam traps students make here?")}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0"
          >
            ⚠️ High-Yield Exam Traps
          </button>
          <button
            onClick={() => handleSendMessage("Summarize the entire key takeaway in 3 bullet points.")}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0"
          >
            📋 3-Bullet Summary
          </button>
          <button
            onClick={() => handleSendMessage("Give me a step-by-step mathematical derivation / calculation example.")}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0"
          >
            📐 Step-by-Step Math
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask anything about "${material.title}"... (or press Enter)`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-all shadow-md shadow-brand-500/20 disabled:opacity-50 flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>

      </div>

      {/* Right Sidebar: Topic Roadmap & Next Actions (1 column) */}
      <div className={`lg:block ${showOutline ? 'block' : 'hidden lg:block'} space-y-4 overflow-y-auto`}>
        
        {/* Next Step Action Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-slate-900 dark:to-brand-950/40 border border-brand-200 dark:border-brand-800/80 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Ready to Test Your Knowledge?</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
            Test yourself with a custom exam tailored to your exact question pattern!
          </p>

          <div className="space-y-2">
            <button
              onClick={onNavigateToQuiz}
              className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Configure Exam & Take Quiz</span>
            </button>

            <button
              onClick={onNavigateToFlashcards}
              className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Layers className="h-4 w-4 text-accent-500" />
              <span>Study Flashcards</span>
            </button>
          </div>
        </div>

        {/* Key Concepts Outline */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ListOrdered className="h-4 w-4 text-brand-500" />
            <span>Key Concepts in Chapter</span>
          </h3>

          <div className="space-y-2">
            {material.keyConcepts.map((concept, idx) => (
              <div
                key={idx}
                onClick={() => handleSendMessage(`Can you explain this specific concept in detail: "${concept}"?`)}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:border-brand-300 dark:hover:border-brand-800 transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {concept}
                </div>
                <div className="text-[10px] text-brand-600 dark:text-brand-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <span>Ask AI Tutor</span>
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
