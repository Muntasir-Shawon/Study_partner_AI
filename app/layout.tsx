import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyPartner AI - Smart Tutor & Custom Exam Simulator",
  description: "AI study partner that teaches topics from slides, explains complex concepts, and generates custom pattern-based quizzes and exams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
