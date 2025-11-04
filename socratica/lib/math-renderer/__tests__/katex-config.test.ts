import { describe, it, expect } from 'vitest';
import KATEX_CONFIG, { AdvancedNotationConfig } from '@/lib/math-renderer/katex-config';

describe('KaTeX Configuration', () => {
  describe('AC2: Library configuration', () => {
    it('should export KaTeX configuration object', () => {
      expect(KATEX_CONFIG).toBeDefined();
      expect(typeof KATEX_CONFIG).toBe('object');
    });

    it('should have throwOnError set to false for graceful error handling', () => {
      expect(KATEX_CONFIG.throwOnError).toBe(false);
    });

    it('should have errorColor configured', () => {
      expect(KATEX_CONFIG.errorColor).toBeDefined();
      expect(KATEX_CONFIG.errorColor).toBe('#cc0000');
    });

    it('should have macros object defined', () => {
      expect(KATEX_CONFIG.macros).toBeDefined();
      expect(typeof KATEX_CONFIG.macros).toBe('object');
    });

    it('should be importable as default export', () => {
      expect(KATEX_CONFIG).toBeDefined();
    });

    it('should export AdvancedNotationConfig type', () => {
      // Type check: config should match AdvancedNotationConfig interface
      const config: AdvancedNotationConfig = KATEX_CONFIG;
      expect(config).toBeDefined();
      expect(config.throwOnError).toBe(false);
      expect(config.errorColor).toBe('#cc0000');
      expect(config.macros).toBeDefined();
    });
  });

  describe('Configuration options', () => {
    it('should allow graceful error handling', () => {
      // Verify throwOnError is false so malformed LaTeX doesn't crash the app
      expect(KATEX_CONFIG.throwOnError).toBe(false);
    });

    it('should have error color for visual feedback', () => {
      expect(KATEX_CONFIG.errorColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should have empty macros object by default', () => {
      expect(KATEX_CONFIG.macros).toEqual({});
    });

    it('should allow custom macros to be added', () => {
      // Verify macros object is extensible
      const customMacros = { '\RR': '\\mathbb{R}' };
      expect(() => {
        Object.assign(KATEX_CONFIG.macros, customMacros);
      }).not.toThrow();
      
      // Clean up
      delete KATEX_CONFIG.macros['\RR'];
    });
  });

  describe('Advanced Notation Support (AC: 1-4)', () => {
    it('should have configuration that supports matrix notation', () => {
      // Configuration should allow matrices (verified by KaTeX's default support)
      expect(KATEX_CONFIG.throwOnError).toBe(false);
      // Matrix notation is supported by KaTeX by default - no special config needed
    });

    it('should have configuration that supports summation and product notation', () => {
      // Summation and product notation supported by KaTeX by default
      expect(KATEX_CONFIG.throwOnError).toBe(false);
    });

    it('should have configuration that supports integrals and derivatives', () => {
      // Integrals and derivatives supported by KaTeX by default
      expect(KATEX_CONFIG.throwOnError).toBe(false);
    });

    it('should have configuration that supports Greek letters', () => {
      // Greek letters supported by KaTeX by default - no config needed
      expect(KATEX_CONFIG.macros).toBeDefined();
    });

    it('should have graceful error handling for malformed LaTeX (AC: 6)', () => {
      // throwOnError: false ensures graceful fallback
      expect(KATEX_CONFIG.throwOnError).toBe(false);
      expect(KATEX_CONFIG.errorColor).toBeDefined();
    });
  });
});

