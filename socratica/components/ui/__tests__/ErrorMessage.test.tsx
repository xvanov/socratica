import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorMessage from "../ErrorMessage";

describe("ErrorMessage", () => {
  it("should render error message", () => {
    render(<ErrorMessage message="An error occurred" />);
    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });

  it("should have correct ARIA attributes", () => {
    render(<ErrorMessage message="Error message" />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveAttribute("aria-label", "Error message");
  });

  it("should render retry button when onRetry provided", () => {
    const handleRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={handleRetry} />);
    const retryButton = screen.getByText("Retry");
    expect(retryButton).toBeInTheDocument();
  });

  it("should not render retry button when onRetry not provided", () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.queryByText("Retry")).not.toBeInTheDocument();
  });

  it("should call onRetry when retry button clicked", async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={handleRetry} />);
    const retryButton = screen.getByText("Retry");
    await user.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("should render custom retry label", () => {
    const handleRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={handleRetry} retryLabel="Try again" />);
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("should use design system colors", () => {
    render(<ErrorMessage message="Error" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("border-[var(--error-300)]", "bg-[var(--error-50)]");
  });

  it("should apply custom className", () => {
    render(<ErrorMessage message="Error" className="custom-class" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("custom-class");
  });

  it("should have accessible retry button", () => {
    const handleRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={handleRetry} retryLabel="Retry" />);
    const retryButton = screen.getByText("Retry");
    expect(retryButton).toHaveAttribute("aria-label", "Retry sending message");
    expect(retryButton).toHaveClass("min-h-[44px]");
  });
});

