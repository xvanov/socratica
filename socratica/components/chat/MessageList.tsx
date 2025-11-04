"use client";

import { useEffect, useRef } from "react";
import Message from "./Message";
import { MessageListProps } from "@/types/chat";

/**
 * MessageList component that displays messages in chronological order
 * Implements auto-scrolling to latest message
 */
export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message when messages change
  useEffect(() => {
    if (messagesEndRef.current && containerRef.current) {
      // Use scrollIntoView for smooth scrolling
      if (typeof messagesEndRef.current.scrollIntoView === 'function') {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }
  }, [messages]);

  // Handle edge cases: very long messages or many messages
  // The container should have proper overflow handling
  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col overflow-y-auto"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="flex flex-col gap-4 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <Message key={index} message={message} index={index} />
          ))
        )}
        {/* Invisible element at the end for scrolling */}
        <div ref={messagesEndRef} className="h-0" aria-hidden="true" />
      </div>
    </div>
  );
}

