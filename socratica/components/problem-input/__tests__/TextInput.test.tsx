import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TextInput from "../TextInput";

// Mock MathPreview component
vi.mock("@/components/math-renderer/MathPreview", () => ({
  default: ({ value }: { value: string }) => {
    if (!value || !value.includes("$")) {
      return null;
    }
    return <div data-testid="math-preview">Preview: {value}</div>;
  },
}));

describe("TextInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render textarea input", () => {
    render(<TextInput />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should render with placeholder", () => {
    render(<TextInput placeholder="Custom placeholder" />);
    expect(screen.getByPlaceholderText("Custom placeholder")).toBeInTheDocument();
  });

  it("should render submit button", () => {
    render(<TextInput />);
    expect(screen.getByRole("button", { name: /submit problem/i })).toBeInTheDocument();
  });

  it("should update input value when user types", () => {
    render(<TextInput />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    
    fireEvent.change(textarea, { target: { value: "Test input" } });
    
    expect(textarea.value).toBe("Test input");
  });

  it("should display math preview when LaTeX syntax is detected", async () => {
    render(<TextInput />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    
    fireEvent.change(textarea, { target: { value: "Solve for $x$" } });
    
    await waitFor(() => {
      expect(screen.getByTestId("math-preview")).toBeInTheDocument();
    });
  });

  it("should not display math preview for plain text", () => {
    render(<TextInput />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    
    fireEvent.change(textarea, { target: { value: "Plain text" } });
    
    expect(screen.queryByTestId("math-preview")).not.toBeInTheDocument();
  });

  it("should call onSubmit when form is submitted", async () => {
    const onSubmit = vi.fn();
    render(<TextInput onSubmit={onSubmit} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    const submitButton = screen.getByRole("button", { name: /submit problem/i });
    
    fireEvent.change(textarea, { target: { value: "Test problem" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("Test problem");
    });
  });

  it("should validate input before submission", async () => {
    const onSubmit = vi.fn();
    render(<TextInput onSubmit={onSubmit} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    const submitButton = screen.getByRole("button", { name: /submit problem/i });
    
    // Submit empty input
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("should display validation error", async () => {
    render(<TextInput />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    const submitButton = screen.getByRole("button", { name: /submit problem/i });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(textarea).toHaveAttribute("aria-invalid", "true");
    });
  });

  it("should clear validation error when user types", async () => {
    render(<TextInput />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    const submitButton = screen.getByRole("button", { name: /submit problem/i });
    
    // Trigger validation error
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    
    // User starts typing
    fireEvent.change(textarea, { target: { value: "Valid input" } });
    
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(textarea).toHaveAttribute("aria-invalid", "false");
    });
  });

  it("should clear input after successful submission", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TextInput onSubmit={onSubmit} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    const submitButton = screen.getByRole("button", { name: /submit problem/i });
    
    fireEvent.change(textarea, { target: { value: "Test problem" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(textarea.value).toBe("");
    });
  });

  it("should handle external value prop", () => {
    render(<TextInput value="External value" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    
    expect(textarea.value).toBe("External value");
  });

  it("should update when external value changes", () => {
    const { rerender } = render(<TextInput value="Initial" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    
    expect(textarea.value).toBe("Initial");
    
    rerender(<TextInput value="Updated" />);
    
    expect(textarea.value).toBe("Updated");
  });

  it("should call onValueChange when input changes", () => {
    const onValueChange = vi.fn();
    render(<TextInput onValueChange={onValueChange} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    
    fireEvent.change(textarea, { target: { value: "New value" } });
    
    expect(onValueChange).toHaveBeenCalledWith("New value");
  });

  it("should disable input when submitting", async () => {
    const onSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<TextInput onSubmit={onSubmit} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    const submitButton = screen.getByRole("button", { name: /submit problem/i });
    
    fireEvent.change(textarea, { target: { value: "Test problem" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(textarea).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  it("should have proper accessibility attributes", () => {
    render(<TextInput />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    
    expect(textarea).toHaveAttribute("aria-label", "Math problem input field");
    expect(textarea).toHaveAttribute("aria-required", "true");
    expect(textarea).toHaveAttribute("aria-describedby", "problem-input-description");
  });

  it("should submit on Enter key press", async () => {
    const onSubmit = vi.fn();
    render(<TextInput onSubmit={onSubmit} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    
    fireEvent.change(textarea, { target: { value: "Test problem" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("Test problem");
    });
  });

  it("should not submit on Shift+Enter (new line)", () => {
    const onSubmit = vi.fn();
    render(<TextInput onSubmit={onSubmit} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    
    fireEvent.change(textarea, { target: { value: "Test problem" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should maintain responsive layout for preview", async () => {
    const { container } = render(<TextInput />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    
    fireEvent.change(textarea, { target: { value: "Solve for $x$" } });
    
    await waitFor(() => {
      const previewContainer = container.querySelector(".flex.flex-col.gap-3.sm\\:flex-row");
      expect(previewContainer).toBeInTheDocument();
    });
  });
});


