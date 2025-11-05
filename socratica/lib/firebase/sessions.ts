/**
 * Session Firestore service functions
 * Handles CRUD operations for session history tracking
 * Falls back to localStorage if Firebase is not configured
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  FirestoreError,
  DocumentData,
} from "firebase/firestore";
// db is imported lazily to avoid initialization errors when Firebase isn't configured
import {
  Session,
  CompletionStatus,
  SESSION_COLLECTION_NAME,
} from "@/types/session";
import * as LocalSessions from "./sessions-local";

// Check if Firebase is configured (client-side check)
const isFirebaseConfigured = () => {
  if (typeof window === "undefined") return false;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return !!(
    projectId &&
    apiKey &&
    projectId !== "undefined" &&
    apiKey !== "undefined" &&
    projectId.trim() !== "" &&
    apiKey.trim() !== ""
  );
};

/**
 * Converts Firestore document to Session object
 */
function firestoreDocToSession(
  docId: string,
  data: DocumentData
): Session {
  return {
    sessionId: docId,
    userId: data.userId,
    problemText: data.problemText || undefined,
    problemImageUrl: data.problemImageUrl || undefined,
    messages: data.messages || [],
    completionStatus: data.completionStatus || "in_progress",
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : typeof data.createdAt === "string"
          ? data.createdAt
          : new Date().toISOString(),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : typeof data.updatedAt === "string"
          ? data.updatedAt
          : new Date().toISOString(),
    stuckState: data.stuckState || undefined,
  };
}

/**
 * Converts Session object to Firestore document data
 */
function sessionToFirestoreData(session: Partial<Session>): Record<string, unknown> {
  const data: Record<string, unknown> = {
    userId: session.userId!,
    messages: session.messages || [],
    completionStatus: session.completionStatus || "in_progress",
  };

  if (session.problemText !== undefined) {
    data.problemText = session.problemText;
  }
  if (session.problemImageUrl !== undefined) {
    data.problemImageUrl = session.problemImageUrl;
  }
  if (session.stuckState !== undefined) {
    data.stuckState = session.stuckState;
  }

  // Handle timestamps
  if (session.createdAt) {
    data.createdAt =
      typeof session.createdAt === "string"
        ? Timestamp.fromDate(new Date(session.createdAt))
        : session.createdAt;
  } else {
    data.createdAt = serverTimestamp();
  }

  if (session.updatedAt) {
    data.updatedAt =
      typeof session.updatedAt === "string"
        ? Timestamp.fromDate(new Date(session.updatedAt))
        : session.updatedAt;
  } else {
    data.updatedAt = serverTimestamp();
  }

  return data;
}

/**
 * Creates or updates a session in Firestore
 * @param session - Session data to save (sessionId optional for create)
 * @returns Saved Session object with sessionId
 * @throws Error if Firestore operation fails
 */
export async function saveSession(session: Partial<Session> & { userId: string }): Promise<Session> {
  // Always use localStorage for MVP - Firebase not configured
  console.log("saveSession - Using localStorage");
  return LocalSessions.saveSessionLocal(session);
}

/**
 * Fetches all sessions for a specific user, sorted by most recent first
 * @param userId - Firebase Auth UID
 * @returns Array of Session objects sorted by createdAt descending
 * @throws Error if Firestore operation fails
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  // Always use localStorage for MVP - Firebase not configured
  console.log("getUserSessions - Using localStorage");
  return LocalSessions.getUserSessionsLocal(userId);
}

/**
 * Fetches a specific session by ID
 * @param sessionId - Session document ID
 * @returns Session object or null if not found
 * @throws Error if Firestore operation fails
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  // Always use localStorage for MVP - Firebase not configured
  console.log("getSessionById - Using localStorage", sessionId);
  const session = await LocalSessions.getSessionByIdLocal(sessionId);
  console.log("getSessionById - Session retrieved:", session ? { sessionId: session.sessionId, messageCount: session.messages?.length, messages: session.messages } : null);
  return session;
}

/**
 * Deletes a session from Firestore
 * @param sessionId - Session document ID to delete
 * @throws Error if Firestore operation fails
 */
export async function deleteSession(sessionId: string): Promise<void> {
  // Always use localStorage for MVP - Firebase not configured
  console.log("deleteSession - Using localStorage");
  return LocalSessions.deleteSessionLocal(sessionId);
}

/**
 * Updates the completion status of a session
 * @param sessionId - Session document ID
 * @param status - New completion status
 * @returns Updated Session object
 * @throws Error if Firestore operation fails
 */
export async function updateSessionCompletionStatus(
  sessionId: string,
  status: CompletionStatus
): Promise<Session> {
  // Always use localStorage for MVP - Firebase not configured
  console.log("updateSessionCompletionStatus - Using localStorage", { sessionId, status });
  return LocalSessions.updateSessionCompletionStatusLocal(sessionId, status);
}

