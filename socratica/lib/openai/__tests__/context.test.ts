import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateMessageTokens,
  calculateTotalTokens,
  convertMessagesToOpenAIFormat,
  truncateContextWindow,
  prepareConversationContext,
  MAX_CONTEXT_WINDOW_TOKENS,
} from '@/lib/openai/context';
import { Message } from '@/types/chat';
import OpenAI from 'openai';

// Mock prompts
vi.mock('@/lib/openai/prompts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/openai/prompts')>();
  return {
    ...actual,
    SOCRATIC_MATH_TUTOR_PROMPT: 'Test Socratic prompt for math tutoring',
    buildEnhancedPromptWithHints: vi.fn(
      (basePrompt: string, isStuck: boolean, consecutiveConfused: number, hintLevel?: number) => {
        if (!isStuck || consecutiveConfused < 2) {
          return basePrompt;
        }
        const hintText = hintLevel === 1 ? 'Hint Level 1' : hintLevel === 2 ? 'Hint Level 2' : hintLevel === 3 ? 'Hint Level 3' : '';
        return `${basePrompt}\n\nHINT GENERATION INSTRUCTIONS (Student is stuck - ${consecutiveConfused} consecutive confused responses):\n${hintText}`;
      }
    ),
    buildEnhancedPromptWithAdaptiveQuestioning: vi.fn(
      (basePrompt: string, understandingLevel: string = 'progressing') => {
        return `${basePrompt}\n\nADAPTIVE QUESTIONING INSTRUCTIONS (Understanding level: ${understandingLevel})`;
      }
    ),
  };
});

describe('Conversation Context Management', () => {
  const createMessage = (
    role: 'student' | 'tutor',
    content: string,
    timestamp: Date | string = new Date()
  ): Message => ({
    role,
    content,
    timestamp,
  });

  describe('calculateMessageTokens', () => {
    it('should calculate token count correctly (approx 4 chars per token)', () => {
      expect(calculateMessageTokens('')).toBe(0);
      expect(calculateMessageTokens('test')).toBe(1); // 4 chars = 1 token
      expect(calculateMessageTokens('hello world')).toBe(3); // 11 chars = 3 tokens (rounded up)
      expect(calculateMessageTokens('a'.repeat(100))).toBe(25); // 100 chars = 25 tokens
    });

    it('should handle edge cases', () => {
      expect(calculateMessageTokens(' ')).toBe(1);
      expect(calculateMessageTokens('a'.repeat(17))).toBe(5); // 17 chars = 5 tokens (rounded up)
    });
  });

  describe('calculateTotalTokens', () => {
    it('should calculate total tokens for multiple messages', () => {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: 'test' }, // 4 chars = 1 token
        { role: 'user', content: 'hello' }, // 5 chars = 2 tokens (rounded up)
        { role: 'assistant', content: 'world' }, // 5 chars = 2 tokens (rounded up)
      ];

      expect(calculateTotalTokens(messages)).toBe(5); // 1 + 2 + 2 = 5 tokens
    });

    it('should handle empty array', () => {
      expect(calculateTotalTokens([])).toBe(0);
    });

    it('should handle non-string content', () => {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: null as any },
      ];

      expect(calculateTotalTokens(messages)).toBe(0);
    });
  });

  describe('convertMessagesToOpenAIFormat', () => {
    it('should convert Message[] to OpenAI API format', () => {
      const messages: Message[] = [
        createMessage('student', 'Hello'),
        createMessage('tutor', 'Hi there!'),
        createMessage('student', 'I need help'),
      ];

      const result = convertMessagesToOpenAIFormat(messages, 'Current message');

      expect(result).toHaveLength(5); // system + 3 history + 1 current
      expect(result[0].role).toBe('system');
      expect(result[0].content).toContain('Test Socratic prompt for math tutoring');
      expect(result[0].content).toContain('ADAPTIVE QUESTIONING INSTRUCTIONS');
      expect(result[1]).toEqual({ role: 'user', content: 'Hello' });
      expect(result[2]).toEqual({ role: 'assistant', content: 'Hi there!' });
      expect(result[3]).toEqual({ role: 'user', content: 'I need help' });
      expect(result[4]).toEqual({ role: 'user', content: 'Current message' });
    });

    it('should map student role to user', () => {
      const messages: Message[] = [createMessage('student', 'Test')];
      const result = convertMessagesToOpenAIFormat(messages, 'Current');

      expect(result[1]).toEqual({ role: 'user', content: 'Test' });
    });

    it('should map tutor role to assistant', () => {
      const messages: Message[] = [createMessage('tutor', 'Response')];
      const result = convertMessagesToOpenAIFormat(messages, 'Current');

      expect(result[1]).toEqual({ role: 'assistant', content: 'Response' });
    });

    it('should include system prompt as first message', () => {
      const messages: Message[] = [];
      const result = convertMessagesToOpenAIFormat(messages, 'Current');

      expect(result[0].role).toBe('system');
      expect(result[0].content).toContain('Test Socratic prompt for math tutoring');
      expect(result[0].content).toContain('ADAPTIVE QUESTIONING INSTRUCTIONS');
    });

    it('should include hint generation instructions in system prompt when student is stuck', () => {
      const messages: Message[] = [];
      const result = convertMessagesToOpenAIFormat(messages, 'Current', true, 2);

      expect(result[0].role).toBe('system');
      expect(result[0].content).toContain('HINT GENERATION INSTRUCTIONS');
      expect(result[0].content).toContain('Student is stuck');
      expect(result[0].content).toContain('2 consecutive confused responses');
    });

    it('should not include hint instructions when student is not stuck', () => {
      const messages: Message[] = [];
      const result = convertMessagesToOpenAIFormat(messages, 'Current', false, 0);

      expect(result[0].role).toBe('system');
      expect(result[0].content).toContain('Test Socratic prompt for math tutoring');
      expect(result[0].content).toContain('ADAPTIVE QUESTIONING INSTRUCTIONS');
      expect(result[0].content).not.toContain('HINT GENERATION INSTRUCTIONS');
    });

    it('should not include hint instructions when consecutiveConfused < 2', () => {
      const messages: Message[] = [];
      const result = convertMessagesToOpenAIFormat(messages, 'Current', false, 1);

      expect(result[0].content).not.toContain('HINT GENERATION INSTRUCTIONS');
    });

    it('should use hint level 1 for 2-3 consecutive confused responses', () => {
      const messages: Message[] = [];
      const result = convertMessagesToOpenAIFormat(messages, 'Current', true, 2, 1);

      expect(result[0].content).toContain('Hint Level 1');
    });

    it('should use hint level 2 for 4-5 consecutive confused responses', () => {
      const messages: Message[] = [];
      const result = convertMessagesToOpenAIFormat(messages, 'Current', true, 4, 2);

      expect(result[0].content).toContain('Hint Level 2');
    });

    it('should use hint level 3 for 6+ consecutive confused responses', () => {
      const messages: Message[] = [];
      const result = convertMessagesToOpenAIFormat(messages, 'Current', true, 6, 3);

      expect(result[0].content).toContain('Hint Level 3');
    });

    it('should maintain chronological order', () => {
      const messages: Message[] = [
        createMessage('student', 'First'),
        createMessage('tutor', 'Second'),
        createMessage('student', 'Third'),
      ];

      const result = convertMessagesToOpenAIFormat(messages, 'Fourth');

      expect(result[1].content).toBe('First');
      expect(result[2].content).toBe('Second');
      expect(result[3].content).toBe('Third');
      expect(result[4].content).toBe('Fourth');
    });

    it('should handle empty conversation history', () => {
      const result = convertMessagesToOpenAIFormat([], 'Current message');

      expect(result).toHaveLength(2); // system + current
      expect(result[0].role).toBe('system');
      expect(result[1]).toEqual({ role: 'user', content: 'Current message' });
    });
  });

  describe('truncateContextWindow', () => {
    it('should preserve system prompt when truncating', () => {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'a'.repeat(10000) }, // Very long message
      ];

      const result = truncateContextWindow(messages, 100);

      expect(result[0].role).toBe('system');
      expect(result[0].content).toBe('System prompt');
    });

    it('should preserve most recent messages when truncating', () => {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: 'System' },
        { role: 'user', content: 'Old message 1' },
        { role: 'assistant', content: 'Old message 2' },
        { role: 'user', content: 'Recent message 1' },
        { role: 'assistant', content: 'Recent message 2' },
      ];

      // Use a small token limit to force truncation
      const result = truncateContextWindow(messages, 50);

      expect(result[0].role).toBe('system');
      // Should preserve most recent messages
      expect(result[result.length - 1].content).toBe('Recent message 2');
      expect(result[result.length - 2].content).toBe('Recent message 1');
    });

    it('should remove oldest messages first', () => {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: 'System' },
        { role: 'user', content: 'Message 1' }, // Should be removed
        { role: 'assistant', content: 'Message 2' }, // Should be removed
        { role: 'user', content: 'Message 3' }, // Should be preserved
        { role: 'assistant', content: 'Message 4' }, // Should be preserved
      ];

      const result = truncateContextWindow(messages, 100);

      expect(result.length).toBeLessThanOrEqual(messages.length);
      // System prompt should always be preserved
      expect(result[0].role).toBe('system');
      // Most recent messages should be preserved
      expect(result[result.length - 1].content).toBe('Message 4');
    });

    it('should handle empty messages array', () => {
      const result = truncateContextWindow([]);

      expect(result).toEqual([]);
    });

    it('should handle system prompt exceeding limit', () => {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: 'a'.repeat(10000) }, // Very long system prompt
        { role: 'user', content: 'Test' },
      ];

      const result = truncateContextWindow(messages, 100);

      // Should return only system prompt
      expect(result.length).toBe(1);
      expect(result[0].role).toBe('system');
    });

    it('should log truncation in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: 'System' },
        { role: 'user', content: 'a'.repeat(10000) },
        { role: 'user', content: 'Message 2' },
      ];

      truncateContextWindow(messages, 100);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Context window truncation')
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log truncation in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: 'System' },
        { role: 'user', content: 'a'.repeat(10000) },
      ];

      truncateContextWindow(messages, 100);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle single message (system prompt only)', () => {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: 'System prompt' },
      ];

      const result = truncateContextWindow(messages, 100);

      expect(result).toEqual(messages);
    });

    it('should use default MAX_CONTEXT_WINDOW_TOKENS when limit not specified', () => {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: 'System' },
        { role: 'user', content: 'a'.repeat(50000) }, // Very long message
      ];

      const result = truncateContextWindow(messages);

      // Should truncate using default limit
      expect(result.length).toBeLessThanOrEqual(messages.length);
      expect(result[0].role).toBe('system');
    });
  });

  describe('prepareConversationContext', () => {
    it('should combine conversion and truncation', () => {
      const messages: Message[] = [
        createMessage('student', 'Hello'),
        createMessage('tutor', 'Hi there!'),
      ];

      const result = prepareConversationContext(messages, 'Current message');

      expect(result[0].role).toBe('system');
      expect(result[1].role).toBe('user');
      expect(result[1].content).toBe('Hello');
      expect(result[2].role).toBe('assistant');
      expect(result[2].content).toBe('Hi there!');
      expect(result[3].role).toBe('user');
      expect(result[3].content).toBe('Current message');
    });

    it('should pass stuck state and hint level to conversion', () => {
      const messages: Message[] = [];
      const result = prepareConversationContext(messages, 'Current', undefined, true, 2, 1);

      expect(result[0].role).toBe('system');
      expect(result[0].content).toContain('HINT GENERATION INSTRUCTIONS');
      expect(result[0].content).toContain('Hint Level 1');
    });

    it('should truncate if context window exceeded', () => {
      const messages: Message[] = [
        createMessage('student', 'a'.repeat(10000)), // Very long message
        createMessage('tutor', 'Response'),
      ];

      const result = prepareConversationContext(messages, 'Current', 100);

      expect(result[0].role).toBe('system');
      // Should truncate and preserve most recent messages
      expect(result.length).toBeLessThanOrEqual(4);
    });

    it('should use default MAX_CONTEXT_WINDOW_TOKENS when limit not specified', () => {
      const messages: Message[] = [
        createMessage('student', 'Hello'),
        createMessage('tutor', 'Hi!'),
      ];

      const result = prepareConversationContext(messages, 'Current');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].role).toBe('system');
    });

    it('should maintain chronological order', () => {
      const messages: Message[] = [
        createMessage('student', 'First'),
        createMessage('tutor', 'Second'),
        createMessage('student', 'Third'),
      ];

      const result = prepareConversationContext(messages, 'Fourth');

      expect(result[1].content).toBe('First');
      expect(result[2].content).toBe('Second');
      expect(result[3].content).toBe('Third');
      expect(result[4].content).toBe('Fourth');
    });
  });

  describe('Integration: Context window management with real token counts', () => {
    it('should handle conversations that fit within context window', () => {
      const messages: Message[] = [
        createMessage('student', 'Short message 1'),
        createMessage('tutor', 'Short response 1'),
        createMessage('student', 'Short message 2'),
        createMessage('tutor', 'Short response 2'),
      ];

      const result = prepareConversationContext(messages, 'Current message');

      // All messages should be preserved
      expect(result.length).toBe(6); // system + 4 history + 1 current
    });

    it('should truncate when conversation exceeds context window', () => {
      // Create many messages that will exceed context window
      const messages: Message[] = [];
      for (let i = 0; i < 100; i++) {
        messages.push(createMessage('student', `Message ${i}: ${'a'.repeat(100)}`));
        messages.push(createMessage('tutor', `Response ${i}: ${'b'.repeat(100)}`));
      }

      const result = prepareConversationContext(
        messages,
        'Current message',
        MAX_CONTEXT_WINDOW_TOKENS
      );

      // Should truncate to fit within limit
      expect(result.length).toBeLessThan(messages.length + 2); // +2 for system and current
      expect(result[0].role).toBe('system');
      // Most recent messages should be preserved
      const lastMessage = result[result.length - 1];
      expect(lastMessage.content).toBe('Current message');
    });
  });
});

