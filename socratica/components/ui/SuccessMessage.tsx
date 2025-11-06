"use client";

import { useEffect, useState } from "react";

interface SuccessMessageProps {
  message: string;
  duration?: number; // Auto-dismiss duration in milliseconds (0 = no auto-dismiss)
  onDismiss?: () => void;
  className?: string;
  "aria-label"?: string;
}

/**
 * SuccessMessage component - Reusable success message following design system
 * 
 * Features:
 * - Follows design system colors and styling
 * - Subtle and not distracting
 * - Optional auto-dismiss
 * - Accessible with role="status"
 */
export default function SuccessMessage({
  message,
  duration = 3000, // Default 3 seconds
  onDismiss,
  className = "",
  "aria-label": ariaLabel,
}: SuccessMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0 && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) {
          onDismiss();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, isVisible, onDismiss]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border border-[var(--accent-success-300)] bg-[var(--accent-success-50)] p-3 dark:border-[var(--accent-success-700)] dark:bg-[var(--accent-success-900)]/20 transition-opacity duration-300 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || "Success message"}
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-[var(--accent-success-600)]"
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
        <p className="text-sm font-medium text-[var(--accent-success-800)] dark:text-[var(--accent-success-200)]">
          {message}
        </p>
      </div>
    </div>
  );
}



