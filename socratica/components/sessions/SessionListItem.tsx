"use client";

import { useState } from "react";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { SessionListItemProps, CompletionStatus } from "@/types/session";

/**
 * Format completion status for display
 */
function formatCompletionStatus(status: CompletionStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "solved":
      return {
        label: "Solved",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      };
    case "not_solved":
      return {
        label: "Not Solved",
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      };
    case "in_progress":
      return {
        label: "In Progress",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      };
    default:
      return {
        label: "Unknown",
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      };
  }
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  } catch {
    return "Unknown date";
  }
}

/**
 * Truncate text to maximum length
 */
function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Extract preview text from session messages
 * Returns the first student message or first message that looks like a problem
 */
function extractPreviewFromMessages(messages: Array<{ role: string; content: string }>): string | null {
  if (!messages || messages.length === 0) {
    return null;
  }

  // First, try to find the first student message
  const firstStudentMessage = messages.find(msg => msg.role === "student" && msg.content && msg.content.trim().length > 0);
  if (firstStudentMessage) {
    // Skip placeholder messages like "[Whiteboard content shared]"
    const content = firstStudentMessage.content.trim();
    if (content && !content.startsWith("[") && content.length > 3) {
      return content;
    }
  }

  // If no good student message, try the first message regardless of role
  const firstMessage = messages.find(msg => msg.content && msg.content.trim().length > 0);
  if (firstMessage) {
    const content = firstMessage.content.trim();
    // Skip placeholder messages and very short messages
    if (content && !content.startsWith("[") && content.length > 3) {
      return content;
    }
  }

  return null;
}

/**
 * SessionListItem component - Displays individual session in history list
 * 
 * Features:
 * - Shows problem preview (text truncation or image thumbnail)
 * - Shows completion status badge
 * - Shows formatted timestamp
 * - Resume and Delete actions
 * - Accessible with ARIA labels
 * - Responsive design
 */
export default function SessionListItem({
  session,
  onResume,
  onDelete,
}: SessionListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const statusInfo = formatCompletionStatus(session.completionStatus);

  // Extract preview text - use problemText/problemImageUrl first, then fallback to messages
  const previewText = session.problemText || extractPreviewFromMessages(session.messages || []) || null;

  const handleResume = () => {
    onResume(session);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(session.sessionId);
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        className="flex flex-col gap-3 p-4 transition-colors hover:bg-[var(--neutral-50)] dark:hover:bg-[var(--neutral-900)] sm:flex-row sm:items-center sm:justify-between"
        role="article"
        aria-label={`Session from ${formatTimestamp(session.createdAt)}`}
        data-testid="session-item"
        data-session-id={session.sessionId}
      >
        {/* Session Preview */}
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {/* Problem Preview */}
          <div className="flex-1 min-w-0">
            {session.problemImageUrl ? (
              <div className="flex items-center gap-2">
                <img
                  src={session.problemImageUrl}
                  alt="Problem preview"
                  className="h-12 w-12 rounded border border-[var(--border)] object-cover"
                  aria-hidden="true"
                />
                <span className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
                  Image problem
                </span>
              </div>
            ) : previewText ? (
              <p className="text-sm text-[var(--neutral-900)] dark:text-[var(--neutral-100)]">
                {truncateText(previewText)}
              </p>
            ) : (
              <p className="text-sm italic text-[var(--neutral-500)] dark:text-[var(--neutral-500)]">
                No problem preview available
              </p>
            )}
          </div>

          {/* Status and Timestamp */}
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            {/* Completion Status Badge */}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}
              aria-label={`Status: ${statusInfo.label}`}
            >
              {statusInfo.label}
            </span>

            {/* Timestamp */}
            <time
              dateTime={session.createdAt}
              className="text-xs text-[var(--neutral-600)] dark:text-[var(--neutral-400)]"
              aria-label={`Created ${formatTimestamp(session.createdAt)}`}
            >
              {formatTimestamp(session.createdAt)}
            </time>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:flex-shrink-0">
          {/* Resume Button */}
          <button
            type="button"
            onClick={handleResume}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-medium text-[var(--neutral-700)] transition-colors hover:border-[var(--neutral-400)] hover:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 dark:bg-[var(--surface)] dark:text-[var(--neutral-300)] dark:hover:border-[var(--neutral-600)] dark:hover:bg-[var(--neutral-800)] dark:focus:ring-[var(--neutral-100)] min-h-[44px] shadow-sm"
            aria-label={`Resume session from ${formatTimestamp(session.createdAt)}`}
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="sr-only sm:not-sr-only">Resume</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDeleteClick}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-medium text-[var(--error-600)] transition-colors hover:border-[var(--error-400)] hover:bg-[var(--error-50)] focus:outline-none focus:ring-2 focus:ring-[var(--error-600)] focus:ring-offset-2 dark:bg-[var(--surface)] dark:text-[var(--error-400)] dark:hover:border-[var(--error-600)] dark:hover:bg-[var(--error-900)]/20 dark:focus:ring-[var(--error-400)] min-h-[44px] shadow-sm"
            aria-label={`Delete session from ${formatTimestamp(session.createdAt)}`}
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="sr-only sm:not-sr-only">Delete</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Session"
        message="Are you sure you want to delete this session? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}

