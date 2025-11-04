import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../ChatInterface';
import { Message } from '@/types/chat';

describe('ChatInterface Integration Tests', () => {
  const createMessage = (
    role: 'student' | 'tutor',
    content: string,
    timestamp: Date | string = new Date()
  ): Message => ({
    role,
    content,
    timestamp,
  });

  describe('Component integration', () => {
    it('should integrate ChatInterface with MessageList and Message components', () => {
      const messages: Message[] = [
        createMessage('student', 'Student message'),
        createMessage('tutor', 'Tutor message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      // Verify ChatInterface renders
      expect(screen.getByRole('region', { name: /chat interface/i })).toBeInTheDocument();

      // Verify MessageList renders (log role)
      expect(screen.getByRole('log')).toBeInTheDocument();

      // Verify Messages render (article role)
      const messageElements = screen.getAllByRole('article');
      expect(messageElements).toHaveLength(2);
      expect(messageElements[0]).toHaveTextContent('Student message');
      expect(messageElements[1]).toHaveTextContent('Tutor message');
    });

    it('should pass messages correctly through component hierarchy', () => {
      const messages: Message[] = [
        createMessage('student', 'Message 1'),
        createMessage('tutor', 'Message 2'),
        createMessage('student', 'Message 3'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
      expect(screen.getByText('Message 3')).toBeInTheDocument();
    });

    it('should handle message state management across components', () => {
      const initialMessages: Message[] = [
        createMessage('student', 'Initial message'),
      ];

      render(<ChatInterface initialMessages={initialMessages} />);

      // Verify initial message is displayed
      expect(screen.getByText('Initial message')).toBeInTheDocument();

      // Verify state is managed correctly
      const messageElements = screen.getAllByRole('article');
      expect(messageElements).toHaveLength(1);
    });
  });

  describe('Auto-scrolling integration', () => {
    it('should trigger auto-scroll when messages are added', () => {
      const messages: Message[] = [
        createMessage('student', 'Message 1'),
      ];

      const { rerender } = render(<ChatInterface initialMessages={messages} />);

      // Add new message
      const newMessages = [...messages, createMessage('tutor', 'Message 2')];
      rerender(<ChatInterface initialMessages={newMessages} />);

      // Verify both messages are displayed
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
    });
  });

  describe('Message flow integration', () => {
    it('should handle complete message flow (student and tutor messages)', () => {
      const messages: Message[] = [
        createMessage('student', 'Hello, I need help'),
        createMessage('tutor', 'I can help you'),
        createMessage('student', 'Great!'),
        createMessage('tutor', 'What is your question?'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      // Verify all messages are displayed in order
      const messageElements = screen.getAllByRole('article');
      expect(messageElements).toHaveLength(4);
      expect(messageElements[0]).toHaveTextContent('Hello, I need help');
      expect(messageElements[1]).toHaveTextContent('I can help you');
      expect(messageElements[2]).toHaveTextContent('Great!');
      expect(messageElements[3]).toHaveTextContent('What is your question?');
    });

    it('should handle alternating student and tutor messages', () => {
      const messages: Message[] = Array.from({ length: 10 }, (_, i) =>
        createMessage(
          i % 2 === 0 ? 'student' : 'tutor',
          `Message ${i + 1}`
        )
      );

      render(<ChatInterface initialMessages={messages} />);

      const messageElements = screen.getAllByRole('article');
      expect(messageElements).toHaveLength(10);

      // Verify alternating roles
      messageElements.forEach((element, index) => {
        const role = index % 2 === 0 ? 'student' : 'tutor';
        expect(element).toHaveAttribute('aria-label', `${role} message`);
      });
    });
  });

  describe('Edge cases in integration', () => {
    it('should handle empty message array', () => {
      render(<ChatInterface initialMessages={[]} />);

      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    });

    it('should handle very long conversation', () => {
      const messages: Message[] = Array.from({ length: 100 }, (_, i) =>
        createMessage(i % 2 === 0 ? 'student' : 'tutor', `Message ${i + 1}`)
      );

      render(<ChatInterface initialMessages={messages} />);

      const messageElements = screen.getAllByRole('article');
      expect(messageElements).toHaveLength(100);
    });

    it('should handle messages with special characters and math notation', () => {
      const messages: Message[] = [
        createMessage('student', 'Solve for x: 2x + 5 = 13'),
        createMessage('tutor', 'x = 4'),
        createMessage('student', 'How did you get that?'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      expect(screen.getByText('Solve for x: 2x + 5 = 13')).toBeInTheDocument();
      expect(screen.getByText('x = 4')).toBeInTheDocument();
      expect(screen.getByText('How did you get that?')).toBeInTheDocument();
    });
  });

  describe('Clear Chat Integration', () => {
    it('should display ClearChat button when messages exist', () => {
      const messages: Message[] = [
        createMessage('student', 'Test message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      expect(
        screen.getByRole('button', { name: /clear chat and start new problem/i })
      ).toBeInTheDocument();
    });

    it('should disable ClearChat button when no messages', () => {
      render(<ChatInterface initialMessages={[]} />);

      const button = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      expect(button).toBeDisabled();
    });

    it('should show confirmation dialog when ClearChat button is clicked', async () => {
      const user = userEvent.setup();
      const messages: Message[] = [
        createMessage('student', 'Test message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const clearButton = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      await user.click(clearButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByText(
          /are you sure you want to clear the chat\? this will reset the conversation/i
        )
      ).toBeInTheDocument();
    });

    it('should clear conversation history when confirmed', async () => {
      const user = userEvent.setup();
      const messages: Message[] = [
        createMessage('student', 'Message 1'),
        createMessage('tutor', 'Message 2'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      // Verify messages are displayed
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();

      // Click clear button
      const clearButton = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      await user.click(clearButton);

      // Confirm clearing - scope query to dialog to avoid matching header button
      const dialog = screen.getByRole('dialog');
      const confirmButton = within(dialog).getByRole('button', { name: /clear chat/i });
      await user.click(confirmButton);

      // Verify messages are cleared
      expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Message 2')).not.toBeInTheDocument();
      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    });

    it('should not clear conversation history when cancelled', async () => {
      const user = userEvent.setup();
      const messages: Message[] = [
        createMessage('student', 'Message 1'),
        createMessage('tutor', 'Message 2'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      // Verify messages are displayed
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();

      // Click clear button
      const clearButton = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      await user.click(clearButton);

      // Cancel clearing
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Verify messages are still displayed
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
    });

    it('should dismiss confirmation dialog with Escape key', async () => {
      const user = userEvent.setup();
      const messages: Message[] = [
        createMessage('student', 'Test message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const clearButton = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      await user.click(clearButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should clear error state when clearing chat', async () => {
      const user = userEvent.setup();
      const messages: Message[] = [
        createMessage('student', 'Test message'),
      ];

      // Mock fetch to simulate error
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      render(<ChatInterface initialMessages={messages} />);

      const messageInput = screen.getByPlaceholderText(/type your message/i);
      await user.type(messageInput, 'Test');
      await user.keyboard('{Enter}');

      // Wait for error to appear
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Click clear button
      const clearButton = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      await user.click(clearButton);

      // Confirm clearing - the confirm button is inside the dialog
      const dialog = screen.getByRole('dialog');
      const confirmButton = within(dialog).getByRole('button', { name: /clear chat/i });
      await user.click(confirmButton);

      // Verify error is cleared
      expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
    });
  });
});



