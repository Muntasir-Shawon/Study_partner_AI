'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, ExternalLink, CheckCircle2, ShieldCheck, Cpu, Sparkles } from 'lucide-react';
import { storage } from '@/lib/storage';
import { ApiSettings } from '@/lib/types';
import { getGeminiModel } from '@/lib/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (settings: ApiSettings) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [useOfflineDemo, setUseOfflineDemo] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = storage.getSettings();
      setApiKey(current.geminiApiKey || '');
      setModel(current.preferredModel || 'gemini-2.5-flash');
      setUseOfflineDemo(current.useOfflineDemo || false);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter a Gemini API Key to test.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const generativeModel = getGeminiModel(apiKey.trim(), model);
      const result = await generativeModel.generateContent("Respond with the single word: READY");
      const text = result.response.text();
      if (text) {
        setTestResult({ success: true, message: `Connected successfully! (Gemini response: ${text.trim().slice(0, 20)})` });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message || 'Check your key and network connection.'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const updated: ApiSettings = {
      geminiApiKey: apiKey.trim(),
      preferredModel: model,
      useOfflineDemo
    };
    storage.saveSettings(updated);
    onSaved(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Model & API Configuration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure Google Gemini API or use instant offline mode
            </p>
          </div>
        </div>

        {/* Gemini API Key input */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-normal"
              >
                <span>Get free API key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Your key is saved locally in your browser and never sent to third-party servers.
            </p>
          </div>

          {/* Model selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Gemini Model Version
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fastest & Intelligent)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
            </select>
          </div>

          {/* Offline demo toggle */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Instant Demo / Offline Simulator
                </span>
                <input
                  type="checkbox"
                  checked={useOfflineDemo}
                  onChange={(e) => setUseOfflineDemo(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically generate high-yield questions, formulas, and AI tutoring responses using the smart built-in academic engine if no API key is provided.
              </p>
            </div>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 flex-shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20"
            >
              Save Settings
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
