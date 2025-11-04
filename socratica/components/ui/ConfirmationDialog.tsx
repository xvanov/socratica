"use client";

import { useEffect, useRef } from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = "Clear Chat",
  message = "Are you sure you want to clear the chat? This will reset the conversation.",
  confirmLabel = "Clear Chat",
  cancelLabel = "Cancel",
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key to dismiss dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onCancel]);

  // Focus management: focus cancel button when dialog opens
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      // Small delay to ensure dialog is rendered
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  // Handle click outside to dismiss (optional)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if click is on the overlay itself (not on the inner dialog)
    // This is more reliable than e.target === e.currentTarget
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onCancel();
    } else if (e.target === e.currentTarget) {
      // Fallback: if dialogRef is not available, use the original check
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-message"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-lg border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2
            id="confirmation-dialog-title"
            className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {title}
          </h2>
          <p
            id="confirmation-dialog-message"
            className="mb-6 text-sm text-zinc-600 dark:text-zinc-400"
          >
            {message}
          </p>
          <div className="flex justify-end gap-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-zinc-50"
              aria-label={cancelLabel}
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-100 dark:focus:ring-zinc-50"
              aria-label={confirmLabel}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


