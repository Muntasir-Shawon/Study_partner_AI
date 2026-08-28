'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface KaTeXRendererProps {
  content: string;
  className?: string;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({ content, className = '' }) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Split text by block math ($$...$$) and inline math ($...$)
    // Regex matches $$...$$ or $...$
    const parts: React.ReactNode[] = [];
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    let index = 0;
    while ((match = regex.exec(content)) !== null) {
      // Text before formula
      if (match.index > lastIndex) {
        const textChunk = content.substring(lastIndex, match.index);
        parts.push(<span key={`text-${index++}`}>{textChunk}</span>);
      }

      const matchStr = match[0];
      const isBlock = matchStr.startsWith('$$') && matchStr.endsWith('$$');
      const mathCode = isBlock ? matchStr.slice(2, -2).trim() : matchStr.slice(1, -1).trim();

      try {
        const html = katex.renderToString(mathCode, {
          displayMode: isBlock,
          throwOnError: false,
        });

        parts.push(
          <span
            key={`math-${index++}`}
            dangerouslySetInnerHTML={{ __html: html }}
            className={isBlock ? 'block my-3 text-center overflow-x-auto py-1' : 'inline-block px-0.5 align-middle'}
          />
        );
      } catch (err) {
        // Fallback plain code if rendering fails
        parts.push(
          <code key={`err-${index++}`} className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-brand-600 dark:text-brand-400">
            {matchStr}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(<span key={`text-end`}>{content.substring(lastIndex)}</span>);
    }

    return parts;
  }, [content]);

  return <div className={`prose-math leading-relaxed ${className}`}>{renderedElements}</div>;
};
