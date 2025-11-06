import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Whiteboard from "@/components/whiteboard/Whiteboard";

describe("Whiteboard Component", () => {
  it("renders whiteboard with toolbar and canvas", () => {
    render(<Whiteboard visible={true} />);
    
    // Check that toolbar is rendered
    const toolbar = screen.getByRole("toolbar", { name: /whiteboard drawing tools/i });
    expect(toolbar).toBeInTheDocument();
    
    // Check that canvas region is rendered
    const canvasRegion = screen.getByRole("region", { name: /interactive whiteboard/i });
    expect(canvasRegion).toBeInTheDocument();
  });

  it("does not render when visible is false", () => {
    const { container } = render(<Whiteboard visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("applies custom aria label", () => {
    render(<Whiteboard visible={true} ariaLabel="Custom whiteboard label" />);
    
    const canvasRegion = screen.getByRole("region", { name: /custom whiteboard label/i });
    expect(canvasRegion).toBeInTheDocument();
  });
});


