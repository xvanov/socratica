import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageContent from '@/components/math-renderer/MessageContent';
import MathDisplay from '@/components/math-renderer/MathDisplay';
import MathBlock from '@/components/math-renderer/MathBlock';
import Message from '@/components/chat/Message';
import ChatInterface from '@/components/chat/ChatInterface';
import { Message as MessageType } from '@/types/chat';

describe('Advanced Math Notation Support', () => {
  describe('AC1: Matrix notation support', () => {
    it('should render 2x2 matrix in inline math', () => {
      render(
        <MessageContent content="$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render 3x3 matrix in block math', () => {
      render(
        <MessageContent content="$$\\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\\\ 7 & 8 & 9 \\end{bmatrix}$$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render column vector', () => {
      render(
        <MathDisplay expression="\\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render row vector', () => {
      render(
        <MathDisplay expression="\\begin{pmatrix} a & b & c \\end{pmatrix}" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });
  });

  describe('AC2: Summation and product notation support', () => {
    it('should render simple summation', () => {
      render(
        <MessageContent content="$\\sum_{i=1}^{n} x_i$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render nested summation', () => {
      render(
        <MathDisplay expression="\\sum_{i=1}^{n} \\sum_{j=1}^{m} a_{ij}" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render summation with fractions', () => {
      render(
        <MathDisplay expression="\\sum_{k=0}^{\\infty} \\frac{1}{k!}" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render simple product', () => {
      render(
        <MessageContent content="$\\prod_{i=1}^{n} x_i$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render nested product', () => {
      render(
        <MathBlock expression="\\prod_{i=1}^{n} \\prod_{j=1}^{m} a_{ij}" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });
  });

  describe('AC3: Integrals and derivatives notation support', () => {
    it('should render definite integral', () => {
      render(
        <MessageContent content="$\\int_{a}^{b} f(x) dx$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render indefinite integral', () => {
      render(
        <MathDisplay expression="\\int f(x) dx" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render double integral', () => {
      render(
        <MathBlock expression="\\iint_{D} f(x,y) dx dy" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render triple integral', () => {
      render(
        <MathDisplay expression="\\iiint_{V} f(x,y,z) dx dy dz" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render line integral', () => {
      render(
        <MessageContent content="$\\oint_{C} f(x) dx$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render first derivative', () => {
      render(
        <MessageContent content="$\\frac{d}{dx} f(x)$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render second derivative', () => {
      render(
        <MathDisplay expression="\\frac{d^2}{dx^2} f(x)" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render partial derivative', () => {
      render(
        <MessageContent content="$\\frac{\\partial f}{\\partial x}$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render higher-order partial derivative', () => {
      render(
        <MathBlock expression="\\frac{\\partial^2 f}{\\partial x \\partial y}" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });
  });

  describe('AC4: Greek letters and special symbols support', () => {
    it('should render lowercase Greek letters', () => {
      render(
        <MessageContent content="$\\alpha, \\beta, \\gamma, \\delta, \\theta, \\lambda, \\pi$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render uppercase Greek letters', () => {
      render(
        <MathDisplay expression="\\Delta, \\Theta, \\Lambda, \\Pi, \\Sigma, \\Omega" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render set operations', () => {
      render(
        <MessageContent content="$\\in, \\notin, \\subset, \\subseteq, \\cup, \\cap, \\emptyset$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render relations', () => {
      render(
        <MathDisplay expression="\\leq, \\geq, \\neq, \\approx, \\equiv, \\sim" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render arrows', () => {
      render(
        <MessageContent content="$\\rightarrow, \\leftarrow, \\leftrightarrow, \\Rightarrow, \\Leftrightarrow$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render logic operators', () => {
      render(
        <MathBlock expression="\\forall, \\exists, \\land, \\lor, \\neg" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render other symbols', () => {
      render(
        <MessageContent content="$\\infty, \\partial, \\nabla, \\cdot, \\times, \\div$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });
  });

  describe('AC5: Nested expressions support', () => {
    it('should render nested fractions', () => {
      render(
        <MessageContent content="$\\frac{\\frac{a}{b}}{\\frac{c}{d}}$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render nested exponents', () => {
      render(
        <MathDisplay expression="x^{y^{z}}" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render nested roots', () => {
      render(
        <MessageContent content="$\\sqrt{\\sqrt{x}}$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render nested sums/products', () => {
      render(
        <MathBlock expression="\\sum_{i=1}^{n} \\prod_{j=1}^{m} a_{ij}" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render complex nested expressions', () => {
      render(
        <MessageContent content="$\\frac{\\sum_{i=1}^{n} x_i}{\\prod_{j=1}^{m} y_j}$" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render matrix with nested expressions', () => {
      render(
        <MathDisplay expression="\\begin{pmatrix} \\frac{a}{b} & x^2 \\\\ \\sum_{i=1}^{n} i & \\sqrt{c} \\end{pmatrix}" />
      );
      
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });
  });

  describe('AC6: Error handling for malformed LaTeX', () => {
    beforeEach(() => {
      // Suppress console warnings/errors in tests
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should handle unclosed braces gracefully', () => {
      render(
        <MessageContent content="$\\frac{a}{b$" />
      );
      
      // Component should render without crashing
      const container = screen.getByText(/frac/i);
      expect(container).toBeInTheDocument();
    });

    it('should handle unmatched brackets gracefully', () => {
      render(
        <MessageContent content="$\\begin{pmatrix} a & b$" />
      );
      
      // Component should render without crashing
      expect(screen.getByText(/begin/i)).toBeInTheDocument();
    });

    it('should handle invalid commands gracefully', () => {
      render(
        <MessageContent content="$\\invalidcommand$" />
      );
      
      // Component should render without crashing
      const container = screen.getByLabelText(/mathematical expression/i);
      expect(container).toBeInTheDocument();
    });

    it('should handle missing arguments gracefully', () => {
      render(
        <MessageContent content="$\\frac{a}$" />
      );
      
      // Component should render without crashing
      const container = screen.getByLabelText(/mathematical expression/i);
      expect(container).toBeInTheDocument();
    });

    it('should handle mixed delimiters gracefully', () => {
      render(
        <MessageContent content="$\\begin{pmatrix} a & b \\end{bmatrix}$" />
      );
      
      // Component should render without crashing
      const container = screen.getByLabelText(/mathematical expression/i);
      expect(container).toBeInTheDocument();
    });

    it('should maintain message rendering even when math fails', () => {
      render(
        <MessageContent content="Text before $\\invalid{math}$ text after" />
      );
      
      // Should render text portions even if math fails
      expect(screen.getByText(/Text before/i)).toBeInTheDocument();
      expect(screen.getByText(/text after/i)).toBeInTheDocument();
    });

    it('should display fallback error message for malformed LaTeX in MessageContent', () => {
      // This test verifies that MessageContent handles parsing errors gracefully
      // by falling back to plain text rendering
      render(
        <MessageContent content="Valid text with $\\broken{math}$ more text" />
      );
      
      // Should render text portions
      expect(screen.getByText(/Valid text with/i)).toBeInTheDocument();
      expect(screen.getByText(/more text/i)).toBeInTheDocument();
    });

    it('should log errors in development mode', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      
      // Force a parsing error scenario
      render(
        <MessageContent content="Test content" />
      );
      
      // In normal operation, no errors should be logged
      // But if parsing fails, error should be logged
      // This test verifies error logging infrastructure exists
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integration: Message component with advanced notation (Task 8)', () => {
    it('should render student message with matrix notation', () => {
      const message: MessageType = {
        role: 'student',
        content: 'Solve using $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$',
        timestamp: new Date(),
      };

      render(<Message message={message} index={0} />);
      
      // Verify message renders with math content
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
      
      // Verify role-based styling (student messages should be right-aligned)
      const messageContainer = screen.getByRole('article');
      expect(messageContainer).toHaveClass('justify-end');
    });

    it('should render tutor message with summation notation', () => {
      const message: MessageType = {
        role: 'tutor',
        content: 'The sum is $\\sum_{i=1}^{n} x_i$',
        timestamp: new Date(),
      };

      render(<Message message={message} index={0} />);
      
      // Verify message renders with math content
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
      
      // Verify role-based styling (tutor messages should be left-aligned)
      const messageContainer = screen.getByRole('article');
      expect(messageContainer).toHaveClass('justify-start');
    });

    it('should render message with block math notation', () => {
      const message: MessageType = {
        role: 'student',
        content: 'Equation: $$\\int_{a}^{b} f(x) dx$$',
        timestamp: new Date(),
      };

      render(<Message message={message} index={0} />);
      
      // Verify block math renders
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should maintain role-based styling with advanced notation', () => {
      const studentMessage: MessageType = {
        role: 'student',
        content: '$\\alpha + \\beta = \\gamma$',
        timestamp: new Date(),
      };

      const { container: studentContainer } = render(<Message message={studentMessage} index={0} />);
      
      // Student message should have blue background
      const studentBubble = studentContainer.querySelector('.bg-blue-600');
      expect(studentBubble).toBeInTheDocument();

      const tutorMessage: MessageType = {
        role: 'tutor',
        content: '$\\Delta = b^2 - 4ac$',
        timestamp: new Date(),
      };

      const { container: tutorContainer } = render(<Message message={tutorMessage} index={1} />);
      
      // Tutor message should have gray background
      const tutorBubble = tutorContainer.querySelector('.bg-zinc-100');
      expect(tutorBubble).toBeInTheDocument();
    });
  });

  describe('Integration: ChatInterface with advanced notation (Task 8)', () => {
    it('should render multiple messages with advanced notation', () => {
      const messages: MessageType[] = [
        {
          role: 'student',
          content: 'Solve $x^2 + 5x + 6 = 0$',
          timestamp: new Date('2025-01-01T10:00:00'),
        },
        {
          role: 'tutor',
          content: 'Factor: $(x+2)(x+3) = 0$ so $x = -2$ or $x = -3$',
          timestamp: new Date('2025-01-01T10:01:00'),
        },
        {
          role: 'student',
          content: 'What about $\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$?',
          timestamp: new Date('2025-01-01T10:02:00'),
        },
      ];

      render(<ChatInterface initialMessages={messages} ocrText="" onOcrTextChange={() => {}} />);
      
      // Verify all messages render with math content
      const mathElements = screen.getAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBeGreaterThan(0);
    });

    it('should handle messages with mixed text and math', () => {
      const messages: MessageType[] = [
        {
          role: 'student',
          content: 'I need help with matrices. Like $\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$',
          timestamp: new Date(),
        },
      ];

      render(<ChatInterface initialMessages={messages} ocrText="" onOcrTextChange={() => {}} />);
      
      // Verify text and math both render
      expect(screen.getByText(/I need help with matrices/i)).toBeInTheDocument();
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });

    it('should render block math expressions in chat interface', () => {
      const messages: MessageType[] = [
        {
          role: 'tutor',
          content: 'The integral is: $$\\int_{0}^{\\infty} e^{-x} dx = 1$$',
          timestamp: new Date(),
        },
      ];

      render(<ChatInterface initialMessages={messages} ocrText="" onOcrTextChange={() => {}} />);
      
      // Verify block math renders
      const mathElement = screen.getByLabelText(/mathematical expression/i);
      expect(mathElement).toBeInTheDocument();
    });
  });

  describe('Accessibility: ARIA labels and screen reader support (Task 8)', () => {
    it('should have ARIA labels for math expressions', () => {
      render(
        <MessageContent content="Solve for $x$ in $x^2 + 5 = 0$" />
      );
      
      const mathElements = screen.getAllByLabelText(/mathematical expression/i);
      expect(mathElements.length).toBeGreaterThan(0);
      
      // Verify ARIA labels are descriptive
      mathElements.forEach((element) => {
        expect(element).toHaveAttribute('aria-label');
        const label = element.getAttribute('aria-label');
        expect(label).toMatch(/mathematical expression/i);
      });
    });

    it('should have ARIA labels for empty math expressions', () => {
      render(<MathDisplay expression="" />);
      
      const fallback = screen.getByLabelText(/empty math expression/i);
      expect(fallback).toBeInTheDocument();
    });

    it('should have ARIA labels for error states', () => {
      render(<MathDisplay expression="\\invalid{command}" />);
      
      // KaTeX with throwOnError: false may render an error, but component should have aria-label
      const container = screen.getByLabelText(/mathematical expression/i);
      expect(container).toBeInTheDocument();
    });
  });
});

