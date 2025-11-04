import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Message from '../Message';
import { Message as MessageType } from '@/types/chat';

describe('Message Component', () => {
  const createMessage = (
    role: 'student' | 'tutor',
    content: string,
    timestamp: Date | string = new Date()
  ): MessageType => ({
    role,
    content,
    timestamp,
  });

  describe('AC2: Student messages appear on right side with distinct styling', () => {
    it('should render student message on right side', () => {
      const message = createMessage('student', 'Hello, I need help with algebra');
      render(<Message message={message} index={0} />);
      
      const messageContainer = screen.getByRole('article');
      expect(messageContainer).toHaveClass('justify-end');
    });

    it('should apply student-specific styling (blue background)', () => {
      const message = createMessage('student', 'Test message');
      render(<Message message={message} index={0} />);
      
      const messageBubble = screen.getByText('Test message').closest('div');
      expect(messageBubble).toHaveClass('bg-blue-600');
    });

    it('should align student message content to right', () => {
      const message = createMessage('student', 'Student message');
      render(<Message message={message} index={0} />);
      
      const messageContainer = screen.getByRole('article');
      const innerContainer = messageContainer.querySelector('.flex-col');
      expect(innerContainer).toHaveClass('items-end');
    });
  });

  describe('AC3: AI tutor messages appear on left side with distinct styling', () => {
    it('should render tutor message on left side', () => {
      const message = createMessage('tutor', 'I can help you with algebra');
      render(<Message message={message} index={0} />);
      
      const messageContainer = screen.getByRole('article');
      expect(messageContainer).toHaveClass('justify-start');
    });

    it('should apply tutor-specific styling (gray background)', () => {
      const message = createMessage('tutor', 'Tutor message');
      render(<Message message={message} index={0} />);
      
      const messageBubble = screen.getByText('Tutor message').closest('div');
      expect(messageBubble).toHaveClass('bg-zinc-100');
    });

    it('should align tutor message content to left', () => {
      const message = createMessage('tutor', 'Tutor message');
      render(<Message message={message} index={0} />);
      
      const messageContainer = screen.getByRole('article');
      const innerContainer = messageContainer.querySelector('.flex-col');
      expect(innerContainer).toHaveClass('items-start');
    });
  });

  describe('AC4: Messages include timestamp or sequence indicator', () => {
    it('should display timestamp when valid Date is provided', () => {
      const date = new Date('2024-01-01T12:00:00');
      const message = createMessage('student', 'Test', date);
      render(<Message message={message} index={0} />);
      
      const timestamp = screen.getByLabelText(/message timestamp/i);
      expect(timestamp).toBeInTheDocument();
      expect(timestamp).toHaveTextContent(/12:00/);
    });

    it('should display timestamp when valid ISO string is provided', () => {
      const message = createMessage('student', 'Test', '2024-01-01T12:00:00Z');
      render(<Message message={message} index={0} />);
      
      const timestamp = screen.getByLabelText(/message timestamp/i);
      expect(timestamp).toBeInTheDocument();
    });

    it('should display sequence indicator when timestamp is invalid', () => {
      const message = createMessage('student', 'Test', 'invalid-date');
      render(<Message message={message} index={0} />);
      
      const timestamp = screen.getByLabelText(/message timestamp/i);
      expect(timestamp).toHaveTextContent('#1');
    });

    it('should use index for sequence indicator fallback', () => {
      const message = createMessage('tutor', 'Test', 'invalid');
      render(<Message message={message} index={2} />);
      
      const timestamp = screen.getByLabelText(/message timestamp/i);
      expect(timestamp).toHaveTextContent('#3');
    });
  });

  describe('Message content display', () => {
    it('should display message content correctly', () => {
      const message = createMessage('student', 'Solve for x: 2x + 5 = 13');
      render(<Message message={message} index={0} />);
      
      expect(screen.getByText('Solve for x: 2x + 5 = 13')).toBeInTheDocument();
    });

    it('should handle long messages with proper wrapping', () => {
      const longContent = 'This is a very long message that should wrap properly and not overflow the container. '.repeat(10);
      const message = createMessage('tutor', longContent);
      render(<Message message={message} index={0} />);
      
      // Use getByRole to find the article, then check for text content
      const messageArticle = screen.getByRole('article');
      expect(messageArticle).toHaveTextContent('This is a very long message');
      
      // Check for wrapping classes on the paragraph element
      const messageText = messageArticle.querySelector('p');
      expect(messageText).toHaveClass('break-words');
      expect(messageText).toHaveClass('whitespace-pre-wrap');
    });

    it('should handle multi-line messages', () => {
      const multiLineContent = 'Line 1\nLine 2\nLine 3';
      const message = createMessage('student', multiLineContent);
      render(<Message message={message} index={0} />);
      
      // Check for text content (whitespace normalization may affect exact match)
      const messageArticle = screen.getByRole('article');
      expect(messageArticle).toHaveTextContent('Line 1');
      expect(messageArticle).toHaveTextContent('Line 2');
      expect(messageArticle).toHaveTextContent('Line 3');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      const message = createMessage('student', 'Test');
      render(<Message message={message} index={0} />);
      
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should have aria-label for message role', () => {
      const message = createMessage('student', 'Test');
      render(<Message message={message} index={0} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'student message');
    });

    it('should have aria-label for timestamp', () => {
      const message = createMessage('tutor', 'Test');
      render(<Message message={message} index={0} />);
      
      const timestamp = screen.getByLabelText(/message timestamp/i);
      expect(timestamp).toBeInTheDocument();
    });
  });
});

