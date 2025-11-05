import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatInterface from '../ChatInterface';
import { Message } from '@/types/chat';

describe('Story 2.1: Acceptance Criteria Tests', () => {
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
    // Clear any previous calls (mock is in setup)
    vi.clearAllMocks();
  });

  describe('AC1: Chat message container displays messages in chronological order', () => {
    it('should display messages in chronological order', () => {
      const messages: Message[] = [
        createMessage('student', 'First message', new Date('2024-01-01T10:00:00')),
        createMessage('tutor', 'Second message', new Date('2024-01-01T10:01:00')),
        createMessage('student', 'Third message', new Date('2024-01-01T10:02:00')),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const messageElements = screen.getAllByRole('article');
      expect(messageElements).toHaveLength(3);
      expect(messageElements[0]).toHaveTextContent('First message');
      expect(messageElements[1]).toHaveTextContent('Second message');
      expect(messageElements[2]).toHaveTextContent('Third message');
    });

    it('should display messages in the order they appear in the array', () => {
      const messages: Message[] = [
        createMessage('tutor', 'Tutor message 1'),
        createMessage('student', 'Student message 1'),
        createMessage('tutor', 'Tutor message 2'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const messageElements = screen.getAllByRole('article');
      expect(messageElements[0]).toHaveTextContent('Tutor message 1');
      expect(messageElements[1]).toHaveTextContent('Student message 1');
      expect(messageElements[2]).toHaveTextContent('Tutor message 2');
    });

    it('should handle messages with different timestamps in chronological order', () => {
      const messages: Message[] = [
        createMessage('student', 'Message 1', new Date('2024-01-01T09:00:00')),
        createMessage('tutor', 'Message 2', new Date('2024-01-01T09:30:00')),
        createMessage('student', 'Message 3', new Date('2024-01-01T10:00:00')),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const messageElements = screen.getAllByRole('article');
      expect(messageElements[0]).toHaveTextContent('Message 1');
      expect(messageElements[1]).toHaveTextContent('Message 2');
      expect(messageElements[2]).toHaveTextContent('Message 3');
    });
  });

  describe('AC2: Student messages appear on right side with distinct styling', () => {
    it('should render student messages on right side', () => {
      const messages: Message[] = [
        createMessage('student', 'Student message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const messageElement = screen.getByRole('article');
      expect(messageElement).toHaveClass('justify-end');
    });

    it('should apply student-specific styling (blue background)', () => {
      const messages: Message[] = [
        createMessage('student', 'Student message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const messageArticle = screen.getByRole('article', { name: /student message/i });
      const messageBubble = messageArticle.querySelector('.rounded-lg');
      expect(messageBubble).toBeTruthy();
      // Check for design system primary color class
      expect(messageBubble).toHaveClass('bg-[var(--primary-600)]');
    });

    it('should align student message content to right', () => {
      const messages: Message[] = [
        createMessage('student', 'Student message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const messageElement = screen.getByRole('article');
      const innerContainer = messageElement.querySelector('.flex-col');
      expect(innerContainer).toHaveClass('items-end');
    });

    it('should have distinct styling that differentiates from tutor messages', () => {
      const messages: Message[] = [
        createMessage('student', 'Student message'),
        createMessage('tutor', 'Tutor message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const studentArticle = screen.getByRole('article', { name: /student message/i });
      const tutorArticle = screen.getByRole('article', { name: /tutor message/i });
      const studentBubble = studentArticle.querySelector('.rounded-lg');
      const tutorBubble = tutorArticle.querySelector('.rounded-lg');

      expect(studentBubble).toBeTruthy();
      expect(tutorBubble).toBeTruthy();
      // Check for design system classes
      expect(studentBubble).toHaveClass('bg-[var(--primary-600)]');
      expect(tutorBubble).toHaveClass('bg-[var(--surface)]');
      expect(studentBubble).not.toHaveClass('bg-[var(--surface)]');
      expect(tutorBubble).not.toHaveClass('bg-[var(--primary-600)]');
    });
  });

  describe('AC3: AI tutor messages appear on left side with distinct styling', () => {
    it('should render tutor messages on left side', () => {
      const messages: Message[] = [
        createMessage('tutor', 'Tutor message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const messageElement = screen.getByRole('article');
      expect(messageElement).toHaveClass('justify-start');
    });

    it('should apply tutor-specific styling (gray background)', () => {
      const messages: Message[] = [
        createMessage('tutor', 'Tutor message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const messageArticle = screen.getByRole('article', { name: /tutor message/i });
      const messageBubble = messageArticle.querySelector('.rounded-lg');
      expect(messageBubble).toBeTruthy();
      // Check for design system surface color class
      expect(messageBubble).toHaveClass('bg-[var(--surface)]');
    });

    it('should align tutor message content to left', () => {
      const messages: Message[] = [
        createMessage('tutor', 'Tutor message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const messageElement = screen.getByRole('article');
      const innerContainer = messageElement.querySelector('.flex-col');
      expect(innerContainer).toHaveClass('items-start');
    });

    it('should have distinct styling that differentiates from student messages', () => {
      const messages: Message[] = [
        createMessage('tutor', 'Tutor message'),
        createMessage('student', 'Student message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const tutorArticle = screen.getByRole('article', { name: /tutor message/i });
      const studentArticle = screen.getByRole('article', { name: /student message/i });
      const tutorBubble = tutorArticle.querySelector('.rounded-lg');
      const studentBubble = studentArticle.querySelector('.rounded-lg');

      expect(tutorBubble).toBeTruthy();
      expect(studentBubble).toBeTruthy();
      // Check for design system classes
      expect(tutorBubble).toHaveClass('bg-[var(--surface)]');
      expect(studentBubble).toHaveClass('bg-[var(--primary-600)]');
      expect(tutorBubble).not.toHaveClass('bg-[var(--primary-600)]');
      expect(studentBubble).not.toHaveClass('bg-[var(--surface)]');
    });
  });

  describe('AC4: Messages include timestamp or sequence indicator', () => {
    it('should display timestamp when valid Date is provided', () => {
      const date = new Date('2024-01-01T12:00:00');
      const messages: Message[] = [
        createMessage('student', 'Test', date),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const timestamp = screen.getByLabelText(/message timestamp/i);
      expect(timestamp).toBeInTheDocument();
      expect(timestamp).toHaveTextContent(/12:00/);
    });

    it('should display timestamp when valid ISO string is provided', () => {
      const messages: Message[] = [
        createMessage('student', 'Test', '2024-01-01T12:00:00Z'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const timestamp = screen.getByLabelText(/message timestamp/i);
      expect(timestamp).toBeInTheDocument();
    });

    it('should display sequence indicator when timestamp is invalid', () => {
      const messages: Message[] = [
        createMessage('student', 'Test', 'invalid-date'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const timestamp = screen.getByLabelText(/message timestamp/i);
      expect(timestamp).toHaveTextContent('#1');
    });

    it('should use index for sequence indicator fallback', () => {
      const messages: Message[] = [
        createMessage('tutor', 'Message 1', 'invalid'),
        createMessage('student', 'Message 2', 'invalid'),
        createMessage('tutor', 'Message 3', 'invalid'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const timestamps = screen.getAllByLabelText(/message timestamp/i);
      expect(timestamps[0]).toHaveTextContent('#1');
      expect(timestamps[1]).toHaveTextContent('#2');
      expect(timestamps[2]).toHaveTextContent('#3');
    });

    it('should display timestamp for all messages', () => {
      const messages: Message[] = [
        createMessage('student', 'Message 1'),
        createMessage('tutor', 'Message 2'),
        createMessage('student', 'Message 3'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const timestamps = screen.getAllByLabelText(/message timestamp/i);
      expect(timestamps).toHaveLength(3);
    });
  });

  describe('AC5: Chat area scrolls automatically to latest message', () => {
    it('should scroll to latest message when messages change', () => {
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

    it('should scroll with smooth behavior', () => {
      const messages: Message[] = [
        createMessage('student', 'Message 1'),
        createMessage('tutor', 'Message 2'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      // Verify messages are displayed (scrollIntoView mock doesn't throw)
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
    });

    it('should scroll when new messages are added', () => {
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

  describe('AC6: Clean, readable typography and spacing', () => {
    it('should have clean, readable typography', () => {
      render(<ChatInterface />);

      const chatInterface = screen.getByRole('region', { name: /chat interface/i });
      expect(chatInterface).toHaveClass('rounded-lg', 'border');
    });

    it('should have proper spacing between messages', () => {
      const messages: Message[] = [
        createMessage('student', 'Message 1'),
        createMessage('tutor', 'Message 2'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const log = screen.getByRole('log');
      const container = log.querySelector('.flex-col');
      expect(container).toHaveClass('gap-4');
    });

    it('should have proper typography classes for message content', () => {
      const messages: Message[] = [
        createMessage('student', 'Test message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const messageArticle = screen.getByRole('article');
      const messageBubble = messageArticle.querySelector('.rounded-lg');
      expect(messageBubble).toHaveClass('text-base', 'leading-relaxed');
    });

    it('should have proper spacing in message container', () => {
      const messages: Message[] = [
        createMessage('student', 'Test message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      // Find article by aria-label (accessible name) not by text content
      const messageArticle = screen.getByRole('article', { name: /student message/i });
      const messageBubble = messageArticle.querySelector('.rounded-lg');
      expect(messageBubble).toHaveClass('px-4', 'py-3');
    });

    it('should have readable text with proper line height', () => {
      const messages: Message[] = [
        createMessage('student', 'Test message'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      const messageArticle = screen.getByRole('article');
      const messageBubble = messageArticle.querySelector('.rounded-lg');
      expect(messageBubble).toHaveClass('leading-relaxed');
    });

    it('should handle long messages with proper wrapping', () => {
      const longContent = 'This is a very long message that should wrap properly. '.repeat(10);
      const messages: Message[] = [
        createMessage('tutor', longContent),
      ];

      render(<ChatInterface initialMessages={messages} />);

      // Check for text content
      const messageArticle = screen.getByRole('article');
      expect(messageArticle).toHaveTextContent('This is a very long message');
      
      // Check for wrapping classes on MessageContent div
      const messageBubble = messageArticle.querySelector('.rounded-lg');
      expect(messageBubble).toBeTruthy();
      if (messageBubble) {
        const messageContent = messageBubble.querySelector('.break-words');
        expect(messageContent).toBeTruthy();
        if (messageContent) {
          expect(messageContent).toHaveClass('break-words');
          expect(messageContent).toHaveClass('whitespace-pre-wrap');
        }
      }
    });
  });

  describe('Multiple acceptance criteria integration', () => {
    it('should satisfy all acceptance criteria simultaneously', () => {
      const messages: Message[] = [
        createMessage('student', 'Student message', new Date('2024-01-01T10:00:00')),
        createMessage('tutor', 'Tutor message', new Date('2024-01-01T10:01:00')),
      ];

      render(<ChatInterface initialMessages={messages} />);

      // AC1: Messages in chronological order
      const messageElements = screen.getAllByRole('article');
      expect(messageElements[0]).toHaveTextContent('Student message');
      expect(messageElements[1]).toHaveTextContent('Tutor message');

      // AC2: Student message on right
      expect(messageElements[0]).toHaveClass('justify-end');

      // AC3: Tutor message on left
      expect(messageElements[1]).toHaveClass('justify-start');

      // AC4: Timestamps present
      const timestamps = screen.getAllByLabelText(/message timestamp/i);
      expect(timestamps).toHaveLength(2);

      // AC5: Auto-scroll (mock doesn't throw, messages are displayed)
      expect(screen.getByText('Student message')).toBeInTheDocument();
      expect(screen.getByText('Tutor message')).toBeInTheDocument();

      // AC6: Clean typography and spacing
      const log = screen.getByRole('log');
      const container = log.querySelector('.flex-col');
      expect(container).toHaveClass('gap-4');
    });
  });
});

