"use client";

import { useState, useEffect, FormEvent } from "react";
import { validateMessage } from "@/lib/utils/validation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface MessageInputProps {
  onMessageSubmit: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isInitialInput?: boolean; // If true, show larger input for initial problem
  ocrText?: string; // Text from OCR to prefill
  onOcrTextChange?: (text: string) => void; // Callback when OCR text is used
}

/**
 * MessageInput component - Input field for sending messages in chat
 * Supports Enter key submission and Shift+Enter for new lines
 */
export default function MessageInput({
  onMessageSubmit,
  placeholder,
  disabled = false,
  isInitialInput = false,
  ocrText,
  onOcrTextChange,
}: MessageInputProps) {
  // Use different placeholders based on mode
  const defaultPlaceholder = isInitialInput
    ? "Type your math problem here... (e.g., Solve for x: 2x + 5 = 13)"
    : "Type your message...";
  const finalPlaceholder = placeholder ?? defaultPlaceholder;

  const [inputValue, setInputValue] = useState(ocrText || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Update input when OCR text changes
  useEffect(() => {
    if (ocrText !== undefined && ocrText !== inputValue) {
      setInputValue(ocrText);
      // Clear validation error when OCR text is set
      if (validationError) {
        setValidationError(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocrText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Notify parent of value change (for OCR text sync)
    if (onOcrTextChange) {
      onOcrTextChange(newValue);
    }
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate input before submission
    const validation = validateMessage(inputValue);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    // Clear validation error if valid
    setValidationError(null);

    if (isSubmitting || disabled) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call onMessageSubmit callback with message text
      await onMessageSubmit(inputValue.trim());

      // Clear input after successful submission
      setInputValue("");
      setValidationError(null);
      // Clear OCR text if it was set
      if (onOcrTextChange) {
        onOcrTextChange("");
      }
    } catch (error) {
      console.error("Error submitting message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift) for quick submission
    // Shift+Enter for new line (default textarea behavior)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const isDisabled = disabled || isSubmitting;

  // For initial input, show larger textarea
  const textareaRows = isInitialInput ? 4 : 1;
  const textareaClassName = isInitialInput
    ? "resize-y"
    : "resize-none";

  return (
    <form onSubmit={handleSubmit} className={`w-full ${isInitialInput ? "p-4" : "border-t border-[var(--border)] bg-[var(--surface-elevated)] dark:bg-[var(--surface)]"}`}>
      <div className={`flex flex-col gap-2 ${isInitialInput ? "" : "p-4"}`}>
        <label htmlFor="message-input" className="sr-only">
          {isInitialInput ? "Math problem input" : "Message input"}
        </label>
        <div className={`flex gap-2 ${isInitialInput ? "flex-col" : ""}`}>
          <textarea
            id="message-input"
            name="message-input"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={finalPlaceholder}
            rows={textareaRows}
            disabled={isDisabled}
            className={`${isInitialInput ? "w-full" : "flex-1"} ${textareaClassName} rounded-lg border px-4 py-3 text-base text-[var(--foreground)] placeholder-[var(--neutral-500)] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[var(--surface)] disabled:text-[var(--neutral-500)] dark:placeholder-[var(--neutral-400)] dark:disabled:bg-[var(--neutral-800)] dark:disabled:text-[var(--neutral-600)] transition-all duration-200 ${
              validationError
                ? "border-[var(--error-300)] bg-[var(--surface-elevated)] focus:border-[var(--error-500)] focus:ring-[var(--error-500)] dark:border-[var(--error-700)] dark:bg-[var(--surface)] dark:focus:border-[var(--error-400)] dark:focus:ring-[var(--error-400)]"
                : "border-[var(--border)] bg-[var(--surface-elevated)] focus:border-[var(--foreground)] focus:ring-[var(--foreground)] dark:bg-[var(--surface)] dark:focus:border-[var(--neutral-100)] dark:focus:ring-[var(--neutral-100)]"
            }`}
            aria-label="Message input field"
            aria-describedby="message-input-description"
            aria-required="true"
            aria-invalid={validationError ? "true" : "false"}
            aria-errormessage={validationError ? "message-input-error" : undefined}
            onInput={(e) => {
              // Auto-resize textarea based on content (only for non-initial input)
              if (!isInitialInput) {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }
            }}
          />
          <button
            type="submit"
            disabled={isDisabled || !!validationError || !inputValue.trim()}
            className={`flex h-12 min-h-[44px] ${isInitialInput ? "w-full" : "w-12 min-w-[44px] flex-shrink-0"} items-center justify-center rounded-lg bg-[var(--primary-600)] px-4 text-base font-medium text-white transition-all duration-200 hover:bg-[var(--primary-700)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[var(--neutral-400)] disabled:text-[var(--neutral-300)] disabled:opacity-75 dark:bg-[var(--primary-500)] dark:hover:bg-[var(--primary-400)] dark:focus:ring-[var(--primary-500)] dark:disabled:bg-[var(--neutral-700)] dark:disabled:text-[var(--neutral-500)] shadow-sm ${isInitialInput ? "sm:w-auto sm:px-8" : ""}`}
            aria-label={isInitialInput ? "Submit problem" : "Send message"}
            aria-disabled={isDisabled || !!validationError || !inputValue.trim()}
          >
            {isSubmitting ? (
              <>
                {isInitialInput ? (
                  "Submitting..."
                ) : (
                  <LoadingSpinner size="sm" />
                )}
              </>
            ) : (
              <>
                {isInitialInput ? (
                  "Submit Problem"
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </>
            )}
          </button>
        </div>
        <p id="message-input-description" className="sr-only">
          {isInitialInput
            ? "Enter your math problem. Press Enter to submit or Shift+Enter for a new line."
            : "Enter your message. Press Enter to send or Shift+Enter for a new line."}
        </p>

        {/* Validation error display */}
        {validationError && (
          <div
            id="message-input-error"
            className="rounded-lg border border-[var(--error-300)] bg-[var(--error-50)] p-2 dark:border-[var(--error-700)] dark:bg-[var(--error-900)]/20 transition-opacity duration-200"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <svg
                className="h-4 w-4 flex-shrink-0 text-[var(--error-600)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs font-medium text-[var(--error-800)] dark:text-[var(--error-200)]">
                {validationError}
              </p>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

