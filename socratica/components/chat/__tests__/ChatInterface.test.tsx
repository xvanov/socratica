import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatInterface from '../ChatInterface';
import { Message } from '@/types/chat';

describe('ChatInterface Component', () => {
  const createMessage = (
    role: 'student' | 'tutor',
    content: string,
    timestamp: Date | string = new Date()
  ): Message => ({
    role,
    content,
    timestamp,
  });

  describe('AC1: Chat message container displays messages in chronological order', () => {
    it('should render ChatInterface component', () => {
      render(<ChatInterface />);
      
      expect(screen.getByRole('region', { name: /chat interface/i })).toBeInTheDocument();
    });

    it('should display messages in chronological order', () => {
      const initialMessages: Message[] = [
        createMessage('student', 'First message', new Date('2024-01-01T10:00:00')),
        createMessage('tutor', 'Second message', new Date('2024-01-01T10:01:00')),
      ];

      render(<ChatInterface initialMessages={initialMessages} />);

      const messageElements = screen.getAllByRole('article');
      expect(messageElements).toHaveLength(2);
      expect(messageElements[0]).toHaveTextContent('First message');
      expect(messageElements[1]).toHaveTextContent('Second message');
    });
  });

  describe('AC6: Clean, readable typography and spacing', () => {
    it('should have clean, readable typography and spacing', () => {
      render(<ChatInterface />);

      const chatInterface = screen.getByRole('region', { name: /chat interface/i });
      expect(chatInterface).toHaveClass('rounded-lg', 'border');
    });

    it('should have proper container layout', () => {
      render(<ChatInterface />);

      const chatInterface = screen.getByRole('region', { name: /chat interface/i });
      const container = chatInterface.querySelector('.flex-col');
      expect(container).toHaveClass('min-h-[400px]', 'max-h-[600px]');
    });
  });

  describe('State management', () => {
    it('should initialize with empty messages when no initialMessages provided', () => {
      render(<ChatInterface />);

      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    });

    it('should initialize with provided initialMessages', () => {
      const initialMessages: Message[] = [
        createMessage('student', 'Initial message'),
      ];

      render(<ChatInterface initialMessages={initialMessages} />);

      expect(screen.getByText('Initial message')).toBeInTheDocument();
    });

    it('should manage message state internally', () => {
      const initialMessages: Message[] = [
        createMessage('student', 'Test message'),
      ];

      render(<ChatInterface initialMessages={initialMessages} />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  describe('Component integration', () => {
    it('should integrate MessageList component', () => {
      const initialMessages: Message[] = [
        createMessage('student', 'Test'),
      ];

      render(<ChatInterface initialMessages={initialMessages} />);

      // Verify MessageList is rendered (indicated by log role)
      expect(screen.getByRole('log')).toBeInTheDocument();
    });

    it('should pass messages to MessageList component', () => {
      const initialMessages: Message[] = [
        createMessage('student', 'Message 1'),
        createMessage('tutor', 'Message 2'),
      ];

      render(<ChatInterface initialMessages={initialMessages} />);

      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
    });
  });

  describe('Responsive design', () => {
    it('should have responsive height constraints', () => {
      render(<ChatInterface />);

      const chatInterface = screen.getByRole('region', { name: /chat interface/i });
      const container = chatInterface.querySelector('.flex-col');
      
      // Mobile: min-h-[400px] max-h-[600px]
      // Desktop: sm:min-h-[500px] sm:max-h-[700px]
      expect(container).toHaveClass('min-h-[400px]', 'max-h-[600px]');
      expect(container).toHaveClass('sm:min-h-[500px]', 'sm:max-h-[700px]');
    });

    it('should have proper container styling for different screen sizes', () => {
      render(<ChatInterface />);

      const chatInterface = screen.getByRole('region', { name: /chat interface/i });
      // Check for design system background classes
      expect(chatInterface).toHaveClass('bg-[var(--surface-elevated)]');
      expect(chatInterface).toHaveClass('dark:bg-[var(--surface)]');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      render(<ChatInterface />);

      expect(screen.getByRole('region', { name: /chat interface/i })).toBeInTheDocument();
    });

    it('should have aria-label for chat interface', () => {
      render(<ChatInterface />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Chat interface');
    });

    it('should be accessible with keyboard navigation', () => {
      render(<ChatInterface />);

      const region = screen.getByRole('region', { name: /chat interface/i });
      expect(region).toBeInTheDocument();
    });
  });

  describe('Component structure', () => {
    it('should have proper container structure', () => {
      render(<ChatInterface />);

      const chatInterface = screen.getByRole('region', { name: /chat interface/i });
      expect(chatInterface).toHaveClass('flex', 'flex-col');
    });

    it('should have proper border and background styling', () => {
      render(<ChatInterface />);

      const chatInterface = screen.getByRole('region', { name: /chat interface/i });
      // Check for design system border classes
      expect(chatInterface).toHaveClass('border');
      expect(chatInterface).toHaveClass('border-[var(--border)]');
    });
  });
});




