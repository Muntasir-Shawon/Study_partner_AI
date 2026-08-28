import { QuestionPattern, StudyMaterial } from "./types";

export const EXAM_PRESETS: Record<string, Partial<QuestionPattern>> = {
  university: {
    name: "University Midterm / Final Exam",
    examPreset: "university",
    questionTypes: ["mcq", "short_answer", "math_derivation"],
    difficulty: "hard",
    totalQuestions: 10,
    timeLimitMinutes: 20,
    negativeMarking: false,
    customInstructions: "Standard university exam questions with theoretical derivations, rigorous multiple choice, and analytical problem-solving."
  },
  sat: {
    name: "SAT / College Board Standard",
    examPreset: "sat",
    questionTypes: ["mcq"],
    difficulty: "medium",
    totalQuestions: 10,
    timeLimitMinutes: 15,
    negativeMarking: false,
    customInstructions: "Standardized SAT-style 4-choice questions emphasizing critical reasoning, logical deduction, and precise reading."
  },
  ap: {
    name: "AP Exam (Advanced Placement)",
    examPreset: "ap",
    questionTypes: ["mcq", "short_answer"],
    difficulty: "hard",
    totalQuestions: 10,
    timeLimitMinutes: 20,
    negativeMarking: false,
    customInstructions: "AP-style college-level multi-choice and free response conceptual questions with scenario analysis."
  },
  bcs: {
    name: "BCS & Civil Service Competitive Exam",
    examPreset: "bcs",
    questionTypes: ["mcq"],
    difficulty: "medium",
    totalQuestions: 15,
    timeLimitMinutes: 15,
    negativeMarking: true,
    negativeMarkValue: 0.5,
    customInstructions: "High-speed competitive exam format with negative marks (0.5 deduction per wrong answer) and sharp factual/conceptual recall."
  },
  gre: {
    name: "GRE / Graduate Assessment",
    examPreset: "gre",
    questionTypes: ["mcq", "multi_select"],
    difficulty: "hard",
    totalQuestions: 8,
    timeLimitMinutes: 15,
    negativeMarking: false,
    customInstructions: "Graduate-level analytical reasoning, multi-correct selection, and quantitative/verbal precision."
  },
  highschool: {
    name: "High School / Standard Quiz",
    examPreset: "highschool",
    questionTypes: ["mcq", "true_false"],
    difficulty: "easy",
    totalQuestions: 5,
    timeLimitMinutes: 10,
    negativeMarking: false,
    customInstructions: "Foundational conceptual check to test basic understanding and memory recall."
  }
};

export const POPULAR_STUDY_TOPICS = [
  {
    title: "Operating Systems: Process Scheduling & Deadlocks",
    category: "Computer Science",
    summary: "Explores CPU scheduling algorithms (Round Robin, FCFS, Priority, SJF), process state transitions, mutual exclusion, semaphores, Banker's Algorithm, and deadlock prevention conditions."
  },
  {
    title: "Linear Algebra: Eigenvalues, Eigenvectors & Diagonalization",
    category: "Mathematics",
    summary: "Mathematical theory of characteristic polynomials $\\det(A - \\lambda I) = 0$, eigenspaces, algebraic vs geometric multiplicity, symmetric matrices, and matrix diagonalization."
  },
  {
    title: "Cellular Respiration & Photosynthesis",
    category: "Biology",
    summary: "Glycolysis, Krebs cycle, electron transport chain, ATP synthesis via chemiosmosis, light-dependent vs Calvin cycle, and chlorophyll photon absorption."
  },
  {
    title: "Macroeconomics: Monetary Policy & Inflation Dynamics",
    category: "Economics",
    summary: "Central bank interest rate decisions, quantitative easing, Phillips Curve, IS-LM model, aggregate supply/demand equilibrium, and CPI inflation indices."
  },
  {
    title: "Machine Learning: Backpropagation & Neural Networks",
    category: "AI & Data Science",
    summary: "Gradient descent optimization, computation graphs, loss functions (Cross-Entropy, MSE), activation functions (ReLU, Sigmoid, Softmax), and weight updates via the chain rule."
  }
];
