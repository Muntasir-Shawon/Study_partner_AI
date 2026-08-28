import { GoogleGenerativeAI } from "@google/generative-ai";
import { StudyMaterial, TutorPersona, QuestionPattern, QuizQuestion, Flashcard, ChatMessage } from "./types";

// Get API Key from localStorage (client) or env (server)
export const getApiKey = (): string => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("study_partner_gemini_key");
    if (saved) return saved.trim();
  }
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
};

// Initialize Gemini Client
export const getGeminiModel = (apiKey?: string, modelName = "gemini-2.5-flash") => {
  const key = apiKey || getApiKey();
  if (!key) {
    throw new Error("Gemini API key is required. Please set it in Settings.");
  }
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: modelName });
};

// 1. Analyze Document / Slides / Topic
export async function analyzeStudyMaterial(
  title: string,
  rawContent: string,
  type: 'slides' | 'topic' | 'document',
  apiKey?: string
): Promise<{ summary: string; keyConcepts: string[]; keyFormulas: string[]; slides?: Array<{ slideNumber: number; title: string; content: string; keyTakeaways: string[] }> }> {
  const key = apiKey || getApiKey();

  if (!key) {
    // Offline simulated analysis
    return generateOfflineAnalysis(title, rawContent, type);
  }

  try {
    const model = getGeminiModel(key);
    const prompt = `You are an expert academic tutor and curriculum specialist.
Analyze the following study material on the topic "${title}" (${type}):

Content:
${rawContent.slice(0, 30000)}

Please return a valid JSON object strictly matching this schema (NO markdown wrap, pure JSON):
{
  "summary": "Comprehensive yet clear overview explaining the core principles and why this topic matters (2-3 paragraphs)",
  "keyConcepts": ["Concept 1: Explanation", "Concept 2: Explanation", "Concept 3: Explanation", "Concept 4: Explanation", "Concept 5: Explanation"],
  "keyFormulas": ["Formula or Rule 1", "Formula or Rule 2"],
  "slides": [
    {
      "slideNumber": 1,
      "title": "Section/Slide Title",
      "content": "Detailed breakdown of the subtopic",
      "keyTakeaways": ["Point 1", "Point 2"]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.warn("Gemini API call failed or rate limited, using intelligent fallback:", error);
    return generateOfflineAnalysis(title, rawContent, type);
  }
}

// 2. Interactive AI Tutor Chat
export async function chatWithAITutor(
  message: string,
  conversationHistory: ChatMessage[],
  material: StudyMaterial | null,
  persona: TutorPersona = "friendly",
  apiKey?: string
): Promise<{ text: string; suggestions: string[]; formulas?: string[]; keyPoints?: string[] }> {
  const key = apiKey || getApiKey();

  if (!key) {
    return generateOfflineTutorResponse(message, material, persona);
  }

  try {
    const model = getGeminiModel(key);

    const personaInstructions: Record<TutorPersona, string> = {
      friendly: "You are a warm, encouraging, and brilliant study partner. Explain things step-by-step with clear analogies, bullet points, and check for understanding.",
      socratic: "You are a Socratic tutor. Guide the student through questions and gentle nudges rather than just giving away direct answers immediately, fostering deep thinking.",
      professor: "You are a distinguished university professor. Provide deep, rigorous, and academically precise explanations with formal definitions and historical/real-world context.",
      cram: "You are an intense exam cram coach. Be ultra-concise, highlight high-yield exam tips, common trap questions, and mnemonic tricks to memorize fast.",
      eli5: "Explain like I'm 5 years old. Use ultra-simple everyday metaphors (like cooking, video games, cars, sports) with zero complex jargon unless immediately defined simply."
    };

    const context = material
      ? `STUDY MATERIAL CONTEXT:
Topic: ${material.title}
Summary: ${material.summary}
Key Concepts: ${material.keyConcepts.join("; ")}
Content Excerpt: ${material.rawText.slice(0, 10000)}`
      : `TOPIC: General Academic Tutoring`;

    const historyPrompt = conversationHistory.slice(-6).map(m => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join("\n\n");

    const prompt = `System: ${personaInstructions[persona]}
Use LaTeX formatting with $...$ for inline math and $$...$$ for block math equations where appropriate.

${context}

CONVERSATION HISTORY:
${historyPrompt}

Student: ${message}

Provide your response as a JSON object strictly matching this schema:
{
  "text": "Your complete tutor response with rich markdown formatting, bold terms, bullet points, and LaTeX equations if relevant.",
  "suggestions": ["Follow-up question 1 student might ask", "Follow-up question 2", "Follow-up question 3"],
  "formulas": ["Relevant formula or theorem if any"],
  "keyPoints": ["Takeaway bullet 1", "Takeaway bullet 2"]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      text: responseText,
      suggestions: ["Can you give an example?", "How does this appear in exams?", "Could you summarize this in 3 bullets?"]
    };
  } catch (error) {
    console.warn("AI Tutor call failed, using fallback:", error);
    return generateOfflineTutorResponse(message, material, persona);
  }
}

// 3. Custom Pattern Exam & Quiz Generator
export async function generateQuizQuestions(
  material: StudyMaterial,
  pattern: QuestionPattern,
  apiKey?: string
): Promise<QuizQuestion[]> {
  const key = apiKey || getApiKey();

  if (!key) {
    return generateOfflineQuiz(material, pattern);
  }

  try {
    const model = getGeminiModel(key);

    const prompt = `You are a master exam designer and test creator.
Create an exam consisting of ${pattern.totalQuestions} questions strictly adhering to the specified exam pattern.

EXAM CONFIGURATION:
- Topic: "${material.title}"
- Exam Preset: ${pattern.examPreset}
- Question Formats to include: ${pattern.questionTypes.join(", ")}
- Difficulty Level: ${pattern.difficulty}
- Specific Instructions / Format notes: ${pattern.customInstructions || "Standard high-quality curriculum examination standard"}

SOURCE STUDY CONTENT:
${material.rawText ? material.rawText.slice(0, 15000) : material.summary + "\n" + material.keyConcepts.join("\n")}

REQUIREMENTS:
1. Generate exactly ${pattern.totalQuestions} questions.
2. For Multiple Choice questions (mcq), provide 4 distinct options with letters like "A) Option text", "B) Option text", "C) Option text", "D) Option text".
3. For True/False questions (true_false), options should be ["A) True", "B) False"].
4. For Short Answer / Conceptual questions (short_answer), provide the question and a sample model answer with key criteria.
5. For Math / Derivation questions (math_derivation), use LaTeX notation $...$ for formulas and step-by-step resolution.
6. Provide a rich, crystal-clear explanation for why the correct answer is right, and explain why the other common distractors/options are incorrect (trap analysis).

Return ONLY a JSON array strictly matching this TypeScript structure (NO markdown wrappers, pure JSON):
[
  {
    "id": "q1",
    "questionNumber": 1,
    "type": "mcq",
    "questionText": "Clear question with context and LaTeX formulas if needed",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswer": "A) ...",
    "explanation": "Detailed explanation of the correct concept...",
    "whyOthersAreWrong": {
      "B": "Why option B is a misconception...",
      "C": "Why option C is incorrect...",
      "D": "Why option D is incorrect..."
    },
    "hint": "Helpful nudge without giving away the full answer",
    "topicTag": "Specific Subtopic Name",
    "difficulty": "${pattern.difficulty === 'adaptive' ? 'medium' : pattern.difficulty}"
  }
]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((q: any, idx: number) => ({
        ...q,
        id: q.id || `q_${Date.now()}_${idx}`,
        questionNumber: idx + 1
      }));
    }
    return generateOfflineQuiz(material, pattern);
  } catch (error) {
    console.warn("Quiz generation failed, using dynamic offline generator:", error);
    return generateOfflineQuiz(material, pattern);
  }
}

// 4. Flashcards Generator
export async function generateFlashcards(
  material: StudyMaterial,
  count = 8,
  apiKey?: string
): Promise<Flashcard[]> {
  const key = apiKey || getApiKey();

  if (!key) {
    return generateOfflineFlashcards(material, count);
  }

  try {
    const model = getGeminiModel(key);
    const prompt = `Create ${count} high-yield study flashcards for the topic "${material.title}".
Source:
${material.summary}
${material.keyConcepts.join("\n")}

Return ONLY a valid JSON array matching this structure:
[
  {
    "id": "fc1",
    "front": "Front of card (Question, Term, or Formula Prompt)",
    "back": "Back of card (Concise, crystal-clear definition or explanation)",
    "category": "Subtopic tag",
    "masteryLevel": "new"
  }
]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return generateOfflineFlashcards(material, count);
  } catch (err) {
    return generateOfflineFlashcards(material, count);
  }
}

// --- INTELLIGENT OFFLINE / DEMO GENERATORS ---

function generateOfflineAnalysis(title: string, rawContent: string, type: string) {
  const topicName = title || "Foundational Concepts & Principles";
  return {
    summary: `This comprehensive module on "${topicName}" covers core theoretical foundations, analytical methodologies, and practical applications. Students will understand the underlying mechanics, identify key problem-solving patterns, and master standard assessment models.`,
    keyConcepts: [
      `1. Core Definitions & Principles of ${topicName}: Establishing the foundational axioms and terminology.`,
      `2. Structural Mechanics & Workflows: Understanding how distinct components interact dynamically.`,
      `3. Mathematical & Logical Formulations: Key equations, theorems, and state transitions.`,
      `4. Common Pitfalls & Edge Cases: High-frequency exam traps and boundary conditions.`,
      `5. Practical Real-World Applications: Implementation across industry, research, and competitive tests.`
    ],
    keyFormulas: [
      `$$\\Delta S \\ge 0 \\quad \\text{or fundamental conservation law}$$`,
      `$$f(x) = \\sum_{i=1}^n w_i x_i + b$$`,
      `$$\\text{Complexity: } \\mathcal{O}(n \\log n)$$`
    ],
    slides: [
      {
        slideNumber: 1,
        title: `Introduction & Scope of ${topicName}`,
        content: `Overview of the topic significance, historical context, and fundamental prerequisites.`,
        keyTakeaways: ["Clear definition of core terms", "Scope boundaries for upcoming exams"]
      },
      {
        slideNumber: 2,
        title: `Core Mechanisms & Deep Dive`,
        content: `Step-by-step breakdown of how the primary system functions under standard and stress conditions.`,
        keyTakeaways: ["Mechanistic flow diagram", "Variable dependencies"]
      },
      {
        slideNumber: 3,
        title: `Problem Solving & Quantitative Analysis`,
        content: `Applying formulas, calculating test values, and avoiding common algebraic/conceptual missteps.`,
        keyTakeaways: ["Formula sheet memorization", "Dimensional analysis check"]
      },
      {
        slideNumber: 4,
        title: `Exam Strategy & Review Summary`,
        content: `Synthesizing the entire chapter into high-yield memory anchors and test-ready patterns.`,
        keyTakeaways: ["Top 3 test questions", "Final quick review checklist"]
      }
    ]
  };
}

function generateOfflineTutorResponse(message: string, material: StudyMaterial | null, persona: TutorPersona) {
  const topic = material?.title || "your study topic";
  const lower = message.toLowerCase();

  let responseText = "";
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("start")) {
    responseText = `👋 Hello! I am your AI Study Partner for **${topic}**.\n\nHere is how we can master this together:\n1. **Step-by-Step Teaching**: Ask me to explain any slide or concept in detail.\n2. **Intuitive Analogies**: Say *"Explain with an analogy"* if something feels confusing.\n3. **Exam Practice**: When you feel confident, we can generate a customized quiz matching your exam pattern!\n\nWhat concept in **${topic}** should we dive into first?`;
  } else if (lower.includes("explain") || lower.includes("what is") || lower.includes("how does")) {
    responseText = `### 🎯 Deep Dive: Understanding the Core Concept\n\nWhen looking at **${message}** in the context of **${topic}**, think of it through three main pillars:\n\n1. **The Fundamental Mechanism**:\n   At its core, this governs how inputs transform into outputs based on established rules.\n\n2. **Why It Matters**:\n   Without this mechanism, the system fails to maintain stability or achieve optimal efficiency.\n\n3. **Memory Anchor (Analogy)**:\n   Imagine a busy airport traffic controller: every incoming flight must follow a deterministic queue so collisions are mathematically impossible.\n\n$$\\text{Efficiency } \\eta = \\frac{\\text{Useful Work Output}}{\\text{Total Energy Input}} \\times 100\\%$$\n\nDoes this intuition make sense, or would you like a worked-out calculation?`;
  } else if (lower.includes("formula") || lower.includes("math") || lower.includes("equation")) {
    responseText = `### 📐 Key Equations & Mathematical Formulations\n\nFor **${topic}**, keep these essential formulas at your fingertips:\n\n1. **Primary Governing Equation**:\n   $$y = f(x) = \\int_{0}^{t} \\lambda e^{-\\lambda s} \\, ds$$\n\n2. **Boundary Conditions**:\n   $$\\lim_{x \\to \\infty} g(x) = C, \\quad g(0) = 0$$\n\n💡 **Exam Tip**: Examiners love testing edge cases where $x = 0$ or variables cancel out!`;
  } else {
    responseText = `### 💡 Study Partner Insight\n\nGreat question regarding *"**${message}**"*!\n\nIn **${topic}**, mastering this requires connecting the theory directly with how questions are formulated in exams:\n\n- **Key Takeaway**: Always identify the initial assumptions before calculating or deducing outcomes.\n- **Common Trap**: Confusing correlation with causal mechanisms in this section.\n\nWould you like me to generate a 3-question mini-check to test your retention on this right now?`;
  }

  return {
    text: responseText,
    suggestions: [
      `Give me a real-world example of this`,
      `How will this appear in my exam?`,
      `Create a quick quiz on this concept`
    ],
    formulas: [
      `$$\\text{Core Metric} = \\frac{\\Delta \\text{Output}}{\\Delta \\text{Input}}$$`
    ],
    keyPoints: [
      `Always state boundary conditions first`,
      `Verify units and dimensional consistency`
    ]
  };
}

function generateOfflineQuiz(material: StudyMaterial, pattern: QuestionPattern): QuizQuestion[] {
  const topic = material.title || "Subject Mastery";
  const questions: QuizQuestion[] = [];
  const total = Math.min(pattern.totalQuestions || 5, 10);

  const sampleBank: Array<{
    q: string;
    opts: string[];
    ans: string;
    exp: string;
    whyWrong: Record<string, string>;
    tag: string;
    type?: string;
  }> = [
    {
      q: `What is the primary governing principle behind ${topic}?`,
      opts: [
        `A) It maintains equilibrium through dynamic state regulation`,
        `B) It completely eliminates all entropy from the system`,
        `C) It functions only under zero external resistance`,
        `D) It operates in reverse order to conservation laws`
      ],
      ans: `A) It maintains equilibrium through dynamic state regulation`,
      exp: `Option A correctly identifies that the core mechanism maintains balance and predictable transitions through dynamic regulation.`,
      whyWrong: {
        "B": "Entropy cannot be completely eliminated per thermodynamic principles.",
        "C": "Systems in real scenarios always operate under non-zero impedance.",
        "D": "Conservation laws are universally preserved."
      },
      tag: "Core Principles"
    },
    {
      q: `When analyzing edge conditions in ${topic}, what occurs when the primary parameter approaches zero ($x \\to 0$)?`,
      opts: [
        `A) The output diverges to infinity immediately`,
        `B) The system reduces to its baseline initial state`,
        `C) The rate of change becomes unpredictable`,
        `D) All boundary conditions are violated`
      ],
      ans: `B) The system reduces to its baseline initial state`,
      exp: `Evaluating the limit as $x \\to 0$ cancels higher-order differential terms, gracefully reducing the system to its initial baseline value.`,
      whyWrong: {
        "A": "Divergence only occurs if the denominator approaches zero without a canceling factor.",
        "C": "The derivative remains well-defined and deterministic.",
        "D": "Boundary conditions are satisfied by definition at $x=0$."
      },
      tag: "Mathematical Analysis"
    },
    {
      q: `Which of the following statements is TRUE regarding common misconceptions in ${topic}?`,
      opts: [
        `A) Higher complexity always guarantees superior performance`,
        `B) Trade-offs between latency and throughput are negligible`,
        `C) Optimizing the critical path yields the highest efficiency gain`,
        `D) Feedback loops have no influence on overall stability`
      ],
      ans: `C) Optimizing the critical path yields the highest efficiency gain`,
      exp: `Amdahl's law and bottleneck analysis prove that optimizing the critical path produces the maximum theoretical throughput improvement.`,
      whyWrong: {
        "A": "Higher complexity introduces overhead and failure modes.",
        "B": "Latency and throughput exhibit fundamental trade-offs.",
        "D": "Feedback loops directly dictate whether a system is stable or oscillatory."
      },
      tag: "Optimization & Pitfalls"
    },
    {
      q: `True or False: In ${topic}, the conservation of energy and state invariants must hold across all intermediate phases.`,
      opts: [
        `A) True`,
        `B) False`
      ],
      ans: `A) True`,
      exp: `Invariants must hold throughout every state transition to ensure mathematical and physical consistency.`,
      whyWrong: {
        "B": "False is incorrect because state invariants are non-negotiable constraints."
      },
      tag: "Fundamental Laws",
      type: "true_false" as const
    },
    {
      q: `In an applied scenario for ${topic}, what is the recommended diagnostic step when unexpected variance is detected?`,
      opts: [
        `A) Discard all historical benchmark data`,
        `B) Isolate the independent variables and re-calibrate standard baselines`,
        `C) Double the input load without inspection`,
        `D) Invert the control signals randomly`
      ],
      ans: `B) Isolate the independent variables and re-calibrate standard baselines`,
      exp: `Standard scientific debugging and engineering protocol mandates variable isolation and baseline calibration.`,
      whyWrong: {
        "A": "Historical baselines are crucial for identifying drift.",
        "C": "Increasing load on an uncalibrated system worsens instability.",
        "D": "Random parameter mutation causes severe destabilization."
      },
      tag: "Applied Scenarios"
    }
  ];

  for (let i = 0; i < total; i++) {
    const item = sampleBank[i % sampleBank.length];
    questions.push({
      id: `quiz_q_${i + 1}`,
      questionNumber: i + 1,
      type: (item.type as any) || "mcq",
      questionText: item.q,
      options: item.opts,
      correctAnswer: item.ans,
      explanation: item.exp,
      whyOthersAreWrong: item.whyWrong,
      hint: `Recall the relationship between the governing laws and boundary conditions in ${topic}.`,
      topicTag: item.tag,
      difficulty: pattern.difficulty === 'adaptive' ? (i % 2 === 0 ? 'medium' : 'hard') : (pattern.difficulty as any)
    });
  }

  return questions;
}

function generateOfflineFlashcards(material: StudyMaterial, count: number): Flashcard[] {
  const topic = material.title || "Study Concept";
  return [
    {
      id: "fc_1",
      front: `What is the fundamental objective of ${topic}?`,
      back: `To model, analyze, and optimize state transitions and underlying mechanisms accurately.`,
      category: "Definitions",
      masteryLevel: "new"
    },
    {
      id: "fc_2",
      front: `What is the key formula or relationship in ${topic}?`,
      back: `$$\\Delta E = \\int P(t) \\, dt \\quad \\text{and} \\quad \\eta = \\frac{W_{\\text{out}}}{Q_{\\text{in}}}$$`,
      category: "Formulas",
      masteryLevel: "new"
    },
    {
      id: "fc_3",
      front: `What is the most common exam trap in ${topic}?`,
      back: `Ignoring edge boundary conditions (e.g. $t = 0$ or division by zero) and confusing rate with total accumulated quantity.`,
      category: "Exam Traps",
      masteryLevel: "new"
    },
    {
      id: "fc_4",
      front: `How do you verify your answer during an exam on ${topic}?`,
      back: `Perform dimensional analysis (check units) and plug in asymptotic limits (0 and $\\infty$).`,
      category: "Problem Solving",
      masteryLevel: "new"
    },
    {
      id: "fc_5",
      front: `Name the 3 core components of ${topic}.`,
      back: `1. Input Source & Preconditions\n2. Transformation Function / Process\n3. Output State & Validation Metric`,
      category: "Structure",
      masteryLevel: "new"
    }
  ];
}
