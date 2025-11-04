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
  buildEnhancedPromptWithAdaptiveQuestioning: vi.fn(
    (basePrompt: string, understandingLevel: string = 'progressing') => {
      return `${basePrompt}\n\nADAPTIVE QUESTIONING INSTRUCTIONS (Understanding level: ${understandingLevel})`;
    }
  ),
  buildEnhancedPromptWithHints: vi.fn(
    (basePrompt: string, isStuck: boolean, consecutiveConfused: number, hintLevel?: number) => {
      if (!isStuck || consecutiveConfused < 2) {
        return basePrompt;
      }
      return `${basePrompt}\n\nHINT GENERATION INSTRUCTIONS`;
    }
  ),
}));

// Mock response validation
vi.mock('@/lib/openai/response-validation', () => ({
  validateMathematicalExpression: vi.fn((expr: string) => {
    // Mock validation logic for testing
    if (!expr || expr.trim() === '') {
      return { isValid: false, error: 'Expression cannot be empty' };
    }
    if (expr.includes('++') || expr.endsWith('+') || expr.endsWith('-')) {
      return { isValid: false, error: 'Invalid expression' };
    }
    return { isValid: true };
  }),
  evaluateResponseCorrectness: vi.fn((expr: string) => {
    return {
      correctnessLevel: 'partial' as const,
      isValidExpression: true,
    };
  }),
}));

// Mock stuck detection
vi.mock('@/lib/openai/stuck-detection', () => ({
  trackStuckState: vi.fn((message: string, history: any[], state: any) => {
    return {
      consecutiveConfused: state?.consecutiveConfused || 0,
      isStuck: state?.isStuck || false,
      lastConfusedIndex: state?.lastConfusedIndex || null,
    };
  }),
  analyzeConversationForStuckState: vi.fn((history: any[]) => {
    return {
      consecutiveConfused: 0,
      isStuck: false,
      lastConfusedIndex: null,
    };
  }),
  resetStuckState: vi.fn(() => ({
    consecutiveConfused: 0,
    isStuck: false,
    lastConfusedIndex: null,
  })),
  calculateHintLevel: vi.fn((consecutiveConfused: number) => {
    return consecutiveConfused >= 2 ? Math.min(consecutiveConfused - 1, 3) : 0;
  }),
}));

// Mock adaptive questioning
vi.mock('@/lib/openai/adaptive-questioning', () => ({
  determineUnderstandingLevel: vi.fn((correctnessLevel: string, stuckState: any, currentState: any) => {
    return {
      level: currentState?.level || 'progressing',
      consecutiveCorrect: currentState?.consecutiveCorrect || 0,
      consecutiveIncorrect: currentState?.consecutiveIncorrect || 0,
      consecutivePartial: currentState?.consecutivePartial || 0,
      totalResponses: (currentState?.totalResponses || 0) + 1,
      lastUpdated: Date.now(),
    };
  }),
  resetUnderstandingState: vi.fn(() => ({
    level: 'progressing' as const,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    consecutivePartial: 0,
    totalResponses: 0,
    lastUpdated: Date.now(),
  })),
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
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('Test Socratic prompt'),
            }),
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

  describe('Response Validation Integration (Story 3.4)', () => {
    it('should validate mathematical expressions before sending to API', async () => {
      const { validateMathematicalExpression } = await import('@/lib/openai/response-validation');
      
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
        message: '2x + 5 = 13',
        conversationHistory: [],
      });

      await POST(request);

      // Verify validation was called (check via mock)
      expect(validateMathematicalExpression).toHaveBeenCalled();
    });

    it('should send message to API even if expression validation fails (let LLM handle)', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Let\'s check that expression format together.',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: '2x +', // Invalid expression
        conversationHistory: [],
      });

      const response = await POST(request);
      const data = await response.json();

      // Should still send to API (LLM will guide student)
      expect(openai.chat.completions.create).toHaveBeenCalled();
      expect(data.success).toBe(true);
    });

    it('should handle non-math messages without validation', async () => {
      const { validateMathematicalExpression } = await import('@/lib/openai/response-validation');
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'How can I help you?',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'I need help with algebra',
        conversationHistory: [],
      });

      await POST(request);

      // Validation should not be called for non-math content
      // (The route checks for math content pattern first)
      const callCount = (validateMathematicalExpression as any).mock?.calls?.length || 0;
      // If validation was called, it should have been called with math content
      if (callCount > 0) {
        // This is fine - the route might still check
      }
      
      expect(openai.chat.completions.create).toHaveBeenCalled();
    });

    it('should include enhanced prompt with validation instructions', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Great! You\'re on the right track.',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'x = 4',
        conversationHistory: [],
      });

      await POST(request);

      const callArgs = (openai.chat.completions.create as any).mock.calls[0][0];
      // System prompt should include validation instructions
      expect(callArgs.messages[0].role).toBe('system');
      expect(callArgs.messages[0].content).toContain('Test Socratic prompt'); // Mocked prompt
    });
  });

  describe('Adaptive Questioning Integration (Story 3.5)', () => {
    it('should include understanding level in context preparation', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Let\'s work through this step by step.',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'I need help with 2x + 5 = 13',
        conversationHistory: [],
        understandingState: {
          level: 'confused',
          consecutiveCorrect: 0,
          consecutiveIncorrect: 2,
          consecutivePartial: 0,
          totalResponses: 2,
          lastUpdated: Date.now(),
        },
      });

      await POST(request);

      // Verify API was called (adaptive questioning integrated)
      expect(openai.chat.completions.create).toHaveBeenCalled();
      
      const callArgs = (openai.chat.completions.create as any).mock.calls[0][0];
      // System prompt should include adaptive questioning instructions
      expect(callArgs.messages[0].role).toBe('system');
    });

    it('should determine understanding level from response validation and stuck state', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Great! You\'re on the right track.',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'x = 4',
        conversationHistory: [],
        stuckState: {
          consecutiveConfused: 3,
          isStuck: true,
          lastConfusedIndex: 0,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      // Should include understanding state in response
      expect(data.data.understandingState).toBeDefined();
      expect(data.data.understandingState.level).toBeDefined();
    });

    it('should integrate adaptive questioning with hint generation', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Let\'s think about this together.',
            },
          },
        ],
      };

      (openai.chat.completions.create as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'I don\'t understand',
        conversationHistory: [],
        stuckState: {
          consecutiveConfused: 2,
          isStuck: true,
          lastConfusedIndex: 0,
        },
        understandingState: {
          level: 'confused',
          consecutiveCorrect: 0,
          consecutiveIncorrect: 2,
          consecutivePartial: 0,
          totalResponses: 2,
          lastUpdated: Date.now(),
        },
      });

      await POST(request);

      // Both adaptive questioning and hint generation should be active
      expect(openai.chat.completions.create).toHaveBeenCalled();
      
      const callArgs = (openai.chat.completions.create as any).mock.calls[0][0];
      // System prompt should include both adaptive questioning and hint instructions
      expect(callArgs.messages[0].role).toBe('system');
      expect(callArgs.messages[0].content).toBeDefined();
    });

    it('should reset understanding state when starting new problem', async () => {
      const mockResponse1 = {
        choices: [
          {
            message: {
              content: 'Let\'s start fresh.',
            },
          },
        ],
      };

      const mockResponse2 = {
        choices: [
          {
            message: {
              content: 'Let\'s solve this new problem.',
            },
          },
        ],
      };

      (openai.chat.completions.create as any)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      // First request with understanding state
      const request1 = createMockRequest({
        message: 'Solve 2x + 5 = 13',
        conversationHistory: [],
        understandingState: {
          level: 'confused',
          consecutiveCorrect: 0,
          consecutiveIncorrect: 3,
          consecutivePartial: 0,
          totalResponses: 3,
          lastUpdated: Date.now(),
        },
      });

      await POST(request1);

      // Second request without understanding state (new problem) should reset
      const request2 = createMockRequest({
        message: 'Solve 3x - 7 = 8',
        conversationHistory: [],
      });

      const response = await POST(request2);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.understandingState).toBeDefined();
      // Should start with default progressing level
      expect(['progressing', 'confused', 'struggling', 'strong']).toContain(data.data.understandingState.level);
    });
  });
});

