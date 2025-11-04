import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { openai } from '@/lib/openai/client';

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

describe('Chat API Route - Retry Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  describe('Exponential backoff', () => {
    it('should retry with exponential backoff (1s, 2s, 4s)', async () => {
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

      const responsePromise = POST(request);

      // Advance timers to simulate exponential backoff
      // First retry after 1 second
      await vi.advanceTimersByTimeAsync(1000);
      // Second retry after 2 seconds
      await vi.advanceTimersByTimeAsync(2000);

      const response = await responsePromise;
      const data = await response.json();

      expect(openai.chat.completions.create).toHaveBeenCalledTimes(3);
      expect(data.success).toBe(true);
    });

    it('should use exponential backoff delays (1s, 2s, 4s)', async () => {
      const errors = [
        new Error('Network error'),
        new Error('Network error'),
        new Error('Network error'),
      ];

      (openai.chat.completions.create as any)
        .mockRejectedValueOnce(errors[0])
        .mockRejectedValueOnce(errors[1])
        .mockRejectedValueOnce(errors[2]);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const responsePromise = POST(request);

      // Advance timers for all retries
      await vi.advanceTimersByTimeAsync(1000); // First retry delay
      await vi.advanceTimersByTimeAsync(2000); // Second retry delay
      await vi.advanceTimersByTimeAsync(4000); // Third retry delay

      const response = await responsePromise;
      const data = await response.json();

      expect(openai.chat.completions.create).toHaveBeenCalledTimes(3);
      expect(data.success).toBe(false);
    });
  });

  describe('Maximum retry attempts', () => {
    it('should retry up to 3 times before failing', async () => {
      const error = new Error('Network error');
      (openai.chat.completions.create as any).mockRejectedValue(error);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const responsePromise = POST(request);

      // Advance timers for all retries
      await vi.advanceTimersByTimeAsync(1000); // First retry
      await vi.advanceTimersByTimeAsync(2000); // Second retry
      await vi.advanceTimersByTimeAsync(4000); // Third retry

      const response = await responsePromise;
      const data = await response.json();

      expect(openai.chat.completions.create).toHaveBeenCalledTimes(3);
      expect(data.success).toBe(false);
    });

    it('should not retry on the last attempt', async () => {
      const error = new Error('Network error');
      (openai.chat.completions.create as any).mockRejectedValue(error);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const responsePromise = POST(request);

      // Advance timers for all retries
      await vi.advanceTimersByTimeAsync(1000); // First retry
      await vi.advanceTimersByTimeAsync(2000); // Second retry
      await vi.advanceTimersByTimeAsync(4000); // Third retry (should not retry)

      const response = await responsePromise;
      const data = await response.json();

      // Should have exactly 3 attempts (initial + 2 retries)
      expect(openai.chat.completions.create).toHaveBeenCalledTimes(3);
      expect(data.success).toBe(false);
    });
  });

  describe('Successful retry', () => {
    it('should succeed on retry after initial failure', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'I can help you with that.',
            },
          },
        ],
      };

      // Fail once, then succeed
      (openai.chat.completions.create as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const responsePromise = POST(request);

      // Advance timer for first retry
      await vi.advanceTimersByTimeAsync(1000);

      const response = await responsePromise;
      const data = await response.json();

      expect(openai.chat.completions.create).toHaveBeenCalledTimes(2);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('I can help you with that.');
    });

    it('should succeed on second retry after two failures', async () => {
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

      const responsePromise = POST(request);

      // Advance timers for retries
      await vi.advanceTimersByTimeAsync(1000); // First retry
      await vi.advanceTimersByTimeAsync(2000); // Second retry

      const response = await responsePromise;
      const data = await response.json();

      expect(openai.chat.completions.create).toHaveBeenCalledTimes(3);
      expect(data.success).toBe(true);
    });
  });

  describe('Retry logging', () => {
    it('should log retry attempts in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const error = new Error('Network error');
      (openai.chat.completions.create as any).mockRejectedValue(error);

      const request = createMockRequest({
        message: 'Hello',
        conversationHistory: [],
      });

      const responsePromise = POST(request);

      // Advance timer for first retry
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);

      await responsePromise;

      // Should log retry attempts
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('retry attempt')
      );
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    }, { timeout: 10000 });
  });
});


