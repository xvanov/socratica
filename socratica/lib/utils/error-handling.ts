/**
 * Error handling utilities for user-friendly error messages
 * Provides functions to format errors and convert technical errors to user-friendly messages
 */

export enum ErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  API_ERROR = "API_ERROR",
  OCR_ERROR = "OCR_ERROR",
  FILE_ERROR = "FILE_ERROR",
  SYSTEM_ERROR = "SYSTEM_ERROR",
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  action?: string; // What the user should do
  retryable?: boolean; // Whether the error can be retried
}

/**
 * Error message constants for consistency
 */
export const ERROR_MESSAGES = {
  NETWORK: {
    GENERIC: "We're having trouble connecting. Please check your internet connection and try again.",
    TIMEOUT: "The request took too long. Please check your connection and try again.",
    OFFLINE: "You appear to be offline. Please check your internet connection and try again.",
    RETRY: "Connection failed. Please try again.",
  },
  API: {
    GENERIC: "We couldn't process your request. Please try again.",
    RATE_LIMIT: "You're sending messages too quickly. Please wait a moment and try again.",
    SERVER_ERROR: "The service is temporarily unavailable. Please try again in a moment.",
    UNAUTHORIZED: "There was an authentication issue. Please refresh the page and try again.",
  },
  VALIDATION: {
    EMPTY: "Please enter your message or problem.",
    WHITESPACE_ONLY: "Please enter some text (not just spaces).",
    TOO_SHORT: "Please enter a complete message or problem.",
  },
  OCR: {
    GENERIC: "We couldn't read text from your image. Please try a clearer photo or type your problem directly.",
    NO_TEXT: "No text was found in your image. Please try a clearer photo or type your problem directly.",
    RATE_LIMIT: "You're uploading images too quickly. Please wait a moment and try again.",
    FILE_TOO_LARGE: "Your image is too large. Please use an image smaller than 10MB.",
    INVALID_FORMAT: "Please upload a JPG, PNG, or WebP image.",
  },
  FILE: {
    INVALID_TYPE: "Please upload a JPG, PNG, or WebP image.",
    TOO_LARGE: "Your image is too large. Please choose a smaller image (under 10MB).",
    CORRUPTED: "The image file appears to be corrupted. Please try a different image.",
  },
  SYSTEM: {
    GENERIC: "Something went wrong. Please try again or refresh the page.",
  },
} as const;

/**
 * Formats an error into a user-friendly message
 * @param error - The error to format (can be Error, string, or unknown)
 * @param errorType - Optional error type to help with formatting
 * @returns User-friendly error message
 */
export function formatError(
  error: unknown,
  errorType?: ErrorType
): string {
  // If it's an Error object, extract the message
  const errorMessage =
    error instanceof Error ? error.message : String(error);

  // If errorType is provided, use it directly
  if (errorType) {
    return getUserFriendlyError(errorType, errorMessage);
  }

  // If it's a string, check if it's already user-friendly
  if (typeof error === "string") {
    // Check if it's already user-friendly (doesn't contain technical terms)
    // User-friendly messages typically start with "Please" or "We" or contain action words
    const isUserFriendly =
      error.startsWith("Please") ||
      error.startsWith("We") ||
      error.startsWith("Your") ||
      (error.length > 30 && // Long messages are likely user-friendly
        !error.includes("API") &&
        !error.includes("500") &&
        !error.includes("404") &&
        !error.includes("fetch") &&
        !error.includes("Failed to") &&
        !error.toLowerCase().includes("error") &&
        !error.toLowerCase().includes("failed"));
    
    if (isUserFriendly) {
      return error;
    }
  }

  // Determine error type from message if not provided
  const detectedType = detectErrorType(errorMessage);

  // Format based on error type
  return getUserFriendlyError(detectedType, errorMessage);
}

/**
 * Detects error type from error message
 * @param errorMessage - The error message to analyze
 * @returns Detected ErrorType
 */
export function detectErrorType(errorMessage: string): ErrorType {
  const lowerMessage = errorMessage.toLowerCase();

  // Network errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("connection") ||
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("offline")
  ) {
    return ErrorType.NETWORK_ERROR;
  }

  // API errors
  if (
    lowerMessage.includes("api") ||
    lowerMessage.includes("500") ||
    lowerMessage.includes("503") ||
    lowerMessage.includes("502") ||
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("429")
  ) {
    return ErrorType.API_ERROR;
  }

  // OCR errors
  if (
    lowerMessage.includes("ocr") ||
    lowerMessage.includes("image") ||
    lowerMessage.includes("extract") ||
    lowerMessage.includes("read text")
  ) {
    return ErrorType.OCR_ERROR;
  }

  // File errors
  if (
    lowerMessage.includes("file") ||
    lowerMessage.includes("upload") ||
    lowerMessage.includes("size") ||
    lowerMessage.includes("format") ||
    lowerMessage.includes("corrupted")
  ) {
    return ErrorType.FILE_ERROR;
  }

  // Validation errors
  if (
    lowerMessage.includes("validation") ||
    lowerMessage.includes("invalid") ||
    lowerMessage.includes("empty") ||
    lowerMessage.includes("required")
  ) {
    return ErrorType.VALIDATION_ERROR;
  }

  // Default to system error
  return ErrorType.SYSTEM_ERROR;
}

/**
 * Gets user-friendly error message for error type
 * @param errorType - The type of error
 * @param originalMessage - Optional original error message for context
 * @returns User-friendly error message
 */
export function getUserFriendlyError(
  errorType: ErrorType,
  originalMessage?: string
): string {
  switch (errorType) {
    case ErrorType.NETWORK_ERROR:
      if (originalMessage?.toLowerCase().includes("timeout")) {
        return ERROR_MESSAGES.NETWORK.TIMEOUT;
      }
      if (originalMessage?.toLowerCase().includes("offline")) {
        return ERROR_MESSAGES.NETWORK.OFFLINE;
      }
      return ERROR_MESSAGES.NETWORK.GENERIC;

    case ErrorType.API_ERROR:
      if (
        originalMessage?.toLowerCase().includes("rate limit") ||
        originalMessage?.toLowerCase().includes("too many requests") ||
        originalMessage?.includes("429")
      ) {
        return ERROR_MESSAGES.API.RATE_LIMIT;
      }
      if (
        originalMessage?.includes("500") ||
        originalMessage?.includes("503") ||
        originalMessage?.includes("502")
      ) {
        return ERROR_MESSAGES.API.SERVER_ERROR;
      }
      if (originalMessage?.includes("401") || originalMessage?.includes("403")) {
        return ERROR_MESSAGES.API.UNAUTHORIZED;
      }
      return ERROR_MESSAGES.API.GENERIC;

    case ErrorType.OCR_ERROR:
      if (originalMessage?.toLowerCase().includes("no text") || originalMessage?.toLowerCase().includes("no text was found")) {
        return ERROR_MESSAGES.OCR.NO_TEXT;
      }
      if (originalMessage?.toLowerCase().includes("rate limit") || originalMessage?.includes("429")) {
        return ERROR_MESSAGES.OCR.RATE_LIMIT;
      }
      return ERROR_MESSAGES.OCR.GENERIC;

    case ErrorType.FILE_ERROR:
      if (originalMessage?.toLowerCase().includes("size") || originalMessage?.toLowerCase().includes("too large")) {
        return ERROR_MESSAGES.FILE.TOO_LARGE;
      }
      if (originalMessage?.toLowerCase().includes("type") || originalMessage?.toLowerCase().includes("format")) {
        return ERROR_MESSAGES.FILE.INVALID_TYPE;
      }
      if (originalMessage?.toLowerCase().includes("corrupted") || originalMessage?.toLowerCase().includes("invalid")) {
        return ERROR_MESSAGES.FILE.CORRUPTED;
      }
      return ERROR_MESSAGES.FILE.INVALID_TYPE;

    case ErrorType.VALIDATION_ERROR:
      if (originalMessage?.toLowerCase().includes("empty")) {
        return ERROR_MESSAGES.VALIDATION.EMPTY;
      }
      if (originalMessage?.toLowerCase().includes("whitespace") || originalMessage?.toLowerCase().includes("spaces")) {
        return ERROR_MESSAGES.VALIDATION.WHITESPACE_ONLY;
      }
      if (originalMessage?.toLowerCase().includes("short") || originalMessage?.toLowerCase().includes("length")) {
        return ERROR_MESSAGES.VALIDATION.TOO_SHORT;
      }
      return ERROR_MESSAGES.VALIDATION.EMPTY;

    case ErrorType.SYSTEM_ERROR:
    default:
      return ERROR_MESSAGES.SYSTEM.GENERIC;
  }
}

/**
 * Gets error information including type, message, and action
 * @param error - The error to analyze
 * @returns ErrorInfo object with type, message, action, and retryable flag
 */
export function getErrorInfo(error: unknown): ErrorInfo {
  const errorMessage =
    error instanceof Error ? error.message : String(error);
  const errorType = detectErrorType(errorMessage);
  const message = getUserFriendlyError(errorType, errorMessage);

  // Determine if error is retryable
  const retryable =
    errorType === ErrorType.NETWORK_ERROR ||
    errorType === ErrorType.API_ERROR ||
    errorType === ErrorType.OCR_ERROR;

  // Determine suggested action
  let action: string | undefined;
  switch (errorType) {
    case ErrorType.NETWORK_ERROR:
      action = "Check your internet connection and try again.";
      break;
    case ErrorType.API_ERROR:
      if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
        action = "Wait a moment and try again.";
      } else {
        action = "Please try again in a moment.";
      }
      break;
    case ErrorType.OCR_ERROR:
      action = "Try a clearer photo or type your problem directly.";
      break;
    case ErrorType.FILE_ERROR:
      if (errorMessage.toLowerCase().includes("size")) {
        action = "Choose a smaller image (under 10MB).";
      } else if (errorMessage.toLowerCase().includes("type")) {
        action = "Upload a JPG, PNG, or WebP image.";
      } else {
        action = "Try a different image.";
      }
      break;
    case ErrorType.VALIDATION_ERROR:
      if (errorMessage.toLowerCase().includes("empty")) {
        action = "Enter your message or problem.";
      } else if (errorMessage.toLowerCase().includes("short")) {
        action = "Enter a complete message or problem.";
      } else {
        action = "Check your input and try again.";
      }
      break;
    default:
      action = "Please try again or refresh the page.";
  }

  return {
    type: errorType,
    message,
    action,
    retryable,
  };
}

