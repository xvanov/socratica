"use client";

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  className?: string;
  "aria-label"?: string;
}

/**
 * ProgressBar component - Reusable progress bar following design system
 * 
 * Features:
 * - Follows design system colors and styling
 * - Accessible with ARIA attributes
 * - Smooth animations
 * - Optional label
 */
export default function ProgressBar({
  progress,
  label,
  className = "",
  "aria-label": ariaLabel,
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const progressLabel = ariaLabel || (label ? `${label}: ${clampedProgress}%` : `${clampedProgress}% complete`);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
            {label}
          </span>
          <span className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
            {clampedProgress}%
          </span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface)] dark:bg-[var(--neutral-800)]"
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={progressLabel}
      >
        <div
          className="h-full rounded-full bg-[var(--primary-600)] transition-all duration-300 ease-out dark:bg-[var(--primary-500)]"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}


