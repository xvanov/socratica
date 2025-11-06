"use client";

import { useState, useRef, useEffect } from "react";
import { katexToImage } from "@/lib/math-renderer/katex-to-image";

interface EquationInputDialogProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (expression: string, imageDataUrl: string) => void;
}

/**
 * Equation Input Dialog Component
 * 
 * Dialog for entering LaTeX expressions that will be rendered as images on the canvas.
 */
export default function EquationInputDialog({
  x,
  y,
  isOpen,
  onClose,
  onConfirm,
}: EquationInputDialogProps) {
  const [expression, setExpression] = useState("");
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setExpression("");
      setError(null);
      setIsRendering(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expression.trim()) {
      setError("Please enter a LaTeX expression");
      return;
    }

    setIsRendering(true);
    setError(null);

    try {
      const imageDataUrl = await katexToImage(expression.trim(), 20, "#000000");
      onConfirm(expression.trim(), imageDataUrl);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to render equation");
    } finally {
      setIsRendering(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Enter LaTeX Equation
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="equation-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              LaTeX Expression
            </label>
            <input
              id="equation-input"
              ref={inputRef}
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g., x^2 + y^2 = r^2"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isRendering}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isRendering}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isRendering}
            >
              {isRendering ? "Rendering..." : "Add Equation"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>Examples:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>x^2 + y^2 = r^2</li>
            <li>{"\\frac{a}{b} = \\frac{c}{d}"}</li>
            <li>{"\\sum_{i=1}^{n} i"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

