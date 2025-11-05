"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import AuthButton from "@/components/ui/AuthButton";
import SessionListItem from "./SessionListItem";
import { Session, SessionHistoryProps } from "@/types/session";
import { getUserSessions, deleteSession } from "@/lib/firebase/sessions";
import { getLocalUserIdHelper } from "@/lib/firebase/sessions-local";

// Check if Firebase is configured (client-side check)
const isFirebaseConfigured = () => {
  if (typeof window === "undefined") return false;
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "undefined" &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "undefined"
  );
};

/**
 * SessionHistory component - Displays list of user's problem-solving sessions
 * 
 * Features:
 * - Displays all previous problem sessions
 * - Shows problem preview, completion status, and timestamp
 * - Sorted by most recent first
 * - Empty state when no sessions exist
 * - Accessible with ARIA labels
 * - Responsive design (mobile, tablet, desktop)
 */
export default function SessionHistory({
  onResumeSession,
}: SessionHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Get current user ID - always use localStorage for MVP
  useEffect(() => {
    // Always use localStorage - no Firebase needed
    setIsAuthLoading(false);
    const localUserId = getLocalUserIdHelper();
    setUserId(localUserId);
  }, []);

  // Fetch sessions when userId is available
  useEffect(() => {
    if (!userId) {
      setIsLoading(false); // Stop loading if no userId
      return;
    }

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userSessions = await getUserSessions(userId);
        setSessions(userSessions);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load session history"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [userId]);

  const handleResume = (session: Session) => {
    if (onResumeSession) {
      onResumeSession(session);
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      console.log("handleDelete - Starting delete", sessionId);
      // Optimistically remove from UI
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.sessionId !== sessionId);
        console.log("handleDelete - UI updated, sessions remaining:", filtered.length);
        return filtered;
      });
      // Delete from localStorage
      await deleteSession(sessionId);
      console.log("handleDelete - Delete completed successfully");
    } catch (err) {
      console.error("handleDelete - Error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete session"
      );
      // Re-fetch sessions on error to restore state
      if (userId) {
        const userSessions = await getUserSessions(userId);
        setSessions(userSessions);
      }
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
        <LoadingSpinner size="md" label={isAuthLoading ? "Checking authentication..." : "Loading session history..."} />
      </div>
    );
  }

  if (!userId) {
    // This shouldn't happen with localStorage, but just in case
    return (
      <div
        className="flex flex-col items-center justify-center p-8 text-center space-y-4"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
          Initializing session storage...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-8 text-center"
        role="status"
        aria-live="polite"
        data-testid="empty-state"
      >
        <svg
          className="mb-4 h-12 w-12 text-[var(--neutral-400)] dark:text-[var(--neutral-600)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h2 className="mb-2 text-lg font-semibold text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
          No sessions yet
        </h2>
        <p className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
          Start solving a problem to create your first session!
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col"
      role="region"
      aria-label="Session history"
      aria-live="polite"
    >
      <div className="mb-4 px-4 pt-4">
        <h2 className="text-xl font-semibold text-[var(--neutral-900)] dark:text-[var(--neutral-100)]">
          Session History
        </h2>
        <p className="mt-1 text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
          {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
        </p>
      </div>
      <ul
        className="flex flex-col divide-y divide-[var(--neutral-200)] dark:divide-[var(--neutral-800)]"
        role="list"
        aria-label="List of problem-solving sessions"
      >
        {sessions.map((session) => (
          <li key={session.sessionId} role="listitem">
            <SessionListItem
              session={session}
              onResume={handleResume}
              onDelete={handleDelete}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

