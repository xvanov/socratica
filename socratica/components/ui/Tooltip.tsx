"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

/**
 * Tooltip component - Accessible tooltip for buttons and controls
 * 
 * Features:
 * - Accessible with proper ARIA attributes
 * - Keyboard accessible (focus triggers tooltip)
 * - Responsive positioning
 * - Follows design system colors
 */
export default function Tooltip({
  content,
  children,
  position = "bottom",
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible]);

  // Calculate tooltip position
  useEffect(() => {
    if (isVisible && wrapperRef.current && tooltipRef.current) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Adjust position if tooltip would go off-screen
      let newPosition = position;
      if (position === "top" && wrapperRect.top - tooltipRect.height < 0) {
        newPosition = "bottom";
      } else if (position === "bottom" && wrapperRect.bottom + tooltipRect.height > viewportHeight) {
        newPosition = "top";
      } else if (position === "left" && wrapperRect.left - tooltipRect.width < 0) {
        newPosition = "right";
      } else if (position === "right" && wrapperRect.right + tooltipRect.width > viewportWidth) {
        newPosition = "left";
      }

      setTooltipPosition(newPosition);
    }
  }, [isVisible, position]);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent dark:border-t-gray-200",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent dark:border-b-gray-200",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent dark:border-l-gray-200",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent dark:border-r-gray-200",
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 ${positionClasses[tooltipPosition]} pointer-events-none`}
          aria-hidden={!isVisible}
        >
          <div className="relative rounded-lg bg-gray-800 px-3 py-2 text-xs font-medium text-white shadow-lg dark:bg-gray-200 dark:text-gray-900">
            {content}
            <div
              className={`absolute h-0 w-0 border-4 ${arrowClasses[tooltipPosition]}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}



