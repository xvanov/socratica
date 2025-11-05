/**
 * Local storage session service functions
 * Fallback when Firebase is not configured
 * Stores sessions in browser localStorage
 */

import { Session, CompletionStatus, SESSION_COLLECTION_NAME } from "@/types/session";

const STORAGE_KEY = "socratica_sessions";
const USER_ID_KEY = "socratica_user_id";

/**
 * Get or create a local user ID
 */
function getLocalUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

/**
 * Get all sessions from localStorage
 */
function getStoredSessions(): Session[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to get sessions from localStorage:", error);
    return [];
  }
}

/**
 * Save sessions to localStorage
 */
function saveStoredSessions(sessions: Session[]): void {
  if (typeof window === "undefined") {
    console.error("Cannot save to localStorage - window is undefined");
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save sessions to localStorage:", error);
    throw error;
  }
}

/**
 * Creates or updates a session in localStorage
 */
export async function saveSessionLocal(session: Partial<Session> & { userId: string }): Promise<Session> {
  console.log("saveSessionLocal - Starting save", { userId: session.userId, messageCount: session.messages?.length });
  
  // Use setTimeout to ensure this resolves asynchronously (even though localStorage is sync)
  return new Promise((resolve, reject) => {
    try {
      // Process in next tick to avoid blocking
      setTimeout(() => {
        try {
          const sessions = getStoredSessions();
          const now = new Date().toISOString();

          // Ensure messages are serializable (no circular refs)
          // Log to debug empty messages issue
          console.log("saveSessionLocal - Messages received:", session.messages?.length, session.messages);
          
          const serializableMessages = (session.messages || []).map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: typeof msg.timestamp === "string" ? msg.timestamp : msg.timestamp?.toISOString() || new Date().toISOString(),
          }));

          console.log("saveSessionLocal - Serialized messages:", serializableMessages.length, serializableMessages);

          const sessionData: Session = {
            sessionId: session.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: session.userId,
            problemText: session.problemText,
            problemImageUrl: session.problemImageUrl,
            messages: serializableMessages,
            completionStatus: session.completionStatus || "in_progress",
            createdAt: session.createdAt || now,
            updatedAt: now,
            stuckState: session.stuckState ? JSON.parse(JSON.stringify(session.stuckState)) : undefined,
          };

          const existingIndex = sessions.findIndex((s) => s.sessionId === sessionData.sessionId);
          
          if (existingIndex >= 0) {
            // Update existing session
            sessions[existingIndex] = sessionData;
            console.log("saveSessionLocal - Updated existing session", sessionData.sessionId);
          } else {
            // Add new session
            sessions.push(sessionData);
            console.log("saveSessionLocal - Created new session", sessionData.sessionId);
          }

          saveStoredSessions(sessions);
          console.log("saveSessionLocal - Saved successfully", { 
            totalSessions: sessions.length,
            savedSessionId: sessionData.sessionId,
            savedMessageCount: sessionData.messages.length,
            savedMessages: sessionData.messages 
          });
          
          // Verify it was saved correctly
          const verifySessions = getStoredSessions();
          const verifySession = verifySessions.find(s => s.sessionId === sessionData.sessionId);
          console.log("saveSessionLocal - Verification:", verifySession ? {
            sessionId: verifySession.sessionId,
            messageCount: verifySession.messages?.length,
            messages: verifySession.messages
          } : "Session not found after save!");
          
          resolve(sessionData);
        } catch (error) {
          console.error("saveSessionLocal - Error in setTimeout:", error);
          reject(error);
        }
      }, 0);
    } catch (error) {
      console.error("saveSessionLocal - Error:", error);
      reject(error);
    }
  });
}

/**
 * Fetches all sessions for a specific user, sorted by most recent first
 */
export async function getUserSessionsLocal(userId: string): Promise<Session[]> {
  const sessions = getStoredSessions();
  const userSessions = sessions
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return userSessions;
}

/**
 * Fetches a specific session by ID
 */
export async function getSessionByIdLocal(sessionId: string): Promise<Session | null> {
  const sessions = getStoredSessions();
  const session = sessions.find((s) => s.sessionId === sessionId) || null;
  console.log("getSessionByIdLocal - Found session:", session ? { sessionId: session.sessionId, messageCount: session.messages?.length, messages: session.messages } : null);
  return session;
}

/**
 * Deletes a session from localStorage
 */
export async function deleteSessionLocal(sessionId: string): Promise<void> {
  console.log("deleteSessionLocal - Deleting session", sessionId);
  
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        try {
          const sessions = getStoredSessions();
          console.log("deleteSessionLocal - Current sessions before delete:", sessions.length);
          
          const filtered = sessions.filter((s) => s.sessionId !== sessionId);
          console.log("deleteSessionLocal - Sessions after filter:", filtered.length);
          
          if (filtered.length === sessions.length) {
            console.warn("deleteSessionLocal - Session not found, nothing to delete");
          }
          
          saveStoredSessions(filtered);
          console.log("deleteSessionLocal - Deleted successfully, remaining sessions:", filtered.length);
          resolve();
        } catch (error) {
          console.error("deleteSessionLocal - Error in setTimeout:", error);
          reject(error);
        }
      }, 0);
    } catch (error) {
      console.error("deleteSessionLocal - Error:", error);
      reject(error);
    }
  });
}

/**
 * Updates the completion status of a session
 */
export async function updateSessionCompletionStatusLocal(
  sessionId: string,
  status: CompletionStatus
): Promise<Session> {
  const sessions = getStoredSessions();
  const sessionIndex = sessions.findIndex((s) => s.sessionId === sessionId);
  
  if (sessionIndex < 0) {
    throw new Error("Session not found");
  }

  sessions[sessionIndex] = {
    ...sessions[sessionIndex],
    completionStatus: status,
    updatedAt: new Date().toISOString(),
  };

  saveStoredSessions(sessions);
  return sessions[sessionIndex];
}

/**
 * Get or create local user ID
 */
export function getLocalUserIdHelper(): string {
  return getLocalUserId();
}

