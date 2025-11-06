import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClearChatButton from '../ClearChatButton';

describe('ClearChatButton Component', () => {
  describe('AC1: "New Problem" or "Clear Chat" button is available', () => {
    it('should render ClearChatButton component', () => {
      const handleClick = vi.fn();
      render(<ClearChatButton onClick={handleClick} />);

      const button = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      expect(button).toBeInTheDocument();
    });

    it('should display "New Problem" text on larger screens', () => {
      const handleClick = vi.fn();
      render(<ClearChatButton onClick={handleClick} />);

      const button = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      expect(button).toHaveTextContent('New Problem');
    });

    it('should have accessible ARIA label', () => {
      const handleClick = vi.fn();
      render(<ClearChatButton onClick={handleClick} />);

      const button = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      expect(button).toHaveAttribute('aria-label', 'Clear chat and start new problem');
    });

    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<ClearChatButton onClick={handleClick} />);

      const button = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      const handleClick = vi.fn();
      render(<ClearChatButton onClick={handleClick} disabled={true} />);

      const button = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      expect(button).toBeDisabled();
    });

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<ClearChatButton onClick={handleClick} disabled={true} />);

      const button = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should be accessible via keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<ClearChatButton onClick={handleClick} />);

      const button = screen.getByRole('button', {
        name: /clear chat and start new problem/i,
      });
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});




