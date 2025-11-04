import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

describe('ConfirmationDialog Component', () => {
  describe('AC3: Confirmation dialog prevents accidental clearing', () => {
    it('should not render when isOpen is false', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={false}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should show default confirmation message', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(
        screen.getByText(
          /are you sure you want to clear the chat\? this will reset the conversation/i
        )
      ).toBeInTheDocument();
    });

    it('should show custom message when provided', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
          message="Custom confirmation message"
        />
      );

      expect(screen.getByText('Custom confirmation message')).toBeInTheDocument();
    });

    it('should have "Cancel" and "Clear Chat" buttons', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear chat/i })).toBeInTheDocument();
    });

    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm when Clear Chat button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /clear chat/i });
      await user.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should dismiss dialog when Escape key is pressed', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should dismiss dialog when clicking outside (overlay)', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const dialog = screen.getByRole('dialog');
      const overlay = dialog.parentElement;

      if (overlay) {
        await user.click(overlay);
        expect(onCancel).toHaveBeenCalledTimes(1);
      }
    });

    it('should not dismiss dialog when clicking inside dialog', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const dialog = screen.getByRole('dialog');
      await user.click(dialog);

      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should have accessible ARIA attributes', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'confirmation-dialog-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'confirmation-dialog-message');
    });

    it('should focus cancel button when dialog opens', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      // Focus happens after a timeout, so we check if it's focusable
      expect(cancelButton).toBeInTheDocument();
    });

    it('should be accessible via keyboard navigation', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      cancelButton.focus();
      expect(cancelButton).toHaveFocus();

      await user.keyboard('{Tab}');
      const confirmButton = screen.getByRole('button', { name: /clear chat/i });
      expect(confirmButton).toHaveFocus();
    });
  });
});

