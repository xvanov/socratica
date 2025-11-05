"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ClearChatButton from "./ClearChatButton";
import SaveSessionButton from "./SaveSessionButton";
import CompleteButton from "./CompleteButton";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { ChatInterfaceProps, Message, StuckState } from "@/types/chat";
import { resetStuckState } from "@/lib/openai/stuck-detection";
import { formatError, ErrorType, ERROR_MESSAGES } from "@/lib/utils/error-handling";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import { calculateRetryDelay, waitForRetry, DEFAULT_RETRY_CONFIG, formatRetryMessage } from "@/lib/utils/retry";
import { saveSession, getSessionById, updateSessionCompletionStatus } from "@/lib/firebase/sessions";
import { CompletionStatus, Session } from "@/types/session";
import { useAuth } from "@/hooks/useAuth";

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

// Stable empty array to avoid creating new references on each render
const EMPTY_MESSAGES: Message[] = [];

// Auto-save interval in milliseconds (5 minutes)
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;

/**
 * ChatInterface component - Main chat interface that displays messages
 * Integrates MessageList and MessageInput components and manages message state
 * Integrates with chat API route to send messages and receive AI responses
 */
export default function ChatInterface({
  initialMessages,
  ocrText,
  onOcrTextChange,
  problemText,
  problemImageUrl,
  onSessionResumed,
  sessionToResume,
}: ChatInterfaceProps) {
  // Use stable empty array if not provided
  const stableInitialMessages = initialMessages ?? EMPTY_MESSAGES;
  const [messages, setMessages] = useState<Message[]>(stableInitialMessages);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [stuckState, setStuckState] = useState<StuckState>(resetStuckState());
  const prevInitialMessagesRef = useRef<Message[]>(stableInitialMessages);
  const isOnline = useNetworkStatus();
  const { user } = useAuth(); // Get Firebase Auth user
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentCompletionStatus, setCurrentCompletionStatus] = useState<CompletionStatus>("in_progress");
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveCurrentSessionRef = useRef<(() => Promise<void>) | null>(null);
  
  // Determine if this is the initial input (no messages yet)
  const isInitialInput = messages.length === 0;

  /**
   * Determine completion status based on conversation
   */
  const determineCompletionStatus = (): CompletionStatus => {
    // Check if last tutor message indicates problem is solved
    const lastTutorMessage = [...messages].reverse().find((msg) => msg.role === "tutor");
    if (lastTutorMessage) {
      const content = lastTutorMessage.content.toLowerCase();
      if (
        content.includes("correct") ||
        content.includes("well done") ||
        content.includes("you got it") ||
        content.includes("exactly right")
      ) {
        return "solved";
      }
    }
    // If conversation has messages, it's in progress, otherwise not started
    return messages.length > 0 ? "in_progress" : "not_solved";
  };

  /**
   * Save current session to Firestore
   */
  const saveCurrentSession = useCallback(async (): Promise<void> => {
    if (!user?.uid || messages.length === 0) {
      return; // Don't save empty sessions or when not authenticated
    }
    
    try {
      const completionStatus = determineCompletionStatus();
      // Ensure messages are properly serialized
      const serializedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: typeof msg.timestamp === "string" ? msg.timestamp : msg.timestamp?.toISOString() || new Date().toISOString(),
      }));
      
      const sessionData: Partial<Session> = {
        userId: user.uid,
        problemText: problemText || undefined,
        problemImageUrl: problemImageUrl || undefined,
        messages: serializedMessages,
        completionStatus,
        stuckState: stuckState,
      };

      // If we have a current session ID, update it; otherwise create new
      if (currentSessionId) {
        sessionData.sessionId = currentSessionId;
      }

      console.log("saveCurrentSession - Session data before save:", { 
        userId: sessionData.userId, 
        messageCount: sessionData.messages?.length,
        messages: sessionData.messages,
        sessionId: sessionData.sessionId 
      });
      const savedSession = await saveSession(sessionData as Partial<Session> & { userId: string });
      console.log("saveCurrentSession - Session saved:", { sessionId: savedSession.sessionId, messageCount: savedSession.messages?.length });
      setCurrentSessionId(savedSession.sessionId);
      setCurrentCompletionStatus(savedSession.completionStatus);
    } catch (err) {
      // Log error for debugging
      const errorMessage = err instanceof Error ? err.message : "Failed to save session";
      console.error("Failed to save session:", err);
      throw err; // Re-throw for manual saves to be handled by handleManualSave
    }
  }, [user, messages, problemText, problemImageUrl, stuckState, currentSessionId]);

  // Store save function in ref to prevent infinite loops
  saveCurrentSessionRef.current = saveCurrentSession;

  /**
   * Handle manual save button click
   */
  const handleManualSave = async () => {
    if (!user?.uid) {
      setError("Please sign in to save sessions");
      return;
    }

    if (messages.length === 0) {
      setError("No messages to save");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      await saveCurrentSession();
      // Show success message briefly
      setSuccessMessage("Session saved successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to save session: ${err.message}`
          : "Failed to save session"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save session periodically
  useEffect(() => {
    if (!user?.uid || messages.length === 0) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    // Set up auto-save timer - use ref to avoid re-creating on every render
    autoSaveTimerRef.current = setInterval(() => {
      if (saveCurrentSessionRef.current) {
        saveCurrentSessionRef.current();
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [user, messages.length]); // Removed saveCurrentSession from dependencies

  // Save session when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      if (user?.uid && messages.length > 0 && saveCurrentSessionRef.current) {
        saveCurrentSessionRef.current();
      }
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [user, messages.length]); // Removed saveCurrentSession from dependencies

  // Save session when starting new problem (when problemText or problemImageUrl changes)
  useEffect(() => {
    if (user?.uid && (problemText || problemImageUrl) && messages.length === 0) {
      // New problem started - save previous session if exists
      if (messages.length === 0 && currentSessionId) {
        // Save current session before starting new one
        saveCurrentSession().then(() => {
          // Clear current session ID and completion status for new session
          setCurrentSessionId(null);
          setCurrentCompletionStatus("in_progress");
        });
      }
    }
  }, [problemText, problemImageUrl]);

  /**
   * Resume a session by loading it from Firestore
   */
  const resumeSession = useCallback(async (sessionId: string) => {
    if (!user?.uid) {
      setError("Please sign in to resume sessions");
      return;
    }

    try {
      const session = await getSessionById(sessionId);
      if (!session) {
        setError("Session not found");
        return;
      }

      // Verify session belongs to current user
      if (session.userId !== user.uid) {
        setError("You don't have permission to access this session");
        return;
      }

      // Restore conversation history
      console.log("resumeSession - Session loaded:", { sessionId, messageCount: session.messages?.length, messages: session.messages });
      const restoredMessages: Message[] = (session.messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp:
          typeof msg.timestamp === "string"
            ? new Date(msg.timestamp)
            : msg.timestamp || new Date(),
      }));
      console.log("resumeSession - Restored messages:", restoredMessages.length, restoredMessages);
      
      // Clear any existing messages first
      setMessages([]);
      // Then set restored messages after a brief delay to ensure state update
      setTimeout(() => {
        setMessages(restoredMessages);
        console.log("resumeSession - Messages set in state:", restoredMessages.length);
      }, 0);

      // Restore stuck state if available
      if (session.stuckState) {
        setStuckState(session.stuckState);
      }

      // Set current session ID and completion status
      setCurrentSessionId(sessionId);
      setCurrentCompletionStatus(session.completionStatus);

      // Restore problem input via callbacks (parent component should handle display)
      if (session.problemText && onOcrTextChange) {
        onOcrTextChange(session.problemText);
      }

      // Call onSessionResumed callback if provided
      if (onSessionResumed) {
        onSessionResumed(sessionId);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resume session"
      );
    }
  }, [user, onOcrTextChange, onSessionResumed]);

  // Resume session when sessionToResume prop is set
  useEffect(() => {
    if (sessionToResume && user?.uid) {
      resumeSession(sessionToResume);
    }
  }, [sessionToResume, user, resumeSession]);

  // Update messages when initialMessages prop changes (for testing and dynamic updates)
  // Only update if initialMessages actually changed (by reference or content)
  useEffect(() => {
    // Deep comparison to check if initialMessages actually changed
    const prevMessages = prevInitialMessagesRef.current;
    const currentMessages = initialMessages ?? EMPTY_MESSAGES;
    
    const hasChanged =
      prevMessages !== currentMessages &&
      (prevMessages.length !== currentMessages.length ||
        prevMessages.some(
          (msg, idx) =>
            msg.role !== currentMessages[idx]?.role ||
            msg.content !== currentMessages[idx]?.content ||
            String(msg.timestamp) !== String(currentMessages[idx]?.timestamp)
        ));

    if (hasChanged) {
      setMessages(currentMessages);
      prevInitialMessagesRef.current = currentMessages;
    }
  }, [initialMessages]);

  // Function to add a new message
  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  // Send message to chat API and get AI response
  const sendMessageToAI = async (
    messageText: string,
    conversationHistory: Message[]
  ) => {
    // Check if offline before attempting request
    if (!isOnline) {
      setError(ERROR_MESSAGES.NETWORK.OFFLINE);
      setRetryMessage(messageText); // Store message for retry when online
      return;
    }

    try {
      setIsAIResponding(true);
      setError(null);

      // Call chat API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory,
          stuckState, // Send current stuck state
        }),
      });

      // Parse response JSON (can only be read once)
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, create a basic error response
        data = {
          success: false,
          error: response.status === 429
            ? "Too many requests. Please wait a moment and try again."
            : response.status >= 500
            ? "The service is temporarily unavailable. Please try again in a moment."
            : response.status === 401 || response.status === 403
            ? "There was an authentication issue. Please refresh the page and try again."
            : "Unable to get tutor response. Please try again.",
        };
      }

      // Handle API response errors
      if (!response.ok || !data.success) {
        // Format error message using error handling utilities
        const errorMessage = formatError(
          data.error || "Unable to get tutor response. Please try again.",
          ErrorType.API_ERROR
        );
        setError(errorMessage);
        setRetryMessage(messageText); // Store message for retry
        setRetryAttempt(0); // Reset retry attempt on new error
        return;
      }

      // Update stuck state from API response
      if (data.data && data.data.stuckState) {
        setStuckState(data.data.stuckState);
      }

      // Add AI response as tutor message
      if (data.data && data.data.message) {
        const aiMessage: Message = {
          role: "tutor",
          content: data.data.message,
          timestamp: data.data.timestamp
            ? new Date(data.data.timestamp)
            : new Date(),
        };

        addMessage(aiMessage);
        setRetryMessage(null); // Clear retry message on success
        setRetryAttempt(0); // Reset retry attempt on success
      }
    } catch (error) {
      // Handle network errors
      console.error("Error sending message to AI:", error);
      // Check if error is due to offline status
      const errorMessage = !isOnline
        ? ERROR_MESSAGES.NETWORK.OFFLINE
        : formatError(error, ErrorType.NETWORK_ERROR);
      setError(errorMessage);
      setRetryMessage(messageText); // Store message for retry
      setRetryAttempt(0); // Reset retry attempt on new error
    } finally {
      setIsAIResponding(false);
    }
  };

  // Handle message submission from MessageInput
  const handleMessageSubmit = async (messageText: string) => {
    // Create message with student role and current timestamp
    const newMessage: Message = {
      role: "student",
      content: messageText,
      timestamp: new Date(),
    };

    // Add student message to state immediately
    addMessage(newMessage);

    // Build conversation history with new message included
    const conversationHistory = [...messages, newMessage];

    // Send message to AI and get response
    await sendMessageToAI(messageText, conversationHistory);
  };

  // Handle retry for failed requests with exponential backoff
  const handleRetry = async () => {
    if (!retryMessage) return;

    setIsRetrying(true);
    const currentAttempt = retryAttempt + 1;

    // If we've exceeded max attempts, show helpful message
    if (currentAttempt >= DEFAULT_RETRY_CONFIG.maxAttempts) {
      setError(
        `${error || ERROR_MESSAGES.NETWORK.GENERIC} Maximum retry attempts reached. Please check your connection and try again later.`
      );
      setIsRetrying(false);
      return;
    }

    // Calculate delay and wait before retry
    const delay = calculateRetryDelay(currentAttempt, DEFAULT_RETRY_CONFIG);
    setRetryAttempt(currentAttempt);
    
    // Show retry status
    setError(
      `${error || ERROR_MESSAGES.NETWORK.GENERIC} ${formatRetryMessage(currentAttempt, DEFAULT_RETRY_CONFIG.maxAttempts)}`
    );

    await waitForRetry(delay);

    // Retry the request
    try {
      await sendMessageToAI(retryMessage, messages);
      // Reset retry attempt on success
      setRetryAttempt(0);
    } catch (err) {
      // Error handling is done in sendMessageToAI
      // If we've hit max attempts, update error message
      if (currentAttempt >= DEFAULT_RETRY_CONFIG.maxAttempts) {
        setError(
          `${formatError(err, ErrorType.NETWORK_ERROR)} Maximum retry attempts reached. Please check your connection and try again later.`
        );
        setRetryAttempt(0);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  // Clear chat functionality
  const clearChat = async () => {
    // Save current session before clearing (if authenticated and has messages)
    if (user?.uid && messages.length > 0) {
      try {
        await saveCurrentSession();
      } catch (err) {
        // Log error but don't block clearing
        console.error("Failed to save session before clearing:", err);
      }
    }

    // Clear conversation history
    setMessages([]);
    // Clear error state and retry message state
    setError(null);
    setRetryMessage(null);
    setRetryAttempt(0);
    setIsRetrying(false);
    // Clear loading state
    setIsAIResponding(false);
    // Reset stuck state (starting new problem session)
    setStuckState(resetStuckState());
    // Clear current session ID and completion status
    setCurrentSessionId(null);
    setCurrentCompletionStatus("in_progress");
    // Hide confirmation dialog
    setShowConfirmDialog(false);
  };

  // Handle clear chat button click
  const handleClearChatClick = () => {
    setShowConfirmDialog(true);
  };

  // Handle confirmation dialog confirmation
  const handleConfirmClear = () => {
    clearChat();
  };

  // Handle confirmation dialog cancellation
  const handleCancelClear = () => {
    setShowConfirmDialog(false);
  };

  // Handle complete button click
  const handleComplete = async () => {
    if (!currentSessionId || !user?.uid) {
      setError("No session to complete");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const updatedSession = await updateSessionCompletionStatus(currentSessionId, "solved");
      setCurrentCompletionStatus("solved");
      setSuccessMessage("Session marked as complete!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to mark session as complete: ${err.message}`
          : "Failed to mark session as complete"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] dark:bg-[var(--surface)] overflow-x-hidden shadow-sm"
      role="region"
      aria-label="Chat interface"
      aria-describedby="chat-interface-description"
    >
      <div id="chat-interface-description" className="sr-only">
        Interactive chat interface for communicating with AI tutor. Messages appear in chronological order.
      </div>
      <div className="flex min-h-[400px] max-h-[600px] flex-1 flex-col overflow-hidden sm:min-h-[500px] sm:max-h-[700px]">
        {/* Header with Clear Chat button */}
        <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Chat with Tutor
          </h2>
          <div className="flex items-center gap-2">
            <CompleteButton
              onClick={handleComplete}
              disabled={messages.length === 0 || !user?.uid || !currentSessionId}
              isCompleted={currentCompletionStatus === "solved"}
            />
            <SaveSessionButton
              onClick={handleManualSave}
              disabled={messages.length === 0 || !user?.uid}
              isSaving={isSaving}
            />
            <ClearChatButton
              onClick={handleClearChatClick}
              disabled={isAIResponding || messages.length === 0}
            />
          </div>
        </header>
        <MessageList messages={messages} />
        {/* Loading indicator */}
        {isAIResponding && (
          <div
            className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-opacity duration-200"
            role="status"
            aria-live="polite"
            aria-label="AI tutor is responding"
          >
            <LoadingSpinner size="sm" label="AI tutor is thinking..." />
          </div>
        )}
        {/* Success message display */}
        {successMessage && (
          <div className="border-t border-[var(--border)] bg-[var(--accent-success-50)] dark:bg-[var(--accent-success-900)]/20 px-4 py-3 transition-opacity duration-200">
            <div className="flex items-center gap-2 text-[var(--accent-success-800)] dark:text-[var(--accent-success-200)]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          </div>
        )}
        {/* Error display with retry button */}
        {error && !isAIResponding && (
          <div className="border-t border-[var(--border)] px-4 py-3 transition-opacity duration-200">
            <ErrorMessage
              message={error}
              onRetry={retryMessage && !isRetrying && retryAttempt < DEFAULT_RETRY_CONFIG.maxAttempts ? handleRetry : undefined}
              retryLabel="Retry"
              retryAttempt={retryAttempt}
              maxRetryAttempts={DEFAULT_RETRY_CONFIG.maxAttempts}
              isRetrying={isRetrying}
            />
          </div>
        )}
        <MessageInput
          onMessageSubmit={handleMessageSubmit}
          disabled={isAIResponding || !isOnline}
          isInitialInput={isInitialInput}
          ocrText={ocrText}
          onOcrTextChange={onOcrTextChange}
        />
      </div>
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />
    </div>
  );
}

