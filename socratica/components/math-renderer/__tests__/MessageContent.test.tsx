import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageContent from '@/components/math-renderer/MessageContent';

describe('MessageContent Component', () => {
  describe('AC1: Detects LaTeX syntax in chat messages', () => {
    it('should detect inline math expressions ($...$)', () => {
      render(<MessageContent content="Solve for $x$" />);
      
      // Should render math component for inline math
      const mathElement = screen.getByLabelText(/mathematical expression: x/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should detect block math expressions ($$...$$)', () => {
      render(<MessageContent content="Equation: $$x^2 + 5 = 0$$" />);
      
      // Should render block math component
      const mathElement = screen.getByLabelText(/mathematical expression: x\^2 \+ 5 = 0/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should detect multiple math expressions in single message', () => {
      render(<MessageContent content="Solve for $x$ in $x^2 + 5 = 0$" />);
      
      // Should render multiple math expressions
      const mathElements = screen.getAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle escaped dollar signs correctly', () => {
      const { container } = render(<MessageContent content="Price is \\$10" />);
      
      // Should render as plain text, not math
      // The parser removes the backslash, so output should be "Price is $10"
      const textContent = container.textContent;
      expect(textContent).toContain('Price is');
      expect(textContent).toContain('10');
      // Should not render math components
      const mathElements = screen.queryAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBe(0);
    });
  });

  describe('AC2: Renders detected LaTeX expressions as formatted math', () => {
    it('should render plain text correctly', () => {
      render(<MessageContent content="Plain text without math" />);
      
      expect(screen.getByText('Plain text without math')).toBeInTheDocument();
    });

    it('should render inline math expressions', () => {
      render(<MessageContent content="Solve for $x$" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render block math expressions', () => {
      render(<MessageContent content="$$\\frac{a}{b}$$" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should handle malformed LaTeX gracefully', () => {
      // Unclosed math should be treated as text
      render(<MessageContent content="Solve for $x" />);
      
      expect(screen.getByText(/Solve for \$x/i)).toBeInTheDocument();
    });
  });

  describe('AC3: Handles both inline ($...$) and block ($$...$$) math', () => {
    it('should handle inline math expressions', () => {
      render(<MessageContent content="Variable $x$ is used" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression: x/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should handle block math expressions', () => {
      render(<MessageContent content="Equation: $$x^2 + 5 = 0$$" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should handle both inline and block math in same message', () => {
      render(<MessageContent content="Solve for $x$ in $$x^2 + 5 = 0$$" />);
      
      // Should render both inline and block math
      const mathElements = screen.getAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('AC4: Renders fractions, exponents, roots, and basic operations correctly', () => {
    it('should render fractions correctly', () => {
      render(<MessageContent content="Fraction: $\\frac{a}{b}$" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render exponents correctly', () => {
      render(<MessageContent content="Exponent: $x^2$ and $x^{n+1}$" />);
      
      const mathElements = screen.getAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should render roots correctly', () => {
      render(<MessageContent content="Root: $\\sqrt{x}$ and $\\sqrt[n]{x}$" />);
      
      const mathElements = screen.getAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should render basic operations correctly', () => {
      render(<MessageContent content="Operations: $x + y$, $x - y$, $x \\cdot y$" />);
      
      const mathElements = screen.getAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBeGreaterThanOrEqual(3);
    });

    it('should render subscripts correctly', () => {
      render(<MessageContent content="Subscript: $x_1$ and $x_{i+1}$" />);
      
      const mathElements = screen.getAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should render Greek letters correctly', () => {
      render(<MessageContent content="Greek: $\\alpha$, $\\beta$, $\\pi$, $\\theta$" />);
      
      const mathElements = screen.getAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBeGreaterThanOrEqual(4);
    });

    it('should render parentheses correctly', () => {
      render(<MessageContent content="Parentheses: $(x + y)$, $[x + y]$, $\\{x + y\\}$" />);
      
      const mathElements = screen.getAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('AC5: Maintains message styling while rendering math', () => {
    it('should preserve whitespace-pre-wrap class', () => {
      render(<MessageContent content="Text with $x$ math" />);
      
      const container = screen.getByText('Text with').closest('div');
      expect(container).toHaveClass('whitespace-pre-wrap');
    });

    it('should preserve break-words class', () => {
      render(<MessageContent content="Text with $x$ math" />);
      
      const container = screen.getByText('Text with').closest('div');
      expect(container).toHaveClass('break-words');
    });

    it('should accept custom className', () => {
      render(<MessageContent content="Test" className="custom-class" />);
      
      const container = screen.getByText('Test').closest('div');
      expect(container).toHaveClass('custom-class');
    });

    it('should handle mixed text and math content', () => {
      render(<MessageContent content="Find $x$ when $y = 5$" />);
      
      // Should render both text and math
      expect(screen.getByText('Find')).toBeInTheDocument();
      const mathElements = screen.getAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle multiple math expressions', () => {
      render(<MessageContent content="Solve $x$ and $y$ in $x + y = 5$" />);
      
      const mathElements = screen.getAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty content', () => {
      const { container } = render(<MessageContent content="" />);
      
      // Should render an empty paragraph or div
      const element = container.querySelector('p, div');
      expect(element).toBeInTheDocument();
    });

    it('should handle content with only math', () => {
      render(<MessageContent content="$x^2 + 5$" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should handle content with only block math', () => {
      render(<MessageContent content="$$\\frac{a}{b}$$" />);
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should handle unclosed inline math as text', () => {
      render(<MessageContent content="Solve for $x" />);
      
      expect(screen.getByText(/Solve for \$x/i)).toBeInTheDocument();
    });

    it('should handle unclosed block math as text', () => {
      render(<MessageContent content="Equation: $$x^2" />);
      
      expect(screen.getByText(/Equation: \$\$x\^2/i)).toBeInTheDocument();
    });
  });

  describe('Integration with Message component styling', () => {
    it('should work with message styling classes', () => {
      // This test verifies that MessageContent maintains styling
      // when used within Message component
      render(<MessageContent content="Test message with $x$" />);
      
      const container = screen.getByText('Test message with').closest('div');
      expect(container).toHaveClass('whitespace-pre-wrap');
      expect(container).toHaveClass('break-words');
    });
  });
});

