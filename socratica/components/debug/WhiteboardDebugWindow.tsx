"use client";

import React, { useState } from "react";

interface WhiteboardDebugWindowProps {
  capturedImage: string | null;
  ocrText: string | null;
  ocrError: string | null;
  whiteboardState: any;
}

export default function WhiteboardDebugWindow({
  capturedImage,
  ocrText,
  ocrError,
  whiteboardState,
}: WhiteboardDebugWindowProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-medium text-[var(--neutral-700)] transition-colors hover:border-[var(--neutral-400)] hover:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 dark:bg-[var(--surface)] dark:text-[var(--neutral-300)] dark:hover:border-[var(--neutral-600)] dark:hover:bg-[var(--neutral-800)] dark:focus:ring-[var(--neutral-100)] min-h-[44px] shadow-sm"
        title="Open Whiteboard Debug Window"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="sr-only sm:not-sr-only">Debug</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 rounded-lg border-2 border-[var(--border)] bg-[var(--surface-elevated)] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2">
        <h3 className="font-semibold text-[var(--foreground)]">Whiteboard Debug</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded p-1 hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)] transition-colors"
          aria-label="Close debug window"
          title="Close debug window"
        >
          <svg className="h-5 w-5 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto p-4 space-y-4">
        {/* Captured Image */}
        <div>
          <h4 className="font-semibold text-sm text-[var(--foreground)] mb-2">Captured Image:</h4>
          {capturedImage ? (
            <div className="space-y-2">
              <img
                src={capturedImage}
                alt="Captured whiteboard"
                className="max-w-full border border-[var(--border)] rounded"
              />
              <div className="text-xs text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
                Size: {Math.round(capturedImage.length / 1024)} KB
              </div>
            </div>
          ) : (
            <div className="text-sm text-[var(--neutral-500)] italic">No image captured</div>
          )}
        </div>

        {/* OCR Results */}
        <div>
          <h4 className="font-semibold text-sm text-[var(--foreground)] mb-2">OCR Text:</h4>
          {ocrError ? (
            <div className="text-sm text-[var(--error-600)] bg-[var(--error-50)] dark:bg-[var(--error-900)]/20 p-2 rounded">
              <strong>Error:</strong> {ocrError}
            </div>
          ) : ocrText ? (
            <div className="text-sm bg-[var(--surface)] p-2 rounded border border-[var(--border)]">
              <pre className="whitespace-pre-wrap font-mono text-xs text-[var(--foreground)]">{ocrText}</pre>
            </div>
          ) : (
            <div className="text-sm text-[var(--neutral-500)] italic">No OCR text available</div>
          )}
        </div>

        {/* Whiteboard State Info */}
        <div>
          <h4 className="font-semibold text-sm text-[var(--foreground)] mb-2">Whiteboard State:</h4>
          <div className="text-xs bg-[var(--surface)] p-2 rounded border border-[var(--border)]">
            <div className="text-[var(--foreground)]">Elements: {whiteboardState?.elements?.length || 0}</div>
            {whiteboardState?.elements?.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-[var(--neutral-600)] dark:text-[var(--neutral-400)] hover:text-[var(--foreground)]">
                  View element details
                </summary>
                <pre className="mt-2 text-xs overflow-auto max-h-40 text-[var(--foreground)]">
                  {JSON.stringify(whiteboardState.elements, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

