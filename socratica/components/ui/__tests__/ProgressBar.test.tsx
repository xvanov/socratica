import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressBar from "../ProgressBar";

describe("ProgressBar", () => {
  it("should render progress bar", () => {
    render(<ProgressBar progress={50} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("should clamp progress to 0-100 range", () => {
    const { rerender } = render(<ProgressBar progress={150} />);
    let progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "100");

    rerender(<ProgressBar progress={-10} />);
    progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
  });

  it("should render with label", () => {
    render(<ProgressBar progress={75} label="Upload progress" />);
    expect(screen.getByText("Upload progress")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("should show percentage when label provided", () => {
    render(<ProgressBar progress={45} label="Processing" />);
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("should not show label when not provided", () => {
    render(<ProgressBar progress={50} />);
    expect(screen.queryByText("50%")).not.toBeInTheDocument();
  });

  it("should have correct ARIA label", () => {
    render(<ProgressBar progress={60} label="Upload" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-label", "Upload: 60%");
  });

  it("should have correct ARIA label without custom label", () => {
    render(<ProgressBar progress={60} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-label", "60% complete");
  });

  it("should use design system colors", () => {
    render(<ProgressBar progress={50} />);
    const progressbar = screen.getByRole("progressbar");
    const fill = progressbar.querySelector("div");
    expect(fill).toHaveClass("bg-[var(--primary-600)]");
  });

  it("should have smooth transition", () => {
    render(<ProgressBar progress={50} />);
    const progressbar = screen.getByRole("progressbar");
    const fill = progressbar.querySelector("div");
    expect(fill).toHaveClass("transition-all", "duration-300", "ease-out");
  });

  it("should apply custom className", () => {
    render(<ProgressBar progress={50} className="custom-class" />);
    const container = screen.getByRole("progressbar").parentElement;
    expect(container).toHaveClass("custom-class");
  });
});



