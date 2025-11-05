"use client";

import { InlineMath } from "react-katex";
import KATEX_CONFIG from "@/lib/math-renderer/katex-config";

/**
 * MathDisplay Component
 * 
 * Renders inline math expressions using KaTeX.
 * Displays mathematical notation inline with text (e.g., $x^2 + 5$).
 * 
 * Enhanced error handling: KaTeX's throwOnError: false ensures graceful fallback.
 * Errors are logged for debugging in development, with TODO for production analytics.
 * 
 * @component
 * @example
 * <MathDisplay expression="x^2 + 5" />
 * <MathDisplay expression="\frac{a}{b}" className="text-blue-600" />
 */
interface MathDisplayProps {
  /** LaTeX expression to render (without delimiters) */
  expression: string;
  /** Optional CSS class name for styling */
  className?: string;
}

export default function MathDisplay({
  expression,
  className = "",
}: MathDisplayProps) {
  // Handle empty or invalid expressions gracefully
  if (!expression || expression.trim() === "") {
    return (
      <span className={className} aria-label="Empty math expression">
        [math]
      </span>
    );
  }

  try {
    return (
      <span
        className={`inline-block max-w-full ${className}`}
        aria-label={`Mathematical expression: ${expression}`}
      >
        <InlineMath math={expression} errorColor={KATEX_CONFIG.errorColor} />
      </span>
    );
  } catch (error) {
    // Fallback display for malformed LaTeX
    // KaTeX's throwOnError: false should prevent this, but we handle it anyway
    if (process.env.NODE_ENV === "development") {
      console.error("MathDisplay rendering error:", error, "Expression:", expression);
    }
    // TODO: In production, log to Firebase Analytics
    
    return (
      <span
        className={`${className} text-red-600`}
        aria-label={`Error rendering math expression: ${expression}`}
        title="Unable to render math expression"
      >
        [Math Error: {expression}]
      </span>
    );
  }
}

