"use client";

interface FeatureInstructionsProps {
  title: string;
  instructions: string[];
  examples?: string[];
  className?: string;
}

/**
 * FeatureInstructions component - Displays clear instructions for features
 * 
 * Features:
 * - Clear, step-by-step guidance
 * - Optional examples
 * - Accessible with proper semantic HTML
 * - Follows design system colors
 */
export default function FeatureInstructions({
  title,
  instructions,
  examples,
  className = "",
}: FeatureInstructionsProps) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4 dark:bg-[var(--surface)] ${className}`}>
      <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">
        {title}
      </h3>
      <ol className="list-decimal list-inside space-y-1 text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
        {instructions.map((instruction, index) => (
          <li key={index}>{instruction}</li>
        ))}
      </ol>
      {examples && examples.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
            Examples:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
            {examples.map((example, index) => (
              <li key={index}>
                <code className="rounded bg-[var(--neutral-100)] px-1 py-0.5 font-mono text-[var(--neutral-800)] dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-200)]">
                  {example}
                </code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


