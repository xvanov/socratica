/**
 * Validation utilities for problem input
 * Provides reusable validation functions for text and image inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

const MIN_TEXT_LENGTH = 3;
const MIN_MESSAGE_LENGTH = 1;

/**
 * Validates problem text input
 * @param text - The problem text to validate
 * @returns ValidationResult with isValid flag and error message
 */
export function validateProblemText(text: string): ValidationResult {
  // Check if text is empty
  if (!text || text.length === 0) {
    return {
      isValid: false,
      error: "Please enter your math problem.",
    };
  }

  // Check if text is only whitespace
  if (!text.trim()) {
    return {
      isValid: false,
      error: "Please enter some text (not just spaces).",
    };
  }

  // Check minimum length
  if (text.trim().length < MIN_TEXT_LENGTH) {
    return {
      isValid: false,
      error: `Please enter a complete math problem (at least ${MIN_TEXT_LENGTH} characters).`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates message text input
 * @param text - The message text to validate
 * @returns ValidationResult with isValid flag and error message
 */
export function validateMessage(text: string): ValidationResult {
  // Check if text is empty
  if (!text || text.length === 0) {
    return {
      isValid: false,
      error: "Please enter your message.",
    };
  }

  // Check if text is only whitespace
  if (!text.trim()) {
    return {
      isValid: false,
      error: "Please enter some text (not just spaces).",
    };
  }

  // Check minimum length
  if (text.trim().length < MIN_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `Please enter a complete message (at least ${MIN_MESSAGE_LENGTH} character).`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Checks if text is empty
 */
export function isEmpty(text: string): boolean {
  return !text || text.length === 0;
}

/**
 * Checks if text is only whitespace
 */
export function isWhitespaceOnly(text: string): boolean {
  return !text.trim();
}

/**
 * Checks if text meets minimum length requirement
 */
export function meetsMinLength(text: string, minLength: number = MIN_TEXT_LENGTH): boolean {
  return text.trim().length >= minLength;
}

/**
 * Generates error message for empty text
 */
export function getEmptyTextError(): string {
  return "Please enter your math problem.";
}

/**
 * Generates error message for whitespace-only text
 */
export function getWhitespaceOnlyError(): string {
  return "Please enter some text (not just spaces).";
}

/**
 * Generates error message for minimum length validation
 */
export function getMinLengthError(minLength: number = MIN_TEXT_LENGTH): string {
  return `Please enter a complete math problem (at least ${minLength} characters).`;
}
