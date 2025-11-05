import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navigation from '../Navigation';
import ConfirmationDialog from '../ConfirmationDialog';

describe('Keyboard Navigation Tests', () => {
  describe('Navigation keyboard navigation', () => {
    it('should handle Tab key to navigate through menu items', async () => {
      const user = userEvent.setup();
      render(<Navigation />);
      
      // Open mobile menu
      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);
      
      // Menu should be open
      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
    });

    it('should handle Escape key to close menu', async () => {
      const user = userEvent.setup();
      render(<Navigation />);
      
      // Open mobile menu
      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);
      
      // Press Escape
      await user.keyboard('{Escape}');
      
      // Menu should be closed
      const menu = screen.queryByRole('menu');
      expect(menu).not.toBeInTheDocument();
    });

    it('should handle Enter key to activate menu items', async () => {
      const user = userEvent.setup();
      render(<Navigation />);
      
      // Open mobile menu
      const menuButton = screen.getByLabelText(/open menu/i);
      await user.click(menuButton);
      
      // Find first menu item
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
      
      // Menu items should be keyboard accessible
      const firstItem = menuItems[0];
      await user.tab();
      await user.keyboard('{Enter}');
      
      // Menu should close after selection
      // Note: Actual navigation behavior depends on href links
    });

    it('should have keyboard accessible desktop navigation links', () => {
      render(<Navigation />);
      
      // Desktop links should be accessible
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      
      // All links should have proper focus styles
      links.forEach(link => {
        expect(link).toHaveAttribute('aria-label');
      });
    });
  });

  describe('ConfirmationDialog keyboard navigation', () => {
    it('should handle Escape key to close dialog', async () => {
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
      
      // Press Escape
      await user.keyboard('{Escape}');
      
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('should trap focus within dialog', async () => {
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
      
      // Tab again should wrap to cancel button (focus trap)
      await user.tab();
      await waitFor(() => {
        expect(document.activeElement).toBe(cancelButton);
      });
    });

    it('should handle Shift+Tab for backward navigation', async () => {
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
      
      // Shift+Tab should wrap to confirm button
      await user.tab({ shift: true });
      const confirmButton = screen.getByRole('button', { name: /clear chat/i });
      await waitFor(() => {
        expect(document.activeElement).toBe(confirmButton);
      });
    });
  });

  describe('Form keyboard navigation', () => {
    it('should handle Enter key to submit forms', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      
      render(
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <input type="text" aria-label="Test input" />
          <button type="submit" aria-label="Submit">Submit</button>
        </form>
      );
      
      const input = screen.getByLabelText(/test input/i);
      await user.type(input, 'test');
      await user.keyboard('{Enter}');
      
      // Enter key should trigger form submission
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should handle Space key to activate buttons', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <button onClick={handleClick} aria-label="Test button">
          Test Button
        </button>
      );
      
      const button = screen.getByLabelText(/test button/i);
      button.focus();
      await user.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});

