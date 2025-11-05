import { describe, it, expect } from "vitest";
import {
  formatError,
  detectErrorType,
  getUserFriendlyError,
  getErrorInfo,
  ErrorType,
  ERROR_MESSAGES,
} from "../error-handling";

describe("Error Handling Utilities", () => {
  describe("detectErrorType", () => {
    it("should detect network errors", () => {
      expect(detectErrorType("Network error")).toBe(ErrorType.NETWORK_ERROR);
      expect(detectErrorType("Connection failed")).toBe(ErrorType.NETWORK_ERROR);
      expect(detectErrorType("fetch error")).toBe(ErrorType.NETWORK_ERROR);
      expect(detectErrorType("timeout occurred")).toBe(ErrorType.NETWORK_ERROR);
      expect(detectErrorType("offline")).toBe(ErrorType.NETWORK_ERROR);
    });

    it("should detect API errors", () => {
      expect(detectErrorType("API error")).toBe(ErrorType.API_ERROR);
      expect(detectErrorType("500 Internal Server Error")).toBe(ErrorType.API_ERROR);
      expect(detectErrorType("503 Service Unavailable")).toBe(ErrorType.API_ERROR);
      expect(detectErrorType("rate limit exceeded")).toBe(ErrorType.API_ERROR);
      expect(detectErrorType("429")).toBe(ErrorType.API_ERROR);
    });

    it("should detect OCR errors", () => {
      expect(detectErrorType("OCR failed")).toBe(ErrorType.OCR_ERROR);
      expect(detectErrorType("image processing error")).toBe(ErrorType.OCR_ERROR);
      expect(detectErrorType("could not extract text")).toBe(ErrorType.OCR_ERROR);
      expect(detectErrorType("read text from image")).toBe(ErrorType.OCR_ERROR);
    });

    it("should detect file errors", () => {
      expect(detectErrorType("file upload failed")).toBe(ErrorType.FILE_ERROR);
      expect(detectErrorType("file size too large")).toBe(ErrorType.FILE_ERROR);
      expect(detectErrorType("invalid file format")).toBe(ErrorType.FILE_ERROR);
      expect(detectErrorType("file corrupted")).toBe(ErrorType.FILE_ERROR);
    });

    it("should detect validation errors", () => {
      expect(detectErrorType("validation failed")).toBe(ErrorType.VALIDATION_ERROR);
      expect(detectErrorType("invalid input")).toBe(ErrorType.VALIDATION_ERROR);
      expect(detectErrorType("empty field")).toBe(ErrorType.VALIDATION_ERROR);
      expect(detectErrorType("required field")).toBe(ErrorType.VALIDATION_ERROR);
    });

    it("should default to system error for unknown errors", () => {
      expect(detectErrorType("unknown error")).toBe(ErrorType.SYSTEM_ERROR);
      expect(detectErrorType("random message")).toBe(ErrorType.SYSTEM_ERROR);
    });
  });

  describe("getUserFriendlyError", () => {
    it("should return user-friendly network error messages", () => {
      expect(getUserFriendlyError(ErrorType.NETWORK_ERROR)).toBe(
        ERROR_MESSAGES.NETWORK.GENERIC
      );
      expect(getUserFriendlyError(ErrorType.NETWORK_ERROR, "timeout")).toBe(
        ERROR_MESSAGES.NETWORK.TIMEOUT
      );
      expect(getUserFriendlyError(ErrorType.NETWORK_ERROR, "offline")).toBe(
        ERROR_MESSAGES.NETWORK.OFFLINE
      );
    });

    it("should return user-friendly API error messages", () => {
      expect(getUserFriendlyError(ErrorType.API_ERROR)).toBe(
        ERROR_MESSAGES.API.GENERIC
      );
      expect(getUserFriendlyError(ErrorType.API_ERROR, "rate limit")).toBe(
        ERROR_MESSAGES.API.RATE_LIMIT
      );
      expect(getUserFriendlyError(ErrorType.API_ERROR, "500")).toBe(
        ERROR_MESSAGES.API.SERVER_ERROR
      );
      expect(getUserFriendlyError(ErrorType.API_ERROR, "401")).toBe(
        ERROR_MESSAGES.API.UNAUTHORIZED
      );
    });

    it("should return user-friendly OCR error messages", () => {
      expect(getUserFriendlyError(ErrorType.OCR_ERROR)).toBe(
        ERROR_MESSAGES.OCR.GENERIC
      );
      expect(getUserFriendlyError(ErrorType.OCR_ERROR, "no text")).toBe(
        ERROR_MESSAGES.OCR.NO_TEXT
      );
      expect(getUserFriendlyError(ErrorType.OCR_ERROR, "rate limit")).toBe(
        ERROR_MESSAGES.OCR.RATE_LIMIT
      );
    });

    it("should return user-friendly file error messages", () => {
      expect(getUserFriendlyError(ErrorType.FILE_ERROR)).toBe(
        ERROR_MESSAGES.FILE.INVALID_TYPE
      );
      expect(getUserFriendlyError(ErrorType.FILE_ERROR, "size")).toBe(
        ERROR_MESSAGES.FILE.TOO_LARGE
      );
      expect(getUserFriendlyError(ErrorType.FILE_ERROR, "corrupted")).toBe(
        ERROR_MESSAGES.FILE.CORRUPTED
      );
    });

    it("should return user-friendly validation error messages", () => {
      expect(getUserFriendlyError(ErrorType.VALIDATION_ERROR)).toBe(
        ERROR_MESSAGES.VALIDATION.EMPTY
      );
      expect(getUserFriendlyError(ErrorType.VALIDATION_ERROR, "empty")).toBe(
        ERROR_MESSAGES.VALIDATION.EMPTY
      );
      expect(getUserFriendlyError(ErrorType.VALIDATION_ERROR, "whitespace")).toBe(
        ERROR_MESSAGES.VALIDATION.WHITESPACE_ONLY
      );
      expect(getUserFriendlyError(ErrorType.VALIDATION_ERROR, "short")).toBe(
        ERROR_MESSAGES.VALIDATION.TOO_SHORT
      );
    });

    it("should return user-friendly system error messages", () => {
      expect(getUserFriendlyError(ErrorType.SYSTEM_ERROR)).toBe(
        ERROR_MESSAGES.SYSTEM.GENERIC
      );
    });
  });

  describe("formatError", () => {
    it("should format Error objects", () => {
      const error = new Error("Network error occurred");
      const formatted = formatError(error, ErrorType.NETWORK_ERROR);
      expect(formatted).toBe(ERROR_MESSAGES.NETWORK.GENERIC);
    });

    it("should format string errors", () => {
      expect(formatError("Network error", ErrorType.NETWORK_ERROR)).toBe(
        ERROR_MESSAGES.NETWORK.GENERIC
      );
      expect(formatError("API error", ErrorType.API_ERROR)).toBe(
        ERROR_MESSAGES.API.GENERIC
      );
    });

    it("should return user-friendly strings as-is", () => {
      const userFriendly = "Please enter your math problem.";
      expect(formatError(userFriendly)).toBe(userFriendly);
    });

    it("should detect technical strings and convert them", () => {
      expect(formatError("API error")).toBe(ERROR_MESSAGES.API.GENERIC);
      expect(formatError("500 Internal Server Error")).toBe(
        ERROR_MESSAGES.API.SERVER_ERROR
      );
      expect(formatError("Failed to fetch")).toBe(ERROR_MESSAGES.NETWORK.GENERIC);
    });

    it("should auto-detect error type if not provided", () => {
      expect(formatError("Network error")).toBe(ERROR_MESSAGES.NETWORK.GENERIC);
      expect(formatError("API error")).toBe(ERROR_MESSAGES.API.GENERIC);
      expect(formatError("OCR failed")).toBe(ERROR_MESSAGES.OCR.GENERIC);
    });

    it("should handle unknown error types", () => {
      expect(formatError("random error")).toBe(ERROR_MESSAGES.SYSTEM.GENERIC);
    });
  });

  describe("getErrorInfo", () => {
    it("should return complete error info for network errors", () => {
      const info = getErrorInfo("Network error");
      expect(info.type).toBe(ErrorType.NETWORK_ERROR);
      expect(info.message).toBe(ERROR_MESSAGES.NETWORK.GENERIC);
      expect(info.retryable).toBe(true);
      expect(info.action).toBe("Check your internet connection and try again.");
    });

    it("should return complete error info for API errors", () => {
      const info = getErrorInfo("API error");
      expect(info.type).toBe(ErrorType.API_ERROR);
      expect(info.message).toBe(ERROR_MESSAGES.API.GENERIC);
      expect(info.retryable).toBe(true);
      expect(info.action).toBe("Please try again in a moment.");
    });

    it("should return complete error info for OCR errors", () => {
      const info = getErrorInfo("OCR failed");
      expect(info.type).toBe(ErrorType.OCR_ERROR);
      expect(info.message).toBe(ERROR_MESSAGES.OCR.GENERIC);
      expect(info.retryable).toBe(true);
      expect(info.action).toBe("Try a clearer photo or type your problem directly.");
    });

    it("should return complete error info for file errors", () => {
      const info = getErrorInfo("file size too large");
      expect(info.type).toBe(ErrorType.FILE_ERROR);
      expect(info.message).toBe(ERROR_MESSAGES.FILE.TOO_LARGE);
      expect(info.retryable).toBe(false);
      expect(info.action).toBe("Choose a smaller image (under 10MB).");
    });

    it("should return complete error info for validation errors", () => {
      const info = getErrorInfo("empty field");
      expect(info.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(info.message).toBe(ERROR_MESSAGES.VALIDATION.EMPTY);
      expect(info.retryable).toBe(false);
      expect(info.action).toBe("Enter your message or problem.");
    });

    it("should handle rate limit errors correctly", () => {
      const info = getErrorInfo("rate limit exceeded");
      expect(info.type).toBe(ErrorType.API_ERROR);
      expect(info.message).toBe(ERROR_MESSAGES.API.RATE_LIMIT);
      expect(info.action).toBe("Wait a moment and try again.");
    });
  });

  describe("ERROR_MESSAGES constants", () => {
    it("should have all required error message categories", () => {
      expect(ERROR_MESSAGES.NETWORK).toBeDefined();
      expect(ERROR_MESSAGES.API).toBeDefined();
      expect(ERROR_MESSAGES.VALIDATION).toBeDefined();
      expect(ERROR_MESSAGES.OCR).toBeDefined();
      expect(ERROR_MESSAGES.FILE).toBeDefined();
      expect(ERROR_MESSAGES.SYSTEM).toBeDefined();
    });

    it("should have user-friendly messages (no technical jargon)", () => {
      // Check that messages don't contain technical terms
      const allMessages = [
        ...Object.values(ERROR_MESSAGES.NETWORK),
        ...Object.values(ERROR_MESSAGES.API),
        ...Object.values(ERROR_MESSAGES.VALIDATION),
        ...Object.values(ERROR_MESSAGES.OCR),
        ...Object.values(ERROR_MESSAGES.FILE),
        ...Object.values(ERROR_MESSAGES.SYSTEM),
      ];

      const technicalTerms = ["API", "500", "404", "fetch", "HTTP", "JSON"];
      allMessages.forEach((message) => {
        technicalTerms.forEach((term) => {
          expect(message.toLowerCase()).not.toContain(term.toLowerCase());
        });
      });
    });

    it("should have actionable messages", () => {
      // Check that messages provide guidance
      const allMessages = [
        ...Object.values(ERROR_MESSAGES.NETWORK),
        ...Object.values(ERROR_MESSAGES.API),
        ...Object.values(ERROR_MESSAGES.VALIDATION),
        ...Object.values(ERROR_MESSAGES.OCR),
        ...Object.values(ERROR_MESSAGES.FILE),
        ...Object.values(ERROR_MESSAGES.SYSTEM),
      ];

      const actionWords = ["please", "try", "check", "choose", "enter"];
      allMessages.forEach((message) => {
        const hasAction = actionWords.some((word) =>
          message.toLowerCase().includes(word)
        );
        expect(hasAction).toBe(true);
      });
    });
  });
});

