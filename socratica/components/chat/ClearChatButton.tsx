"use client";

import Tooltip from "@/components/ui/Tooltip";

interface ClearChatButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function ClearChatButton({
  onClick,
  disabled = false,
}: ClearChatButtonProps) {
  return (
    <Tooltip content="Clear chat and start a new problem">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-medium text-[var(--neutral-700)] transition-colors hover:border-[var(--neutral-400)] hover:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--surface)] dark:text-[var(--neutral-300)] dark:hover:border-[var(--neutral-600)] dark:hover:bg-[var(--neutral-800)] dark:focus:ring-[var(--neutral-100)] min-h-[44px] min-w-[44px] shadow-sm"
        aria-label="Clear chat and start new problem"
      >
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span className="sr-only sm:not-sr-only">New Problem</span>
      </button>
    </Tooltip>
  );
}

