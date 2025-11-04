import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MathBlock from '@/components/math-renderer/MathBlock';

describe('MathBlock Component', () => {
  describe('AC4: Basic block math expressions render correctly', () => {
    it('should render simple block math expression', () => {
      render(<MathBlock expression="\\frac{a}{b}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression:.*frac/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render complex block expression', () => {
      render(<MathBlock expression="x^2 + y^2 = z^2" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x\^2 \+ y\^2 = z\^2/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render expression with fractions', () => {
      render(<MathBlock expression="\\frac{x+1}{y-2}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression:.*frac/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render expression with Greek letters', () => {
      render(<MathBlock expression="\\alpha + \\beta = \\gamma" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression:.*alpha/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render expression with multiple lines of math', () => {
      render(<MathBlock expression="\\begin{align} x &= 1 \\\\ y &= 2 \\end{align}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });
  });

  describe('Error handling for malformed LaTeX', () => {
    it('should handle empty expression gracefully', () => {
      render(<MathBlock expression="" />);
      
      const fallback = screen.getByLabelText(/empty math expression/i);
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveTextContent('[math]');
      expect(fallback).toHaveClass('text-center');
    });

    it('should handle whitespace-only expression gracefully', () => {
      render(<MathBlock expression="   " />);
      
      const fallback = screen.getByLabelText(/empty math expression/i);
      expect(fallback).toBeInTheDocument();
    });

    it('should handle invalid LaTeX syntax gracefully', () => {
      // KaTeX with throwOnError: false should handle this, but we test fallback
      render(<MathBlock expression="\\invalid{command}" />);
      
      // KaTeX may render an error message instead of throwing
      // We verify the component doesn't crash
      const container = screen.getByLabelText(/mathematical expression/i);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Custom className support', () => {
    it('should apply custom className', () => {
      render(<MathBlock expression="x^2" className="my-4" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x\^2/i);
      expect(mathElement).toHaveClass('my-4');
    });

    it('should work without className', () => {
      render(<MathBlock expression="x^2" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x\^2/i);
      expect(mathElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for screen readers', () => {
      render(<MathBlock expression="\\frac{a}{b}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression:.*frac/i);
      expect(mathElement).toBeInTheDocument();
      expect(mathElement).toHaveAttribute('aria-label');
    });

    it('should provide accessible fallback for empty expressions', () => {
      render(<MathBlock expression="" />);
      
      const fallback = screen.getByLabelText(/empty math expression/i);
      expect(fallback).toBeInTheDocument();
    });
  });

  describe('Common math symbols support (AC5)', () => {
    it('should render basic operators', () => {
      render(<MathBlock expression="x + y - z * w / v = 5" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render comparison operators', () => {
      render(<MathBlock expression="x < y \\leq z \\geq w \\neq v" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render square roots', () => {
      render(<MathBlock expression="\\sqrt{x + y}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render nth roots', () => {
      render(<MathBlock expression="\\sqrt[n]{x}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render parentheses and brackets', () => {
      render(<MathBlock expression="\\left( x + y \\right) \\left[ a - b \\right]" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render Greek letters', () => {
      render(<MathBlock expression="\\alpha, \\beta, \\gamma, \\pi, \\theta, \\Delta, \\Sigma" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render subscripts and superscripts', () => {
      render(<MathBlock expression="x_1^2 + x_{i+1}^{n+1}" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });
  });
});

