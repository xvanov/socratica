import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock scrollIntoView for jsdom (only in browser-like environments)
beforeAll(() => {
  // Only set up DOM-related mocks when running in jsdom environment
  if (typeof window !== 'undefined' && typeof Element !== 'undefined') {
    // Ensure scrollIntoView exists on Element prototype
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = function (options?: ScrollIntoViewOptions | boolean) {
        // Mock implementation - does nothing but doesn't throw
      };
    }
    
    // Also ensure it exists on HTMLElement prototype
    if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = function (options?: ScrollIntoViewOptions | boolean) {
        // Mock implementation - does nothing but doesn't throw
      };
    }
  }
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

