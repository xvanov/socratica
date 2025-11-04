"use client";

import { useState, useEffect, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ClearChatButton from "./ClearChatButton";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { ChatInterfaceProps, Message } from "@/types/chat";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const prevInitialMessagesRef = useRef<Message[]>(stableInitialMessages);
  
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
        }),
      });

      const data = await response.json();

      // Handle API response
      if (!response.ok || !data.success) {
        const errorMessage =
          data.error || "Unable to get tutor response. Please try again.";
        setError(errorMessage);
        setRetryMessage(messageText); // Store message for retry
        return;
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
      }
    } catch (error) {
      // Handle network errors
      console.error("Error sending message to AI:", error);
      setError("Network error. Please check your connection and try again.");
      setRetryMessage(messageText); // Store message for retry
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

  // Handle retry for failed requests
  const handleRetry = async () => {
    if (retryMessage) {
      // Use current messages state for retry (includes all previous messages)
      await sendMessageToAI(retryMessage, messages);
    }
  };

  // Clear chat functionality
  const clearChat = () => {
    // Clear conversation history
    setMessages([]);
    // Clear error state and retry message state
    setError(null);
    setRetryMessage(null);
    // Clear loading state
    setIsAIResponding(false);
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
      className="flex flex-col rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
      role="region"
      aria-label="Chat interface"
    >
      <div className="flex min-h-[400px] max-h-[600px] flex-1 flex-col overflow-hidden sm:min-h-[500px] sm:max-h-[700px]">
        {/* Header with Clear Chat button */}
        <div className="flex items-center justify-between border-b border-zinc-300 px-4 py-3 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Chat with Tutor
          </h2>
          <ClearChatButton
            onClick={handleClearChatClick}
            disabled={isAIResponding || messages.length === 0}
          />
        </div>
        <MessageList messages={messages} />
        {/* Loading indicator */}
        {isAIResponding && (
          <div
            className="border-t border-zinc-300 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800"
            role="status"
            aria-live="polite"
            aria-label="AI tutor is responding"
          >
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>AI tutor is thinking...</span>
            </div>
          </div>
        )}
        {/* Error display with retry button */}
        {error && !isAIResponding && (
          <div
            className="border-t border-red-300 bg-red-50 px-4 py-3 dark:border-red-700 dark:bg-red-900/20"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </p>
                {retryMessage && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-2 text-sm font-medium text-red-600 underline transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                    aria-label="Retry sending message"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <MessageInput
          onMessageSubmit={handleMessageSubmit}
          disabled={isAIResponding}
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

