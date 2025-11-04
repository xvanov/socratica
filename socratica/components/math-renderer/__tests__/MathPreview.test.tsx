import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MathPreview from "../MathPreview";

// Mock the MathDisplay and MathBlock components
vi.mock("../MathDisplay", () => ({
  default: ({ expression }: { expression: string }) => (
    <span data-testid="math-display">{expression}</span>
  ),
}));

vi.mock("../MathBlock", () => ({
  default: ({ expression }: { expression: string }) => (
    <div data-testid="math-block">{expression}</div>
  ),
}));

describe("MathPreview", () => {
  it("should not render for plain text without LaTeX", () => {
    const { container } = render(<MathPreview value="Plain text" />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render for empty value", () => {
    const { container } = render(<MathPreview value="" />);
    expect(container.firstChild).toBeNull();
  });

  it("should render inline math expression", async () => {
    render(<MathPreview value="Solve for $x$" />);
    
    await waitFor(
      () => {
        expect(screen.getByTestId("math-display")).toBeInTheDocument();
        expect(screen.getByTestId("math-display")).toHaveTextContent("x");
      },
      { timeout: 2000 }
    );
  });

  it("should render block math expression", async () => {
    render(<MathPreview value="Equation: $$x^2 + 5 = 0$$" />);
    
    await waitFor(
      () => {
        expect(screen.getByTestId("math-block")).toBeInTheDocument();
        expect(screen.getByTestId("math-block")).toHaveTextContent("x^2 + 5 = 0");
      },
      { timeout: 2000 }
    );
  });

  it("should render mixed text and math", async () => {
    render(<MathPreview value="Find $x$ when $y = 5$" />);
    
    await waitFor(
      () => {
        const displays = screen.getAllByTestId("math-display");
        expect(displays).toHaveLength(2);
        expect(displays[0]).toHaveTextContent("x");
        expect(displays[1]).toHaveTextContent("y = 5");
      },
      { timeout: 2000 }
    );
  });

  it("should render text content between math expressions", async () => {
    render(<MathPreview value="Find $x$ when $y = 5$" />);
    
    await waitFor(
      () => {
        const container = screen.getByRole("region", { name: "Math preview" });
        expect(container).toHaveTextContent("Find");
        expect(container).toHaveTextContent("when");
      },
      { timeout: 2000 }
    );
  });

  it("should handle multiple math expressions", async () => {
    render(<MathPreview value="$x$ $y$ $z$" />);
    
    await waitFor(
      () => {
        const displays = screen.getAllByTestId("math-display");
        expect(displays).toHaveLength(3);
      },
      { timeout: 2000 }
    );
  });

  it("should not render for escaped dollar signs", () => {
    const { container } = render(<MathPreview value="Price is \\$10" />);
    expect(container.firstChild).toBeNull();
  });

  it("should have proper ARIA attributes", async () => {
    render(<MathPreview value="Solve for $x$" />);
    
    await waitFor(
      () => {
        const region = screen.getByRole("region", { name: "Math preview" });
        expect(region).toHaveAttribute("aria-live", "polite");
        expect(region).toHaveAttribute("aria-atomic", "false");
      },
      { timeout: 2000 }
    );
  });

  it("should debounce updates", async () => {
    const { rerender } = render(<MathPreview value="Solve for $x$" />);
    
    await waitFor(
      () => {
        expect(screen.getByTestId("math-display")).toHaveTextContent("x");
      },
      { timeout: 2000 }
    );
    
    // Update value immediately
    rerender(<MathPreview value="Solve for $y$" />);
    
    // Should still show old value briefly
    expect(screen.getByTestId("math-display")).toHaveTextContent("x");
    
    // Wait for debounce delay
    await waitFor(
      () => {
        expect(screen.getByTestId("math-display")).toHaveTextContent("y");
      },
      { timeout: 1000 }
    );
  });

  it("should update immediately on first render", async () => {
    render(<MathPreview value="Solve for $x$" />);
    
    await waitFor(
      () => {
        expect(screen.getByTestId("math-display")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should clear preview when value is cleared", async () => {
    const { rerender, container } = render(<MathPreview value="Solve for $x$" />);
    
    await waitFor(
      () => {
        expect(screen.getByTestId("math-display")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
    
    rerender(<MathPreview value="" />);
    
    await waitFor(
      () => {
        expect(container.firstChild).toBeNull();
      },
      { timeout: 1000 }
    );
  });

  it("should handle both inline and block math", async () => {
    render(<MathPreview value="Inline: $x$ and block: $$y^2$$" />);
    
    await waitFor(
      () => {
        expect(screen.getByTestId("math-display")).toBeInTheDocument();
        expect(screen.getByTestId("math-block")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should apply className prop", async () => {
    const { container } = render(
      <MathPreview value="Solve for $x$" className="custom-class" />
    );
    
    await waitFor(
      () => {
        const region = container.querySelector(".custom-class");
        expect(region).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  describe("Common algebra notation support", () => {
    it("should render variables", async () => {
      render(<MathPreview value="Variables: $x$, $y$, $a$, $b$" />);
      
      await waitFor(
        () => {
          const displays = screen.getAllByTestId("math-display");
          expect(displays).toHaveLength(4);
          expect(displays[0]).toHaveTextContent("x");
          expect(displays[1]).toHaveTextContent("y");
          expect(displays[2]).toHaveTextContent("a");
          expect(displays[3]).toHaveTextContent("b");
        },
        { timeout: 2000 }
      );
    });

    it("should render exponents", async () => {
      render(<MathPreview value="Exponents: $x^2$, $x^{n+1}$, $2^{x+y}$" />);
      
      await waitFor(
        () => {
          const displays = screen.getAllByTestId("math-display");
          expect(displays).toHaveLength(3);
          expect(displays[0]).toHaveTextContent("x^2");
          expect(displays[1]).toHaveTextContent("x^{n+1}");
          expect(displays[2]).toHaveTextContent("2^{x+y}");
        },
        { timeout: 2000 }
      );
    });

    it("should render fractions", async () => {
      render(<MathPreview value="Fractions: $\\frac{a}{b}$, $\\frac{x+1}{y-2}$, $\\frac{2x+3}{5}$" />);
      
      await waitFor(
        () => {
          const displays = screen.getAllByTestId("math-display");
          expect(displays).toHaveLength(3);
          expect(displays[0]).toHaveTextContent("\\frac{a}{b}");
          expect(displays[1]).toHaveTextContent("\\frac{x+1}{y-2}");
          expect(displays[2]).toHaveTextContent("\\frac{2x+3}{5}");
        },
        { timeout: 2000 }
      );
    });

    it("should render basic operations", async () => {
      render(<MathPreview value="Operations: $x + y$, $x - y$, $x \\cdot y$, $\\frac{x}{y}$" />);
      
      await waitFor(
        () => {
          const displays = screen.getAllByTestId("math-display");
          expect(displays).toHaveLength(4);
          expect(displays[0]).toHaveTextContent("x + y");
          expect(displays[1]).toHaveTextContent("x - y");
          // Note: The mock displays the expression as-is, which includes escaped backslashes
          expect(displays[2]).toHaveTextContent("x \\\\cdot y");
          expect(displays[3]).toHaveTextContent("\\\\frac{x}{y}");
        },
        { timeout: 2000 }
      );
    });

    it("should render subscripts", async () => {
      render(<MathPreview value="Subscripts: $x_1$, $x_{i+1}$" />);
      
      await waitFor(
        () => {
          const displays = screen.getAllByTestId("math-display");
          expect(displays).toHaveLength(2);
          expect(displays[0]).toHaveTextContent("x_1");
          expect(displays[1]).toHaveTextContent("x_{i+1}");
        },
        { timeout: 2000 }
      );
    });

    it("should render superscripts", async () => {
      render(<MathPreview value="Superscripts: $x^2$, $x^{n+1}$" />);
      
      await waitFor(
        () => {
          const displays = screen.getAllByTestId("math-display");
          expect(displays).toHaveLength(2);
          expect(displays[0]).toHaveTextContent("x^2");
          expect(displays[1]).toHaveTextContent("x^{n+1}");
        },
        { timeout: 2000 }
      );
    });

    it("should render parentheses", async () => {
      render(<MathPreview value="Parentheses: $(x + y)$, $[x + y]$, $\\{x + y\\}$" />);
      
      await waitFor(
        () => {
          const displays = screen.getAllByTestId("math-display");
          expect(displays).toHaveLength(3);
          expect(displays[0]).toHaveTextContent("(x + y)");
          expect(displays[1]).toHaveTextContent("[x + y]");
          // Note: The mock displays the expression as-is, which includes escaped backslashes
          expect(displays[2]).toHaveTextContent("\\\\{x + y\\\\}");
        },
        { timeout: 2000 }
      );
    });

    it("should render block math expressions", async () => {
      render(<MathPreview value="Block: $$\\frac{a}{b}$$ and $$\\sum_{i=1}^{n} x_i$$" />);
      
      await waitFor(
        () => {
          const blocks = screen.getAllByTestId("math-block");
          expect(blocks).toHaveLength(2);
          expect(blocks[0]).toHaveTextContent("\\frac{a}{b}");
          expect(blocks[1]).toHaveTextContent("\\sum_{i=1}^{n} x_i");
        },
        { timeout: 2000 }
      );
    });

    it("should render mixed text and math with common notation", async () => {
      render(<MathPreview value="Solve for $x$ in $x^2 + \\frac{a}{b} = 0$" />);
      
      await waitFor(
        () => {
          const displays = screen.getAllByTestId("math-display");
          expect(displays).toHaveLength(2);
          expect(displays[0]).toHaveTextContent("x");
          // Note: The mock displays the expression as-is, which includes escaped backslashes
          expect(displays[1]).toHaveTextContent("x^2 + \\\\frac{a}{b} = 0");
        },
        { timeout: 2000 }
      );
    });
  });
});

