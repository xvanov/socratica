# Error Message Guidelines

This document outlines the guidelines for creating user-friendly error messages across the Socratica application.

## Principles

1. **User-Friendly Language**: Avoid technical jargon. Use plain language that students can understand.
2. **Actionable Guidance**: Tell users what happened and what they should do next.
3. **Context-Specific**: Match error messages to the user's context and action.
4. **Consistent Format**: Use consistent error message structure across all components.
5. **Accessible**: Error messages must be accessible with proper ARIA attributes.

## Error Categories

### Network Errors
- **When**: Connection issues, timeouts, offline status
- **Guidelines**: 
  - Explain what went wrong (connection issue)
  - Provide clear action (check internet, try again)
  - Avoid technical terms (no "fetch failed", "network request failed")
- **Examples**:
  - ✅ "We're having trouble connecting. Please check your internet connection and try again."
  - ❌ "Network error: Failed to fetch"

### API Errors
- **When**: Server errors, rate limits, authentication issues
- **Guidelines**:
  - Use friendly language (no HTTP status codes)
  - Explain what happened in user terms
  - Provide actionable guidance
- **Examples**:
  - ✅ "You're sending messages too quickly. Please wait a moment and try again."
  - ❌ "429 Too Many Requests"

### Validation Errors
- **When**: Input validation failures
- **Guidelines**:
  - Be specific about what's wrong
  - Explain what's needed
  - Use positive language when possible
- **Examples**:
  - ✅ "Please enter your math problem."
  - ❌ "Input cannot be empty."

### OCR Errors
- **When**: Image processing failures, text extraction issues
- **Guidelines**:
  - Explain what went wrong
  - Provide alternative actions (try clearer photo, type instead)
  - Avoid technical terms about OCR or image processing
- **Examples**:
  - ✅ "We couldn't read text from your image. Please try a clearer photo or type your problem directly."
  - ❌ "OCR processing failed"

### File Errors
- **When**: Invalid file types, size limits, corrupted files
- **Guidelines**:
  - Explain the issue clearly
  - Provide specific limits or requirements
  - Suggest alternatives
- **Examples**:
  - ✅ "Your image is too large. Please choose a smaller image (under 10MB)."
  - ❌ "File size exceeds maximum limit"

## Error Message Structure

Error messages should follow this structure:

1. **What happened**: Brief description of the issue
2. **What to do**: Clear action or guidance

**Template**: `[What happened]. [What to do].`

**Example**: "We couldn't process your request. Please try again."

## Accessibility Requirements

All error messages must include:

- `role="alert"` for critical errors (immediate attention)
- `aria-live="polite"` for validation errors (non-critical)
- `aria-live="assertive"` for critical errors (immediate attention)
- `aria-errormessage` linking error to input field
- `aria-invalid="true"` on input field when error exists

## Error Display Patterns

### Inline Errors (Form Validation)
- Display below input field
- Use error styling (red border, error icon)
- Clear when user starts typing
- Associated with input via `aria-errormessage`

### Toast/Alert Errors (Network/API)
- Display in prominent location
- Include retry button if applicable
- Auto-dismiss after timeout or user action
- Use `role="alert"` and `aria-live="assertive"`

### Error Messages Component
- Use consistent `ErrorMessage` component
- Include error icon
- Support retry functionality
- Follow design system colors

## Implementation Patterns

### Using Error Handling Utilities

```typescript
import { formatError, ErrorType, getErrorInfo } from "@/lib/utils/error-handling";

// Format error for display
const errorMessage = formatError(error, ErrorType.NETWORK_ERROR);

// Get complete error info
const errorInfo = getErrorInfo(error);
// errorInfo.type, errorInfo.message, errorInfo.action, errorInfo.retryable
```

### Error Constants

Use error message constants from `@/lib/utils/error-handling`:

```typescript
import { ERROR_MESSAGES } from "@/lib/utils/error-handling";

// Use predefined messages
setError(ERROR_MESSAGES.NETWORK.GENERIC);
```

## Testing Error Messages

When testing error messages, verify:

1. ✅ Message is user-friendly (no technical jargon)
2. ✅ Message provides actionable guidance
3. ✅ Message is accessible (proper ARIA attributes)
4. ✅ Message is consistent with other error messages
5. ✅ Error is associated with correct input/action
6. ✅ Retry functionality works (if applicable)

## Common Mistakes to Avoid

1. ❌ Using technical terms ("API error", "500 Internal Server Error")
2. ❌ Not providing actionable guidance
3. ❌ Using negative language ("Don't do X")
4. ❌ Inconsistent error message format
5. ❌ Missing accessibility attributes
6. ❌ Error messages that don't match user's context

## Examples

### Good Error Messages

```typescript
// Network error
"We're having trouble connecting. Please check your internet connection and try again."

// Validation error
"Please enter your math problem."

// OCR error
"We couldn't read text from your image. Please try a clearer photo or type your problem directly."

// File error
"Your image is too large. Please choose a smaller image (under 10MB)."
```

### Bad Error Messages

```typescript
// Too technical
"Network error: Failed to fetch from /api/chat"

// No guidance
"Error occurred"

// Too negative
"Don't submit empty messages"

// Technical jargon
"OCR processing failed: Image quality below threshold"
```

## Future Enhancements

- Add error message translations
- Implement error message analytics
- Create error message testing framework
- Add error message preview tool

