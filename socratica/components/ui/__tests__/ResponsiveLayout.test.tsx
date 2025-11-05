import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ResponsiveLayout from '../ResponsiveLayout';

describe('ResponsiveLayout Component Tests (Story 5.1 - Task 1)', () => {
  describe('ResponsiveLayout wrapper functionality', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <ResponsiveLayout>
          <div>Test Content</div>
        </ResponsiveLayout>
      );
      
      expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply responsive container classes', () => {
      const { container } = render(
        <ResponsiveLayout>
          <div>Test</div>
        </ResponsiveLayout>
      );
      
      const layout = container.firstChild;
      expect(layout).toHaveClass('w-full');
      expect(layout).toHaveClass('max-w-7xl');
      expect(layout).toHaveClass('mx-auto');
      expect(layout).toHaveClass('overflow-x-hidden');
    });

    it('should apply responsive padding classes', () => {
      const { container } = render(
        <ResponsiveLayout>
          <div>Test</div>
        </ResponsiveLayout>
      );
      
      const layout = container.firstChild;
      expect(layout).toHaveClass('px-4');
      expect(layout).toHaveClass('sm:px-6');
      expect(layout).toHaveClass('lg:px-8');
    });

    it('should allow custom className prop', () => {
      const { container } = render(
        <ResponsiveLayout className="custom-class">
          <div>Test</div>
        </ResponsiveLayout>
      );
      
      const layout = container.firstChild;
      expect(layout).toHaveClass('custom-class');
    });

    it('should prevent horizontal overflow', () => {
      const { container } = render(
        <ResponsiveLayout>
          <div>Test</div>
        </ResponsiveLayout>
      );
      
      const layout = container.firstChild;
      expect(layout).toHaveClass('overflow-x-hidden');
    });
  });
});

