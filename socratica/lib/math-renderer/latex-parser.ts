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
 * Cleans LaTeX expressions by removing commands unsupported by KaTeX.
 * 
 * KaTeX doesn't support certain LaTeX commands that OCR systems may include,
 * such as \hspace, \vspace, etc. This function removes these unsupported commands
 * to prevent rendering errors.
 * 
 * @param latex - LaTeX expression to clean
 * @returns Cleaned LaTeX expression with unsupported commands removed
 * 
 * @example
 * ```typescript
 * cleanLaTeX("f(x) = \\frac{3}{4}x + 10, \\hspace{1cm} g(x) = x^2")
 * // Returns: "f(x) = \\frac{3}{4}x + 10,  g(x) = x^2"
 * ```
 */
export function cleanLaTeX(latex: string): string {
  if (!latex) return latex;

  // Remove \hspace{...} commands (with optional * variant)
  // Matches: \hspace{1cm}, \hspace*{1cm}, \hspace{0.5in}, etc.
  let cleaned = latex.replace(/\\hspace\*?\{[^}]*\}/g, ' ');

  // Remove \vspace{...} commands (vertical spacing, also not supported)
  cleaned = cleaned.replace(/\\vspace\*?\{[^}]*\}/g, '');

  // Remove \vskip commands
  cleaned = cleaned.replace(/\\vskip\s*[^\s]*/g, '');

  // Remove \hskip commands
  cleaned = cleaned.replace(/\\hskip\s*[^\s]*/g, ' ');

  // Clean up multiple spaces that might result from removing commands
  cleaned = cleaned.replace(/\s+/g, ' ');

  return cleaned.trim();
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
          content: cleanLaTeX(mathContent.trim()),
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
            content: cleanLaTeX(mathContent.trim()),
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
          content: cleanLaTeX(mathContent.trim()),
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
            content: cleanLaTeX(mathContent.trim()),
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
 * Auto-detects mathematical expressions in plain text and wraps them in LaTeX delimiters.
 * 
 * Detects patterns like:
 * - Polynomial expressions: (x^2-11x+30), x^2+5x+6
 * - Equations: (x^2-5x+5)=1, x^2 = 4
 * - Expressions with exponents: x^2, y^3
 * - Fractions: 3/4, (a+b)/(c+d)
 * 
 * Only wraps expressions that look like math (contain variables, exponents, operators, etc.)
 * and aren't already wrapped in delimiters.
 * 
 * @param text - Plain text that may contain math expressions
 * @returns Text with math expressions wrapped in $...$ delimiters
 * 
 * @example
 * ```typescript
 * autoWrapMath("Solve for x: (x^2-11x+30)/(x^2-5x+5)=1")
 * // Returns: "Solve for x: $(x^2-11x+30)/(x^2-5x+5)=1$"
 * ```
 */
export function autoWrapMath(text: string): string {
  if (!text || text.trim() === "") return text;
  
  // If text already has LaTeX delimiters, don't process it
  if (hasLaTeX(text)) {
    return text;
  }

  let result = text;
  const matches: Array<{ start: number; end: number; content: string }> = [];
  
  // Pattern 1: Fractions with variables: (a+b)/(c+d)
  // Check fractions FIRST before individual parentheses to avoid duplicates
  const fractionPattern = /\([^)]*[a-zA-Z][^)]*\)\s*\/\s*\([^)]*[a-zA-Z][^)]*\)/g;
  let match: RegExpExecArray | null;
  
  while ((match = fractionPattern.exec(text)) !== null) {
    const content = match[0];
    matches.push({
      start: match.index,
      end: match.index + content.length,
      content: content,
    });
  }
  
  // Pattern 2: Equations with variables (extends beyond parentheses)
  // Matches: (x^2-5x+5)=1, x^2+5x+6=1, etc.
  // Pattern: (expression)=number or variable=number
  const equationPattern = /(\([^)]*[a-zA-Z]\^?\d*[^)]*\)|[a-zA-Z]\^?\d*([\+\-\*\/]?[a-zA-Z]?\d*)*)\s*=\s*[0-9]+/g;
  
  while ((match = equationPattern.exec(text)) !== null) {
    const content = match[0];
    // Avoid duplicates with existing matches
    const isDuplicate = matches.some(m => 
      match!.index >= m.start && match!.index < m.end ||
      match!.index < m.start && match!.index + content.length > m.start
    );
    if (!isDuplicate) {
      matches.push({
        start: match.index,
        end: match.index + content.length,
        content: content,
      });
    }
  }
  
  // Pattern 3: Parenthesized expressions with variables and exponents
  // Matches: (x^2-11x+30), (x^2-5x+5), etc.
  // Must contain at least one variable with optional exponent
  // Only match if not already part of a fraction or equation
  const parenPattern = /\([^)]*[a-zA-Z]\^?\d*[^)]*\)/g;
  
  while ((match = parenPattern.exec(text)) !== null) {
    const content = match[0];
    // Check if it looks like math (has variables and operators)
    if (/[a-zA-Z]\^?\d*/.test(content) && /[\+\-\*\/=<>≤≥≠]/.test(content)) {
      // Avoid duplicates - check if this is already covered by a fraction or equation
      const isDuplicate = matches.some(m => 
        match!.index >= m.start && match!.index < m.end ||
        match!.index < m.start && match!.index + content.length > m.start
      );
      if (!isDuplicate) {
        matches.push({
          start: match.index,
          end: match.index + content.length,
          content: content,
        });
      }
    }
  }
  
  // Sort matches by start position (reverse order for safe replacement)
  matches.sort((a, b) => b.start - a.start);
  
  // Replace matches with wrapped versions
  for (const match of matches) {
    // Check if already wrapped
    const beforeMatch = result.substring(Math.max(0, match.start - 1), match.start);
    const afterMatch = result.substring(match.end, Math.min(result.length, match.end + 1));
    
    // Don't wrap if already in delimiters
    if (beforeMatch === "$" || afterMatch === "$") {
      continue;
    }
    
    // Wrap the match
    result = result.substring(0, match.start) + 
             `$${match.content}$` + 
             result.substring(match.end);
  }
  
  return result;
}

/**
 * Normalizes multi-line equations that were incorrectly broken by OCR.
 * 
 * OCR sometimes breaks equations across lines like:
 *   2
 *   x
 *   =
 *   6
 * This function detects and fixes these patterns to produce: 2x = 6
 * 
 * @param text - Text that may contain multi-line equations
 * @returns Text with normalized equations
 * 
 * @example
 * ```typescript
 * normalizeMultiLineEquations("5) \\quad 2\nx\n=\n6\nx=6")
 * // Returns: "5) \\quad 2x = 6\nx=6"
 * ```
 */
export function normalizeMultiLineEquations(text: string): string {
  if (!text || text.trim() === "") return text;
  
  // Split into lines, but preserve line breaks for processing
  const lines = text.split(/\r?\n/);
  const result: string[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const currentLine = lines[i].trim();
    
    // Check for patterns like:
    // \quad NUMBER
    // VARIABLE
    // =
    // NUMBER
    // VARIABLE=NUMBER (duplicate solution)
    if (currentLine.includes("\\quad")) {
      const equationParts: string[] = [currentLine];
      let j = i + 1;
      let looksLikeEquation = false;
      
      // Collect consecutive lines that look like equation fragments
      while (j < lines.length && j < i + 6) { // Max 6 lines for equation
        const nextLine = lines[j].trim();
        
        // Empty line breaks the pattern
        if (!nextLine) {
          break;
        }
        
        // Check if this could be part of an equation
        // Matches: single variable, number, operator, or simple expressions like "x=6"
        const isMathFragment = /^[a-zA-Z]$|^\d+$|^[=\+\-\*\/]$|^[a-zA-Z]\s*=\s*\d+$/.test(nextLine);
        
        // Check if line contains text words (not math) - breaks pattern
        const hasTextWords = /^[a-zA-Z]{2,}/.test(nextLine) && !/^[a-zA-Z]\s*=\s*\d+$/.test(nextLine);
        
        if (hasTextWords) {
          break;
        }
        
        if (isMathFragment) {
          equationParts.push(nextLine);
          if (/^[=\+\-\*\/]$/.test(nextLine)) {
            looksLikeEquation = true;
          }
          // Check for duplicate solution pattern like "x=6"
          if (/^[a-zA-Z]\s*=\s*\d+$/.test(nextLine)) {
            looksLikeEquation = true;
          }
          j++;
        } else {
          break;
        }
      }
      
      // If we found a broken equation pattern, reconstruct it
      if (looksLikeEquation && equationParts.length > 2) {
        // Reconstruct: keep \quad part, join rest intelligently
        const quadMatch = equationParts[0].match(/^(\d+\)\s*\\quad\s*\d+)/);
        if (quadMatch) {
          // Pattern: "5) \quad 2" -> keep as is
          const quadPart = quadMatch[1];
          const rest = equationParts.slice(1);
          
          // Join rest parts intelligently
          let reconstructed = quadPart;
          for (const part of rest) {
            // If it's an operator, add space before and after
            if (/^[=\+\-\*\/]$/.test(part)) {
              reconstructed += " " + part;
            } else if (/^[a-zA-Z]\s*=\s*\d+$/.test(part)) {
              // Duplicate solution - skip it
              continue;
            } else {
              // Variable or number - join directly (no space for variables after numbers)
              if (/^\d+$/.test(part)) {
                reconstructed += " " + part;
              } else {
                reconstructed += part;
              }
            }
          }
          
          // Clean up spacing
          reconstructed = reconstructed.replace(/\s+/g, " ");
          reconstructed = reconstructed.replace(/\s*=\s*/g, " = ");
          
          result.push(reconstructed);
          i = j;
          continue;
        }
      }
    }
    
    // Check if this looks like the start of a broken equation (without \quad)
    // Pattern: line ends with number/variable, followed by lines with just variable/number/operator
    if (currentLine && /[\d\)]$/.test(currentLine) && !currentLine.includes("\\quad")) {
      // Look ahead to see if we have a broken equation pattern
      const equationParts: string[] = [currentLine];
      let j = i + 1;
      let looksLikeEquation = false;
      
      // Collect consecutive lines that look like equation fragments
      while (j < lines.length && j < i + 5) {
        const nextLine = lines[j].trim();
        
        // Empty line or line with text (not math) breaks the pattern
        if (!nextLine || (/^[a-zA-Z]{2,}/.test(nextLine) && !/^[a-zA-Z]\s*=\s*\d+$/.test(nextLine))) {
          break;
        }
        
        // Check if this could be part of an equation
        // Matches: single variable, number, operator, or simple expressions
        if (/^[a-zA-Z]$|^\d+$|^[=\+\-\*\/]$|^[a-zA-Z]\s*=\s*\d+$/.test(nextLine)) {
          equationParts.push(nextLine);
          if (/^[=\+\-\*\/]$|^[a-zA-Z]\s*=\s*\d+$/.test(nextLine)) {
            looksLikeEquation = true;
          }
          j++;
        } else {
          break;
        }
      }
      
      // If we found a broken equation pattern, reconstruct it
      if (looksLikeEquation && equationParts.length > 2) {
        // Reconstruct: join parts intelligently
        let reconstructed = equationParts[0];
        let hasDuplicateSolution = false;
        
        for (let k = 1; k < equationParts.length; k++) {
          const part = equationParts[k];
          
          // Skip duplicate solutions (pattern like "x=6" after we've already constructed the equation)
          if (/^[a-zA-Z]\s*=\s*\d+$/.test(part)) {
            hasDuplicateSolution = true;
            continue; // Skip this duplicate solution
          }
          
          // If it's an operator, add space before and after
          if (/^[=\+\-\*\/]$/.test(part)) {
            reconstructed += " " + part;
          } else if (/^\d+$/.test(part)) {
            // Number - add space before
            reconstructed += " " + part;
          } else {
            // Variable - join directly (no space)
            reconstructed += part;
          }
        }
        
        // Clean up spacing around operators
        reconstructed = reconstructed.replace(/\s+/g, " ");
        reconstructed = reconstructed.replace(/\s*=\s*/g, " = ");
        reconstructed = reconstructed.replace(/\s*\+\s*/g, " + ");
        reconstructed = reconstructed.replace(/\s*-\s*/g, " - ");
        reconstructed = reconstructed.replace(/\s*\*\s*/g, " * ");
        reconstructed = reconstructed.replace(/\s*\/\s*/g, " / ");
        
        // Remove duplicate solutions (e.g., "2x = 6 x=6" -> "2x = 6")
        reconstructed = reconstructed.replace(/\s+([a-zA-Z])\s*=\s*(\d+)\s+\1\s*=\s*\2/g, ' $1 = $2');
        
        result.push(reconstructed);
        i = j;
        continue;
      }
    }
    
    // Regular line - keep as is
    result.push(lines[i]);
    i++;
  }
  
  // Post-process: remove duplicate equations that appear after broken ones
  // Pattern: broken equation followed (possibly after blank lines) by complete equation like "(x^2-5x+5)=1"
  const finalResult: string[] = [];
  for (let k = 0; k < result.length; k++) {
    const currentLine = result[k].trim();
    
    // Check if this line looks like a complete equation (e.g., "(x^2-5x+5)=1" or "(x^2-5x+5)")
    // that might be a duplicate of a previous broken equation
    if (/^\([^)]*[a-zA-Z][^)]*\)\s*(?:=\s*\d+)?$/.test(currentLine)) {
      // Look backwards through blank lines to find a previous equation
      let prevIdx = k - 1;
      while (prevIdx >= 0 && result[prevIdx].trim() === "") {
        prevIdx--;
      }
      
      if (prevIdx >= 0) {
        const prevLine = result[prevIdx].trim();
        
        // Check if previous line contains an equation with similar content
        // Extract equation parts to compare
        const currentMatch = currentLine.match(/^\(([^)]*)\)(?:\s*=\s*(\d+))?$/);
        const prevMatch = prevLine.match(/\(([^)]*)\)(?:\s*=\s*(\d+))?/);
        
        if (currentMatch && prevMatch) {
          // Normalize expressions for comparison (remove spaces, compare structure)
          const currentExpr = currentMatch[1].replace(/\s+/g, '').toLowerCase();
          const prevExpr = prevMatch[1].replace(/\s+/g, '').toLowerCase();
          
          // If expressions match structurally
          if (currentExpr === prevExpr) {
            const currentResult = currentMatch[2];
            const prevResult = prevMatch[2];
            
            // Skip if same result, or if current is incomplete and prev is complete
            if (currentResult === prevResult || (!currentResult && prevResult)) {
              continue; // Skip duplicate
            }
          }
        }
      }
    }
    
    finalResult.push(result[k]);
  }
  
  return finalResult.join("\n");
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

