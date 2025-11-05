"use client";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  "aria-label"?: string;
}

/**
 * ErrorMessage component - Reusable error message following design system
 * 
 * Features:
 * - Follows design system colors and styling
 * - Accessible with role="alert"
 * - Optional retry mechanism
 * - User-friendly error display
 */
export default function ErrorMessage({
  message,
  onRetry,
  retryLabel = "Retry",
  className = "",
  "aria-label": ariaLabel,
}: ErrorMessageProps) {
  return (
    <div
      className={`rounded-lg border border-[var(--error-300)] bg-[var(--error-50)] p-3 dark:border-[var(--error-700)] dark:bg-[var(--error-900)]/20 ${className}`}
      role="alert"
      aria-live="assertive"
      aria-label={ariaLabel || "Error message"}
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-[var(--error-600)] dark:text-[var(--error-400)]"
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
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--error-800)] dark:text-[var(--error-200)]">
            {message}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-[var(--error-600)] underline transition-colors hover:text-[var(--error-800)] dark:text-[var(--error-400)] dark:hover:text-[var(--error-200)] min-h-[44px] px-2"
              aria-label={`${retryLabel} sending message`}
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

