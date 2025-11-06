/**
 * Session-related type definitions
 * Defines session data model and interfaces for session history tracking
 */

import { Message, StuckState } from "./chat";
import { WhiteboardState } from "./whiteboard";

/**
 * Completion status for a problem session
 */
export type CompletionStatus = "solved" | "not_solved" | "in_progress";

/**
 * Session data model interface
 * Represents a problem-solving session with conversation history and metadata
 */
export interface Session {
  /** Auto-generated document ID from Firestore */
  sessionId: string;
  /** Firebase Auth UID of the user who owns this session */
  userId: string;
  /** Text input problem (if problem was entered as text) */
  problemText?: string;
  /** Image URL if problem was uploaded via image upload */
  problemImageUrl?: string;
  /** Full conversation history array with all messages (student and tutor) */
  messages: Message[];
  /** Completion status of the problem session */
  completionStatus: CompletionStatus;
  /** ISO 8601 timestamp (UTC) when session was created */
  createdAt: string;
  /** ISO 8601 timestamp (UTC) when session was last updated */
  updatedAt: string;
  /** Optional stuck detection state */
  stuckState?: StuckState;
  /** Optional whiteboard state with drawings and settings */
  whiteboardState?: WhiteboardState;
}

/**
 * Firestore collection name for sessions
 */
export const SESSION_COLLECTION_NAME = "sessions";

/**
 * Props for SessionHistory component
 */
export interface SessionHistoryProps {
  /** Optional callback when a session is selected to resume */
  onResumeSession?: (session: Session) => void;
}

/**
 * Props for SessionListItem component
 */
export interface SessionListItemProps {
  /** Session data to display */
  session: Session;
  /** Callback when session is selected to resume */
  onResume: (session: Session) => void;
  /** Callback when session is selected for deletion */
  onDelete: (sessionId: string) => void;
}

