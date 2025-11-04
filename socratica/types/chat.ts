/**
 * Chat-related type definitions
 * Defines message types and interfaces for the chat interface
 */

export type MessageRole = "student" | "tutor";

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: Date | string;
}

export interface MessageProps {
  message: Message;
  index?: number;
}

export interface MessageListProps {
  messages: Message[];
}

export interface ChatInterfaceProps {
  initialMessages?: Message[];
  ocrText?: string; // Text extracted from OCR, to prefill input
  onOcrTextChange?: (text: string) => void; // Callback when OCR text changes
}

