import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { openai } from '@/lib/openai/client';
import OpenAI from 'openai';

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

describe('Chat API Route - Error Handling', () => {
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

  describe('Rate limit errors (429)', () => {
    it('should handle rate limit errors with appropriate messaging', async () => {
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
      expect(data.error).toContain('wait a moment');
    });

    it('should retry on rate limit errors (up to 3 attempts)', async () => {
      const apiError = new OpenAI.APIError(
        429,
        undefined,
        'Rate limit exceeded',
        undefined
      );
      (openai.chat.completions.create as any).mockRejectedValue(apiError);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      // Should retry up to 3 times
      expect(openai.chat.completions.create).toHaveBeenCalledTimes(3);
      expect(data.success).toBe(false);
    });
  });

  describe('Authentication errors (401)', () => {
    it('should handle authentication errors with clear error message', async () => {
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
      expect(data.error).toContain('API key');
    });
  });

  describe('Context window overflow errors', () => {
    it('should handle context window overflow errors gracefully', async () => {
      // Create an error that matches the context window overflow pattern
      // OpenAI.APIError message format is "400 Context window overflow"
      // The route handler checks: error.status === 400 && error.message?.includes("context")
      const apiError = new OpenAI.APIError(
        400,
        undefined,
        'Context window overflow',
        undefined
      );
      // The message property contains "400 Context window overflow" which includes "context"
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
      expect(data.error).toContain('new conversation');
    });

    it('should detect context window overflow by status and message', async () => {
      // Create an error that matches the context window overflow pattern
      const apiError = new OpenAI.APIError(
        400,
        undefined,
        'Context window overflow',
        undefined
      );
      // The message property contains "400 Context window overflow" which includes "context"
      // Retry logic will retry 3 times, so mock all attempts
      (openai.chat.completions.create as any).mockRejectedValue(apiError);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('too long');
    });
  });

  describe('Network timeout errors', () => {
    it('should handle network timeout errors with retry option', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.message = 'timeout';
      // Retry logic will retry 3 times, so mock all attempts
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
      expect(data.error).toContain('try again');
    });

    it('should handle timeout errors with connection check message', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.message = 'timeout';
      // Retry logic will retry 3 times, so mock all attempts
      (openai.chat.completions.create as any).mockRejectedValue(timeoutError);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      // Network timeout errors return timeout message
      expect(data.error).toContain('timed out');
    });
  });

  describe('Invalid response format errors', () => {
    it('should handle invalid response format errors with fallback handling', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '', // Empty content
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

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid response format');
    });

    it('should handle missing choices in response', async () => {
      const mockResponse = {
        choices: [],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid response format');
    });
  });

  describe('Generic API errors', () => {
    it('should handle generic API errors with user-friendly message', async () => {
      const apiError = new OpenAI.APIError(
        500,
        undefined,
        'Internal server error',
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

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unable to get tutor response');
      expect(data.error).toContain('try again');
    });

    it('should handle unknown errors gracefully', async () => {
      const unknownError = new Error('Unknown error');
      // Retry logic will retry 3 times, so mock all attempts
      (openai.chat.completions.create as any).mockRejectedValue(unknownError);

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
  });

  describe('Error logging', () => {
    it('should log errors to console in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const apiError = new OpenAI.APIError(
        500,
        undefined,
        'Internal server error',
        undefined
      );
      (openai.chat.completions.create as any).mockRejectedValueOnce(apiError);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      await POST(request);

      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error message format', () => {
    it('should return errors in consistent format', async () => {
      const apiError = new OpenAI.APIError(
        429,
        undefined,
        'Rate limit exceeded',
        undefined
      );
      (openai.chat.completions.create as any).mockRejectedValueOnce(apiError);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('data', null);
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
      expect(data.error.length).toBeGreaterThan(0);
    });
  });
});

