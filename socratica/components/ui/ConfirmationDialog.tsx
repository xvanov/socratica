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

  // Focus trap: keep focus within dialog when open
  useEffect(() => {
    if (!isOpen) return;

    const dialogElement = dialogRef.current;
    if (!dialogElement) return;

    const focusableElements = dialogElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
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
        className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] shadow-lg dark:bg-[var(--surface)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2
            id="confirmation-dialog-title"
            className="mb-4 text-lg font-semibold text-[var(--foreground)]"
          >
            {title}
          </h2>
          <p
            id="confirmation-dialog-message"
            className="mb-6 text-sm text-[var(--neutral-600)]"
          >
            {message}
          </p>
          <div className="flex justify-end gap-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--neutral-700)] transition-colors hover:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 dark:bg-[var(--surface)] dark:text-[var(--neutral-300)] dark:hover:bg-[var(--neutral-800)] dark:focus:ring-[var(--neutral-100)] shadow-sm"
              aria-label={cancelLabel}
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-[var(--primary-600)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-700)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] focus:ring-offset-2 dark:bg-[var(--primary-500)] dark:hover:bg-[var(--primary-400)] dark:focus:ring-[var(--primary-500)] shadow-sm"
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


