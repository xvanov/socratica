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

/**
 * Validation result for student responses
 */
export type CorrectnessLevel = "correct" | "incorrect" | "partial";

export interface ValidationResult {
  correctnessLevel: CorrectnessLevel;
  feedback?: string;
  isValidExpression?: boolean;
  expressionError?: string;
}

/**
 * Stuck state tracking interface
 * Tracks whether student is stuck and number of consecutive confused responses
 */
export interface StuckState {
  consecutiveConfused: number;
  isStuck: boolean;
  lastConfusedIndex: number | null; // Index of last confused message in conversation
}

/**
 * Understanding level for adaptive questioning
 */
export type UnderstandingLevel = "confused" | "struggling" | "progressing" | "strong";

/**
 * Question complexity level matching understanding level
 */
export type QuestionComplexity = "simplified" | "scaffolded" | "standard" | "advanced";

