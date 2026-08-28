# 🎓 StudyPartner AI - Intelligent Study Companion & Adaptive Exam Simulator

**StudyPartner AI** is a modern, full-stack interactive learning platform designed to help students, researchers, and professionals master any subject. Upload your lecture slides or specify any topic, and let the AI tutor teach you step-by-step with intuitive analogies, LaTeX formulas, voice narration, active recall flashcards, and custom pattern-based exam simulations.

---

## 🌟 Key Features

### 1. 📂 Multi-Format Slide & Study Material Hub
- **Upload Lecture Slides**: Drag-and-drop support for PDF slides (`.pdf`), PowerPoint (`.pptx`), Markdown (`.md`), and text notes (`.txt`).
- **Topic Input Mode**: Directly enter any subject, syllabus, or sub-topics (e.g. *Operating Systems: Process Scheduling*, *Linear Algebra: Eigenvalues*, *Organic Chemistry*).
- **1-Click Pre-Loaded Modules**: Instant test topics in Computer Science, Mathematics, Biology, Economics, and AI.
- **Smart Outline & Formula Extraction**: Automatically structures slide takeaways, core definitions, and mathematical equations.

### 2. 🤖 Interactive AI Tutor
- **Persona Modes**:
  - 🤝 **Friendly Partner**: Encouraging, step-by-step guidance with analogies.
  - 🤔 **Socratic Guide**: Thought-provoking questions that build deep first-principles intuition.
  - 🎓 **Distinguished Professor**: Academic rigor, formal proofs, and historical context.
  - ⚡ **Exam Cram Coach**: High-yield exam traps, memorization mnemonics, and speed tips.
  - 🐣 **ELI5 (Explain Like I'm 5)**: Crystal clear everyday metaphors with zero jargon.
- **Voice Read-Aloud (Text-to-Speech)**: Integrated Web Speech API narration for auditory learners.
- **LaTeX Math Rendering**: Formatted mathematical formulas and equations using KaTeX.
- **Quick Action Prompts**: 1-click shortcuts for *"Everyday Analogy"*, *"High-Yield Exam Traps"*, *"3-Bullet Summary"*, and *"Step-by-Step Math"*.

### 3. 🎯 Custom Exam Pattern & Question Generator
- **Exam Presets**: University Midterm/Final, SAT, AP Exams, BCS & Civil Services, GRE, High School Chapter Quiz, or Custom.
- **Question Formats**:
  - Multiple Choice (MCQ with trap analysis)
  - True / False Statements
  - Multi-Select (Choose all that apply)
  - Short Conceptual Questions
  - Math & Formula Derivations
- **Adaptive Difficulty**: Easy, Medium, Hard, or Adaptive.
- **Negative Marking Penalty**: Configurable deduction (-0.25, -0.5, -1.0) for competitive exam simulation.
- **Custom Exam Instructions**: Tell the AI specific patterns or slide sections to emphasize.

### 4. 🏆 Live Quiz Arena
- **Timed Simulation**: Real-time countdown timer with visual progress bar.
- **Dual Mode**:
  - **Exam Mode**: Simulates real exam conditions with final scorecard and analysis at completion.
  - **Practice Mode**: Instant feedback after every question with full explanations.
- **Detailed Solution & Trap Analysis**: In-depth explanations for why the correct answer is right and why each alternative is a distractor.
- **Comprehensive Report Card**: Score %, grade badge, time taken, weak areas identification, and celebration confetti.

### 5. 🗂️ Active Recall Flashcards & Master Notes
- **3D Flip Flashcards**: Interactive 3D flip study deck with spaced repetition tracking (*"Mastered"* vs *"Still Learning"*).
- **Master Study Notes**: Structured lecture breakdown, formula cheat sheets, and 1-click Markdown (`.md`) export and PDF printing.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/Study_partner.git
   cd Study_partner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 AI Configuration (Google Gemini API)

The app comes with an **Instant Demo / Offline Simulator** so you can test all features immediately without any setup!

To connect live real-time Gemini AI:
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click the **Key icon** in the app's navigation bar.
3. Paste your Gemini API key (stored securely in your browser).
4. Select your preferred model (e.g. `gemini-2.5-flash` or `gemini-2.0-flash`).

Alternatively, create a `.env.local` file:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router & React 18)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
- **AI Engine**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai) (`gemini-2.5-flash`)
- **Math Rendering**: [KaTeX](https://katex.org/)
- **Animations & Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti), [Framer Motion](https://www.framer.com/motion/)
- **PDF & Document Parsing**: [PDF.js](https://mozilla.github.io/pdf.js/)

---

## 📄 License
MIT License. Free for personal and educational use.
