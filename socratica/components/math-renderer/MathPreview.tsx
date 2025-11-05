"use client";

import { useEffect, useState } from "react";
import { parseLaTeX, hasLaTeX, type ParsedSegment } from "@/lib/math-renderer/latex-parser";
import MathDisplay from "@/components/math-renderer/MathDisplay";
import MathBlock from "@/components/math-renderer/MathBlock";

/**
 * MathPreview Component
 * 
 * Renders a preview of mathematical notation from LaTeX input.
 * Displays rendered math expressions as user types, with real-time updates.
 * 
 * @component
 * @example
 * <MathPreview value="Solve for $x$ in $x^2 + 5 = 0$" />
 */
interface MathPreviewProps {
  /** Input text value to parse and render */
  value: string;
  /** Optional CSS class name for styling */
  className?: string;
}

/**
 * Debounce delay for preview updates (milliseconds)
 */
const PREVIEW_DEBOUNCE_DELAY = 300;

export default function MathPreview({
  value,
  className = "",
}: MathPreviewProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [parsedSegments, setParsedSegments] = useState<ParsedSegment[]>([]);
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Debounce input updates
  useEffect(() => {
    // Update immediately on first render
    if (isFirstRender) {
      setDebouncedValue(value);
      setIsFirstRender(false);
      return;
    }

    // Debounce subsequent updates
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, PREVIEW_DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timer);
    };
  }, [value, isFirstRender]);

  // Parse LaTeX when debounced value changes
  useEffect(() => {
    if (!debouncedValue || debouncedValue.trim() === "") {
      setParsedSegments([]);
      return;
    }

    const segments = parseLaTeX(debouncedValue);
    setParsedSegments(segments);
  }, [debouncedValue]);

  // Don't render preview if no LaTeX detected
  if (!hasLaTeX(value)) {
    return null;
  }

  // Don't render if no parsed segments
  if (parsedSegments.length === 0) {
    return null;
  }

  return (
    <section
      className={`rounded-lg border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
      role="region"
      aria-label="Math preview"
      aria-live="polite"
      aria-atomic="false"
      aria-describedby="math-preview-description"
    >
      <div id="math-preview-description" className="sr-only">
        Live preview of mathematical notation rendered from your input.
      </div>
      <div className="flex flex-col gap-2">
        {parsedSegments.map((segment, index) => {
          if (segment.type === "text") {
            return (
              <span key={index} className="text-zinc-950 dark:text-zinc-50">
                {segment.content}
              </span>
            );
          } else if (segment.type === "inline-math") {
            return (
              <MathDisplay
                key={index}
                expression={segment.content}
                className="inline"
              />
            );
          } else if (segment.type === "block-math") {
            return (
              <MathBlock
                key={index}
                expression={segment.content}
                className="my-2"
              />
            );
          }
          return null;
        })}
      </div>
    </section>
  );
}

