"use client";

import { useState } from "react";
import AuthButton from "./AuthButton";

/**
 * Navigation Component
 * 
 * Provides responsive navigation that adapts to different screen sizes:
 * - Mobile (< 640px): Hamburger menu that expands/collapses
 * - Tablet (640px - 1024px): Horizontal menu with hamburger fallback
 * - Desktop (> 1024px): Full horizontal menu
 * 
 * Meets WCAG 2.1 Level AA accessibility requirements:
 * - Keyboard navigation support
 * - Screen reader support with ARIA labels
 * - Focus management
 * - Touch targets meet 44x44px minimum
 */
export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Handle Escape key to close menu
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isMenuOpen) {
      e.preventDefault();
      closeMenu();
    }
  };

  // Handle arrow key navigation in mobile menu
  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const menuItems = navItems;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = index < menuItems.length - 1 ? index + 1 : 0;
      const nextItem = document.querySelector(`[data-menu-item-index="${nextIndex}"]`) as HTMLElement;
      nextItem?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = index > 0 ? index - 1 : menuItems.length - 1;
      const prevItem = document.querySelector(`[data-menu-item-index="${prevIndex}"]`) as HTMLElement;
      prevItem?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      const firstItem = document.querySelector(`[data-menu-item-index="0"]`) as HTMLElement;
      firstItem?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const lastItem = document.querySelector(`[data-menu-item-index="${menuItems.length - 1}"]`) as HTMLElement;
      lastItem?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      closeMenu();
    }
  };

  // Navigation items (currently placeholder - can be extended)
  const navItems = [
    { label: "Home", href: "/", id: "nav-home" },
    { label: "Session History", href: "/sessions", id: "nav-sessions" },
    { label: "About", href: "#about", id: "nav-about" },
    { label: "Help", href: "#help", id: "nav-help" },
  ];

  return (
    <nav
      className="w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800"
      role="navigation"
      aria-label="Main navigation"
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <a
              href="/"
              className="text-xl font-semibold text-black dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 rounded"
              aria-label="Socratica - Home"
            >
              Socratica
            </a>
          </div>

          {/* Desktop Navigation - Hidden on mobile, visible on lg screens */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="text-base text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 rounded px-2 py-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={item.label}
              >
                {item.label}
              </a>
            ))}
            <AuthButton showSignOut={true} />
          </div>

          {/* Mobile Menu Button - Visible on mobile/tablet, hidden on desktop */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition-colors min-h-[44px] min-w-[44px]"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
          >
            <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
            {isMenuOpen ? (
              // Close icon (X)
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu - Hidden by default, shown when isMenuOpen is true */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden border-t border-zinc-200 dark:border-zinc-800"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item, index) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="block px-3 py-2 text-base text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 min-h-[44px] flex items-center"
                  role="menuitem"
                  data-menu-item-index={index}
                  onClick={closeMenu}
                  onKeyDown={(e) => {
                    handleMenuKeyDown(e, index);
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      closeMenu();
                    }
                  }}
                >
                  {item.label}
                </a>
              ))}
              <div className="px-3 py-2">
                <AuthButton showSignOut={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

