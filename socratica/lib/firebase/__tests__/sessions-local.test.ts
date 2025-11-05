/**
 * Unit tests for session service functions
 * Tests localStorage-based session operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveSessionLocal,
  getUserSessionsLocal,
  getSessionByIdLocal,
  deleteSessionLocal,
  updateSessionCompletionStatusLocal,
  getLocalUserIdHelper,
} from '@/lib/firebase/sessions-local';
import { Session, CompletionStatus } from '@/types/session';

describe('Session Local Storage Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getLocalUserIdHelper', () => {
    it('should create a new user ID if none exists', () => {
      const userId = getLocalUserIdHelper();
      expect(userId).toBeTruthy();
      expect(userId).toMatch(/^local_\d+_[a-z0-9]+$/);
    });

    it('should return the same user ID on subsequent calls', () => {
      const userId1 = getLocalUserIdHelper();
      const userId2 = getLocalUserIdHelper();
      expect(userId1).toBe(userId2);
    });
  });

  describe('saveSessionLocal', () => {
    it('should create a new session with messages', async () => {
      const userId = getLocalUserIdHelper();
      const sessionData = {
        userId,
        problemText: 'Solve for x: 2x + 5 = 15',
        messages: [
          {
            role: 'student' as const,
            content: 'Solve for x: 2x + 5 = 15',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const savedSession = await saveSessionLocal(sessionData);
      
      expect(savedSession.sessionId).toBeTruthy();
      expect(savedSession.userId).toBe(userId);
      expect(savedSession.messages.length).toBe(1);
      expect(savedSession.completionStatus).toBe('in_progress');
    });

    it('should update existing session when sessionId is provided', async () => {
      const userId = getLocalUserIdHelper();
      const sessionData = {
        userId,
        problemText: 'Solve for x: 2x + 5 = 15',
        messages: [
          {
            role: 'student' as const,
            content: 'Solve for x: 2x + 5 = 15',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const savedSession = await saveSessionLocal(sessionData);
      const sessionId = savedSession.sessionId;

      // Update with more messages
      const updatedData = {
        ...sessionData,
        sessionId,
        messages: [
          ...sessionData.messages,
          {
            role: 'tutor' as const,
            content: 'What operation could you use?',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const updatedSession = await saveSessionLocal(updatedData);
      
      expect(updatedSession.sessionId).toBe(sessionId);
      expect(updatedSession.messages.length).toBe(2);
    });
  });

  describe('getUserSessionsLocal', () => {
    it('should return empty array when no sessions exist', async () => {
      const userId = getLocalUserIdHelper();
      const sessions = await getUserSessionsLocal(userId);
      expect(sessions).toEqual([]);
    });

    it('should return only sessions for the specified user', async () => {
      const userId1 = getLocalUserIdHelper();
      localStorage.setItem('socratica_user_id', userId1);
      
      const userId2 = 'local_9999999999_testuser2';
      
      // Create sessions for both users
      await saveSessionLocal({
        userId: userId1,
        problemText: 'Problem 1',
        messages: [],
      });

      await saveSessionLocal({
        userId: userId2,
        problemText: 'Problem 2',
        messages: [],
      });

      const user1Sessions = await getUserSessionsLocal(userId1);
      expect(user1Sessions.length).toBe(1);
      expect(user1Sessions[0].problemText).toBe('Problem 1');
    });

    it('should return sessions sorted by most recent first', async () => {
      const userId = getLocalUserIdHelper();
      
      // Create sessions with different timestamps
      const session1 = await saveSessionLocal({
        userId,
        problemText: 'Problem 1',
        messages: [],
        createdAt: new Date('2025-01-27T10:00:00Z').toISOString(),
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const session2 = await saveSessionLocal({
        userId,
        problemText: 'Problem 2',
        messages: [],
        createdAt: new Date('2025-01-27T11:00:00Z').toISOString(),
      });

      const sessions = await getUserSessionsLocal(userId);
      
      expect(sessions.length).toBe(2);
      expect(sessions[0].sessionId).toBe(session2.sessionId);
      expect(sessions[1].sessionId).toBe(session1.sessionId);
    });
  });

  describe('getSessionByIdLocal', () => {
    it('should return null when session does not exist', async () => {
      const session = await getSessionByIdLocal('nonexistent-id');
      expect(session).toBeNull();
    });

    it('should return session when it exists', async () => {
      const userId = getLocalUserIdHelper();
      const savedSession = await saveSessionLocal({
        userId,
        problemText: 'Test problem',
        messages: [],
      });

      const retrievedSession = await getSessionByIdLocal(savedSession.sessionId);
      
      expect(retrievedSession).toBeTruthy();
      expect(retrievedSession?.sessionId).toBe(savedSession.sessionId);
      expect(retrievedSession?.problemText).toBe('Test problem');
    });
  });

  describe('deleteSessionLocal', () => {
    it('should delete session from localStorage', async () => {
      const userId = getLocalUserIdHelper();
      const savedSession = await saveSessionLocal({
        userId,
        problemText: 'Test problem',
        messages: [],
      });

      await deleteSessionLocal(savedSession.sessionId);

      const sessions = await getUserSessionsLocal(userId);
      expect(sessions.length).toBe(0);
    });

    it('should not affect other sessions when deleting', async () => {
      const userId = getLocalUserIdHelper();
      
      const session1 = await saveSessionLocal({
        userId,
        problemText: 'Problem 1',
        messages: [],
      });

      const session2 = await saveSessionLocal({
        userId,
        problemText: 'Problem 2',
        messages: [],
      });

      await deleteSessionLocal(session1.sessionId);

      const sessions = await getUserSessionsLocal(userId);
      expect(sessions.length).toBe(1);
      expect(sessions[0].sessionId).toBe(session2.sessionId);
    });
  });

  describe('updateSessionCompletionStatusLocal', () => {
    it('should update completion status', async () => {
      const userId = getLocalUserIdHelper();
      const savedSession = await saveSessionLocal({
        userId,
        problemText: 'Test problem',
        messages: [],
        completionStatus: 'in_progress',
      });

      const updatedSession = await updateSessionCompletionStatusLocal(
        savedSession.sessionId,
        'solved'
      );

      expect(updatedSession.completionStatus).toBe('solved');

      const retrievedSession = await getSessionByIdLocal(savedSession.sessionId);
      expect(retrievedSession?.completionStatus).toBe('solved');
    });

    it('should throw error when session does not exist', async () => {
      await expect(
        updateSessionCompletionStatusLocal('nonexistent-id', 'solved')
      ).rejects.toThrow('Session not found');
    });
  });
});

