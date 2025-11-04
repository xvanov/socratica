import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../ChatInterface';
import { Message } from '@/types/chat';

describe('MessageInput Integration Tests', () => {
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
    // Mock fetch for API calls
    global.fetch = vi.fn();
  });

  describe('Integration with ChatInterface', () => {
    it('should integrate MessageInput with ChatInterface', () => {
      render(<ChatInterface />);
      
      // MessageInput should be rendered
      const textarea = screen.getByLabelText(/message input field/i);
      expect(textarea).toBeInTheDocument();
      
      // When no messages, should show "Submit problem" button (initial input mode)
      const submitButton = screen.getByLabelText(/submit problem/i);
      expect(submitButton).toBeInTheDocument();
    });

    it('should submit message and add it to ChatInterface', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
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
      // Initially shows "Submit problem" button (initial input mode)
      const submitButton = screen.getByLabelText(/submit problem/i);
      
      // Submit message
      await user.type(textarea, 'Hello, I need help');
      await submitButton.disabled ? null : await user.click(submitButton);
      
      // Student message should appear immediately
      await waitFor(() => {
        expect(screen.getByText('Hello, I need help')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should clear input field after message submission', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
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
      
      const textarea = screen.getByLabelText(/message input field/i) as HTMLTextAreaElement;
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);
      
      await user.type(textarea, 'Test message');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }
      
      // Input should clear after submission
      await waitFor(() => {
        expect(textarea.value).toBe('');
      }, { timeout: 3000 });
    });

    it('should disable MessageInput while AI is responding', async () => {
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
                message: 'I can help you with that.',
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
      
      await user.type(textarea, 'Test message');
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
      // After first message, button changes to "Send message"
      await waitFor(() => {
        expect(textarea).not.toBeDisabled();
      }, { timeout: 3000 });
    });
  });

  describe('Message flow integration', () => {
    it('should handle complete message flow (student message → AI response)', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            message: 'I can help you solve that equation. What do you think the first step should be?',
            messageId: 'msg_123',
            timestamp: new Date().toISOString(),
          },
        }),
      });
      
      render(<ChatInterface />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);
      
      // Submit student message
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
        expect(screen.getByText(/I can help you solve that equation/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle multiple messages in sequence', async () => {
      const user = userEvent.setup();
      
      // Mock multiple API responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              message: 'First AI response',
              messageId: 'msg_1',
              timestamp: new Date().toISOString(),
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              message: 'Second AI response',
              messageId: 'msg_2',
              timestamp: new Date().toISOString(),
            },
          }),
        });
      
      render(<ChatInterface />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      // First message uses "Submit problem" button
      let submitButton = screen.getByLabelText(/submit problem/i);
      
      // Send first message
      await user.type(textarea, 'First message');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }
      
      await waitFor(() => {
        expect(screen.getByText('First message')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      await waitFor(() => {
        expect(screen.getByText('First AI response')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // After first message, button changes to "Send message"
      const sendButton = screen.getByLabelText(/send message/i);
      
      // Send second message
      await user.type(textarea, 'Second message');
      if (!sendButton.disabled) {
        await user.click(sendButton);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Second message')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      await waitFor(() => {
        expect(screen.getByText('Second AI response')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Auto-scrolling integration', () => {
    it('should trigger auto-scroll when new message is added', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
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
      
      await user.type(textarea, 'Test message');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }
      
      // Messages should be displayed (auto-scroll is handled by MessageList)
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      await waitFor(() => {
        expect(screen.getByText('AI response')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Error handling integration', () => {
    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock API error
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
      
      await user.type(textarea, 'Test message');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }
      
      // Student message should still appear
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Error message should appear
      await waitFor(() => {
        expect(screen.getByText(/unable to get tutor response/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Retry button should appear
      await waitFor(() => {
        expect(screen.getByLabelText(/retry sending message/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should maintain conversation context after errors', async () => {
      const user = userEvent.setup();
      
      // Mock first API error, then success
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            success: false,
            data: null,
            error: 'Network error',
          }),
        })
        .mockResolvedValueOnce({
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
      
      render(<ChatInterface />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);
      
      await user.type(textarea, 'Test message');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }
      
      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Click retry
      const retryButton = screen.getByLabelText(/retry sending message/i);
      await user.click(retryButton);
      
      // AI response should appear after retry
      await waitFor(() => {
        expect(screen.getByText('AI response after retry')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});

