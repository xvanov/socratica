"use client";

interface HelpTextProps {
  text: string;
  id: string;
  className?: string;
}

/**
 * HelpText component - Accessible help text for form inputs
 * 
 * Features:
 * - Accessible via aria-describedby
 * - Visible help text below input fields
 * - Follows design system colors
 * - Proper semantic HTML
 */
export default function HelpText({ text, id, className = "" }: HelpTextProps) {
  return (
    <p
      id={id}
      className={`mt-1 text-xs text-[var(--neutral-600)] dark:text-[var(--neutral-400)] ${className}`}
    >
      {text}
    </p>
  );
}



