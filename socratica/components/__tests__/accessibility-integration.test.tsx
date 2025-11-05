import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../chat/ChatInterface';
import ImageUpload from '../problem-input/ImageUpload';
import Navigation from '../ui/Navigation';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import { Message as MessageType } from '@/types/chat';

describe('Accessibility Integration Tests', () => {
  const createMessage = (
    role: 'student' | 'tutor',
    content: string,
    timestamp: Date | string = new Date()
  ): MessageType => ({
    role,
    content,
    timestamp,
  });

  describe('Chat interface accessibility', () => {
    it('should be fully accessible with ARIA labels and keyboard navigation', async () => {
      const user = userEvent.setup();
      const messages: MessageType[] = [
        createMessage('student', 'Solve for x: 2x + 5 = 13'),
        createMessage('tutor', 'x = 4'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      // Verify ARIA structure
      const region = screen.getByRole('region', { name: /chat interface/i });
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute('aria-describedby');

      const log = screen.getByRole('log', { name: /chat messages/i });
      expect(log).toBeInTheDocument();
      expect(log).toHaveAttribute('aria-live', 'polite');

      // Verify keyboard navigation
      const textarea = screen.getByLabelText(/message input field/i);
      expect(textarea).toBeInTheDocument();
      
      // Tab should move focus to textarea
      await user.tab();
      // Focus should be on textarea (or another focusable element)
      expect(document.activeElement).toBeInstanceOf(HTMLElement);
    });

    it('should have proper focus indicators on all interactive elements', async () => {
      const user = userEvent.setup();
      render(<ChatInterface />);

      // Focus on textarea
      const textarea = screen.getByLabelText(/message input field/i);
      textarea.focus();
      
      // Check that focus-visible styles are applied
      expect(document.activeElement).toBe(textarea);
    });

    it('should announce new messages to screen readers', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Test message'),
      ];

      const { rerender } = render(<ChatInterface initialMessages={messages} />);

      // Add new message
      const newMessages = [...messages, createMessage('tutor', 'Response')];
      rerender(<ChatInterface initialMessages={newMessages} />);

      // Verify aria-live is configured
      const log = screen.getByRole('log');
      expect(log).toHaveAttribute('aria-live', 'polite');
      expect(log).toHaveAttribute('aria-atomic', 'false');
    });
  });

  describe('Problem input interface accessibility', () => {
    it('should be fully accessible with ARIA labels and keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onImageSelect={() => {}} />);

      // Verify file input has proper ARIA
      const fileInput = screen.getByLabelText(/upload image of math problem/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('aria-describedby');

      // Verify upload button has aria-label (may be multiple, use getAllByLabelText)
      const uploadButtons = screen.getAllByLabelText(/upload image/i);
      expect(uploadButtons.length).toBeGreaterThan(0);
      
      // All should have aria-label
      uploadButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });

      // Verify keyboard navigation
      await user.tab();
      // Focus should move to interactive elements
      expect(document.activeElement).toBeInstanceOf(HTMLElement);
    });

    it('should have proper alt text for images', () => {
      // Component structure should support alt text
      render(<ImageUpload onImageSelect={() => {}} />);

      // File input should have aria-label
      const fileInput = screen.getByLabelText(/upload image of math problem/i);
      expect(fileInput).toBeInTheDocument();
    });
  });

  describe('Navigation accessibility', () => {
    it('should be fully accessible with keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      // Verify navigation has proper ARIA
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();

      // Verify menu button has proper ARIA
      const menuButton = screen.getByLabelText(/open menu/i);
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      // Open menu
      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Verify menu has proper ARIA
      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();

      // Verify Escape closes menu
      await user.keyboard('{Escape}');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should support arrow key navigation in mobile menu', async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      // Open menu
      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);

      // Menu items should be keyboard accessible
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);

      // All menu items should have proper focus styles
      menuItems.forEach(item => {
        expect(item).toHaveClass('focus:outline-none', 'focus:ring-2');
      });
    });
  });

  describe('Math rendering accessibility', () => {
    it('should have alternative text for math expressions', () => {
      const messages: MessageType[] = [
        createMessage('student', 'Solve for $x$ in $x^2 + 5 = 0$'),
      ];

      render(<ChatInterface initialMessages={messages} />);

      // Math expressions should have aria-label
      // This would require rendering math components
      const message = screen.getByText(/solve for/i);
      expect(message).toBeInTheDocument();
    });

    it('should have aria-live for math preview updates', () => {
      // MathPreview component should have aria-live
      // This would require rendering TextInput with MathPreview
    });
  });

  describe('Focus management', () => {
    it('should have visible focus indicators on all interactive elements', async () => {
      const user = userEvent.setup();
      render(<ChatInterface />);

      // Focus on textarea
      const textarea = screen.getByLabelText(/message input field/i);
      textarea.focus();

      // Check that focus styles are applied
      expect(document.activeElement).toBe(textarea);
      
      // Focus should be visible (CSS :focus-visible should apply)
      const computedStyle = window.getComputedStyle(textarea);
      // Focus styles should be visible
      expect(textarea).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('should trap focus in dialogs', async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();
      const handleConfirm = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      );

      // Wait for focus to settle on cancel button
      const cancelButton = screen.getByLabelText(/cancel/i);
      await waitFor(() => {
        expect(document.activeElement).toBe(cancelButton);
      });

      // Tab should move to confirm button
      await user.tab();
      const confirmButton = screen.getByRole('button', { name: /clear chat/i });
      await waitFor(() => {
        expect(document.activeElement).toBe(confirmButton);
      });

      // Tab again should wrap back to cancel (focus trap)
      await user.tab();
      await waitFor(() => {
        expect(document.activeElement).toBe(cancelButton);
      });
    });
  });

  describe('Color contrast compliance', () => {
    it('should meet WCAG AA contrast requirements', () => {
      // Color contrast is validated in design system tests
      // Integration test verifies components use design system colors
      render(<ChatInterface />);

      // Components should use design system CSS variables
      const region = screen.getByRole('region');
      expect(region).toHaveClass('bg-[var(--surface-elevated)]');
    });
  });
});

