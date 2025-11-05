"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  "aria-label"?: string;
}

/**
 * LoadingSpinner component - Reusable loading indicator following design system
 * 
 * Features:
 * - Follows design system colors and spacing
 * - Accessible with ARIA labels
 * - Multiple sizes for different contexts
 * - Smooth animation
 */
export default function LoadingSpinner({
  size = "md",
  className = "",
  label,
  "aria-label": ariaLabel,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  const labelSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const spinnerLabel = ariaLabel || label || "Loading...";

  return (
    <div
      className={`flex flex-col items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={spinnerLabel}
    >
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-[var(--neutral-300)] border-t-[var(--primary-600)] dark:border-[var(--neutral-600)] dark:border-t-[var(--primary-500)]`}
        aria-hidden="true"
      />
      {label && (
        <p className={`${labelSizeClasses[size]} text-[var(--neutral-600)] dark:text-[var(--neutral-400)]`}>
          {label}
        </p>
      )}
    </div>
  );
}

