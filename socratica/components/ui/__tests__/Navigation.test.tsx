import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from '../Navigation';

// Mock window.matchMedia for responsive breakpoint testing
const mockMatchMedia = (matches: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('Navigation Component Tests (Story 5.1 - AC 4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock matchMedia for responsive breakpoint tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia(false),
    });
  });

  describe('Navigation accessibility and responsive behavior', () => {
    it('should render navigation with proper ARIA labels', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it('should render logo/brand link with accessible label', () => {
      render(<Navigation />);
      
      const logoLink = screen.getByLabelText(/socratica - home/i);
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('should show mobile menu button on small screens', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveClass('lg:hidden');
    });

    it('should hide desktop menu on mobile screens', () => {
      render(<Navigation />);
      
      // Desktop menu should be hidden on mobile (lg:hidden class)
      // We check that desktop menu items are not visible initially
      // Logo link should be visible, but desktop nav items should be hidden
      const logoLink = screen.getByLabelText(/socratica - home/i);
      expect(logoLink).toBeInTheDocument();
      
      // Desktop menu container should have lg:flex class (hidden on mobile)
      const nav = screen.getByRole('navigation');
      const desktopMenu = nav.querySelector('.hidden.lg\\:flex');
      expect(desktopMenu).toBeInTheDocument();
    });

    it('should toggle mobile menu when button is clicked', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      
      // Menu should be closed initially
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      
      // Click to open menu
      fireEvent.click(menuButton);
      
      // Menu should now be visible
      const mobileMenu = screen.getByRole('menu', { name: /mobile navigation menu/i });
      expect(mobileMenu).toBeInTheDocument();
      
      // Button should now show "Close menu"
      expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
    });

    it('should close mobile menu when menu item is clicked', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      
      // Open menu
      fireEvent.click(menuButton);
      
      // Menu should be open
      expect(screen.getByRole('menu')).toBeInTheDocument();
      
      // Click a menu item
      const homeLink = screen.getByRole('menuitem', { name: /home/i });
      fireEvent.click(homeLink);
      
      // Menu should be closed
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should have touch-friendly menu button (44x44px minimum)', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toHaveClass('min-h-[44px]');
      expect(menuButton).toHaveClass('min-w-[44px]');
    });

    it('should have touch-friendly menu items (44px minimum height)', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(menuButton);
      
      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach(item => {
        expect(item).toHaveClass('min-h-[44px]');
      });
    });

    it('should support keyboard navigation', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      
      // Open menu with keyboard
      fireEvent.keyDown(menuButton, { key: 'Enter' });
      fireEvent.click(menuButton);
      
      const homeLink = screen.getByRole('menuitem', { name: /home/i });
      
      // Test keyboard navigation on menu items
      fireEvent.keyDown(homeLink, { key: 'Enter' });
      
      // Menu should close
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should have proper focus management', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toHaveClass('focus:outline-none');
      expect(menuButton).toHaveClass('focus:ring-2');
    });

    it('should render all navigation items', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(menuButton);
      
      expect(screen.getByRole('menuitem', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /about/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /help/i })).toBeInTheDocument();
    });

    it('should update aria-expanded when menu opens/closes', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      
      // Initially closed
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      
      // Open menu
      fireEvent.click(menuButton);
      
      // Should be expanded
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Responsive layout breakpoints', () => {
    it('should use mobile-first responsive classes', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // Check mobile menu button has lg:hidden (hidden on large screens)
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toHaveClass('lg:hidden');
    });

    it('should hide mobile menu button on desktop screens', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia(true), // Simulate large screen
      });
      
      render(<Navigation />);
      
      // Mobile menu button should have lg:hidden class (hidden on desktop)
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toHaveClass('lg:hidden');
      
      // Desktop menu should be visible (not hidden)
      const nav = screen.getByRole('navigation');
      const desktopMenu = nav.querySelector('.hidden.lg\\:flex');
      expect(desktopMenu).toBeInTheDocument();
    });
  });
});

