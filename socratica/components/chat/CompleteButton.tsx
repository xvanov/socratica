"use client";

import Tooltip from "@/components/ui/Tooltip";

interface CompleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isCompleted?: boolean;
}

export default function CompleteButton({
  onClick,
  disabled = false,
  isCompleted = false,
}: CompleteButtonProps) {
  return (
    <Tooltip content={isCompleted ? "Session completed" : "Mark session as complete"}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isCompleted}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] min-w-[44px] shadow-sm ${
          isCompleted
            ? "border-[var(--accent-success-500)] bg-[var(--accent-success-50)] text-[var(--accent-success-700)] dark:bg-[var(--accent-success-900)]/20 dark:text-[var(--accent-success-200)]"
            : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--neutral-700)] hover:border-[var(--neutral-400)] hover:bg-[var(--surface)] dark:bg-[var(--surface)] dark:text-[var(--neutral-300)] dark:hover:border-[var(--neutral-600)] dark:hover:bg-[var(--neutral-800)]"
        }`}
        aria-label={isCompleted ? "Session completed" : "Mark session as complete"}
      >
        {isCompleted ? (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="sr-only sm:not-sr-only">Completed</span>
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="sr-only sm:not-sr-only">Complete</span>
          </>
        )}
      </button>
    </Tooltip>
  );
}

