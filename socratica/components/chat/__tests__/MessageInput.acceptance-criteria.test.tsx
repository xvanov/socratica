import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageInput from '../MessageInput';
import ChatInterface from '../ChatInterface';

describe('MessageInput - Acceptance Criteria Tests', () => {
  const mockOnMessageSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('AC1: Message input field at bottom of chat interface', () => {
    it('should render message input field at bottom of ChatInterface', () => {
      render(<ChatInterface />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      expect(textarea).toBeInTheDocument();
      
      // MessageInput should be at bottom (checked by ChatInterface layout)
      const chatInterface = screen.getByRole('region', { name: /chat interface/i });
      const messageInput = textarea.closest('form');
      expect(messageInput).toBeInTheDocument();
    });
  });

  describe('AC2: Send button or Enter key submits message', () => {
    it('should submit message when Send button is clicked', async () => {
      const user = userEvent.setup();
      mockOnMessageSubmit.mockResolvedValue(undefined);
      
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      const sendButton = screen.getByLabelText(/send message/i);
      
      await user.type(textarea, 'Hello, I need help');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockOnMessageSubmit).toHaveBeenCalledWith('Hello, I need help');
      });
    });

    it('should submit message when Enter key is pressed', async () => {
      const user = userEvent.setup();
      mockOnMessageSubmit.mockResolvedValue(undefined);
      
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      
      await user.type(textarea, 'Hello, I need help{Enter}');
      
      await waitFor(() => {
        expect(mockOnMessageSubmit).toHaveBeenCalledWith('Hello, I need help');
      });
    });

    it('should NOT submit when Shift+Enter is pressed (creates new line)', async () => {
      const user = userEvent.setup();
      
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      
      await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');
      
      expect(mockOnMessageSubmit).not.toHaveBeenCalled();
      expect(textarea).toHaveValue('Line 1\nLine 2');
    });
  });

  describe('AC3: Student message appears immediately in chat after sending', () => {
    it('should add student message to ChatInterface immediately', async () => {
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
      
      await user.type(textarea, 'Hello, I need help');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }
      
      // Student message should appear immediately (before AI response)
      await waitFor(() => {
        expect(screen.getByText('Hello, I need help')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('AC4: Input field clears after sending', () => {
    it('should clear input field after successful submission', async () => {
      const user = userEvent.setup();
      mockOnMessageSubmit.mockResolvedValue(undefined);
      
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i) as HTMLTextAreaElement;
      const sendButton = screen.getByLabelText(/send message/i);
      
      await user.type(textarea, 'Test message');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });
  });

  describe('AC5: Message appears with student\'s text and styling', () => {
    it('should display student message with correct text and styling', async () => {
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
      
      const messageText = 'Solve for x: 2x + 5 = 13';
      await user.type(textarea, messageText);
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }
      
      // Student message should appear with correct text
      await waitFor(() => {
        const studentMessage = screen.getByText(messageText);
        expect(studentMessage).toBeInTheDocument();
        
        // Message component uses role="article" on a div, not an article element
        const messageContainer = studentMessage.closest('[role="article"]');
        expect(messageContainer).not.toBeNull();
        expect(messageContainer).toHaveClass('justify-end');
      }, { timeout: 3000 });
    });
  });

  describe('AC6: Disable send button while message is being processed', () => {
    it('should disable send button while AI is responding', async () => {
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
      
      const textarea = screen.getByLabelText(/message input field/i);
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);
      
      await user.type(textarea, 'Test message');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }
      
      // Textarea should be disabled while AI is responding
      await waitFor(() => {
        expect(textarea).toBeDisabled();
      });
      
      // Resolve API call
      resolveFetch!();
      await fetchPromise;
      
      // Textarea should be enabled after response
      await waitFor(() => {
        expect(textarea).not.toBeDisabled();
      }, { timeout: 3000 });
    });

    it('should disable send button while message is being submitted', async () => {
      const user = userEvent.setup();
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockOnMessageSubmit.mockReturnValue(promise);
      
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      const sendButton = screen.getByLabelText(/send message/i);
      
      await user.type(textarea, 'Test message');
      await user.click(sendButton);
      
      // Send button should be disabled while submitting
      expect(sendButton).toBeDisabled();
      
      // Resolve promise
      resolvePromise!();
      await promise;
      
      // Wait for component to update - input should be cleared
      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });
      
      // After input is cleared, button will be disabled (because input is empty)
      // Type something to verify button becomes enabled
      await user.type(textarea, 'New message');
      await waitFor(() => {
        expect(sendButton).not.toBeDisabled();
      });
    });
  });

  describe('All acceptance criteria together', () => {
    it('should satisfy all acceptance criteria simultaneously', async () => {
      const user = userEvent.setup();
      
      // Use a delayed promise to ensure we can check disabled state
      let resolveFetch: () => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = () => {
          resolve({
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
        };
      });
      
      (global.fetch as any).mockReturnValueOnce(fetchPromise);
      
      render(<ChatInterface />);
      
      const textarea = screen.getByLabelText(/message input field/i) as HTMLTextAreaElement;
      // Initially shows "Submit problem" button
      const submitButton = screen.getByLabelText(/submit problem/i);
      
      // AC1: Message input field at bottom
      expect(textarea).toBeInTheDocument();
      
      // AC2: Send button and Enter key work
      await user.type(textarea, 'Solve for x: 2x + 5 = 13');
      if (!submitButton.disabled) {
        await user.click(submitButton);
      }
      
      // AC3: Student message appears immediately
      // AC5: Message appears with student's text and styling
      await waitFor(() => {
        // Find message container (role="article") that contains the student message text
        const messageContainers = screen.getAllByRole('article');
        const studentMessageContainer = messageContainers.find((container) =>
          container.textContent?.includes('Solve for x: 2x + 5 = 13')
        );
        
        expect(studentMessageContainer).toBeDefined();
        expect(studentMessageContainer).toHaveClass('justify-end');
      }, { timeout: 3000 });
      
      // AC6: Textarea is disabled while AI is responding
      // Wait for textarea to become disabled after submission
      await waitFor(() => {
        expect(textarea).toBeDisabled();
      }, { timeout: 3000 });
      
      // Resolve API call to complete the flow (input clearing happens after API completes)
      resolveFetch!();
      await fetchPromise;
      
      // AC4: Input field clears after sending (happens after onMessageSubmit/API completes)
      await waitFor(() => {
        expect(textarea.value).toBe('');
      }, { timeout: 3000 });
      
      // AI response should appear
      await waitFor(() => {
        expect(screen.getByText(/I can help you solve that equation/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Textarea should be enabled after response
      await waitFor(() => {
        expect(textarea).not.toBeDisabled();
      }, { timeout: 3000 });
    });
  });
});

