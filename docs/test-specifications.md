# Socratica - Test Specifications

**Author:** xvanov  
**Date:** 2025-11-03  
**Approach:** Test-Driven Development (TDD)  
**Purpose:** Detailed test specifications for each story

---

## Test Strategy Overview

### Test Pyramid

```
        /\
       /E2E\         ← Few, high-level user flows (10%)
      /------\
     /  INT  \       ← API routes, LLM integration (20%)
    /--------\
   / COMPONENT\      ← React components, UI interactions (30%)
  /-----------\
 /   UNIT      \     ← Business logic, utilities (40%)
/--------------\
```

### Test Principles

1. **Tests Verify Acceptance Criteria**: Each acceptance criterion has at least one test
2. **Tests Are Meaningful**: Tests verify actual functionality, not implementation details
3. **Tests Are Simple**: Easy to understand and maintain
4. **Tests Are Fast**: Unit tests < 1s, E2E tests < 30s
5. **Tests Are Independent**: No shared state between tests

### Test Categories

- **Unit Tests**: Fast, isolated, test single functions/components
- **Component Tests**: Test React components in isolation
- **Integration Tests**: Test API routes and external services
- **E2E Tests**: Test complete user flows in browser

---

## Phase 1 Test Specifications

### Epic 1: Problem Input

#### Story 1.1: Text Input Interface

**Acceptance Criteria:**
1. Text input field is visible and accessible
2. Input field accepts multi-line text for complex problems
3. Input field has placeholder text that guides students
4. Submit button or Enter key sends the problem text
5. Input field clears after submission

**Test Specifications:**

**Unit Tests:**
```typescript
// File: tests/components/ProblemInput.test.tsx

describe('Story 1.1: Text Input Interface', () => {
  describe('Acceptance Criterion 1: Text input field is visible and accessible', () => {
    test('should display text input field', () => {
      render(<ProblemInput />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });
    
    test('should have accessible label', () => {
      render(<ProblemInput />);
      expect(screen.getByLabelText(/problem input|enter your problem/i)).toBeInTheDocument();
    });
    
    test('should be keyboard navigable', async () => {
      const { user } = render(<ProblemInput />);
      await user.tab();
      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });
  });
  
  describe('Acceptance Criterion 2: Input field accepts multi-line text', () => {
    test('should accept multi-line text input', async () => {
      const { user } = render(<ProblemInput />);
      const input = screen.getByRole('textbox');
      const multiLineText = 'Solve for x:\n2x + 5 = 13\nShow your work.';
      await user.type(input, multiLineText);
      expect(input).toHaveValue(multiLineText);
    });
    
    test('should preserve line breaks', async () => {
      const { user } = render(<ProblemInput />);
      const input = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.type(input, 'Line 1{Enter}Line 2');
      expect(input.value).toContain('\n');
    });
  });
  
  describe('Acceptance Criterion 3: Input field has placeholder text', () => {
    test('should display placeholder text', () => {
      render(<ProblemInput />);
      expect(screen.getByPlaceholderText(/enter your math problem|type your problem/i)).toBeInTheDocument();
    });
    
    test('placeholder text should be helpful', () => {
      render(<ProblemInput />);
      const placeholder = screen.getByPlaceholderText(/enter|type/i);
      expect(placeholder).toHaveAttribute('placeholder');
      expect(placeholder.getAttribute('placeholder')).toMatch(/problem|equation|math/i);
    });
  });
  
  describe('Acceptance Criterion 4: Submit button or Enter key sends problem', () => {
    test('should submit when button is clicked', async () => {
      const onSubmit = vi.fn();
      const { user } = render(<ProblemInput onSubmit={onSubmit} />);
      const input = screen.getByRole('textbox');
      await user.type(input, '2x + 5 = 13');
      await user.click(screen.getByRole('button', { name: /submit|send/i }));
      expect(onSubmit).toHaveBeenCalledWith('2x + 5 = 13');
    });
    
    test('should submit when Enter key is pressed', async () => {
      const onSubmit = vi.fn();
      const { user } = render(<ProblemInput onSubmit={onSubmit} />);
      const input = screen.getByRole('textbox');
      await user.type(input, '2x + 5 = 13');
      await user.keyboard('{Enter}');
      expect(onSubmit).toHaveBeenCalledWith('2x + 5 = 13');
    });
    
    test('should NOT submit on Shift+Enter (new line)', async () => {
      const onSubmit = vi.fn();
      const { user } = render(<ProblemInput onSubmit={onSubmit} />);
      const input = screen.getByRole('textbox');
      await user.type(input, '2x + 5 = 13');
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      expect(onSubmit).not.toHaveBeenCalled();
      expect(input).toHaveValue('2x + 5 = 13\n');
    });
    
    test('should disable submit button while processing', async () => {
      const onSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      const { user } = render(<ProblemInput onSubmit={onSubmit} />);
      const submitButton = screen.getByRole('button', { name: /submit|send/i });
      const input = screen.getByRole('textbox');
      await user.type(input, '2x + 5 = 13');
      await user.click(submitButton);
      expect(submitButton).toBeDisabled();
    });
  });
  
  describe('Acceptance Criterion 5: Input field clears after submission', () => {
    test('should clear input after successful submission', async () => {
      const onSubmit = vi.fn();
      const { user } = render(<ProblemInput onSubmit={onSubmit} />);
      const input = screen.getByRole('textbox');
      await user.type(input, '2x + 5 = 13');
      await user.keyboard('{Enter}');
      expect(input).toHaveValue('');
    });
    
    test('should clear input after button submission', async () => {
      const onSubmit = vi.fn();
      const { user } = render(<ProblemInput onSubmit={onSubmit} />);
      const input = screen.getByRole('textbox');
      await user.type(input, '2x + 5 = 13');
      await user.click(screen.getByRole('button', { name: /submit|send/i }));
      expect(input).toHaveValue('');
    });
  });
  
  describe('Additional Quality Tests', () => {
    test('should handle empty input gracefully', async () => {
      const onSubmit = vi.fn();
      const { user } = render(<ProblemInput onSubmit={onSubmit} />);
      await user.click(screen.getByRole('button', { name: /submit|send/i }));
      // Should either prevent submission or show error
      expect(onSubmit).not.toHaveBeenCalled();
    });
    
    test('should handle very long input', async () => {
      const { user } = render(<ProblemInput />);
      const input = screen.getByRole('textbox');
      const longText = 'x'.repeat(10000);
      await user.type(input, longText);
      expect(input).toHaveValue(longText);
    });
  });
});
```

**E2E Tests:**
```typescript
// File: tests/e2e/problem-input.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Story 1.1: Text Input Interface - E2E', () => {
  test('user can type problem and submit', async ({ page }) => {
    await page.goto('/');
    
    // Verify input is visible
    const input = page.locator('textarea[aria-label*="problem"], textarea[placeholder*="problem"]');
    await expect(input).toBeVisible();
    
    // Type problem
    await input.fill('2x + 5 = 13');
    
    // Submit
    await page.click('button:has-text("Submit"), button:has-text("Send")');
    
    // Verify input cleared (or verify submission in chat - depends on Epic 2)
    await expect(input).toHaveValue('');
  });
  
  test('user can submit with Enter key', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('textarea[aria-label*="problem"]');
    await input.fill('2x + 5 = 13');
    await input.press('Enter');
    await expect(input).toHaveValue('');
  });
  
  test('user can type multi-line problem', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('textarea[aria-label*="problem"]');
    await input.fill('Solve for x:\n2x + 5 = 13\nShow your work.');
    await expect(input).toHaveValue('Solve for x:\n2x + 5 = 13\nShow your work.');
  });
  
  test('placeholder text is visible', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('textarea[aria-label*="problem"]');
    await expect(input).toHaveAttribute('placeholder');
    const placeholder = await input.getAttribute('placeholder');
    expect(placeholder).toMatch(/problem|equation|math/i);
  });
});
```

---

#### Story 1.2: Image Upload Interface

**Acceptance Criteria:**
1. Image upload button/file picker is visible on interface
2. Supports common image formats (JPG, PNG, WebP)
3. Image preview displays after selection
4. Image can be removed/cleared before submission
5. File size limits are enforced with user feedback
6. Loading state shows during upload process

**Test Specifications:**

**Unit Tests:**
```typescript
// File: tests/components/ImageUpload.test.tsx

describe('Story 1.2: Image Upload Interface', () => {
  describe('Acceptance Criterion 1: Upload button visible', () => {
    test('should display upload button', () => {
      render(<ImageUpload />);
      expect(screen.getByRole('button', { name: /upload|choose file|select image/i })).toBeInTheDocument();
    });
    
    test('should display file input', () => {
      render(<ImageUpload />);
      const fileInput = screen.getByLabelText(/upload|choose file|select image/i);
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', /image/i);
    });
  });
  
  describe('Acceptance Criterion 2: Supports image formats', () => {
    test('should accept JPG files', async () => {
      const { user } = render(<ImageUpload />);
      const fileInput = screen.getByLabelText(/upload|choose file/i);
      const file = new File(['fake jpg'], 'test.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput, file);
      expect(fileInput.files?.[0]).toBe(file);
    });
    
    test('should accept PNG files', async () => {
      const { user } = render(<ImageUpload />);
      const fileInput = screen.getByLabelText(/upload|choose file/i);
      const file = new File(['fake png'], 'test.png', { type: 'image/png' });
      await user.upload(fileInput, file);
      expect(fileInput.files?.[0]).toBe(file);
    });
    
    test('should accept WebP files', async () => {
      const { user } = render(<ImageUpload />);
      const fileInput = screen.getByLabelText(/upload|choose file/i);
      const file = new File(['fake webp'], 'test.webp', { type: 'image/webp' });
      await user.upload(fileInput, file);
      expect(fileInput.files?.[0]).toBe(file);
    });
    
    test('should reject non-image files', async () => {
      const { user } = render(<ImageUpload />);
      const fileInput = screen.getByLabelText(/upload|choose file/i);
      const file = new File(['not an image'], 'test.txt', { type: 'text/plain' });
      
      // Mock file input behavior - browser will reject non-image
      await expect(async () => {
        await user.upload(fileInput, file);
      }).rejects.toThrow();
    });
  });
  
  describe('Acceptance Criterion 3: Image preview displays', () => {
    test('should display preview after image selection', async () => {
      const { user } = render(<ImageUpload />);
      const fileInput = screen.getByLabelText(/upload|choose file/i);
      const file = new File(['fake image'], 'test.jpg', { type: 'image/jpeg' });
      
      // Create object URL for preview
      const objectUrl = 'blob:http://localhost:3000/fake-url';
      global.URL.createObjectURL = vi.fn(() => objectUrl);
      
      await user.upload(fileInput, file);
      
      const preview = screen.getByRole('img', { name: /preview/i });
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute('src', objectUrl);
    });
  });
  
  describe('Acceptance Criterion 4: Image can be removed', () => {
    test('should have remove/clear button', async () => {
      const { user } = render(<ImageUpload />);
      const fileInput = screen.getByLabelText(/upload|choose file/i);
      const file = new File(['fake'], 'test.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput, file);
      
      const removeButton = screen.getByRole('button', { name: /remove|clear|delete/i });
      expect(removeButton).toBeInTheDocument();
    });
    
    test('should clear image when remove button clicked', async () => {
      const { user } = render(<ImageUpload />);
      const fileInput = screen.getByLabelText(/upload|choose file/i);
      const file = new File(['fake'], 'test.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput, file);
      
      const removeButton = screen.getByRole('button', { name: /remove|clear|delete/i });
      await user.click(removeButton);
      
      expect(screen.queryByRole('img', { name: /preview/i })).not.toBeInTheDocument();
      expect(fileInput.files).toHaveLength(0);
    });
  });
  
  describe('Acceptance Criterion 5: File size limits enforced', () => {
    test('should reject files larger than limit', async () => {
      const { user } = render(<ImageUpload maxSize={5 * 1024 * 1024} />); // 5MB
      const fileInput = screen.getByLabelText(/upload|choose file/i);
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      
      await user.upload(fileInput, largeFile);
      
      expect(screen.getByText(/file too large|file size exceeds/i)).toBeInTheDocument();
      expect(fileInput.files).toHaveLength(0);
    });
    
    test('should accept files within size limit', async () => {
      const { user } = render(<ImageUpload maxSize={5 * 1024 * 1024} />);
      const fileInput = screen.getByLabelText(/upload|choose file/i);
      const smallFile = new File(['fake'], 'test.jpg', { type: 'image/jpeg' });
      
      await user.upload(fileInput, smallFile);
      expect(fileInput.files?.[0]).toBe(smallFile);
    });
    
    test('should display helpful error message for oversized files', async () => {
      const { user } = render(<ImageUpload maxSize={5 * 1024 * 1024} />);
      const fileInput = screen.getByLabelText(/upload|choose file/i);
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      
      await user.upload(fileInput, largeFile);
      
      const errorMessage = screen.getByText(/file too large|file size exceeds/i);
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.textContent).toMatch(/5.*MB|size limit/i);
    });
  });
  
  describe('Acceptance Criterion 6: Loading state during upload', () => {
    test('should show loading indicator during upload', async () => {
      const { user } = render(<ImageUpload onUpload={vi.fn()} />);
      const fileInput = screen.getByLabelText(/upload|choose file/i);
      const file = new File(['fake'], 'test.jpg', { type: 'image/jpeg' });
      
      await user.upload(fileInput, file);
      
      expect(screen.getByRole('status', { name: /loading|uploading/i })).toBeInTheDocument();
    });
    
    test('should disable upload button during upload', async () => {
      const { user } = render(<ImageUpload onUpload={vi.fn()} />);
      const fileInput = screen.getByLabelText(/upload|choose file/i);
      const uploadButton = screen.getByRole('button', { name: /upload|submit/i });
      const file = new File(['fake'], 'test.jpg', { type: 'image/jpeg' });
      
      await user.upload(fileInput, file);
      expect(uploadButton).toBeDisabled();
    });
  });
});
```

**Integration Tests:**
```typescript
// File: tests/integration/image-upload.test.ts

describe('Story 1.2: Image Upload Integration', () => {
  test('should handle file upload flow', async () => {
    const file = new File(['fake image'], 'test.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    expect(response.ok).toBe(true);
    const result = await response.json();
    expect(result.imageUrl).toBeTruthy();
  });
  
  test('should reject oversized files', async () => {
    const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', largeFile);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    expect(response.status).toBe(413); // Payload Too Large
  });
});
```

**E2E Tests:**
```typescript
// File: tests/e2e/image-upload.spec.ts

test.describe('Story 1.2: Image Upload Interface - E2E', () => {
  test('user can upload image and see preview', async ({ page }) => {
    await page.goto('/');
    
    // Create test image file
    const filePath = path.join(__dirname, '../fixtures/test-image.jpg');
    
    // Find file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    
    // Verify preview appears
    await expect(page.locator('img[alt*="preview"], img[aria-label*="preview"]')).toBeVisible();
  });
  
  test('user can remove uploaded image', async ({ page }) => {
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, '../fixtures/test-image.jpg');
    await fileInput.setInputFiles(filePath);
    
    // Remove image
    await page.click('button:has-text("Remove"), button:has-text("Clear")');
    
    // Verify preview removed
    await expect(page.locator('img[alt*="preview"]')).not.toBeVisible();
  });
  
  test('user sees error for oversized file', async ({ page }) => {
    await page.goto('/');
    
    // Create large file (simulate)
    const largeFilePath = path.join(__dirname, '../fixtures/large-image.jpg');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(largeFilePath);
    
    // Verify error message
    await expect(page.locator('text=/file too large|file size exceeds/i')).toBeVisible();
  });
});
```

---

#### Story 1.3: OCR/Vision LLM Integration

**Acceptance Criteria:**
1. Image is sent to Vision LLM API for text extraction
2. Extracted text is displayed in text input field for review/editing
3. Error handling for API failures with user-friendly messages
4. Loading indicator shows during OCR processing
5. Extracted text maintains mathematical notation where possible
6. Student can edit extracted text before submitting

**Test Specifications:**

**Unit Tests:**
```typescript
// File: tests/api/ocr.test.ts

describe('Story 1.3: OCR/Vision LLM Integration', () => {
  describe('Acceptance Criterion 1: Image sent to Vision API', () => {
    test('should send image to OpenAI Vision API', async () => {
      const mockResponse = { text: 'Solve for x: 2x + 5 = 13' };
      vi.spyOn(openaiClient, 'extractTextFromImage').mockResolvedValue(mockResponse);
      
      const imageFile = new File(['fake'], 'test.jpg', { type: 'image/jpeg' });
      const result = await extractTextFromImage(imageFile);
      
      expect(openaiClient.extractTextFromImage).toHaveBeenCalledWith(imageFile);
      expect(result.text).toBe('Solve for x: 2x + 5 = 13');
    });
    
    test('should include proper API parameters', async () => {
      vi.spyOn(openaiClient, 'extractTextFromImage');
      const imageFile = new File(['fake'], 'test.jpg', { type: 'image/jpeg' });
      
      await extractTextFromImage(imageFile);
      
      expect(openaiClient.extractTextFromImage).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4-vision-preview',
          max_tokens: 500
        })
      );
    });
  });
  
  describe('Acceptance Criterion 2: Extracted text displayed in input', () => {
    test('should populate input field with extracted text', async () => {
      const mockResponse = { text: '2x + 5 = 13' };
      vi.spyOn(openaiClient, 'extractTextFromImage').mockResolvedValue(mockResponse);
      
      render(<ImageUpload onExtract={handleExtract} />);
      const fileInput = screen.getByLabelText(/upload/i);
      const textInput = screen.getByLabelText(/problem input/i);
      
      await user.upload(fileInput, mockImageFile);
      await waitFor(() => {
        expect(textInput).toHaveValue('2x + 5 = 13');
      });
    });
  });
  
  describe('Acceptance Criterion 3: Error handling', () => {
    test('should handle API errors gracefully', async () => {
      vi.spyOn(openaiClient, 'extractTextFromImage').mockRejectedValue(new Error('API Error'));
      
      const imageFile = new File(['fake'], 'test.jpg', { type: 'image/jpeg' });
      
      await expect(extractTextFromImage(imageFile)).rejects.toThrow('API Error');
    });
    
    test('should display user-friendly error message', async () => {
      vi.spyOn(openaiClient, 'extractTextFromImage').mockRejectedValue(new Error('API Error'));
      
      render(<ImageUpload onExtract={handleExtract} />);
      const fileInput = screen.getByLabelText(/upload/i);
      await user.upload(fileInput, mockImageFile);
      
      await waitFor(() => {
        expect(screen.getByText(/unable to extract|extraction failed/i)).toBeInTheDocument();
      });
    });
    
    test('should provide retry option on error', async () => {
      vi.spyOn(openaiClient, 'extractTextFromImage').mockRejectedValue(new Error('API Error'));
      
      render(<ImageUpload onExtract={handleExtract} />);
      const fileInput = screen.getByLabelText(/upload/i);
      await user.upload(fileInput, mockImageFile);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry|try again/i })).toBeInTheDocument();
      });
    });
  });
  
  describe('Acceptance Criterion 4: Loading indicator', () => {
    test('should show loading indicator during OCR', async () => {
      const mockResponse = { text: '2x + 5 = 13' };
      vi.spyOn(openaiClient, 'extractTextFromImage').mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      );
      
      render(<ImageUpload onExtract={handleExtract} />);
      const fileInput = screen.getByLabelText(/upload/i);
      await user.upload(fileInput, mockImageFile);
      
      expect(screen.getByRole('status', { name: /processing|extracting/i })).toBeInTheDocument();
    });
  });
  
  describe('Acceptance Criterion 5: Mathematical notation preservation', () => {
    test('should preserve LaTeX notation in extracted text', async () => {
      const mockResponse = { text: 'Solve for $x$: $2x + 5 = 13$' };
      vi.spyOn(openaiClient, 'extractTextFromImage').mockResolvedValue(mockResponse);
      
      const imageFile = new File(['fake'], 'test.jpg', { type: 'image/jpeg' });
      const result = await extractTextFromImage(imageFile);
      
      expect(result.text).toContain('$');
      expect(result.text).toContain('2x + 5 = 13');
    });
  });
  
  describe('Acceptance Criterion 6: Text editing before submission', () => {
    test('should allow editing extracted text', async () => {
      const mockResponse = { text: '2x + 5 = 13' };
      vi.spyOn(openaiClient, 'extractTextFromImage').mockResolvedValue(mockResponse);
      
      render(<ImageUpload onExtract={handleExtract} />);
      const fileInput = screen.getByLabelText(/upload/i);
      const textInput = screen.getByLabelText(/problem input/i);
      
      await user.upload(fileInput, mockImageFile);
      await waitFor(() => {
        expect(textInput).toHaveValue('2x + 5 = 13');
      });
      
      // Edit text
      await user.clear(textInput);
      await user.type(textInput, '3x - 7 = 8');
      expect(textInput).toHaveValue('3x - 7 = 8');
    });
  });
});
```

**Integration Tests:**
```typescript
// File: tests/integration/ocr.test.ts

describe('Story 1.3: OCR Integration Tests', () => {
  test('should successfully extract text from image', async () => {
    const imageFile = fs.readFileSync(path.join(__dirname, '../fixtures/test-image.jpg'));
    const formData = new FormData();
    formData.append('image', new Blob([imageFile], { type: 'image/jpeg' }));
    
    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData
    });
    
    expect(response.ok).toBe(true);
    const result = await response.json();
    expect(result.text).toBeTruthy();
    expect(typeof result.text).toBe('string');
  }, 15000); // Longer timeout for API call
  
  test('should handle invalid image files', async () => {
    const formData = new FormData();
    formData.append('image', new Blob(['not an image'], { type: 'text/plain' }));
    
    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData
    });
    
    expect(response.status).toBe(400);
  });
});
```

---

### Epic 2: Chat Interface & LLM Integration

#### Story 2.1: Basic Chat UI Layout

**Acceptance Criteria:**
1. Chat message container displays messages in chronological order
2. Student messages appear on right side with distinct styling
3. AI tutor messages appear on left side with distinct styling
4. Messages include timestamp or sequence indicator
5. Chat area scrolls automatically to latest message
6. Clean, readable typography and spacing

**Test Specifications:**

**Component Tests:**
```typescript
// File: tests/components/ChatInterface.test.tsx

describe('Story 2.1: Basic Chat UI Layout', () => {
  describe('Acceptance Criterion 1: Messages in chronological order', () => {
    test('should display messages in order', () => {
      const messages = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date('2024-01-01T10:00:00') },
        { id: '2', role: 'assistant', content: 'Hi!', timestamp: new Date('2024-01-01T10:00:01') }
      ];
      
      render(<ChatInterface messages={messages} />);
      
      const messageElements = screen.getAllByRole('article');
      expect(messageElements[0]).toHaveTextContent('Hello');
      expect(messageElements[1]).toHaveTextContent('Hi!');
    });
  });
  
  describe('Acceptance Criterion 2: Student messages on right', () => {
    test('should render student messages on right side', () => {
      const messages = [{ id: '1', role: 'user', content: 'Hello', timestamp: new Date() }];
      const { container } = render(<ChatInterface messages={messages} />);
      
      const message = container.querySelector('[data-role="user"]');
      expect(message).toHaveClass(/right|end/);
    });
  });
  
  describe('Acceptance Criterion 3: AI messages on left', () => {
    test('should render AI messages on left side', () => {
      const messages = [{ id: '1', role: 'assistant', content: 'Hi!', timestamp: new Date() }];
      const { container } = render(<ChatInterface messages={messages} />);
      
      const message = container.querySelector('[data-role="assistant"]');
      expect(message).toHaveClass(/left|start/);
    });
  });
  
  describe('Acceptance Criterion 4: Timestamp display', () => {
    test('should display timestamp on messages', () => {
      const timestamp = new Date('2024-01-01T10:00:00');
      const messages = [{ id: '1', role: 'user', content: 'Hello', timestamp }];
      
      render(<ChatInterface messages={messages} />);
      
      expect(screen.getByText(/10:00|10:00 AM|January 1/i)).toBeInTheDocument();
    });
  });
  
  describe('Acceptance Criterion 5: Auto-scroll to latest', () => {
    test('should scroll to bottom when new message arrives', async () => {
      const { rerender } = render(<ChatInterface messages={[]} />);
      const container = screen.getByRole('log');
      
      const scrollSpy = vi.spyOn(container, 'scrollTop', 'set');
      
      const newMessages = [{ id: '1', role: 'user', content: 'Hello', timestamp: new Date() }];
      rerender(<ChatInterface messages={newMessages} />);
      
      await waitFor(() => {
        expect(scrollSpy).toHaveBeenCalled();
      });
    });
  });
  
  describe('Acceptance Criterion 6: Clean typography', () => {
    test('should have readable font size', () => {
      const messages = [{ id: '1', role: 'user', content: 'Hello', timestamp: new Date() }];
      const { container } = render(<ChatInterface messages={messages} />);
      
      const message = container.querySelector('[data-role="user"]');
      const styles = window.getComputedStyle(message!);
      expect(parseInt(styles.fontSize)).toBeGreaterThanOrEqual(14);
    });
    
    test('should have appropriate line height', () => {
      const messages = [{ id: '1', role: 'user', content: 'Hello', timestamp: new Date() }];
      const { container } = render(<ChatInterface messages={messages} />);
      
      const message = container.querySelector('[data-role="user"]');
      const styles = window.getComputedStyle(message!);
      expect(parseFloat(styles.lineHeight)).toBeGreaterThan(1.2);
    });
  });
});
```

**E2E Tests:**
```typescript
// File: tests/e2e/chat-interface.spec.ts

test.describe('Story 2.1: Basic Chat UI Layout - E2E', () => {
  test('messages display in chronological order', async ({ page }) => {
    await page.goto('/');
    
    // Send first message
    await page.fill('textarea[aria-label*="problem"]', 'Hello');
    await page.click('button:has-text("Submit")');
    
    await page.waitForSelector('[data-role="assistant"]');
    
    // Send second message
    await page.fill('textarea[aria-label*="problem"]', 'How do I solve this?');
    await page.click('button:has-text("Submit")');
    
    // Verify order
    const messages = await page.locator('[data-role="user"], [data-role="assistant"]').all();
    expect(messages.length).toBeGreaterThanOrEqual(2);
    
    const firstText = await messages[0].textContent();
    expect(firstText).toContain('Hello');
  });
  
  test('student messages appear on right', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea[aria-label*="problem"]', 'Test');
    await page.click('button:has-text("Submit")');
    
    const userMessage = page.locator('[data-role="user"]').first();
    const styles = await userMessage.evaluate((el) => window.getComputedStyle(el));
    expect(styles.textAlign).toBe('right');
  });
  
  test('AI messages appear on left', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea[aria-label*="problem"]', 'Test');
    await page.click('button:has-text("Submit")');
    await page.waitForSelector('[data-role="assistant"]');
    
    const aiMessage = page.locator('[data-role="assistant"]').first();
    const styles = await aiMessage.evaluate((el) => window.getComputedStyle(el));
    expect(styles.textAlign).toBe('left');
  });
});
```

---

## Test Execution Commands

### Local Development

```bash
# Run all tests
pnpm test

# Run unit tests only (fast)
pnpm test:unit

# Run component tests
pnpm test:component

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### CI/CD Execution

Tests run automatically on:
- Every commit (unit + component tests)
- Every PR (all tests)
- Main branch (all tests + deployment)

---

## Test Data Strategy

### Fixtures

Create test fixtures for:
- Images: `tests/fixtures/test-image.jpg`, `tests/fixtures/large-image.jpg`
- Math problems: `tests/fixtures/problems.json`
- Mock API responses: `tests/fixtures/api-responses.json`

### Mocks

Mock external services:
- OpenAI API: Use `vi.mock('@/lib/api/openai')`
- File API: Use `vi.fn()` for file operations
- Browser APIs: Use testing library mocks

### Test Utilities

Create reusable test utilities:
- `tests/utils/test-helpers.ts` - Common test functions
- `tests/utils/mock-factories.ts` - Factory functions for test data
- `tests/utils/render-helpers.tsx` - Custom render functions

---

This test specification document provides detailed test cases for each story, ensuring:

✅ **TDD Compliance**: Tests written before code  
✅ **Acceptance Criteria Coverage**: Every criterion has tests  
✅ **Meaningful Tests**: Tests verify actual functionality  
✅ **Fast Tests**: Unit tests < 1s, E2E tests < 30s  
✅ **Independent Tests**: No shared state between tests


