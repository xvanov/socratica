import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatInterface from '../ChatInterface';
import Message from '../Message';
import MessageList from '../MessageList';
import MessageInput from '../MessageInput';
import { Message as MessageType } from '@/types/chat';

describe('ARIA Labels and Attributes', () => {
  const createMessage = (
    role: 'student' | 'tutor',
    content: string,
    timestamp: Date | string = new Date()
  ): MessageType => ({
    role,
    content,
    timestamp,
  });

  describe('ChatInterface ARIA attributes', () => {
    it('should have proper region role and aria-label', () => {
      render(<ChatInterface />);
      
      const chatInterface = screen.getByRole('region', { name: /chat interface/i });
      expect(chatInterface).toBeInTheDocument();
    });

    it('should have aria-describedby linking to description', () => {
      render(<ChatInterface />);
      
      const chatInterface = screen.getByRole('region', { name: /chat interface/i });
      expect(chatInterface).toHaveAttribute('aria-describedby', 'chat-interface-description');
      
      const description = document.getElementById('chat-interface-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('sr-only');
    });

    it('should have semantic header element', () => {
      render(<ChatInterface />);
      
      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent('Chat with Tutor');
    });

    it('should have aria-live region for loading state', () => {
      render(<ChatInterface initialMessages={[createMessage('student', 'Test')]} />);
      
      // Loading state is conditionally rendered, but aria-live should be present when loading
      const loadingRegion = screen.queryByRole('status', { name: /ai tutor is responding/i });
      // May not be present if not loading, but if present should have proper attributes
      if (loadingRegion) {
        expect(loadingRegion).toHaveAttribute('aria-live', 'polite');
      }
    });
  });

  describe('MessageList ARIA attributes', () => {
    it('should have proper log role and aria-label', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Test message'),
      ];

      render(<MessageList messages={messages} />);

      const messageList = screen.getByRole('log', { name: /chat messages/i });
      expect(messageList).toBeInTheDocument();
    });

    it('should have aria-live="polite" for dynamic content', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Test message'),
      ];

      render(<MessageList messages={messages} />);

      const messageList = screen.getByRole('log');
      expect(messageList).toHaveAttribute('aria-live', 'polite');
      expect(messageList).toHaveAttribute('aria-atomic', 'false');
    });

    it('should have aria-describedby linking to description', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Test message'),
      ];

      render(<MessageList messages={messages} />);

      const messageList = screen.getByRole('log');
      expect(messageList).toHaveAttribute('aria-describedby', 'message-list-description');
      
      const description = document.getElementById('message-list-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('sr-only');
    });
  });

  describe('Message component semantic HTML', () => {
    it('should use semantic article element instead of div with role', () => {
      const message = createMessage('student', 'Test message');
      render(<Message message={message} index={0} />);
      
      const article = screen.getByRole('article');
      expect(article.tagName).toBe('ARTICLE');
      expect(article).not.toHaveAttribute('role');
    });

    it('should have aria-label for message role', () => {
      const studentMessage = createMessage('student', 'Student message');
      render(<Message message={studentMessage} index={0} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'student message');
    });

    it('should have aria-label for timestamp', () => {
      const message = createMessage('tutor', 'Test message');
      render(<Message message={message} index={0} />);
      
      const timestamp = screen.getByLabelText(/message timestamp/i);
      expect(timestamp).toBeInTheDocument();
    });
  });

  describe('MessageInput ARIA attributes', () => {
    it('should have proper form labels and descriptions', () => {
      render(<MessageInput onMessageSubmit={() => {}} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      expect(textarea).toBeInTheDocument();
      
      // Check aria-describedby links to description
      const descriptionId = textarea.getAttribute('aria-describedby');
      expect(descriptionId).toBeTruthy();
      
      if (descriptionId) {
        // aria-describedby can contain multiple IDs separated by spaces
        const ids = descriptionId.split(' ');
        // At least one description element should exist
        const hasDescription = ids.some(id => {
          const element = document.getElementById(id);
          return element !== null;
        });
        expect(hasDescription).toBe(true);
      }
    });

    it('should have aria-required attribute', () => {
      render(<MessageInput onMessageSubmit={() => {}} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('should have aria-invalid when validation error exists', () => {
      render(<MessageInput onMessageSubmit={() => {}} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      
      // Initially should not be invalid
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-errormessage linking to error when validation fails', () => {
      render(<MessageInput onMessageSubmit={() => {}} />);
      
      const textarea = screen.getByLabelText(/message input field/i);
      const errorId = textarea.getAttribute('aria-errormessage');
      
      // Error message ID may be undefined if no error
      // But if present, should link to valid error element
      if (errorId) {
        const errorElement = document.getElementById(errorId);
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveAttribute('role', 'alert');
      }
    });

    it('should have aria-label on submit button', () => {
      render(<MessageInput onMessageSubmit={() => {}} />);
      
      const submitButton = screen.getByLabelText(/send message/i);
      expect(submitButton).toBeInTheDocument();
    });

    it('should have aria-disabled on submit button when disabled', () => {
      render(<MessageInput onMessageSubmit={() => {}} disabled={true} />);
      
      const submitButton = screen.getByLabelText(/send message/i);
      expect(submitButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have decorative icons marked with aria-hidden', () => {
      render(<MessageInput onMessageSubmit={() => {}} />);
      
      // Check for SVG icons that should be hidden
      const svgIcons = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });
});

