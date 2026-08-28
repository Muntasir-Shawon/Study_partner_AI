import { StudyMaterial, Quiz, QuizResult, Flashcard, ChatMessage, ApiSettings } from "./types";

const STORAGE_KEYS = {
  CURRENT_MATERIAL: "study_partner_current_material",
  ALL_MATERIALS: "study_partner_materials_history",
  QUIZ_HISTORY: "study_partner_quiz_results",
  ACTIVE_QUIZ: "study_partner_active_quiz",
  FLASHCARDS: "study_partner_flashcards",
  CHAT_MESSAGES: "study_partner_chat_history",
  SETTINGS: "study_partner_settings",
};

export const storage = {
  // Study Materials
  getCurrentMaterial(): StudyMaterial | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_MATERIAL);
    return data ? JSON.parse(data) : null;
  },

  setCurrentMaterial(material: StudyMaterial | null) {
    if (typeof window === "undefined") return;
    if (material) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_MATERIAL, JSON.stringify(material));
      // Also add to materials history
      const list = this.getAllMaterials();
      const filtered = list.filter((m) => m.id !== material.id);
      localStorage.setItem(STORAGE_KEYS.ALL_MATERIALS, JSON.stringify([material, ...filtered].slice(0, 15)));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_MATERIAL);
    }
  },

  getAllMaterials(): StudyMaterial[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.ALL_MATERIALS);
    return data ? JSON.parse(data) : [];
  },

  // Quiz Results History
  getQuizResults(): QuizResult[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  saveQuizResult(result: QuizResult) {
    if (typeof window === "undefined") return;
    const history = this.getQuizResults();
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify([result, ...history].slice(0, 30)));
  },

  // Active Quiz
  getActiveQuiz(): Quiz | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_QUIZ);
    return data ? JSON.parse(data) : null;
  },

  setActiveQuiz(quiz: Quiz | null) {
    if (typeof window === "undefined") return;
    if (quiz) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_QUIZ, JSON.stringify(quiz));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_QUIZ);
    }
  },

  // Flashcards
  getFlashcards(): Flashcard[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    return data ? JSON.parse(data) : [];
  },

  saveFlashcards(flashcards: Flashcard[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
  },

  // Chat History
  getChatHistory(materialId: string): ChatMessage[] {
    if (typeof window === "undefined") return [];
    const all = localStorage.getItem(`${STORAGE_KEYS.CHAT_MESSAGES}_${materialId}`);
    return all ? JSON.parse(all) : [];
  },

  saveChatHistory(materialId: string, messages: ChatMessage[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${STORAGE_KEYS.CHAT_MESSAGES}_${materialId}`, JSON.stringify(messages.slice(-50)));
  },

  // Settings
  getSettings(): ApiSettings {
    if (typeof window === "undefined") {
      return { geminiApiKey: "", preferredModel: "gemini-2.5-flash", useOfflineDemo: false };
    }
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const key = localStorage.getItem("study_partner_gemini_key") || "";
    if (data) {
      const parsed = JSON.parse(data);
      return { ...parsed, geminiApiKey: parsed.geminiApiKey || key };
    }
    return { geminiApiKey: key, preferredModel: "gemini-2.5-flash", useOfflineDemo: false };
  },

  saveSettings(settings: ApiSettings) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (settings.geminiApiKey) {
      localStorage.setItem("study_partner_gemini_key", settings.geminiApiKey);
    } else {
      localStorage.removeItem("study_partner_gemini_key");
    }
  }
};
