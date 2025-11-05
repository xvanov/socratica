import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MathDisplay from '../MathDisplay';
import MathBlock from '../MathBlock';
import MathPreview from '../MathPreview';

describe('Math Renderer ARIA Labels and Attributes', () => {
  describe('MathDisplay ARIA attributes', () => {
    it('should have aria-label for mathematical expressions', () => {
      render(<MathDisplay expression="x^2 + 5" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
      expect(mathElement).toHaveTextContent(/\d/); // Should contain rendered math
    });

    it('should have descriptive aria-label with expression', () => {
      render(<MathDisplay expression="x^2 + 5" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x\^2 \+ 5/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should handle empty expressions gracefully', () => {
      render(<MathDisplay expression="" />);
      
      const mathElement = screen.getByLabelText(/empty math expression/i);
      expect(mathElement).toBeInTheDocument();
    });
  });

  describe('MathBlock ARIA attributes', () => {
    it('should have aria-label for mathematical expressions', () => {
      render(<MathBlock expression="\\frac{a}{b}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should have descriptive aria-label with expression', () => {
      render(<MathBlock expression="x^2 + y^2 = z^2" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x\^2 \+ y\^2 = z\^2/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should handle empty expressions gracefully', () => {
      render(<MathBlock expression="" />);
      
      const mathElement = screen.getByLabelText(/empty math expression/i);
      expect(mathElement).toBeInTheDocument();
    });
  });

  describe('MathPreview ARIA attributes', () => {
    it('should have proper region role and aria-label', () => {
      render(<MathPreview value="Solve for $x$ in $x^2 + 5 = 0$" />);
      
      const preview = screen.getByRole('region', { name: /math preview/i });
      expect(preview).toBeInTheDocument();
    });

    it('should have aria-live="polite" for dynamic content', () => {
      render(<MathPreview value="Solve for $x$" />);
      
      const preview = screen.getByRole('region', { name: /math preview/i });
      expect(preview).toHaveAttribute('aria-live', 'polite');
      expect(preview).toHaveAttribute('aria-atomic', 'false');
    });

    it('should have aria-describedby linking to description', () => {
      render(<MathPreview value="Solve for $x$" />);
      
      const preview = screen.getByRole('region', { name: /math preview/i });
      expect(preview).toHaveAttribute('aria-describedby', 'math-preview-description');
      
      const description = document.getElementById('math-preview-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('sr-only');
    });

    it('should use semantic section element', () => {
      render(<MathPreview value="Solve for $x$" />);
      
      const section = document.querySelector('section[role="region"]');
      expect(section).toBeInTheDocument();
    });

    it('should not render when no LaTeX detected', () => {
      const { container } = render(<MathPreview value="plain text" />);
      
      expect(container.firstChild).toBeNull();
    });
  });
});


