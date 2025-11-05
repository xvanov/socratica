"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import AuthButton from "@/components/auth/AuthButton";
import SessionListItem from "./SessionListItem";
import { Session, SessionHistoryProps } from "@/types/session";
import { getUserSessions, deleteSession } from "@/lib/firebase/sessions";
import { useAuth } from "@/hooks/useAuth";

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
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIndexBuilding, setIsIndexBuilding] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch sessions when user is authenticated
  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth to finish loading
    }

    if (!user) {
      // No user signed in - no sessions to show
      setIsLoading(false);
      setSessions([]);
      return;
    }

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsIndexBuilding(false);
        const userSessions = await getUserSessions(user.uid);
        setSessions(userSessions);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load session history";
        
        // Check if error is about index building
        if (errorMessage.includes("index is currently building") || errorMessage.includes("requires an index")) {
          setIsIndexBuilding(true);
          setError("Firestore index is building. This usually takes 1-5 minutes. The page will automatically refresh when ready.");
          
          // Retry after 30 seconds
          retryTimeoutRef.current = setTimeout(() => {
            fetchSessions();
          }, 30000);
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();

    // Cleanup timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [user, authLoading]);

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
      if (user) {
        const userSessions = await getUserSessions(user.uid);
        setSessions(userSessions);
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
        <LoadingSpinner size="md" label={authLoading ? "Checking authentication..." : "Loading session history..."} />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="flex flex-col items-center justify-center p-8 text-center space-y-4"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
          Please sign in to view your session history.
        </p>
        <AuthButton variant="signin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage message={error} />
        {isIndexBuilding && (
          <div className="mt-4 text-center">
            <LoadingSpinner size="sm" label="Waiting for index to be ready..." />
            <p className="mt-2 text-xs text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
              The page will automatically refresh when the index is ready. This usually takes 1-5 minutes.
            </p>
          </div>
        )}
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

