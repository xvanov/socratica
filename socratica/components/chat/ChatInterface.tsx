"use client";

import { useState, useEffect, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ClearChatButton from "./ClearChatButton";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { ChatInterfaceProps, Message, StuckState } from "@/types/chat";
import { resetStuckState } from "@/lib/openai/stuck-detection";
import { formatError, ErrorType, ERROR_MESSAGES } from "@/lib/utils/error-handling";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import { calculateRetryDelay, waitForRetry, DEFAULT_RETRY_CONFIG, formatRetryMessage } from "@/lib/utils/retry";

// Stable empty array to avoid creating new references on each render
const EMPTY_MESSAGES: Message[] = [];

/**
 * ChatInterface component - Main chat interface that displays messages
 * Integrates MessageList and MessageInput components and manages message state
 * Integrates with chat API route to send messages and receive AI responses
 */
export default function ChatInterface({
  initialMessages,
  ocrText,
  onOcrTextChange,
}: ChatInterfaceProps) {
  // Use stable empty array if not provided
  const stableInitialMessages = initialMessages ?? EMPTY_MESSAGES;
  const [messages, setMessages] = useState<Message[]>(stableInitialMessages);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [stuckState, setStuckState] = useState<StuckState>(resetStuckState());
  const prevInitialMessagesRef = useRef<Message[]>(stableInitialMessages);
  const isOnline = useNetworkStatus();
  
  // Determine if this is the initial input (no messages yet)
  const isInitialInput = messages.length === 0;

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

      const data = await response.json();

      // Handle API response
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
  const clearChat = () => {
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
          <ClearChatButton
            onClick={handleClearChatClick}
            disabled={isAIResponding || messages.length === 0}
          />
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

