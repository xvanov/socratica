import { describe, it, expect } from "vitest";
import { parseLaTeX, hasLaTeX, cleanLaTeX, autoWrapMath, normalizeMultiLineEquations, type ParsedSegment } from "../latex-parser";

describe("latex-parser", () => {
  describe("cleanLaTeX", () => {
    it("should remove \\hspace commands from LaTeX", () => {
      const input = "f(x) = \\frac{3}{4}x + 10, \\hspace{1cm} g(x) = x^2";
      const result = cleanLaTeX(input);
      expect(result).toBe("f(x) = \\frac{3}{4}x + 10, g(x) = x^2");
    });

    it("should remove \\hspace* commands", () => {
      const input = "f(x) = x^2 \\hspace*{0.5in} g(x) = x^3";
      const result = cleanLaTeX(input);
      expect(result).toBe("f(x) = x^2 g(x) = x^3");
    });

    it("should remove multiple \\hspace commands", () => {
      const input = "a \\hspace{1cm} b \\hspace{2cm} c";
      const result = cleanLaTeX(input);
      expect(result).toBe("a b c");
    });

    it("should remove \\vspace commands", () => {
      const input = "f(x) = x^2 \\vspace{1cm} g(x) = x^3";
      const result = cleanLaTeX(input);
      expect(result).toBe("f(x) = x^2 g(x) = x^3");
    });

    it("should remove \\hskip commands", () => {
      const input = "f(x) = x^2 \\hskip 1cm g(x) = x^3";
      const result = cleanLaTeX(input);
      expect(result).toBe("f(x) = x^2 g(x) = x^3");
    });

    it("should remove \\vskip commands", () => {
      const input = "f(x) = x^2 \\vskip 1cm g(x) = x^3";
      const result = cleanLaTeX(input);
      expect(result).toBe("f(x) = x^2 g(x) = x^3");
    });

    it("should handle empty string", () => {
      expect(cleanLaTeX("")).toBe("");
    });

    it("should handle string without spacing commands", () => {
      const input = "f(x) = \\frac{3}{4}x + 10";
      expect(cleanLaTeX(input)).toBe(input);
    });

    it("should clean up multiple spaces after removing commands", () => {
      const input = "a \\hspace{1cm}  \\hspace{1cm}  b";
      const result = cleanLaTeX(input);
      expect(result).toBe("a b");
    });

    it("should handle the OCR bug case", () => {
      const input = "f(x) = \\frac{3}{4}x + 10, \\hspace{1cm} g(x) = x^2 - 3.";
      const result = cleanLaTeX(input);
      expect(result).toBe("f(x) = \\frac{3}{4}x + 10, g(x) = x^2 - 3.");
    });
  });

  describe("parseLaTeX", () => {
    it("should return text segment for empty input", () => {
      const result = parseLaTeX("");
      expect(result).toEqual([{ type: "text", content: "" }]);
    });

    it("should return text segment for plain text", () => {
      const result = parseLaTeX("Plain text without math");
      expect(result).toEqual([
        { type: "text", content: "Plain text without math" },
      ]);
    });

    it("should parse inline math expression", () => {
      const result = parseLaTeX("Solve for $x$");
      expect(result).toEqual([
        { type: "text", content: "Solve for " },
        { type: "inline-math", content: "x", raw: "$x$" },
      ]);
    });

    it("should parse block math expression", () => {
      const result = parseLaTeX("Equation: $$x^2 + 5 = 0$$");
      expect(result).toEqual([
        { type: "text", content: "Equation: " },
        { type: "block-math", content: "x^2 + 5 = 0", raw: "$$x^2 + 5 = 0$$" },
      ]);
    });

    it("should parse multiple inline math expressions", () => {
      const result = parseLaTeX("Solve for $x$ in $x^2 + 5 = 0$");
      expect(result).toEqual([
        { type: "text", content: "Solve for " },
        { type: "inline-math", content: "x", raw: "$x$" },
        { type: "text", content: " in " },
        { type: "inline-math", content: "x^2 + 5 = 0", raw: "$x^2 + 5 = 0$" },
      ]);
    });

    it("should handle mixed text and math", () => {
      const result = parseLaTeX("Find $x$ when $y = 5$ and $z = 10$");
      expect(result).toEqual([
        { type: "text", content: "Find " },
        { type: "inline-math", content: "x", raw: "$x$" },
        { type: "text", content: " when " },
        { type: "inline-math", content: "y = 5", raw: "$y = 5$" },
        { type: "text", content: " and " },
        { type: "inline-math", content: "z = 10", raw: "$z = 10$" },
      ]);
    });

    it("should handle escaped dollar signs", () => {
      const result = parseLaTeX("Price is \\$10");
      expect(result).toEqual([{ type: "text", content: "Price is $10" }]);
    });

    it("should handle unclosed inline math as text", () => {
      const result = parseLaTeX("Solve for $x");
      expect(result).toEqual([{ type: "text", content: "Solve for $x" }]);
    });

    it("should handle unclosed block math as text", () => {
      const result = parseLaTeX("Equation: $$x^2");
      expect(result).toEqual([{ type: "text", content: "Equation: $$x^2" }]);
    });

    it("should handle block math before inline math", () => {
      const result = parseLaTeX("$$\\frac{a}{b}$$ and $x$");
      expect(result).toEqual([
        { type: "block-math", content: "\\frac{a}{b}", raw: "$$\\frac{a}{b}$$" },
        { type: "text", content: " and " },
        { type: "inline-math", content: "x", raw: "$x$" },
      ]);
    });

    it("should trim math content", () => {
      const result = parseLaTeX("Solve for $  x  $");
      expect(result).toEqual([
        { type: "text", content: "Solve for " },
        { type: "inline-math", content: "x", raw: "$  x  $" },
      ]);
    });

    it("should handle math at start of string", () => {
      const result = parseLaTeX("$x$ is a variable");
      expect(result).toEqual([
        { type: "inline-math", content: "x", raw: "$x$" },
        { type: "text", content: " is a variable" },
      ]);
    });

    it("should handle math at end of string", () => {
      const result = parseLaTeX("Variable is $x$");
      expect(result).toEqual([
        { type: "text", content: "Variable is " },
        { type: "inline-math", content: "x", raw: "$x$" },
      ]);
    });

    it("should parse inline math with \\(...\\) format", () => {
      const result = parseLaTeX("Solve for \\(x\\)");
      expect(result).toEqual([
        { type: "text", content: "Solve for " },
        { type: "inline-math", content: "x", raw: "\\(x\\)" },
      ]);
    });

    it("should parse block math with \\[...\\] format", () => {
      const result = parseLaTeX("Equation: \\[x^2 + 5 = 0\\]");
      expect(result).toEqual([
        { type: "text", content: "Equation: " },
        { type: "block-math", content: "x^2 + 5 = 0", raw: "\\[x^2 + 5 = 0\\]" },
      ]);
    });

    it("should parse multiple \\(...\\) expressions", () => {
      const result = parseLaTeX("What do you think the first step should be to solve for \\( x \\)? What could you do to isolate the \\( x^2 \\) term?");
      expect(result).toEqual([
        { type: "text", content: "What do you think the first step should be to solve for " },
        { type: "inline-math", content: "x", raw: "\\( x \\)" },
        { type: "text", content: "? What could you do to isolate the " },
        { type: "inline-math", content: "x^2", raw: "\\( x^2 \\)" },
        { type: "text", content: " term?" },
      ]);
    });

    it("should handle mixed $...$ and \\(...\\) formats", () => {
      const result = parseLaTeX("Solve for $x$ in \\(x^2 + 5 = 0\\)");
      expect(result).toEqual([
        { type: "text", content: "Solve for " },
        { type: "inline-math", content: "x", raw: "$x$" },
        { type: "text", content: " in " },
        { type: "inline-math", content: "x^2 + 5 = 0", raw: "\\(x^2 + 5 = 0\\)" },
      ]);
    });

    it("should handle only math expression", () => {
      const result = parseLaTeX("$x^2 + 5$");
      expect(result).toEqual([
        { type: "inline-math", content: "x^2 + 5", raw: "$x^2 + 5$" },
      ]);
    });

    it("should handle block math only", () => {
      const result = parseLaTeX("$$\\frac{a}{b}$$");
      expect(result).toEqual([
        { type: "block-math", content: "\\frac{a}{b}", raw: "$$\\frac{a}{b}$$" },
      ]);
    });

    it("should handle consecutive dollar signs correctly", () => {
      const result = parseLaTeX("$$x$$ and $$y$$");
      expect(result).toEqual([
        { type: "block-math", content: "x", raw: "$$x$$" },
        { type: "text", content: " and " },
        { type: "block-math", content: "y", raw: "$$y$$" },
      ]);
    });

    it("should remove \\hspace from parsed inline math expressions", () => {
      const result = parseLaTeX("Let $f(x) = \\frac{3}{4}x + 10, \\hspace{1cm} g(x) = x^2$");
      expect(result).toEqual([
        { type: "text", content: "Let " },
        { type: "inline-math", content: "f(x) = \\frac{3}{4}x + 10, g(x) = x^2", raw: "$f(x) = \\frac{3}{4}x + 10, \\hspace{1cm} g(x) = x^2$" },
      ]);
    });

    it("should remove \\hspace from parsed block math expressions", () => {
      const result = parseLaTeX("$$f(x) = x^2 \\hspace{1cm} g(x) = x^3$$");
      expect(result).toEqual([
        { type: "block-math", content: "f(x) = x^2 g(x) = x^3", raw: "$$f(x) = x^2 \\hspace{1cm} g(x) = x^3$$" },
      ]);
    });

    it("should handle OCR output with \\hspace in \\(...\\) format", () => {
      const result = parseLaTeX("Let \\( f(x) = \\frac{3}{4}x + 10, \\hspace{1cm} g(x) = x^2 - 3. \\)");
      expect(result).toEqual([
        { type: "text", content: "Let " },
        { type: "inline-math", content: "f(x) = \\frac{3}{4}x + 10, g(x) = x^2 - 3.", raw: "\\( f(x) = \\frac{3}{4}x + 10, \\hspace{1cm} g(x) = x^2 - 3. \\)" },
      ]);
    });
  });

  describe("hasLaTeX", () => {
    it("should return false for empty string", () => {
      expect(hasLaTeX("")).toBe(false);
    });

    it("should return false for plain text", () => {
      expect(hasLaTeX("Plain text without math")).toBe(false);
    });

    it("should return true for inline math", () => {
      expect(hasLaTeX("Solve for $x$")).toBe(true);
    });

    it("should return true for block math", () => {
      expect(hasLaTeX("Equation: $$x^2 + 5 = 0$$")).toBe(true);
    });

    it("should return false for escaped dollar signs", () => {
      expect(hasLaTeX("Price is \\$10")).toBe(false);
    });

    it("should return false for unclosed math", () => {
      expect(hasLaTeX("Solve for $x")).toBe(false);
    });

    it("should return true for math at start", () => {
      expect(hasLaTeX("$x$ is a variable")).toBe(true);
    });

    it("should return true for math at end", () => {
      expect(hasLaTeX("Variable is $x$")).toBe(true);
    });

    it("should return true for only math", () => {
      expect(hasLaTeX("$x^2 + 5$")).toBe(true);
    });

    it("should detect \\(...\\) format", () => {
      expect(hasLaTeX("Solve for \\(x\\)")).toBe(true);
    });

    it("should detect \\[...\\] format", () => {
      expect(hasLaTeX("Equation: \\[x^2 + 5 = 0\\]")).toBe(true);
    });
  });

  describe("autoWrapMath", () => {
    it("should wrap parenthesized math expressions", () => {
      const input = "Solve for x: (x^2-11x+30)";
      const result = autoWrapMath(input);
      expect(result).toBe("Solve for x: $(x^2-11x+30)$");
    });

    it("should wrap equations with variables", () => {
      const input = "Solve for x: (x^2-5x+5)=1";
      const result = autoWrapMath(input);
      expect(result).toBe("Solve for x: $(x^2-5x+5)=1$");
    });

    it("should handle the OCR bug case", () => {
      const input = `Solve for "x"

(x^2-11x+30)

(x^2-5x+5)=1`;
      const result = autoWrapMath(input);
      expect(result).toContain("$(x^2-11x+30)$");
      expect(result).toContain("$(x^2-5x+5)=1$");
    });

    it("should wrap fractions with variables", () => {
      const input = "Simplify: (a+b)/(c+d)";
      const result = autoWrapMath(input);
      expect(result).toBe("Simplify: $(a+b)/(c+d)$");
    });

    it("should not wrap text that already has LaTeX delimiters", () => {
      const input = "Solve for $x$ in $x^2 + 5 = 0$";
      const result = autoWrapMath(input);
      expect(result).toBe(input); // Should remain unchanged
    });

    it("should handle empty string", () => {
      expect(autoWrapMath("")).toBe("");
    });

    it("should handle plain text without math", () => {
      const input = "This is just plain text";
      expect(autoWrapMath(input)).toBe(input);
    });

    it("should wrap multiple math expressions", () => {
      const input = "First: (x^2+5x+6) and second: (y^2+3y+2)";
      const result = autoWrapMath(input);
      expect(result).toContain("$(x^2+5x+6)$");
      expect(result).toContain("$(y^2+3y+2)$");
    });
  });

  describe("normalizeMultiLineEquations", () => {
    it("should normalize broken equations with \\quad pattern", () => {
      const input = `5) \\quad 2
x
=
6
x=6`;
      const result = normalizeMultiLineEquations(input);
      expect(result).toBe("5) \\quad 2x = 6");
    });

    it("should normalize broken equations without \\quad", () => {
      const input = `5) 2
x
=
6
x=6`;
      const result = normalizeMultiLineEquations(input);
      expect(result).toBe("5) 2x = 6");
    });

    it("should handle multiple broken equations", () => {
      const input = `5) \\quad 2
x
=
6

6) \\quad 3
z
=
24`;
      const result = normalizeMultiLineEquations(input);
      expect(result).toContain("5) \\quad 2x = 6");
      expect(result).toContain("6) \\quad 3z = 24");
    });

    it("should preserve intentional line breaks between problems", () => {
      const input = `Solve the following equations

1) y + 4 = 9

2) k + 5 = 7`;
      const result = normalizeMultiLineEquations(input);
      expect(result).toContain("Solve the following equations");
      expect(result).toContain("1) y + 4 = 9");
      expect(result).toContain("2) k + 5 = 7");
    });

    it("should handle equations with operators on separate lines", () => {
      const input = `5) \\quad 2
x
+
3
=
9`;
      const result = normalizeMultiLineEquations(input);
      expect(result).toBe("5) \\quad 2x + 3 = 9");
    });

    it("should handle empty string", () => {
      expect(normalizeMultiLineEquations("")).toBe("");
    });

    it("should handle text without broken equations", () => {
      const input = "Solve for x: 2x = 6";
      expect(normalizeMultiLineEquations(input)).toBe(input);
    });

    it("should remove duplicate solutions", () => {
      const input = `5) \\quad 2
x
=
6
x=6`;
      const result = normalizeMultiLineEquations(input);
      expect(result).toBe("5) \\quad 2x = 6");
      expect(result).not.toContain("x=6");
    });
  });
});

