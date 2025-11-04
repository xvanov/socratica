import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MathDisplay from '@/components/math-renderer/MathDisplay';

describe('MathDisplay Component', () => {
  describe('AC3: Basic inline math expressions render correctly', () => {
    it('should render simple inline math expression', () => {
      render(<MathDisplay expression="x^2 + 5" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x\^2 \+ 5/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render expression with fractions', () => {
      render(<MathDisplay expression="\\frac{a}{b}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression:.*frac/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render expression with exponents', () => {
      render(<MathDisplay expression="x^{n+1}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x\^\{n\+1\}/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render expression with Greek letters', () => {
      render(<MathDisplay expression="\\alpha + \\beta" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression:.*alpha/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render expression with subscripts', () => {
      render(<MathDisplay expression="x_1 + x_2" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x_1 \+ x_2/i);
      expect(mathElement).toBeInTheDocument();
    });
  });

  describe('Error handling for malformed LaTeX', () => {
    it('should handle empty expression gracefully', () => {
      render(<MathDisplay expression="" />);
      
      const fallback = screen.getByLabelText(/empty math expression/i);
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveTextContent('[math]');
    });

    it('should handle whitespace-only expression gracefully', () => {
      render(<MathDisplay expression="   " />);
      
      const fallback = screen.getByLabelText(/empty math expression/i);
      expect(fallback).toBeInTheDocument();
    });

    it('should handle invalid LaTeX syntax gracefully', () => {
      // KaTeX with throwOnError: false should handle this, but we test fallback
      render(<MathDisplay expression="\\invalid{command}" />);
      
      // KaTeX may render an error message instead of throwing
      // We verify the component doesn't crash
      const container = screen.getByLabelText(/mathematical expression/i);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Custom className support', () => {
    it('should apply custom className', () => {
      render(<MathDisplay expression="x^2" className="text-blue-600" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x\^2/i);
      expect(mathElement).toHaveClass('text-blue-600');
    });

    it('should work without className', () => {
      render(<MathDisplay expression="x^2" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x\^2/i);
      expect(mathElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for screen readers', () => {
      render(<MathDisplay expression="x^2 + 5" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x\^2 \+ 5/i);
      expect(mathElement).toBeInTheDocument();
      expect(mathElement).toHaveAttribute('aria-label');
    });

    it('should provide accessible fallback for empty expressions', () => {
      render(<MathDisplay expression="" />);
      
      const fallback = screen.getByLabelText(/empty math expression/i);
      expect(fallback).toBeInTheDocument();
    });
  });

  describe('Common math symbols support (AC5)', () => {
    it('should render basic operators', () => {
      render(<MathDisplay expression="x + y - z * w / v = 5" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render comparison operators', () => {
      render(<MathDisplay expression="x < y \\leq z \\geq w" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render square roots', () => {
      render(<MathDisplay expression="\\sqrt{x}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render nth roots', () => {
      render(<MathDisplay expression="\\sqrt[n]{x}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render parentheses and brackets', () => {
      render(<MathDisplay expression="(x + y) [a - b] \\{m + n\\}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });
  });
});

