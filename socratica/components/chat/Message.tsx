"use client";

import { MessageProps } from "@/types/chat";
import MessageContent from "@/components/math-renderer/MessageContent";

/**
 * Message component that displays a single chat message
 * Supports role-based styling (student on right, tutor on left)
 */
export default function Message({ message, index }: MessageProps) {
  const isStudent = message.role === "student";
  
  // Format timestamp
  const formatTimestamp = (timestamp: Date | string): string => {
    if (timestamp instanceof Date) {
      // Check if date is valid
      if (isNaN(timestamp.getTime())) {
        return `#${index !== undefined ? index + 1 : "?"}`;
      }
      return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    // If string, try to parse it
    const date = new Date(timestamp);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Fallback to sequence number if timestamp parsing fails
      return `#${index !== undefined ? index + 1 : "?"}`;
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const timestamp = formatTimestamp(message.timestamp);

  return (
    <article
      className={`flex w-full ${isStudent ? "justify-end" : "justify-start"} overflow-x-hidden`}
      aria-label={`${message.role} message`}
    >
      <div
        className={`flex max-w-[85%] flex-col gap-1 sm:max-w-[75%] md:max-w-[70%] ${
          isStudent ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-lg px-4 py-3 text-base leading-relaxed break-words ${
            isStudent
              ? "bg-[var(--primary-600)] text-white dark:bg-[var(--primary-500)]"
              : "bg-[var(--surface)] text-[var(--foreground)] dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-100)]"
          }`}
        >
          <MessageContent content={message.content} />
        </div>
        <div
          className={`text-xs text-[var(--neutral-500)] dark:text-[var(--neutral-400)] ${
            isStudent ? "text-right" : "text-left"
          }`}
          aria-label={`Message timestamp: ${timestamp}`}
        >
          {timestamp}
        </div>
      </div>
    </article>
  );
}

