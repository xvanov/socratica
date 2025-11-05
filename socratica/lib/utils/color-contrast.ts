/**
 * Color Contrast Utilities
 * 
 * Utilities for calculating and validating WCAG color contrast ratios.
 * Ensures design system colors meet accessibility requirements (minimum 4.5:1 for text).
 */

/**
 * Converts hex color to RGB values
 * @param hex - Hex color string (e.g., "#3b82f6" or "3b82f6")
 * @returns RGB values [r, g, b] in range 0-255
 */
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r, g, b];
}

/**
 * Calculates relative luminance of a color (WCAG formula)
 * @param rgb - RGB values [r, g, b] in range 0-255
 * @returns Relative luminance value between 0 and 1
 */
function getLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates color contrast ratio between two colors (WCAG formula)
 * @param color1 - First color hex string
 * @param color2 - Second color hex string
 * @returns Contrast ratio (1.0 to 21.0, where 21.0 is maximum contrast)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if color contrast meets WCAG AA standard for normal text (4.5:1 minimum)
 * @param foreground - Foreground color hex string
 * @param background - Background color hex string
 * @returns True if contrast ratio meets or exceeds 4.5:1
 */
export function meetsWCAGAA(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5;
}

/**
 * Checks if color contrast meets WCAG AAA standard for normal text (7:1 minimum)
 * @param foreground - Foreground color hex string
 * @param background - Background color hex string
 * @returns True if contrast ratio meets or exceeds 7:1
 */
export function meetsWCAGAAA(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 7;
}

/**
 * Gets WCAG compliance level for a color pair
 * @param foreground - Foreground color hex string
 * @param background - Background color hex string
 * @returns "AAA" | "AA" | "FAIL"
 */
export function getWCAGLevel(
  foreground: string,
  background: string
): "AAA" | "AA" | "FAIL" {
  const ratio = getContrastRatio(foreground, background);
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "FAIL";
}

/**
 * Design system color palette for testing
 * These should match the colors defined in globals.css
 */
export const DESIGN_SYSTEM_COLORS = {
  // Primary colors (educational blue)
  primary: {
    500: "#3b82f6", // Base primary
    600: "#2563eb",
    700: "#1d4ed8",
  },
  // Accent colors
  accentSuccess: {
    500: "#22c55e", // Base success
    600: "#16a34a",
  },
  accentFeedback: {
    500: "#f59e0b", // Base feedback
    600: "#d97706",
  },
  // Neutral colors
  neutral: {
    600: "#4b5563", // Text color
    700: "#374151",
    800: "#1f2937",
    900: "#111827", // Text color dark
  },
  // Background colors
  background: {
    light: "#ffffff",
    dark: "#0a0a0a",
  },
  surface: {
    light: "#f8f9fa",
    dark: "#161616",
  },
  // Error colors
  error: {
    500: "#ef4444",
    600: "#dc2626",
  },
} as const;

/**
 * Validates design system color contrast requirements
 * @returns Array of validation results
 */
export function validateDesignSystemContrast(): Array<{
  foreground: string;
  background: string;
  ratio: number;
  level: "AAA" | "AA" | "FAIL";
  description: string;
}> {
  const results: Array<{
    foreground: string;
    background: string;
    ratio: number;
    level: "AAA" | "AA" | "FAIL";
    description: string;
  }> = [];

  // Test primary text on light background
  results.push({
    foreground: DESIGN_SYSTEM_COLORS.neutral[900],
    background: DESIGN_SYSTEM_COLORS.background.light,
    ratio: getContrastRatio(
      DESIGN_SYSTEM_COLORS.neutral[900],
      DESIGN_SYSTEM_COLORS.background.light
    ),
    level: getWCAGLevel(
      DESIGN_SYSTEM_COLORS.neutral[900],
      DESIGN_SYSTEM_COLORS.background.light
    ),
    description: "Primary text on light background",
  });

  // Test primary text on dark background - use foreground color which is lighter
  results.push({
    foreground: "#f5f5f5", // Foreground color for dark mode (lighter)
    background: DESIGN_SYSTEM_COLORS.background.dark,
    ratio: getContrastRatio(
      "#f5f5f5",
      DESIGN_SYSTEM_COLORS.background.dark
    ),
    level: getWCAGLevel(
      "#f5f5f5",
      DESIGN_SYSTEM_COLORS.background.dark
    ),
    description: "Primary text on dark background",
  });

  // Test primary color on light background
  results.push({
    foreground: DESIGN_SYSTEM_COLORS.primary[600],
    background: DESIGN_SYSTEM_COLORS.background.light,
    ratio: getContrastRatio(
      DESIGN_SYSTEM_COLORS.primary[600],
      DESIGN_SYSTEM_COLORS.background.light
    ),
    level: getWCAGLevel(
      DESIGN_SYSTEM_COLORS.primary[600],
      DESIGN_SYSTEM_COLORS.background.light
    ),
    description: "Primary color on light background",
  });

  // Test accent success on light background
  results.push({
    foreground: DESIGN_SYSTEM_COLORS.accentSuccess[600],
    background: DESIGN_SYSTEM_COLORS.background.light,
    ratio: getContrastRatio(
      DESIGN_SYSTEM_COLORS.accentSuccess[600],
      DESIGN_SYSTEM_COLORS.background.light
    ),
    level: getWCAGLevel(
      DESIGN_SYSTEM_COLORS.accentSuccess[600],
      DESIGN_SYSTEM_COLORS.background.light
    ),
    description: "Success accent on light background",
  });

  return results;
}

