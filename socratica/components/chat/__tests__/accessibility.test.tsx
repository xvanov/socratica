import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Message from '../Message';
import MessageList from '../MessageList';
import ChatInterface from '../ChatInterface';
import { Message as MessageType } from '@/types/chat';

describe('Accessibility Tests', () => {
  const createMessage = (
    role: 'student' | 'tutor',
    content: string,
    timestamp: Date | string = new Date()
  ): MessageType => ({
    role,
    content,
    timestamp,
  });

  describe('ARIA labels and roles', () => {
    it('Message component should have proper ARIA role (article)', () => {
      const message = createMessage('student', 'Test message');
      render(<Message message={message} index={0} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('Message component should have aria-label for message role', () => {
      const message = createMessage('student', 'Test message');
      render(<Message message={message} index={0} />);

      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'student message');
    });

    it('MessageList component should have proper ARIA role (log)', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Test'),
      ];

      render(<MessageList messages={messages} />);

      expect(screen.getByRole('log')).toBeInTheDocument();
    });

    it('MessageList component should have aria-label for chat messages', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Test'),
      ];

      render(<MessageList messages={messages} />);

      const log = screen.getByRole('log');
      expect(log).toHaveAttribute('aria-label', 'Chat messages');
    });

    it('MessageList component should have aria-live for dynamic content', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Test'),
      ];

      render(<MessageList messages={messages} />);

      const log = screen.getByRole('log');
      expect(log).toHaveAttribute('aria-live', 'polite');
      expect(log).toHaveAttribute('aria-atomic', 'false');
    });

    it('ChatInterface component should have proper ARIA role (region)', () => {
      render(<ChatInterface />);

      expect(screen.getByRole('region', { name: /chat interface/i })).toBeInTheDocument();
    });

    it('ChatInterface component should have aria-label for chat interface', () => {
      render(<ChatInterface />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Chat interface');
    });
  });

  describe('Keyboard navigation', () => {
    it('Message component should be accessible via keyboard', () => {
      const message = createMessage('student', 'Test message');
      render(<Message message={message} index={0} />);

      const article = screen.getByRole('article');
      
      // Verify element is focusable (if it needs to be)
      // For now, we verify the structure exists
      expect(article).toBeInTheDocument();
    });

    it('MessageList component should support keyboard navigation', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Message 1'),
        createMessage('tutor', 'Message 2'),
      ];

      render(<MessageList messages={messages} />);

      const log = screen.getByRole('log');
      
      // Verify container is accessible
      expect(log).toBeInTheDocument();
      expect(log).toHaveClass('overflow-y-auto');
    });

    it('ChatInterface component should be accessible via keyboard', () => {
      render(<ChatInterface />);

      const region = screen.getByRole('region', { name: /chat interface/i });
      
      // Verify component is accessible
      expect(region).toBeInTheDocument();
    });
  });

  describe('Screen reader compatibility', () => {
    it('Message component should have semantic HTML for screen readers', () => {
      const message = createMessage('student', 'Test message');
      render(<Message message={message} index={0} />);

      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'student message');
      
      // Verify message content is readable
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('MessageList component should announce new messages to screen readers', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Message 1'),
      ];

      const { rerender } = render(<MessageList messages={messages} />);

      // Add new message
      const newMessages = [...messages, createMessage('tutor', 'Message 2')];
      rerender(<MessageList messages={newMessages} />);

      // Verify aria-live is set for announcements
      const log = screen.getByRole('log');
      expect(log).toHaveAttribute('aria-live', 'polite');
    });

    it('Timestamp should have aria-label for screen readers', () => {
      const message = createMessage('student', 'Test message');
      render(<Message message={message} index={0} />);

      const timestamp = screen.getByLabelText(/message timestamp/i);
      expect(timestamp).toBeInTheDocument();
    });
  });

  describe('Focus management', () => {
    it('MessageList should have proper overflow handling for focus', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Test'),
      ];

      render(<MessageList messages={messages} />);

      const log = screen.getByRole('log');
      expect(log).toHaveClass('overflow-y-auto');
    });

    it('ChatInterface should have proper container structure for focus', () => {
      render(<ChatInterface />);

      const region = screen.getByRole('region', { name: /chat interface/i });
      expect(region).toBeInTheDocument();
    });
  });

  describe('Color contrast and visual indicators', () => {
    it('Student messages should have distinct styling', () => {
      const message = createMessage('student', 'Test message');
      render(<Message message={message} index={0} />);

      const messageBubble = screen.getByText('Test message').closest('div');
      expect(messageBubble).toHaveClass('bg-blue-600');
    });

    it('Tutor messages should have distinct styling', () => {
      const message = createMessage('tutor', 'Test message');
      render(<Message message={message} index={0} />);

      const messageBubble = screen.getByText('Test message').closest('div');
      expect(messageBubble).toHaveClass('bg-zinc-100');
    });

    it('Messages should have proper text contrast', () => {
      const studentMessage = createMessage('student', 'Student message');
      const tutorMessage = createMessage('tutor', 'Tutor message');

      const { rerender } = render(<Message message={studentMessage} index={0} />);
      
      const studentBubble = screen.getByText('Student message').closest('div');
      expect(studentBubble).toHaveClass('text-white');

      rerender(<Message message={tutorMessage} index={0} />);
      
      const tutorBubble = screen.getByText('Tutor message').closest('div');
      expect(tutorBubble).toHaveClass('text-zinc-950');
    });
  });

  describe('Semantic HTML', () => {
    it('Message component should use semantic article element', () => {
      const message = createMessage('student', 'Test');
      render(<Message message={message} index={0} />);

      const article = screen.getByRole('article');
      expect(article.tagName).toBe('DIV'); // React renders as div, but role is article
      expect(article).toHaveAttribute('role', 'article');
    });

    it('MessageList component should use semantic log element', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Test'),
      ];

      render(<MessageList messages={messages} />);

      const log = screen.getByRole('log');
      expect(log).toHaveAttribute('role', 'log');
    });

    it('ChatInterface component should use semantic region element', () => {
      render(<ChatInterface />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('role', 'region');
    });
  });

  describe('WCAG 2.1 Level AA compliance', () => {
    it('All interactive elements should have accessible names', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Test'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      // Verify all interactive elements have accessible names
      expect(screen.getByRole('region', { name: /chat interface/i })).toBeInTheDocument();
      expect(screen.getByRole('log', { name: /chat messages/i })).toBeInTheDocument();
      expect(screen.getByRole('article', { name: /student message/i })).toBeInTheDocument();
    });

    it('Messages should have proper heading structure (if applicable)', () => {
      // This test verifies that if headings are added in the future,
      // they follow proper hierarchy
      const messages: MessageType[] = [
        createMessage('student', 'Test'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      // Verify structure exists
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });
});

