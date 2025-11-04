import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageInput from '../MessageInput';

describe('MessageInput Component', () => {
  const mockOnMessageSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC1: Message input field at bottom of chat interface', () => {
    it('should render message input field', () => {
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should have proper placeholder text', () => {
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      expect(textarea).toHaveAttribute('placeholder', 'Type your message...');
    });

    it('should accept custom placeholder', () => {
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} placeholder="Custom placeholder" />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      expect(textarea).toHaveAttribute('placeholder', 'Custom placeholder');
    });
  });

  describe('AC2: Send button or Enter key submits message', () => {
    it('should render Send button', () => {
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const sendButton = screen.getByLabelText(/send message/i);
      expect(sendButton).toBeInTheDocument();
    });

    it('should submit message when Send button is clicked', async () => {
      const user = userEvent.setup();
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
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      
      await user.type(textarea, 'Hello, I need help{Enter}');
      
      await waitFor(() => {
        expect(mockOnMessageSubmit).toHaveBeenCalledWith('Hello, I need help');
      });
    });

    it('should NOT submit message when Shift+Enter is pressed (creates new line)', async () => {
      const user = userEvent.setup();
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      
      await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');
      
      // Should not submit, just create new line
      expect(mockOnMessageSubmit).not.toHaveBeenCalled();
      expect(textarea).toHaveValue('Line 1\nLine 2');
    });
  });

  describe('AC3: Student message appears immediately in chat after sending', () => {
    it('should call onMessageSubmit when message is sent', async () => {
      const user = userEvent.setup();
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      const sendButton = screen.getByLabelText(/send message/i);
      
      await user.type(textarea, 'Test message');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockOnMessageSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnMessageSubmit).toHaveBeenCalledWith('Test message');
      });
    });
  });

  describe('AC4: Input field clears after sending', () => {
    it('should clear input field after successful submission', async () => {
      const user = userEvent.setup();
      mockOnMessageSubmit.mockResolvedValue(undefined);
      
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      const sendButton = screen.getByLabelText(/send message/i);
      
      await user.type(textarea, 'Test message');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });
    });
  });

  describe('AC5: Message appears with student\'s text and styling', () => {
    it('should preserve message text when submitting', async () => {
      const user = userEvent.setup();
      mockOnMessageSubmit.mockResolvedValue(undefined);
      
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      const sendButton = screen.getByLabelText(/send message/i);
      
      const messageText = 'Solve for x: 2x + 5 = 13';
      await user.type(textarea, messageText);
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockOnMessageSubmit).toHaveBeenCalledWith(messageText);
      });
    });
  });

  describe('AC6: Disable send button while message is being processed', () => {
    it('should disable send button while submitting', async () => {
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
      
      // Button should be disabled while submitting
      expect(sendButton).toBeDisabled();
      
      // Resolve promise to complete submission
      resolvePromise!();
      await promise;
      
      // Wait for component to update - input should be cleared and button re-enabled
      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });
      
      // After input is cleared, button will be disabled again (because input is empty)
      // But if we type something, it should be enabled
      await user.type(textarea, 'New message');
      await waitFor(() => {
        expect(sendButton).not.toBeDisabled();
      });
    });

    it('should disable send button when disabled prop is true', () => {
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} disabled={true} />);
      
      const sendButton = screen.getByLabelText(/send message/i);
      expect(sendButton).toBeDisabled();
    });

    it('should show loading spinner in send button while submitting', async () => {
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
      
      // Should show spinner
      const spinner = screen.getByRole('button', { name: /send message/i }).querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      
      // Resolve promise
      resolvePromise!();
      await promise;
    });
  });

  describe('Input validation', () => {
    it('should prevent submission of empty messages', async () => {
      const user = userEvent.setup();
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const sendButton = screen.getByLabelText(/send message/i);
      
      // Send button should be disabled when input is empty
      expect(sendButton).toBeDisabled();
      
      // Try to submit empty message
      await user.click(sendButton);
      
      expect(mockOnMessageSubmit).not.toHaveBeenCalled();
    });

    it('should prevent submission of whitespace-only messages', async () => {
      const user = userEvent.setup();
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      const sendButton = screen.getByLabelText(/send message/i);
      
      await user.type(textarea, '   ');
      
      // Button is disabled when input is only whitespace, so we can't click it
      // But Enter key will trigger handleSubmit which validates
      // Need to clear first to enable Enter key, then type whitespace and press Enter
      await user.clear(textarea);
      await user.type(textarea, '   ');
      await user.keyboard('{Enter}');
      
      // Should show validation error after submission attempt
      await waitFor(() => {
        const errorMessage = screen.queryByText(/cannot be only spaces/i);
        expect(errorMessage).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Send button should be disabled
      expect(sendButton).toBeDisabled();
      expect(mockOnMessageSubmit).not.toHaveBeenCalled();
    });

    it('should show validation error for empty messages', async () => {
      const user = userEvent.setup();
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      
      // Button is disabled when input is empty, so we can't click it
      // But Enter key will trigger handleSubmit which validates
      // Focus textarea and press Enter
      await user.click(textarea);
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        const errorMessage = screen.queryByText(/cannot be empty/i);
        expect(errorMessage).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should clear validation error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      
      // Trigger validation error by submitting whitespace
      await user.type(textarea, '   ');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        const errorMessage = screen.queryByText(/cannot be only spaces/i);
        expect(errorMessage).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Clear and type valid message
      await user.clear(textarea);
      await user.type(textarea, 'Valid message');
      
      // Error should be cleared when user starts typing (handleChange clears validationError)
      await waitFor(() => {
        expect(screen.queryByText(/cannot be only spaces/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Auto-scrolling integration', () => {
    it('should trigger auto-scroll when new message is added (handled by MessageList)', async () => {
      const user = userEvent.setup();
      mockOnMessageSubmit.mockResolvedValue(undefined);
      
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      const sendButton = screen.getByLabelText(/send message/i);
      
      await user.type(textarea, 'Test message');
      await user.click(sendButton);
      
      // Message submission should complete (auto-scroll is handled by MessageList)
      await waitFor(() => {
        expect(mockOnMessageSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      const sendButton = screen.getByLabelText(/send message/i);
      
      expect(textarea).toHaveAttribute('aria-label', 'Message input field');
      expect(sendButton).toHaveAttribute('aria-label', 'Send message');
    });

    it('should have aria-required attribute on textarea', () => {
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('should have aria-invalid attribute when validation fails', async () => {
      const user = userEvent.setup();
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      
      // Trigger validation error by submitting whitespace
      // Note: Button is disabled when input is whitespace-only, so we use Enter key instead
      await user.type(textarea, '   ');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(textarea).toHaveAttribute('aria-invalid', 'true');
      }, { timeout: 3000 });
    });

    it('should have aria-describedby for description', () => {
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      expect(textarea).toHaveAttribute('aria-describedby', 'message-input-description');
    });

    it('should be accessible via keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      
      // Tab to textarea
      await user.tab();
      expect(textarea).toHaveFocus();
      
      // Type message
      await user.type(textarea, 'Test message');
      
      // Tab to send button
      await user.tab();
      const sendButton = screen.getByLabelText(/send message/i);
      expect(sendButton).toHaveFocus();
    });
  });

  describe('Responsive design', () => {
    it('should have proper styling for different screen sizes', () => {
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const form = screen.getByLabelText(/message input field/i).closest('form');
      expect(form).toHaveClass('w-full');
      
      const textarea = screen.getByLabelText(/message input field/i);
      expect(textarea).toHaveClass('flex-1');
    });

    it('should auto-resize textarea based on content', async () => {
      const user = userEvent.setup();
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i) as HTMLTextAreaElement;
      
      // Type multiple lines
      await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2{Shift>}{Enter}{/Shift}Line 3');
      
      // Textarea should auto-resize (height is set via onInput handler)
      expect(textarea.value).toContain('\n');
    });
  });

  describe('Multiple messages', () => {
    it('should handle multiple message submissions', async () => {
      const user = userEvent.setup();
      mockOnMessageSubmit.mockResolvedValue(undefined);
      
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      const sendButton = screen.getByLabelText(/send message/i);
      
      // Send first message
      await user.type(textarea, 'First message');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockOnMessageSubmit).toHaveBeenCalledWith('First message');
      });
      
      // Send second message
      await user.type(textarea, 'Second message');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockOnMessageSubmit).toHaveBeenCalledWith('Second message');
        expect(mockOnMessageSubmit).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Long messages', () => {
    it('should handle long messages with proper wrapping', async () => {
      const user = userEvent.setup();
      mockOnMessageSubmit.mockResolvedValue(undefined);
      
      render(<MessageInput onMessageSubmit={mockOnMessageSubmit} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      const sendButton = screen.getByLabelText(/send message/i);
      
      const longMessage = 'This is a very long message that should wrap properly. '.repeat(10);
      await user.type(textarea, longMessage);
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockOnMessageSubmit).toHaveBeenCalledWith(longMessage.trim());
      });
    });
  });
});


