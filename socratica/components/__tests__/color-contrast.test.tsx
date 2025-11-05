import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getContrastRatio, meetsWCAGAA, getWCAGLevel, validateDesignSystemContrast } from '../../lib/utils/color-contrast';

describe('Color Contrast Validation', () => {
  describe('WCAG AA compliance', () => {
    it('should meet WCAG AA minimum (4.5:1) for normal text on light background', () => {
      const foreground = '#111827'; // neutral-900
      const background = '#ffffff'; // background light
      
      const ratio = getContrastRatio(foreground, background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWCAGAA(foreground, background)).toBe(true);
    });

    it('should meet WCAG AA minimum (4.5:1) for normal text on dark background', () => {
      const foreground = '#f5f5f5'; // foreground dark mode
      const background = '#0a0a0a'; // background dark
      
      const ratio = getContrastRatio(foreground, background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWCAGAA(foreground, background)).toBe(true);
    });

    it('should meet WCAG AA minimum (3:1) for large text', () => {
      // Large text requires 3:1 minimum
      const foreground = '#2563eb'; // primary-600
      const background = '#ffffff'; // background light
      
      const ratio = getContrastRatio(foreground, background);
      expect(ratio).toBeGreaterThanOrEqual(3);
      
      // For large text, we can use a lower threshold
      const meetsLargeText = ratio >= 3;
      expect(meetsLargeText).toBe(true);
    });

    it('should meet WCAG AA minimum (3:1) for UI components', () => {
      const foreground = '#3b82f6'; // primary-500
      const background = '#ffffff'; // background light
      
      const ratio = getContrastRatio(foreground, background);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it('should validate design system color combinations', () => {
      const results = validateDesignSystemContrast();
      
      // All critical combinations should meet WCAG AA
      // Note: UI components only need 3:1, but text needs 4.5:1
      results.forEach(result => {
        if (result.description.includes('text')) {
          // Text combinations need 4.5:1
          expect(result.level).not.toBe('FAIL');
          expect(result.ratio).toBeGreaterThanOrEqual(4.5);
        } else {
          // UI components need 3:1 minimum - check ratio directly, not level
          expect(result.ratio).toBeGreaterThanOrEqual(3.0);
        }
      });
    });

    it('should return correct WCAG level for color pairs', () => {
      // High contrast (should be AAA)
      const highContrast = getWCAGLevel('#000000', '#ffffff');
      expect(highContrast).toBe('AAA');
      
      // Medium contrast (should be AA)
      const mediumContrast = getWCAGLevel('#2563eb', '#ffffff');
      expect(mediumContrast).toBe('AA');
      
      // Low contrast (should fail)
      const lowContrast = getWCAGLevel('#cccccc', '#ffffff');
      expect(lowContrast).toBe('FAIL');
    });
  });

  describe('Student message contrast', () => {
    it('should meet WCAG AA for white text on primary background', () => {
      const foreground = '#ffffff'; // white text
      const background = '#2563eb'; // primary-600
      
      const ratio = getContrastRatio(foreground, background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWCAGAA(foreground, background)).toBe(true);
    });
  });

  describe('Tutor message contrast', () => {
    it('should meet WCAG AA for foreground text on surface background', () => {
      const foreground = '#1a1a1a'; // foreground
      const background = '#f8f9fa'; // surface
      
      const ratio = getContrastRatio(foreground, background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWCAGAA(foreground, background)).toBe(true);
    });
  });

  describe('Error message contrast', () => {
    it('should meet WCAG AA for error text on error background', () => {
      const foreground = '#991b1b'; // error-800
      const background = '#fef2f2'; // error-50
      
      const ratio = getContrastRatio(foreground, background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWCAGAA(foreground, background)).toBe(true);
    });
  });
});

