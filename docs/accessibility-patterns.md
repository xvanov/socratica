# Accessibility Patterns and Best Practices

This document outlines accessibility patterns and best practices used throughout the Socratica application to ensure WCAG 2.1 Level AA compliance.

## ARIA Patterns

### ARIA Labels
- Use `aria-label` for icon-only buttons and controls that don't have visible text
- Use `aria-labelledby` to reference visible labels when label text is present elsewhere
- Use `aria-describedby` for help text, error messages, and additional context
- Use `aria-describedby` with multiple IDs (space-separated) for multiple descriptions

### ARIA Live Regions
- Use `aria-live="polite"` for non-critical updates (chat messages, loading states)
- Use `aria-live="assertive"` for critical updates (errors, alerts)
- Use `aria-atomic="false"` for log regions where only new content should be announced
- Use `role="status"` for status messages and loading indicators
- Use `role="log"` for chat message lists

### Role Attributes
- Only use `role` attributes when semantic HTML is insufficient
- Prefer semantic HTML elements (`<article>`, `<section>`, `<header>`, `<nav>`, `<main>`) over `<div>` with roles
- Use `role="region"` for major page sections when semantic HTML isn't available

### Examples
```tsx
// Icon-only button
<button aria-label="Clear chat and start new problem">
  <svg aria-hidden="true">...</svg>
</button>

// Form input with description
<textarea
  aria-label="Message input field"
  aria-describedby="message-input-description message-input-error"
/>
<p id="message-input-description" className="sr-only">
  Enter your message. Press Enter to send.
</p>

// Dynamic content
<div role="log" aria-live="polite" aria-atomic="false">
  {messages.map(...)}
</div>
```

## Keyboard Navigation

### Standard Keys
- **Tab**: Move focus forward through interactive elements
- **Shift+Tab**: Move focus backward
- **Enter**: Activate buttons and submit forms
- **Space**: Activate buttons and checkboxes
- **Escape**: Close modals, dialogs, and menus
- **Arrow Keys**: Navigate within components (menus, lists)
- **Home/End**: Jump to first/last item in lists

### Focus Management
- Focus should move to newly opened dialogs/modals
- Focus should return to trigger element when dialog closes
- Focus trap: Keep focus within modals/dialogs (Tab wraps, Shift+Tab wraps)
- Skip links: Provide skip links for main content (if needed)

### Examples
```tsx
// Escape key handler
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);

// Arrow key navigation
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    // Focus next item
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    // Focus previous item
  }
};
```

## Color Contrast

### Requirements
- **Normal text**: Minimum 4.5:1 contrast ratio (WCAG AA)
- **Large text** (18pt+ or 14pt+ bold): Minimum 3:1 contrast ratio (WCAG AA)
- **UI components**: Minimum 3:1 contrast ratio
- **Focus indicators**: Minimum 3:1 contrast ratio

### Validation
Use the color contrast utilities from `lib/utils/color-contrast.ts`:
```tsx
import { getContrastRatio, meetsWCAGAA } from '@/lib/utils/color-contrast';

const ratio = getContrastRatio('#111827', '#ffffff');
expect(meetsWCAGAA('#111827', '#ffffff')).toBe(true);
```

### Design System Colors
All design system colors are validated to meet WCAG AA requirements:
- Primary colors: Text on primary backgrounds meets contrast requirements
- Neutral colors: Text colors meet contrast requirements
- Error colors: Error text on error backgrounds meets contrast requirements

## Focus Indicators

### Requirements
- Visible outline: 2px solid outline with sufficient contrast
- Focus visibility: Ensure focus indicators are visible on all browsers
- Use `:focus-visible` for keyboard users (not mouse users)

### Implementation
Global focus styles are defined in `app/globals.css`:
```css
*:focus-visible {
  outline: 2px solid var(--primary-600);
  outline-offset: 2px;
  border-radius: 0.25rem;
}
```

### Tailwind Utilities
Use Tailwind focus utilities for custom focus styles:
```tsx
className="focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] focus:ring-offset-2"
```

## Semantic HTML

### Elements
- Use `<nav>` for navigation
- Use `<main>` for main content
- Use `<article>` for individual messages/content items
- Use `<section>` for distinct sections
- Use `<header>` for page/section headers
- Use `<footer>` for page/section footers
- Use `<aside>` for sidebar content

### Heading Hierarchy
- Proper heading hierarchy: h1 → h2 → h3 (no skipping levels)
- Use headings to structure content logically
- Each page should have exactly one `<h1>`

### Form Elements
- Use proper `<form>` elements for forms
- Use `<label>` elements associated with inputs via `htmlFor`
- Use `<input>`, `<textarea>`, `<button>` elements appropriately
- Use `<fieldset>` and `<legend>` for grouped form inputs

### Examples
```tsx
// Semantic article
<article aria-label="student message">
  <div>Message content</div>
</article>

// Semantic header
<header>
  <h2>Chat with Tutor</h2>
</header>

// Proper form structure
<form onSubmit={handleSubmit}>
  <label htmlFor="message-input">Message</label>
  <textarea id="message-input" aria-describedby="description" />
  <p id="description" className="sr-only">Help text</p>
</form>
```

## Alternative Text

### Images
- All images must have descriptive `alt` text
- Decorative images use `alt=""` or `aria-hidden="true"`
- Alt text should be descriptive and meaningful (not redundant)
- Avoid phrases like "image of" or "picture of"

### Icons
- Icon-only buttons use `aria-label` for button label
- Decorative icons use `aria-hidden="true"`
- Icons with text labels don't need additional aria-label

### Math Equations
- Math expressions use `aria-label` with descriptive text
- Format: `aria-label="Mathematical expression: {expression}"`
- Error states include error information in aria-label

### Examples
```tsx
// Image with alt text
<img src={previewUrl} alt="Preview of uploaded math problem" />

// Icon-only button
<button aria-label="Remove image">
  <svg aria-hidden="true">...</svg>
</button>

// Math expression
<span aria-label="Mathematical expression: x squared plus 5">
  <MathDisplay expression="x^2 + 5" />
</span>
```

## Testing

### Unit Tests
- Test ARIA attributes (`aria-label`, `aria-describedby`, `role`)
- Test keyboard event handling
- Test focus indicator visibility
- Test alt text presence
- Test semantic HTML structure

### Integration Tests
- Test keyboard navigation flows
- Test screen reader announcements
- Test focus trap in dialogs
- Test aria-live region updates

### Automated Testing
- Use `@testing-library/react` for accessibility testing
- Use `axe-core` for automated accessibility audits
- Use Lighthouse for accessibility scoring
- Use color contrast checker tools (WebAIM Contrast Checker)

## Component Checklist

When creating new components, ensure:

- [ ] All interactive elements have accessible names (`aria-label` or visible label)
- [ ] Form inputs have `aria-describedby` linking to help text
- [ ] Error messages have `aria-errormessage` linking from input
- [ ] Dynamic content updates use `aria-live` regions
- [ ] Semantic HTML elements are used where appropriate
- [ ] Keyboard navigation is fully supported
- [ ] Focus indicators are visible and meet contrast requirements
- [ ] Images have descriptive alt text
- [ ] Icon-only buttons have aria-label
- [ ] Decorative icons have aria-hidden="true"
- [ ] Color contrast meets WCAG AA requirements
- [ ] Focus trap is implemented for modals/dialogs

## References

- [WCAG 2.1 Level AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind CSS Focus Styles](https://tailwindcss.com/docs/focus)


