import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { openai } from '@/lib/openai/client';
import { SOCRATIC_MATH_TUTOR_PROMPT } from '@/lib/openai/prompts';
import OpenAI from 'openai';
import { Message } from '@/types/chat';

// Mock OpenAI client
vi.mock('@/lib/openai/client', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

// Mock prompts
vi.mock('@/lib/openai/prompts', () => ({
  SOCRATIC_MATH_TUTOR_PROMPT: 'Test Socratic prompt',
}));

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const createMessage = (
    role: 'student' | 'tutor',
    content: string,
    timestamp: Date | string = new Date()
  ): Message => ({
    role,
    content,
    timestamp,
  });

  describe('AC1: Integrates with LLM API (OpenAI GPT-4 Turbo) using architecture patterns', () => {
    it('should integrate with OpenAI client', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'I can help you with that.',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Hello, I need help',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(openai.chat.completions.create).toHaveBeenCalled();
      expect(data.success).toBe(true);
    });

    it('should use GPT-4 Turbo model', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'I can help you with that.',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Hello, I need help',
        conversationHistory: [],
      });

      await POST(request);

      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4-turbo',
        })
      );
    });
  });

  describe('AC2: Sends student message to API with appropriate system prompt', () => {
    it('should send system prompt to API', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'I can help you with that.',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Hello, I need help',
        conversationHistory: [],
      });

      await POST(request);

      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'system',
              content: SOCRATIC_MATH_TUTOR_PROMPT,
            },
          ]),
        })
      );
    });

    it('should send student message to API', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'I can help you with that.',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Solve for x: 2x + 5 = 13',
        conversationHistory: [],
      });

      await POST(request);

      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'user',
              content: 'Solve for x: 2x + 5 = 13',
            },
          ]),
        })
      );
    });

    it('should convert conversation history to OpenAI format', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'I can help you with that.',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const conversationHistory: Message[] = [
        createMessage('student', 'Hello'),
        createMessage('tutor', 'Hi there!'),
        createMessage('student', 'I need help'),
      ];

      const request = createMockRequest({
        message: 'Solve for x: 2x + 5 = 13',
        conversationHistory,
      });

      await POST(request);

      const callArgs = (openai.chat.completions.create as any).mock.calls[0][0];
      expect(callArgs.messages).toHaveLength(5); // system + 3 history + 1 current
      expect(callArgs.messages[1]).toEqual({ role: 'user', content: 'Hello' });
      expect(callArgs.messages[2]).toEqual({ role: 'assistant', content: 'Hi there!' });
      expect(callArgs.messages[3]).toEqual({ role: 'user', content: 'I need help' });
      expect(callArgs.messages[4]).toEqual({ role: 'user', content: 'Solve for x: 2x + 5 = 13' });
    });

    it('should truncate conversation history when context window exceeded', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'I can help you with that.',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      // Create many messages that will exceed context window
      const conversationHistory: Message[] = [];
      for (let i = 0; i < 100; i++) {
        conversationHistory.push(
          createMessage('student', `Message ${i}: ${'a'.repeat(100)}`)
        );
        conversationHistory.push(
          createMessage('tutor', `Response ${i}: ${'b'.repeat(100)}`)
        );
      }

      const request = createMockRequest({
        message: 'Current message',
        conversationHistory,
      });

      await POST(request);

      const callArgs = (openai.chat.completions.create as any).mock.calls[0][0];
      // Should truncate to fit within context window
      expect(callArgs.messages.length).toBeLessThan(conversationHistory.length + 2);
      // System prompt should always be preserved
      expect(callArgs.messages[0].role).toBe('system');
      // Most recent messages should be preserved
      expect(callArgs.messages[callArgs.messages.length - 1].content).toBe('Current message');
    });
  });

  describe('AC3: Receives and displays AI response in chat', () => {
    it('should return AI response in correct format', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'I can help you solve that equation. What do you think the first step should be?',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Solve for x: 2x + 5 = 13',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('message');
      expect(data.data.message).toBe('I can help you solve that equation. What do you think the first step should be?');
      expect(data.data).toHaveProperty('messageId');
      expect(data.data).toHaveProperty('timestamp');
    });

    it('should handle empty AI response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid response format');
    });
  });

  describe('Request validation', () => {
    it('should validate message is required', async () => {
      const request = createMockRequest({
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Message is required');
    });

    it('should validate message is a string', async () => {
      const request = createMockRequest({
        message: 123,
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('must be a string');
    });

    it('should validate message is not empty', async () => {
      const request = createMockRequest({
        message: '   ',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('cannot be empty');
    });

    it('should validate conversationHistory is an array', async () => {
      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: 'not an array',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('must be an array');
    });
  });

  describe('AC6: Error Handling', () => {
    it('should handle rate limit errors (429)', async () => {
      const apiError = new OpenAI.APIError(
        429,
        undefined,
        'Rate limit exceeded',
        undefined
      );
      // Retry logic will retry 3 times, so mock all attempts
      (openai.chat.completions.create as any).mockRejectedValue(apiError);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Too many requests');
    });

    it('should handle authentication errors (401)', async () => {
      const apiError = new OpenAI.APIError(
        401,
        undefined,
        'Invalid API key',
        undefined
      );
      // Retry logic will retry 3 times, so mock all attempts
      (openai.chat.completions.create as any).mockRejectedValue(apiError);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Authentication error');
    });

    it('should handle context window overflow errors', async () => {
      // Create an error that matches the context window overflow pattern
      // OpenAI.APIError message format is "400 Context window overflow"
      // The route handler checks: error.status === 400 && error.message?.includes("context")
      const apiError = new OpenAI.APIError(
        400,
        undefined,
        'Context window overflow',
        undefined
      );
      // The message property contains "400 Context window overflow" which includes "context" (case-insensitive check)
      // Retry logic will retry 3 times, so mock all attempts
      (openai.chat.completions.create as any).mockRejectedValue(apiError);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('too long');
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout');
      // Retry logic will retry 3 times, then throw the error
      // The catch block checks for "timeout" in error.message and returns 504
      (openai.chat.completions.create as any).mockRejectedValue(timeoutError);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      // Network timeout errors return 504 after retries fail
      expect(response.status).toBe(504);
      expect(data.success).toBe(false);
      expect(data.error).toContain('timed out');
    });

    it('should handle generic API errors', async () => {
      // Create a generic error that doesn't match timeout pattern
      const apiError = new Error('Internal server error');
      // Make sure it doesn't match timeout pattern
      (openai.chat.completions.create as any).mockRejectedValue(apiError);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unable to get tutor response');
    });

    it('should handle invalid request format (JSON parsing errors)', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid request format');
    });
  });

  describe('Retry logic', () => {
    it('should retry on failure (up to 3 attempts)', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'I can help you with that.',
            },
          },
        ],
      };

      // Fail twice, then succeed
      (openai.chat.completions.create as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(openai.chat.completions.create).toHaveBeenCalledTimes(3);
      expect(data.success).toBe(true);
    });

    it('should fail after max retry attempts', async () => {
      const error = new Error('Network error');
      (openai.chat.completions.create as any).mockRejectedValue(error);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(openai.chat.completions.create).toHaveBeenCalledTimes(3);
      expect(data.success).toBe(false);
    });
  });
});

