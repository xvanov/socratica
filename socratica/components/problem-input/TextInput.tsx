"use client";

import { useState, useEffect, FormEvent } from "react";
import { validateProblemText } from "@/lib/utils/validation";

interface TextInputProps {
  onSubmit?: (value: string) => void;
  placeholder?: string;
  value?: string; // External value (e.g., from OCR)
  onValueChange?: (value: string) => void; // Callback when value changes externally
}

export default function TextInput({
  onSubmit,
  placeholder = "Type your math problem here...",
  value: externalValue,
  onValueChange,
}: TextInputProps) {
  const [inputValue, setInputValue] = useState(externalValue || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Update internal state when external value changes (e.g., from OCR)
  // Only sync when external value changes, not when internal value changes
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== inputValue) {
      setInputValue(externalValue);
      // Clear validation error when external value changes
      setValidationError(null);
    }
    // Note: onValueChange should not be called here - it's only for external updates
    // User typing should update local state only, not trigger parent updates
  }, [externalValue]); // Only depend on externalValue, not inputValue

  // Clear validation error when user starts typing
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Notify parent of value change (for controlled component behavior)
    if (onValueChange) {
      onValueChange(newValue);
    }
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate input before submission
    const validation = validateProblemText(inputValue);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    // Clear validation error if valid
    setValidationError(null);

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(inputValue);
      }

      // Clear input after successful submission
      setInputValue("");
      setValidationError(null);
    } catch (error) {
      console.error("Error submitting problem:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift) for single-line quick submission
    // Shift+Enter for new line (default textarea behavior)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3">
        <label htmlFor="problem-input" className="sr-only">
          Math problem input
        </label>
        <textarea
          id="problem-input"
          name="problem-input"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={4}
          disabled={isSubmitting}
          className={`w-full resize-y rounded-lg border px-4 py-3 text-base text-zinc-950 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 dark:text-zinc-50 dark:placeholder-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 ${
            validationError
              ? "border-red-300 bg-white focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:bg-zinc-900 dark:focus:border-red-400 dark:focus:ring-red-400"
              : "border-zinc-300 bg-white focus:border-zinc-950 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          }`}
          aria-label="Math problem input field"
          aria-describedby="problem-input-description"
          aria-required="true"
          aria-invalid={validationError ? "true" : "false"}
          aria-errormessage={validationError ? "problem-input-error" : undefined}
        />
        <p id="problem-input-description" className="sr-only">
          Enter your math problem. Press Enter to submit or Shift+Enter for a new line.
        </p>
        
        {/* Validation error display */}
        {validationError && (
          <div
            id="problem-input-error"
            className="rounded-lg border border-red-300 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/20"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <svg
                className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
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
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {validationError}
              </p>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || !!validationError}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-zinc-950 px-5 text-base font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-zinc-300 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500 sm:w-auto sm:px-8"
          aria-label="Submit problem"
        >
          {isSubmitting ? "Submitting..." : "Submit Problem"}
        </button>
      </div>
    </form>
  );
}

