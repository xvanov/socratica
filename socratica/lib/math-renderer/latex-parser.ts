/**
 * LaTeX Parser Utility
 * 
 * Detects and parses LaTeX syntax from text input.
 * Handles inline math ($...$), block math ($$...$$), and edge cases.
 * 
 * @module latex-parser
 */

/**
 * Type of parsed segment (text or math expression)
 */
export type SegmentType = "text" | "inline-math" | "block-math";

/**
 * Parsed segment containing text or math expression
 */
export interface ParsedSegment {
  type: SegmentType;
  content: string;
  raw?: string; // Original LaTeX delimiters included
}

/**
 * Parses text input to detect and extract LaTeX math expressions.
 * 
 * Handles:
 * - Inline math: $...$ (single dollar signs) or \(...\) (parentheses)
 * - Block math: $$...$$ (double dollar signs) or \[...\] (brackets)
 * - Escaped dollar signs: \$ (should not trigger math rendering)
 * - Multiple math expressions per input
 * - Mixed text and math content
 * 
 * @param text - Input text to parse
 * @returns Array of parsed segments (text and math expressions)
 * 
 * @example
 * ```typescript
 * parseLaTeX("Solve for $x$ in $x^2 + 5 = 0$")
 * // Returns: [
 * //   { type: "text", content: "Solve for " },
 * //   { type: "inline-math", content: "x", raw: "$x$" },
 * //   { type: "text", content: " in " },
 * //   { type: "inline-math", content: "x^2 + 5 = 0", raw: "$x^2 + 5 = 0$" }
 * // ]
 * ```
 */
export function parseLaTeX(text: string): ParsedSegment[] {
  if (!text || text.trim() === "") {
    return [{ type: "text", content: text }];
  }

  const segments: ParsedSegment[] = [];
  let currentIndex = 0;
  let currentText = "";

  while (currentIndex < text.length) {
    // Check for block math first: \[...\] (priority over $$)
    if (
      currentIndex < text.length - 3 &&
      text[currentIndex] === "\\" &&
      text[currentIndex + 1] === "["
    ) {
      // Save any accumulated text
      if (currentText) {
        segments.push({ type: "text", content: currentText });
        currentText = "";
      }

      // Find closing \]
      const closingIndex = text.indexOf("\\]", currentIndex + 2);
      if (closingIndex !== -1) {
        const mathContent = text.slice(currentIndex + 2, closingIndex);
        segments.push({
          type: "block-math",
          content: mathContent.trim(),
          raw: `\\[${mathContent}\\]`,
        });
        currentIndex = closingIndex + 2;
      } else {
        // Unclosed block math - treat as text
        currentText += text[currentIndex];
        currentIndex++;
      }
    }
    // Check for block math: $$...$$
    else if (
      currentIndex < text.length - 3 &&
      text[currentIndex] === "$" &&
      text[currentIndex + 1] === "$"
    ) {
      // Check if escaped (\$$)
      if (currentIndex > 0 && text[currentIndex - 1] === "\\") {
        // Escaped dollar signs - treat as text (remove backslash)
        currentText = currentText.slice(0, -1); // Remove the backslash
        currentText += text[currentIndex];
        currentIndex++;
      } else {
        // Save any accumulated text
        if (currentText) {
          segments.push({ type: "text", content: currentText });
          currentText = "";
        }

        // Find closing $$
        const closingIndex = text.indexOf("$$", currentIndex + 2);
        if (closingIndex !== -1) {
          const mathContent = text.slice(currentIndex + 2, closingIndex);
          segments.push({
            type: "block-math",
            content: mathContent.trim(),
            raw: `$$${mathContent}$$`,
          });
          currentIndex = closingIndex + 2;
        } else {
          // Unclosed block math - merge back into last text segment or create new one
          const remainingText = text.slice(currentIndex);
          if (segments.length > 0 && segments[segments.length - 1].type === "text") {
            // Merge with last text segment
            segments[segments.length - 1].content += remainingText;
          } else {
            // Create new text segment
            currentText += remainingText;
          }
          currentIndex = text.length;
        }
      }
    }
    // Check for inline math: \(...\)
    else if (
      currentIndex < text.length - 2 &&
      text[currentIndex] === "\\" &&
      text[currentIndex + 1] === "("
    ) {
      // Save any accumulated text
      if (currentText) {
        segments.push({ type: "text", content: currentText });
        currentText = "";
      }

      // Find closing \)
      const closingIndex = text.indexOf("\\)", currentIndex + 2);
      if (closingIndex !== -1) {
        const mathContent = text.slice(currentIndex + 2, closingIndex);
        segments.push({
          type: "inline-math",
          content: mathContent.trim(),
          raw: `\\(${mathContent}\\)`,
        });
        currentIndex = closingIndex + 2;
      } else {
        // Unclosed inline math - treat as text
        currentText += text[currentIndex];
        currentIndex++;
      }
    }
    // Check for inline math: $...$
    else if (text[currentIndex] === "$") {
      // Check if escaped (\$)
      if (currentIndex > 0 && text[currentIndex - 1] === "\\") {
        // Escaped dollar sign - treat as text (remove backslash)
        currentText = currentText.slice(0, -1); // Remove the backslash
        currentText += text[currentIndex];
        currentIndex++;
      } else {
        // Save any accumulated text
        if (currentText) {
          segments.push({ type: "text", content: currentText });
          currentText = "";
        }

        // Find closing $ (but not $$)
        let closingIndex = text.indexOf("$", currentIndex + 1);
        // Make sure it's not part of $$
        while (closingIndex !== -1 && closingIndex < text.length - 1 && text[closingIndex + 1] === "$") {
          closingIndex = text.indexOf("$", closingIndex + 2);
        }
        
        if (closingIndex !== -1) {
          const mathContent = text.slice(currentIndex + 1, closingIndex);
          segments.push({
            type: "inline-math",
            content: mathContent.trim(),
            raw: `$${mathContent}$`,
          });
          currentIndex = closingIndex + 1;
        } else {
          // Unclosed inline math - merge back into last text segment or create new one
          const remainingText = text.slice(currentIndex);
          if (segments.length > 0 && segments[segments.length - 1].type === "text") {
            // Merge with last text segment
            segments[segments.length - 1].content += remainingText;
          } else {
            // Create new text segment
            currentText += remainingText;
          }
          currentIndex = text.length;
        }
      }
    } else {
      // Regular text character
      currentText += text[currentIndex];
      currentIndex++;
    }
  }

  // Add any remaining text
  if (currentText) {
    segments.push({ type: "text", content: currentText });
  }

  return segments.length > 0 ? segments : [{ type: "text", content: text }];
}

/**
 * Checks if text contains any LaTeX math expressions.
 * 
 * @param text - Input text to check
 * @returns True if LaTeX syntax is detected, false otherwise
 * 
 * @example
 * ```typescript
 * hasLaTeX("Solve for $x$") // true
 * hasLaTeX("Solve for \\(x\\)") // true
 * hasLaTeX("Plain text") // false
 * ```
 */
export function hasLaTeX(text: string): boolean {
  if (!text) return false;
  
  // Check for block math \[...\]
  if (text.includes("\\[")) {
    return true;
  }
  
  // Check for block math ($$...$$)
  if (text.includes("$$")) {
    return true;
  }
  
  // Check for inline math \(...\)
  if (text.includes("\\(")) {
    return true;
  }
  
  // Check for inline math ($...$) - but not escaped (\$)
  // Simple check: look for $ that's not preceded by \
  const dollarIndex = text.indexOf("$");
  if (dollarIndex !== -1 && (dollarIndex === 0 || text[dollarIndex - 1] !== "\\")) {
    // Check if there's a closing $ after this one
    const closingIndex = text.indexOf("$", dollarIndex + 1);
    if (closingIndex !== -1) {
      return true;
    }
  }
  
  return false;
}

