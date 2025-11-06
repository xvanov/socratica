/**
 * Session Firestore service functions
 * Handles CRUD operations for session history tracking
 * Requires Firebase authentication - uses Firebase Auth user ID
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
import { db } from "./firestore";
import {
  Session,
  CompletionStatus,
  SESSION_COLLECTION_NAME,
} from "@/types/session";
import { WhiteboardState } from "@/types/whiteboard";

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
    whiteboardState: data.whiteboardState || undefined,
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
  if (session.whiteboardState !== undefined) {
    data.whiteboardState = session.whiteboardState;
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
  try {
    const sessionsRef = collection(db, SESSION_COLLECTION_NAME);
    const sessionData = sessionToFirestoreData(session);
    
    if (session.sessionId) {
      // Update existing session
      const sessionRef = doc(db, SESSION_COLLECTION_NAME, session.sessionId);
      
      // Verify session exists and belongs to user before updating
      const existingDoc = await getDoc(sessionRef);
      if (!existingDoc.exists()) {
        throw new Error("Session not found");
      }
      
      const existingData = existingDoc.data();
      if (existingData.userId !== session.userId) {
        throw new Error("You don't have permission to update this session");
      }

      // IMPORTANT: Preserve whiteboardState if it exists and we're not explicitly updating it
      // This prevents conflicts with the whiteboard's real-time listener
      if (session.whiteboardState === undefined && existingData.whiteboardState !== undefined) {
        // Don't include whiteboardState in the update - preserve existing value
        // The whiteboard component manages its own state separately
        delete sessionData.whiteboardState;
      } else if (session.whiteboardState !== undefined) {
        // Explicitly updating whiteboardState - include it
        sessionData.whiteboardState = session.whiteboardState;
      }
      
      await updateDoc(sessionRef, sessionData);
      
      // Fetch updated session
      const updatedDoc = await getDoc(sessionRef);
      if (!updatedDoc.exists()) {
        throw new Error("Session not found after update");
      }
      return firestoreDocToSession(updatedDoc.id, updatedDoc.data());
    } else {
      // Create new session
      const docRef = await addDoc(sessionsRef, sessionData);
      const newDoc = await getDoc(docRef);
      if (!newDoc.exists()) {
        throw new Error("Session not found after creation");
      }
      return firestoreDocToSession(newDoc.id, newDoc.data());
    }
  } catch (error) {
    const firestoreError = error as FirestoreError;
    // Log detailed error for debugging
    console.error("Firestore save error:", {
      code: firestoreError.code,
      message: firestoreError.message,
      stack: firestoreError.stack,
    });
    throw new Error(`Failed to save session: ${firestoreError.message || firestoreError.code || "Unknown error"}`);
  }
}

/**
 * Fetches all sessions for a specific user, sorted by most recent first
 * @param userId - Firebase Auth UID
 * @returns Array of Session objects sorted by createdAt descending
 * @throws Error if Firestore operation fails
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  try {
    const sessionsRef = collection(db, SESSION_COLLECTION_NAME);
    const q = query(
      sessionsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) =>
      firestoreDocToSession(doc.id, doc.data())
    );
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(`Failed to fetch user sessions: ${firestoreError.message}`);
  }
}

/**
 * Fetches a specific session by ID
 * @param sessionId - Session document ID
 * @returns Session object or null if not found
 * @throws Error if Firestore operation fails
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  try {
    const sessionRef = doc(db, SESSION_COLLECTION_NAME, sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      return null;
    }
    
    return firestoreDocToSession(sessionDoc.id, sessionDoc.data());
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(`Failed to fetch session: ${firestoreError.message}`);
  }
}

/**
 * Deletes a session from Firestore
 * @param sessionId - Session document ID to delete
 * @throws Error if Firestore operation fails
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const sessionRef = doc(db, SESSION_COLLECTION_NAME, sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(`Failed to delete session: ${firestoreError.message}`);
  }
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
  try {
    const sessionRef = doc(db, SESSION_COLLECTION_NAME, sessionId);
    await updateDoc(sessionRef, {
      completionStatus: status,
      updatedAt: serverTimestamp(),
    });
    
    const updatedDoc = await getDoc(sessionRef);
    if (!updatedDoc.exists()) {
      throw new Error("Session not found after update");
    }
    
    return firestoreDocToSession(updatedDoc.id, updatedDoc.data());
  } catch (error) {
    const firestoreError = error as FirestoreError;
    throw new Error(`Failed to update session status: ${firestoreError.message}`);
  }
}

