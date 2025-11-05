import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import SuccessMessage from "../SuccessMessage";

describe("SuccessMessage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render success message", () => {
    render(<SuccessMessage message="Success!" />);
    expect(screen.getByText("Success!")).toBeInTheDocument();
  });

  it("should have correct ARIA attributes", () => {
    render(<SuccessMessage message="Success message" />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-label", "Success message");
  });

  it("should auto-dismiss after default duration (3000ms)", () => {
    const onDismiss = vi.fn();
    const { unmount } = render(<SuccessMessage message="Success!" onDismiss={onDismiss} />);
    
    expect(screen.getByText("Success!")).toBeInTheDocument();
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(screen.queryByText("Success!")).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    
    unmount();
  });

  it("should auto-dismiss after custom duration", () => {
    const onDismiss = vi.fn();
    const { unmount } = render(<SuccessMessage message="Success!" duration={2000} onDismiss={onDismiss} />);
    
    expect(screen.getByText("Success!")).toBeInTheDocument();
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    expect(screen.queryByText("Success!")).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    
    unmount();
  });

  it("should not auto-dismiss when duration is 0", () => {
    const onDismiss = vi.fn();
    render(<SuccessMessage message="Success!" duration={0} onDismiss={onDismiss} />);
    
    expect(screen.getByText("Success!")).toBeInTheDocument();
    
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    
    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("should use design system colors", () => {
    render(<SuccessMessage message="Success!" />);
    const status = screen.getByRole("status");
    expect(status).toHaveClass("border-[var(--accent-success-300)]", "bg-[var(--accent-success-50)]");
  });

  it("should apply custom className", () => {
    render(<SuccessMessage message="Success!" className="custom-class" />);
    const status = screen.getByRole("status");
    expect(status).toHaveClass("custom-class");
  });

  it("should have smooth transition", () => {
    render(<SuccessMessage message="Success!" />);
    const status = screen.getByRole("status");
    expect(status).toHaveClass("transition-opacity", "duration-300");
  });
});

