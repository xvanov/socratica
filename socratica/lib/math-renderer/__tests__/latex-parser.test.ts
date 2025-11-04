import { describe, it, expect } from "vitest";
import { parseLaTeX, hasLaTeX, type ParsedSegment } from "../latex-parser";

describe("latex-parser", () => {
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
});

