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
import Tooltip from "@/components/ui/Tooltip";
import Whiteboard from "@/components/whiteboard/Whiteboard";
import WhiteboardDebugWindow from "@/components/debug/WhiteboardDebugWindow";
import { extractTextFromWhiteboard } from "@/lib/ocr/whiteboard-ocr";
import { ChatInterfaceProps, Message, StuckState } from "@/types/chat";
import { resetStuckState } from "@/lib/openai/stuck-detection";
import { formatError, ErrorType, ERROR_MESSAGES } from "@/lib/utils/error-handling";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import { calculateRetryDelay, waitForRetry, DEFAULT_RETRY_CONFIG, formatRetryMessage } from "@/lib/utils/retry";
import { saveSession, getSessionById, updateSessionCompletionStatus } from "@/lib/firebase/sessions";
import { CompletionStatus, Session } from "@/types/session";
import { useAuth } from "@/hooks/useAuth";
import { WhiteboardState } from "@/types/whiteboard";

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
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [whiteboardState, setWhiteboardState] = useState<WhiteboardState | null>(null);
  const whiteboardStateRef = useRef<WhiteboardState | null>(null);
  const captureWhiteboardImageRef = useRef<(() => Promise<string | null>) | null>(null);
  const [whiteboardOCRText, setWhiteboardOCRText] = useState<string | null>(null);
  const [whiteboardOCRError, setWhiteboardOCRError] = useState<string | null>(null);
  const [capturedWhiteboardImage, setCapturedWhiteboardImage] = useState<string | null>(null);
  
  // Handle whiteboard state changes
  const handleWhiteboardStateChange = useCallback((state: WhiteboardState) => {
    console.log("ChatInterface: Whiteboard state updated:", { 
      elementCount: state.elements.length, 
      elements: state.elements.map(e => ({ type: e.type, id: e.id })),
      timestamp: new Date().toISOString()
    });
    whiteboardStateRef.current = state;
    setWhiteboardState(state);
  }, []);

  // Handle whiteboard capture function ready
  const handleWhiteboardCaptureReady = useCallback((capture: () => Promise<string | null>) => {
    captureWhiteboardImageRef.current = capture;
  }, []);
  
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
  const sendMessageToAI = useCallback(async (
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

      // Capture whiteboard image if available
      // IMPORTANT: Capture from visible whiteboard instance if open, otherwise from hidden one
      let whiteboardImage: string | null = null;
      let ocrText: string | null = null;
      let ocrError: string | null = null;
      
      if (captureWhiteboardImageRef.current) {
        try {
          console.log("ChatInterface: Attempting to capture whiteboard image...", {
            showWhiteboard,
            hasCaptureFunction: !!captureWhiteboardImageRef.current,
            hasWhiteboardState: !!(whiteboardStateRef.current || whiteboardState),
            elementCount: (whiteboardStateRef.current || whiteboardState)?.elements?.length || 0
          });
          
          // Only capture if there are elements - use ref for latest state
          const currentWhiteboardStateForCapture = whiteboardStateRef.current || whiteboardState;
          if (currentWhiteboardStateForCapture && currentWhiteboardStateForCapture.elements && currentWhiteboardStateForCapture.elements.length > 0) {
            whiteboardImage = await captureWhiteboardImageRef.current();
            setCapturedWhiteboardImage(whiteboardImage);
            
            if (whiteboardImage) {
              console.log("ChatInterface: Successfully captured whiteboard image:", { 
                hasImage: true,
                dataURLLength: whiteboardImage.length,
                elementCount: currentWhiteboardStateForCapture.elements.length,
                preview: whiteboardImage.substring(0, 100) + "..."
              });
              
              // Run OCR on the captured image
              console.log("ChatInterface: Running OCR on whiteboard image...");
              const ocrResult = await extractTextFromWhiteboard(whiteboardImage);
              
              if (ocrResult.error) {
                console.warn("ChatInterface: OCR error:", ocrResult.error);
                ocrError = ocrResult.error;
                setWhiteboardOCRError(ocrResult.error);
                setWhiteboardOCRText(null);
              } else {
                ocrText = ocrResult.text;
                setWhiteboardOCRText(ocrResult.text);
                setWhiteboardOCRError(null);
                console.log("ChatInterface: OCR successful:", { 
                  text: ocrResult.text,
                  textLength: ocrResult.text.length
                });
              }
            } else {
              console.warn("ChatInterface: Whiteboard image capture returned null");
              setCapturedWhiteboardImage(null);
            }
          } else {
            console.log("ChatInterface: Skipping capture - no elements to capture");
            setCapturedWhiteboardImage(null);
            setWhiteboardOCRText(null);
            setWhiteboardOCRError(null);
          }
        } catch (error) {
          console.error("Failed to capture whiteboard image or run OCR:", error);
          setWhiteboardOCRError(error instanceof Error ? error.message : "Unknown error");
          // Continue without image if capture fails
        }
      } else {
        console.log("ChatInterface: No capture function available (whiteboard may not be mounted)");
        setCapturedWhiteboardImage(null);
        setWhiteboardOCRText(null);
        setWhiteboardOCRError(null);
      }

      // Log request details before sending
      const requestBody = {
        message: messageText,
        conversationHistory,
        stuckState,
        whiteboardState: whiteboardStateRef.current || whiteboardState,
        whiteboardImage,
        whiteboardOCRText: ocrText,
        userId: user?.uid,
      };
      
      console.log("ChatInterface: Sending request to API:", {
        messageLength: messageText.length,
        conversationHistoryLength: conversationHistory.length,
        hasWhiteboardState: !!requestBody.whiteboardState,
        whiteboardElementCount: requestBody.whiteboardState?.elements?.length || 0,
        hasWhiteboardImage: !!requestBody.whiteboardImage,
        whiteboardImageLength: requestBody.whiteboardImage?.length || 0,
        hasWhiteboardOCRText: !!requestBody.whiteboardOCRText,
        whiteboardOCRTextLength: requestBody.whiteboardOCRText?.length || 0,
        hasUserId: !!requestBody.userId,
      });

      // Call chat API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log("ChatInterface: Sent message to API with whiteboard state:", {
        hasWhiteboardState: !!(whiteboardStateRef.current || whiteboardState),
        hasWhiteboardImage: !!whiteboardImage,
        elementCount: (whiteboardStateRef.current || whiteboardState)?.elements?.length || 0,
        whiteboardStateFromRef: !!whiteboardStateRef.current,
        whiteboardStateFromState: !!whiteboardState,
      });

      // Parse response JSON (can only be read once)
      let data;
      try {
        const responseText = await response.text();
        console.log("ChatInterface: Raw API response:", {
          status: response.status,
          statusText: response.statusText,
          responseText: responseText.substring(0, 1000), // First 1000 chars for debugging
          responseTextFull: responseText, // Full response for debugging
        });
        
        try {
          data = JSON.parse(responseText);
          console.log("ChatInterface: Parsed response data:", {
            success: data.success,
            hasError: !!data.error,
            error: data.error,
            hasData: !!data.data,
            dataKeys: data.data ? Object.keys(data.data) : [],
          });
        } catch (parseError) {
          console.error("ChatInterface: Failed to parse JSON response:", parseError, {
            responseText: responseText.substring(0, 500),
          });
          data = {
            success: false,
            error: response.status === 429
              ? "Too many requests. Please wait a moment and try again."
              : response.status >= 500
              ? "The service is temporarily unavailable. Please try again in a moment."
              : response.status === 401 || response.status === 403
              ? "There was an authentication issue. Please refresh the page and try again."
              : `Server error (${response.status}): ${responseText.substring(0, 200)}`,
          };
        }
      } catch (jsonError) {
        // If reading response fails, create a basic error response
        console.error("ChatInterface: Failed to read response:", jsonError);
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
        // Log detailed error info for debugging
        console.error("ChatInterface: API error response:", {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          hasWhiteboardImage: !!whiteboardImage,
          hasWhiteboardOCRText: !!ocrText,
          hasWhiteboardState: !!(whiteboardStateRef.current || whiteboardState),
          whiteboardElementCount: (whiteboardStateRef.current || whiteboardState)?.elements?.length || 0,
          messageText: messageText.substring(0, 50),
        });
        
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
  }, [isOnline, whiteboardState, whiteboardStateRef, captureWhiteboardImageRef, user?.uid, stuckState, addMessage]);

  // Handle whiteboard submit (send whiteboard content without text message)
  const handleWhiteboardSubmit = useCallback(async () => {
    // Check if whiteboard has content - use ref for latest state
    const currentWhiteboardState = whiteboardStateRef.current || whiteboardState;
    if (!currentWhiteboardState || !currentWhiteboardState.elements || currentWhiteboardState.elements.length === 0) {
      setError("Please draw something on the whiteboard before sending.");
      return;
    }

    // Add a placeholder student message to indicate whiteboard content was shared
    const whiteboardMessage: Message = {
      role: "student",
      content: "[Whiteboard content shared]",
      timestamp: new Date(),
    };

    // Add student message to state immediately
    addMessage(whiteboardMessage);

    // Build conversation history with new message included
    const conversationHistory = [...messages, whiteboardMessage];

    // Use empty string for the actual message text - the whiteboard image and state will be sent
    await sendMessageToAI("", conversationHistory);
  }, [messages, sendMessageToAI, whiteboardState, whiteboardStateRef, addMessage]);

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
    <div className="flex flex-col">
      {/* Chat Panel - Full width when whiteboard is closed, overlay on side when whiteboard is open */}
      <div
        className={`flex flex-col rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] dark:bg-[var(--surface)] overflow-x-hidden shadow-sm ${
          showWhiteboard ? 'lg:fixed lg:right-0 lg:top-16 lg:bottom-0 lg:w-[30%] lg:z-50 lg:shadow-xl lg:rounded-none lg:border-l' : 'flex-1'
        }`}
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
          <div className="flex items-center gap-2">
            <Tooltip content={showWhiteboard ? "Switch to chat mode" : "Open whiteboard"}>
              <button
                type="button"
                onClick={() => setShowWhiteboard(!showWhiteboard)}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-medium text-[var(--neutral-700)] transition-colors hover:border-[var(--neutral-400)] hover:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 dark:bg-[var(--surface)] dark:text-[var(--neutral-300)] dark:hover:border-[var(--neutral-600)] dark:hover:bg-[var(--neutral-800)] dark:focus:ring-[var(--neutral-100)] min-h-[44px] min-w-[44px] shadow-sm"
                aria-label={showWhiteboard ? "Hide whiteboard" : "Show whiteboard"}
                aria-pressed={showWhiteboard}
              >
                {showWhiteboard ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="sr-only sm:not-sr-only">Chat</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="sr-only sm:not-sr-only">Whiteboard</span>
                  </>
                )}
              </button>
            </Tooltip>
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
        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onConfirm={handleConfirmClear}
          onCancel={handleCancelClear}
        />
      </div>
      </div>
      {/* Whiteboard Panel - Single component instance always mounted */}
      {/* Mobile: Full-screen modal overlay */}
      {showWhiteboard && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWhiteboard(false)} aria-hidden="true" />
          <div className="absolute inset-0 flex flex-col bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold">Whiteboard</h3>
              <button
                type="button"
                onClick={() => setShowWhiteboard(false)}
                className="rounded-md p-2 hover:bg-gray-100"
                aria-label="Close whiteboard"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Whiteboard
                key="whiteboard-main"
                initialState={whiteboardState || undefined}
                onStateChange={handleWhiteboardStateChange}
                onCaptureReady={handleWhiteboardCaptureReady}
                onSubmit={handleWhiteboardSubmit}
                visible={showWhiteboard}
                sessionId={currentSessionId || undefined}
                userId={user?.uid || undefined}
              />
            </div>
          </div>
        </div>
      )}
      {/* Desktop: Full-screen whiteboard when open */}
      {showWhiteboard && (
        <div className="hidden lg:block fixed inset-0 z-40 bg-[var(--surface)]">
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Whiteboard</h3>
              <button
                type="button"
                onClick={() => setShowWhiteboard(false)}
                className="rounded-md p-2 hover:bg-[var(--surface-elevated)]"
                aria-label="Close whiteboard"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Whiteboard
                key="whiteboard-main"
                initialState={whiteboardState || undefined}
                onStateChange={handleWhiteboardStateChange}
                onCaptureReady={handleWhiteboardCaptureReady}
                onSubmit={handleWhiteboardSubmit}
                visible={showWhiteboard}
                sessionId={currentSessionId || undefined}
                userId={user?.uid || undefined}
              />
            </div>
          </div>
        </div>
      )}
      {/* Always mount whiteboard component (hidden) to preserve state when closed */}
      {!showWhiteboard && (
        <div className="hidden">
          <Whiteboard
            key="whiteboard-main"
            initialState={whiteboardState || undefined}
            onStateChange={handleWhiteboardStateChange}
            visible={false}
            sessionId={currentSessionId || undefined}
            userId={user?.uid || undefined}
          />
        </div>
      )}
      {/* Debug window for whiteboard OCR */}
      <WhiteboardDebugWindow
        capturedImage={capturedWhiteboardImage}
        ocrText={whiteboardOCRText}
        ocrError={whiteboardOCRError}
        whiteboardState={whiteboardState}
      />
    </div>
  );
}

