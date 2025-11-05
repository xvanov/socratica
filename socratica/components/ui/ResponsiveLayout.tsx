"use client";

import { ReactNode } from "react";

/**
 * ResponsiveLayout Component
 * 
 * Wrapper component that provides consistent responsive layout behavior
 * across the application. Ensures:
 * - Proper overflow prevention
 * - Responsive container widths
 * - Consistent spacing and padding
 * - Mobile-first responsive design
 * 
 * @param children - Child components to wrap
 * @param className - Optional additional CSS classes
 */
interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function ResponsiveLayout({
  children,
  className = "",
}: ResponsiveLayoutProps) {
  return (
    <div
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden ${className}`}
      role="region"
      aria-label="Content wrapper"
    >
      {children}
    </div>
  );
}

