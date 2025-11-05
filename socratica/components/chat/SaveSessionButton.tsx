"use client";

import Tooltip from "@/components/ui/Tooltip";

interface SaveSessionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isSaving?: boolean;
}

export default function SaveSessionButton({
  onClick,
  disabled = false,
  isSaving = false,
}: SaveSessionButtonProps) {
  return (
    <Tooltip content={isSaving ? "Saving session..." : "Save current session"}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isSaving}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-medium text-[var(--neutral-700)] transition-colors hover:border-[var(--neutral-400)] hover:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--surface)] dark:text-[var(--neutral-300)] dark:hover:border-[var(--neutral-600)] dark:hover:bg-[var(--neutral-800)] dark:focus:ring-[var(--neutral-100)] min-h-[44px] min-w-[44px] shadow-sm"
        aria-label="Save current session"
      >
        {isSaving ? (
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        ) : (
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
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
        )}
        <span className="sr-only sm:not-sr-only">{isSaving ? "Saving..." : "Save Session"}</span>
      </button>
    </Tooltip>
  );
}

