import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock scrollIntoView for jsdom
beforeAll(() => {
  // Ensure scrollIntoView exists on Element prototype
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function (options?: ScrollIntoViewOptions | boolean) {
      // Mock implementation - does nothing but doesn't throw
    };
  }
  
  // Also ensure it exists on HTMLElement prototype
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = function (options?: ScrollIntoViewOptions | boolean) {
      // Mock implementation - does nothing but doesn't throw
    };
  }
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

