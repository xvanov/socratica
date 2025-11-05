"use client";

import { BlockMath } from "react-katex";
import KATEX_CONFIG from "@/lib/math-renderer/katex-config";

/**
 * MathBlock Component
 * 
 * Renders block math expressions using KaTeX.
 * Displays mathematical notation in a centered block (e.g., $$\frac{a}{b}$$).
 * 
 * Enhanced error handling: KaTeX's throwOnError: false ensures graceful fallback.
 * Errors are logged for debugging in development, with TODO for production analytics.
 * 
 * @component
 * @example
 * <MathBlock expression="\frac{a}{b}" />
 * <MathBlock expression="x^2 + y^2 = z^2" className="my-4" />
 */
interface MathBlockProps {
  /** LaTeX expression to render (without delimiters) */
  expression: string;
  /** Optional CSS class name for styling */
  className?: string;
}

export default function MathBlock({
  expression,
  className = "",
}: MathBlockProps) {
  // Handle empty or invalid expressions gracefully
  if (!expression || expression.trim() === "") {
    return (
      <div
        className={`${className} text-center text-zinc-500`}
        aria-label="Empty math expression"
      >
        [math]
      </div>
    );
  }

  try {
    return (
      <div
        className={`overflow-x-auto ${className}`}
        aria-label={`Mathematical expression: ${expression}`}
      >
        <div className="min-w-0">
          <BlockMath math={expression} errorColor={KATEX_CONFIG.errorColor} />
        </div>
      </div>
    );
  } catch (error) {
    // Fallback display for malformed LaTeX
    // KaTeX's throwOnError: false should prevent this, but we handle it anyway
    if (process.env.NODE_ENV === "development") {
      console.error("MathBlock rendering error:", error, "Expression:", expression);
    }
    // TODO: In production, log to Firebase Analytics
    
    return (
      <div
        className={`${className} text-center text-red-600`}
        aria-label={`Error rendering math expression: ${expression}`}
        title="Unable to render math expression"
      >
        [Math Error: {expression}]
      </div>
    );
  }
}

