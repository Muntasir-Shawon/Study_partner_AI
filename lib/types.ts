export type StudyMaterialType = 'slides' | 'topic' | 'document' | 'notes';

export interface StudyMaterial {
  id: string;
  title: string;
  type: StudyMaterialType;
  rawText: string;
  summary: string;
  keyConcepts: string[];
  keyFormulas?: string[];
  slides?: Array<{
    slideNumber: number;
    title: string;
    content: string;
    keyTakeaways: string[];
  }>;
  createdAt: string;
}

export type TutorPersona = 'socratic' | 'friendly' | 'professor' | 'cram' | 'eli5';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  suggestions?: string[];
  formulas?: string[];
  keyPoints?: string[];
}

export type QuestionType = 'mcq' | 'true_false' | 'multi_select' | 'short_answer' | 'math_derivation';
export type ExamPreset = 'custom' | 'university' | 'sat' | 'ap' | 'bcs' | 'gre' | 'highschool';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'adaptive';

export interface QuestionPattern {
  id: string;
  name: string;
  examPreset: ExamPreset;
  questionTypes: QuestionType[];
  difficulty: DifficultyLevel;
  totalQuestions: number;
  timeLimitMinutes: number; // 0 means untimed
  negativeMarking: boolean;
  negativeMarkValue?: number; // e.g. 0.25 or 0.5
  customInstructions?: string;
}

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  type: QuestionType;
  questionText: string;
  options?: string[]; // E.g. ["A) ...", "B) ...", "C) ...", "D) ..."]
  correctAnswer: string; // The correct option e.g. "A" or exact option string or text answer
  explanation: string;
  whyOthersAreWrong?: Record<string, string>;
  hint?: string;
  topicTag?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  pattern: QuestionPattern;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  topicTitle: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  score: number;
  maxScore: number;
  percentage: number;
  timeTakenSeconds: number;
  date: string;
  answers: Record<string, UserAnswer>;
  weakAreas: string[];
  feedback: string;
  recommendedStudyTips: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  masteryLevel: 'new' | 'learning' | 'mastered';
}

export interface ApiSettings {
  geminiApiKey: string;
  preferredModel: string;
  useOfflineDemo: boolean;
}
