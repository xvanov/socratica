import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  it("should render with default props", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Loading...");
  });

  it("should render with custom label", () => {
    render(<LoadingSpinner label="Processing..." />);
    expect(screen.getByText("Processing...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Processing...");
  });

  it("should render with custom aria-label", () => {
    render(<LoadingSpinner aria-label="Custom loading label" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Custom loading label");
  });

  it("should render small size", () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole("status");
    const spinnerElement = spinner.querySelector("div[aria-hidden='true']");
    expect(spinnerElement).toHaveClass("h-4", "w-4", "border-2");
  });

  it("should render medium size (default)", () => {
    render(<LoadingSpinner size="md" />);
    const spinner = screen.getByRole("status");
    const spinnerElement = spinner.querySelector("div[aria-hidden='true']");
    expect(spinnerElement).toHaveClass("h-8", "w-8", "border-4");
  });

  it("should render large size", () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole("status");
    const spinnerElement = spinner.querySelector("div[aria-hidden='true']");
    expect(spinnerElement).toHaveClass("h-12", "w-12", "border-4");
  });

  it("should have correct ARIA attributes", () => {
    render(<LoadingSpinner label="Loading data" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveAttribute("aria-live", "polite");
    expect(spinner).toHaveAttribute("aria-label", "Loading data");
  });

  it("should use design system colors", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status");
    const spinnerElement = spinner.querySelector("div[aria-hidden='true']");
    expect(spinnerElement).toHaveClass("border-[var(--neutral-300)]", "border-t-[var(--primary-600)]");
  });

  it("should apply custom className", () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("custom-class");
  });

  it("should not render label when not provided", () => {
    render(<LoadingSpinner />);
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});

