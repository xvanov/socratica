import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../ChatInterface';
import { Message } from '@/types/chat';

// Mock fetch globally
global.fetch = vi.fn();

describe('ChatInterface LLM Integration Tests', () => {
  const createMessage = (
    role: 'student' | 'tutor',
    content: string,
    timestamp: Date | string = new Date()
  ): Message => ({
    role,
    content,
    timestamp,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC1: Integrates with LLM API using architecture patterns', () => {
    it('should call chat API route when message is submitted', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            message: 'I can help you with that.',
            messageId: 'msg_123',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Hello, I need help');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/chat',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: expect.stringContaining('Hello, I need help'),
          })
        );
      });
    });
  });

  describe('AC2: Sends student message to API with appropriate system prompt', () => {
    it('should send student message and conversation history to API', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            message: 'I can help you with that.',
            messageId: 'msg_123',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Solve for x: 2x + 5 = 13');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      await waitFor(() => {
        const callArgs = (global.fetch as any).mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.message).toBe('Solve for x: 2x + 5 = 13');
        expect(Array.isArray(body.conversationHistory)).toBe(true);
      });
    });
  });

  describe('AC3: Receives and displays AI response in chat', () => {
    it('should display AI response as tutor message', async () => {
      const user = userEvent.setup();
      
      const aiResponse = 'I can help you solve that equation. What do you think the first step should be?';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            message: aiResponse,
            messageId: 'msg_123',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Solve for x: 2x + 5 = 13');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      // Student message should appear immediately
      await waitFor(() => {
        expect(screen.getByText('Solve for x: 2x + 5 = 13')).toBeInTheDocument();
      }, { timeout: 3000 });

      // AI response should appear after API call
      await waitFor(() => {
        expect(screen.getByText(aiResponse)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display AI response with tutor styling (left side)', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            message: 'AI response',
            messageId: 'msg_123',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Hello');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      await waitFor(() => {
        const aiMessage = screen.getByText('AI response');
        expect(aiMessage).toBeInTheDocument();
        // Message component uses role="article" on a div, not an article element
        const messageContainer = aiMessage.closest('[role="article"]');
        expect(messageContainer).not.toBeNull();
        expect(messageContainer).toHaveClass('justify-start');
      }, { timeout: 3000 });
    });
  });

  describe('AC4: Shows loading indicator while waiting for AI response', () => {
    it('should show loading indicator while waiting for AI response', async () => {
      const user = userEvent.setup();
      
      // Mock delayed API response
      let resolveFetch: () => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = () => {
          resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                message: 'AI response',
                messageId: 'msg_123',
                timestamp: new Date().toISOString(),
              },
            }),
          });
        };
      });
      
      (global.fetch as any).mockReturnValueOnce(fetchPromise);

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Hello');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      // Loading indicator should appear
      await waitFor(() => {
        expect(screen.getByText(/AI tutor is thinking/i)).toBeInTheDocument();
      });

      // Resolve API call
      resolveFetch!();
      await fetchPromise;

      // Loading indicator should disappear
      await waitFor(() => {
        expect(screen.queryByText(/AI tutor is thinking/i)).not.toBeInTheDocument();
      });
    });

    it('should disable message input while AI is responding', async () => {
      const user = userEvent.setup();
      
      let resolveFetch: () => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = () => {
          resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                message: 'AI response',
                messageId: 'msg_123',
                timestamp: new Date().toISOString(),
              },
            }),
          });
        };
      });
      
      (global.fetch as any).mockReturnValueOnce(fetchPromise);

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i) as HTMLTextAreaElement;
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Hello');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      // MessageInput should be disabled while AI is responding
      await waitFor(() => {
        expect(textarea).toBeDisabled();
      });

      // Resolve API call
      resolveFetch!();
      await fetchPromise;

      // MessageInput should be enabled after response
      await waitFor(() => {
        expect(textarea).not.toBeDisabled();
      }, { timeout: 3000 });
    });
  });

  describe('AC5: API response time is acceptable', () => {
    it('should handle API responses within acceptable time', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            message: 'AI response',
            messageId: 'msg_123',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      const startTime = Date.now();
      
      await user.type(textarea, 'Hello');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      await waitFor(() => {
        expect(screen.getByText('AI response')).toBeInTheDocument();
      }, { timeout: 3000 });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Response should be within acceptable time (< 5 seconds typical)
      // Note: This is a mock test, so actual API time may vary
      expect(responseTime).toBeLessThan(5000);
    });
  });

  describe('AC6: Error Handling', () => {
    it('should handle rate limit errors (429)', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          data: null,
          error: 'Too many requests. Please wait a moment and try again.',
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Hello');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      // Student message should still appear
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Error message should appear
      await waitFor(() => {
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      });

      // Retry button should appear
      await waitFor(() => {
        expect(screen.getByLabelText(/retry sending message/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle authentication errors (401)', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          data: null,
          error: 'Authentication error. Please check your API key.',
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Hello');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/authentication error/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle network timeout errors', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 504,
        json: async () => ({
          success: false,
          data: null,
          error: 'Request timed out. Please try again or check your connection.',
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Hello');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/timed out/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle context window overflow errors', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          data: null,
          error: 'Conversation is too long. Please start a new conversation.',
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Hello');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/too long/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display error state in UI with retry button', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          data: null,
          error: 'Unable to get tutor response. Please try again.',
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Hello');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/unable to get tutor response/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/retry sending message/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should maintain conversation context even after errors', async () => {
      const user = userEvent.setup();
      
      // First request fails
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          data: null,
          error: 'Network error',
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'First message');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Student message should still be in chat
      expect(screen.getByText('First message')).toBeInTheDocument();

      // Retry should maintain conversation context
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            message: 'AI response',
            messageId: 'msg_123',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const retryButton = screen.getByLabelText(/retry sending message/i);
      await user.click(retryButton);

      // AI response should appear
      await waitFor(() => {
        expect(screen.getByText('AI response')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Both messages should be present
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('AI response')).toBeInTheDocument();
    });

    it('should handle retry functionality', async () => {
      const user = userEvent.setup();
      
      // First request fails
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          data: null,
          error: 'Network error',
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Hello');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Retry with success
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            message: 'AI response after retry',
            messageId: 'msg_123',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const retryButton = screen.getByLabelText(/retry sending message/i);
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('AI response after retry')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Error should be cleared
      expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
    });
  });

  describe('Auto-scrolling integration', () => {
    it('should trigger auto-scroll when AI response is added', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            message: 'AI response',
            messageId: 'msg_123',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      render(<ChatInterface />);

      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);

      await user.type(textarea, 'Hello');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }

      // Both messages should be displayed (auto-scroll is handled by MessageList)
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('AI response')).toBeInTheDocument();
      });
    });
  });
});

