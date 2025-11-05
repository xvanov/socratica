"use client";

import { parseLaTeX, autoWrapMath, normalizeMultiLineEquations, type ParsedSegment } from "@/lib/math-renderer/latex-parser";
import MathDisplay from "./MathDisplay";
import MathBlock from "./MathBlock";

/**
 * MessageContent Component
 * 
 * Renders chat message content with math rendering support.
 * Parses LaTeX syntax from message text and renders math expressions using
 * MathDisplay (inline) and MathBlock (block) components.
 * 
 * Enhanced error handling ensures graceful fallback for malformed LaTeX expressions
 * while maintaining message rendering continuity.
 * 
 * Maintains message styling while rendering math expressions.
 * Handles both inline ($...$) and block ($$...$$) math expressions.
 * 
 * @component
 * @example
 * <MessageContent content="Solve for $x$ in $x^2 + 5 = 0$" />
 * <MessageContent content="Equation: $$\frac{a}{b}$$" className="text-base" />
 */
interface MessageContentProps {
  /** Message content string that may contain LaTeX syntax */
  content: string;
  /** Optional CSS class name for styling */
  className?: string;
}

export default function MessageContent({
  content,
  className = "",
}: MessageContentProps) {
  // Handle empty content gracefully
  if (!content || content.trim() === "") {
    return (
      <div className={`whitespace-pre-wrap break-words ${className}`}>
        {content}
      </div>
    );
  }

  try {
    // Normalize multi-line equations broken by OCR before processing
    const normalizedContent = normalizeMultiLineEquations(content);
    
    // Auto-wrap math expressions in plain text (e.g., from OCR) before parsing
    const wrappedContent = autoWrapMath(normalizedContent);
    
    // Parse content to detect LaTeX expressions
    const segments: ParsedSegment[] = parseLaTeX(wrappedContent);

    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log("MessageContent parsing:", { content, segments });
    }

    // If no math detected, render as plain text
    if (segments.length === 1 && segments[0].type === "text") {
      return (
        <div className={`whitespace-pre-wrap break-words ${className}`}>
          {segments[0].content}
        </div>
      );
    }

    // Render mixed content (text + math)
    return (
      <div className={`whitespace-pre-wrap break-words ${className}`}>
        {segments.map((segment, index) => {
          // Add unique key for React rendering
          const key = `segment-${index}-${segment.type}`;

          try {
            switch (segment.type) {
              case "text":
                return <span key={key}>{segment.content}</span>;

              case "inline-math":
                return (
                  <MathDisplay
                    key={key}
                    expression={segment.content}
                    className="inline"
                  />
                );

              case "block-math":
                return (
                  <MathBlock
                    key={key}
                    expression={segment.content}
                    className="my-2"
                  />
                );

              default:
                // Fallback for unknown segment types
                return <span key={key}>{segment.content}</span>;
            }
          } catch (error) {
            // Handle individual segment rendering errors
            // Continue rendering other segments even if one fails
            if (process.env.NODE_ENV === "development") {
              console.warn("MessageContent segment rendering error:", error, "Segment:", segment);
            }
            // TODO: In production, log to Firebase Analytics
            
            // Fallback: display raw LaTeX for failed segments
            return (
              <span
                key={key}
                className="text-red-600"
                title="Unable to render math expression"
              >
                {segment.raw || segment.content}
              </span>
            );
          }
        })}
      </div>
    );
  } catch (error) {
    // Fallback: if parsing fails completely, render as plain text
    if (process.env.NODE_ENV === "development") {
      console.error("MessageContent parsing error:", error, "Content:", content);
    }
    // TODO: In production, log to Firebase Analytics
    
    // Maintain message rendering even when parsing fails
    return (
      <div className={`whitespace-pre-wrap break-words ${className}`}>
        {content}
      </div>
    );
  }
}
