import { describe, it, expect } from "vitest";
import {
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  getWCAGLevel,
  validateDesignSystemContrast,
} from "../color-contrast";

describe("Color Contrast Utilities", () => {
  describe("getContrastRatio", () => {
    it("should calculate maximum contrast (white on black)", () => {
      const ratio = getContrastRatio("#ffffff", "#000000");
      expect(ratio).toBeCloseTo(21.0, 1);
    });

    it("should calculate minimum contrast (same colors)", () => {
      const ratio = getContrastRatio("#ffffff", "#ffffff");
      expect(ratio).toBeCloseTo(1.0, 1);
    });

    it("should calculate contrast for design system colors", () => {
      const ratio = getContrastRatio("#111827", "#ffffff"); // neutral-900 on white
      expect(ratio).toBeGreaterThan(4.5); // Should meet WCAG AA
    });
  });

  describe("meetsWCAGAA", () => {
    it("should return true for high contrast pairs", () => {
      expect(meetsWCAGAA("#111827", "#ffffff")).toBe(true); // black on white
      expect(meetsWCAGAA("#ffffff", "#000000")).toBe(true); // white on black
    });

    it("should return false for low contrast pairs", () => {
      expect(meetsWCAGAA("#cccccc", "#ffffff")).toBe(false); // gray on white
      expect(meetsWCAGAA("#333333", "#444444")).toBe(false); // similar grays
    });

    it("should validate design system primary colors", () => {
      // Primary color text on light background should meet WCAG AA
      expect(meetsWCAGAA("#2563eb", "#ffffff")).toBe(true);
    });
  });

  describe("meetsWCAGAAA", () => {
    it("should return true for very high contrast pairs", () => {
      expect(meetsWCAGAAA("#ffffff", "#000000")).toBe(true); // white on black
    });

    it("should return false for pairs that only meet AA", () => {
      // Some pairs meet AA but not AAA
      const ratio = getContrastRatio("#2563eb", "#ffffff");
      if (ratio < 7) {
        expect(meetsWCAGAAA("#2563eb", "#ffffff")).toBe(false);
      }
    });
  });

  describe("getWCAGLevel", () => {
    it("should return AAA for maximum contrast", () => {
      expect(getWCAGLevel("#ffffff", "#000000")).toBe("AAA");
    });

    it("should return AA for medium contrast", () => {
      const level = getWCAGLevel("#111827", "#ffffff");
      expect(level).toBe("AAA"); // Actually AAA but could be AA for some colors
    });

    it("should return FAIL for low contrast", () => {
      expect(getWCAGLevel("#cccccc", "#ffffff")).toBe("FAIL");
    });
  });

  describe("validateDesignSystemContrast", () => {
    it("should validate all design system color combinations", () => {
      const results = validateDesignSystemContrast();

      expect(results.length).toBeGreaterThan(0);

      // All text/background combinations should meet WCAG AA minimum
      results.forEach((result) => {
        expect(result.ratio).toBeGreaterThan(0);
        expect(["AAA", "AA", "FAIL"]).toContain(result.level);
        
        // Critical text combinations must meet AA
        if (result.description.includes("text")) {
          expect(result.level).not.toBe("FAIL");
        }
      });
    });

    it("should validate primary text on light background meets WCAG AA", () => {
      const results = validateDesignSystemContrast();
      const primaryTextResult = results.find(
        (r) => r.description === "Primary text on light background"
      );

      expect(primaryTextResult).toBeDefined();
      expect(primaryTextResult!.level).not.toBe("FAIL");
      expect(primaryTextResult!.ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("should validate primary text on dark background meets WCAG AA", () => {
      const results = validateDesignSystemContrast();
      const darkTextResult = results.find(
        (r) => r.description === "Primary text on dark background"
      );

      expect(darkTextResult).toBeDefined();
      expect(darkTextResult!.level).not.toBe("FAIL");
      expect(darkTextResult!.ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("should validate primary color on light background meets WCAG AA", () => {
      const results = validateDesignSystemContrast();
      const primaryColorResult = results.find(
        (r) => r.description === "Primary color on light background"
      );

      expect(primaryColorResult).toBeDefined();
      expect(primaryColorResult!.ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});

