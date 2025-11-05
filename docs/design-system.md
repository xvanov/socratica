# Socratica Design System

**Version:** 1.0  
**Last Updated:** 2025-01-27  
**Status:** Active

## Overview

The Socratica Design System provides a cohesive visual language for the entire application. It ensures consistency, accessibility, and a professional, trustworthy aesthetic that supports learning without distraction.

## Design Philosophy

- **Educational Focus**: Colors and typography promote focus and clarity
- **Professional Yet Friendly**: Clean, modern aesthetic appropriate for educational context
- **Accessibility First**: All design tokens meet WCAG 2.1 Level AA requirements
- **Dark Mode Support**: Complete design system support for both light and dark modes

## Color Palette

### Primary Colors

Educational blue palette designed to promote focus and calm learning:

- **Primary 500** (`#3b82f6`): Base primary color
- **Primary 600** (`#2563eb`): Primary actions, buttons
- **Primary 700** (`#1d4ed8`): Hover states, emphasis

**Usage**: Primary actions, buttons, links, student message bubbles

**CSS Variables**: `--primary-500`, `--primary-600`, `--primary-700`

### Accent Colors

#### Success (Encouragement)
- **Success 500** (`#22c55e`): Base success color
- **Success 600** (`#16a34a`): Success emphasis

**Usage**: Positive feedback, success messages, encouragement

**CSS Variables**: `--accent-success-500`, `--accent-success-600`

#### Feedback (Subtle Warnings)
- **Feedback 500** (`#f59e0b`): Base feedback color
- **Feedback 400** (`#fbbf24`): Lighter feedback for dark mode

**Usage**: Warnings, informational messages, non-critical feedback

**CSS Variables**: `--accent-feedback-500`, `--accent-feedback-400`

### Neutral Colors

Text and UI element colors:

- **Neutral 50** (`#f9fafb`): Lightest background
- **Neutral 100** (`#f3f4f6`): Light backgrounds
- **Neutral 200** (`#e5e7eb`): Borders, dividers
- **Neutral 300** (`#d1d5db`): Subtle borders
- **Neutral 400** (`#9ca3af`): Placeholder text
- **Neutral 500** (`#6b7280`): Secondary text
- **Neutral 600** (`#4b5563`): Primary text (dark mode)
- **Neutral 700** (`#374151`): Secondary text (light mode)
- **Neutral 800** (`#1f2937`): Emphasis text
- **Neutral 900** (`#111827`): Primary text (light mode)

**CSS Variables**: `--neutral-50` through `--neutral-900`

### Semantic Colors

#### Background Colors
- **Background**: `#ffffff` (light) / `#0a0a0a` (dark)
- **Surface**: `#f8f9fa` (light) / `#161616` (dark)
- **Surface Elevated**: `#ffffff` (light) / `#1f1f1f` (dark)
- **Border**: `#e5e7eb` (light) / `#2a2a2a` (dark)

**CSS Variables**: `--background`, `--surface`, `--surface-elevated`, `--border`

#### Error Colors
- **Error 500** (`#ef4444`): Base error color
- **Error 600** (`#dc2626`): Error emphasis

**Usage**: Error messages, validation errors

**CSS Variables**: `--error-500`, `--error-600`

### Color Contrast Requirements

All color combinations meet WCAG 2.1 Level AA requirements:
- **Text on backgrounds**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 4.5:1 contrast ratio

See `lib/utils/color-contrast.ts` for contrast validation utilities.

## Typography

### Font Families

- **Geist Sans**: Primary body font (loaded via Next.js)
- **Geist Mono**: Code and math notation font

**CSS Variables**: `--font-sans`, `--font-mono`

### Typography Scale

| Size | CSS Variable | Rem | Pixels | Usage |
|------|-------------|-----|--------|-------|
| xs | `--text-xs` | 0.75rem | 12px | Captions, labels |
| sm | `--text-sm` | 0.875rem | 14px | Small text, metadata |
| base | `--text-base` | 1rem | 16px | Body text |
| lg | `--text-lg` | 1.125rem | 18px | Large body text |
| xl | `--text-xl` | 1.25rem | 20px | Subheadings |
| 2xl | `--text-2xl` | 1.5rem | 24px | Section headings |
| 3xl | `--text-3xl` | 1.875rem | 30px | Page headings |
| 4xl | `--text-4xl` | 2.25rem | 36px | Hero headings |

### Line Heights

- **Tight**: 1.25 (headings)
- **Snug**: 1.375 (compact text)
- **Normal**: 1.5 (body text)
- **Relaxed**: 1.625 (comfortable reading)
- **Loose**: 2 (spacious text)

**CSS Variables**: `--leading-tight` through `--leading-loose`

### Letter Spacing

- **Tighter**: -0.05em
- **Tight**: -0.025em
- **Normal**: 0em
- **Wide**: 0.025em
- **Wider**: 0.05em

**CSS Variables**: `--tracking-tighter` through `--tracking-wider`

### Math Notation Support

Typography system supports KaTeX math rendering with:
- Proper font sizing for mathematical expressions
- Clear readability of mathematical notation
- Consistent spacing around math blocks

## Spacing System

Based on Tailwind's 4px base unit system:

| Size | CSS Variable | Rem | Pixels | Usage |
|------|-------------|-----|--------|-------|
| 0 | `--spacing-0` | 0px | 0px | No spacing |
| 1 | `--spacing-1` | 0.25rem | 4px | Tight spacing |
| 2 | `--spacing-2` | 0.5rem | 8px | Minimum touch target spacing |
| 3 | `--spacing-3` | 0.75rem | 12px | Compact spacing |
| 4 | `--spacing-4` | 1rem | 16px | Standard spacing |
| 5 | `--spacing-5` | 1.25rem | 20px | Medium spacing |
| 6 | `--spacing-6` | 1.5rem | 24px | Section spacing |
| 8 | `--spacing-8` | 2rem | 32px | Large spacing |
| 10 | `--spacing-10` | 2.5rem | 40px | Extra large spacing |
| 12 | `--spacing-12` | 3rem | 48px | Component spacing |
| 16 | `--spacing-16` | 4rem | 64px | Section spacing |
| 20 | `--spacing-20` | 5rem | 80px | Page spacing |

### Touch Target Requirements

- Minimum touch target size: 44x44px
- Minimum spacing between touch targets: 8px (`--spacing-2`)

## Shadow System

Subtle shadows for depth and elevation:

### Light Mode Shadows

- **sm**: `0 1px 2px 0 rgb(0 0 0 / 0.05)` - Subtle elevation
- **base**: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` - Default elevation
- **md**: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` - Medium elevation
- **lg**: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` - Large elevation (modals, dialogs)
- **xl**: `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` - Maximum elevation

### Dark Mode Shadows

Dark mode shadows use increased opacity for visibility:
- **sm-dark**: `0 1px 2px 0 rgb(0 0 0 / 0.3)`
- **base-dark**: `0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)`
- **md-dark**: `0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)`
- **lg-dark**: `0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)`
- **xl-dark**: `0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)`

**CSS Variables**: `--shadow-sm` through `--shadow-xl` (light mode), `--shadow-sm-dark` through `--shadow-xl-dark` (dark mode)

### Usage Guidelines

- **Cards**: `shadow-sm` or `shadow-base`
- **Buttons**: `shadow-sm` (subtle depth)
- **Modals/Dialogs**: `shadow-lg` or `shadow-xl`
- **Elevated surfaces**: `shadow-md`

## Component Patterns

### Buttons

**Primary Button**:
```tsx
className="bg-[var(--primary-600)] text-white hover:bg-[var(--primary-700)] shadow-sm"
```

**Secondary Button**:
```tsx
className="border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--neutral-700)] hover:bg-[var(--surface)] shadow-sm"
```

### Cards

**Card Container**:
```tsx
className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] shadow-sm"
```

### Input Fields

**Text Input**:
```tsx
className="border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)] placeholder-[var(--neutral-500)] focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]"
```

### Messages

**Student Message**:
```tsx
className="bg-[var(--primary-600)] text-white"
```

**Tutor Message**:
```tsx
className="bg-[var(--surface)] text-[var(--foreground)]"
```

## Usage in Code

### Using CSS Variables

Access design system tokens via CSS variables:

```tsx
<div className="bg-[var(--surface)] text-[var(--foreground)]">
  Content
</div>
```

### Using Tailwind Utilities

Design system tokens are available via Tailwind utilities where configured:

```tsx
<div className="bg-surface text-foreground">
  Content
</div>
```

## Accessibility

### Color Contrast

All color combinations are validated to meet WCAG 2.1 Level AA:
- Text contrast ratio: Minimum 4.5:1
- Large text contrast ratio: Minimum 3:1
- Interactive elements: Minimum 4.5:1

Use `lib/utils/color-contrast.ts` utilities to validate custom color combinations.

### Typography

- Minimum font size: 16px for body text
- Line height: 1.5 for optimal readability
- Font families chosen for math notation clarity

### Touch Targets

- Minimum size: 44x44px
- Minimum spacing: 8px between interactive elements

## Dark Mode

All design system tokens support dark mode via CSS media queries:

```css
@media (prefers-color-scheme: dark) {
  /* Dark mode color overrides */
}
```

Components automatically adapt to dark mode using CSS variables.

## Testing

Design system implementation includes:
- Color contrast validation tests (`lib/utils/__tests__/color-contrast.test.ts`)
- Component visual consistency tests
- Accessibility compliance tests

## References

- [WCAG 2.1 Level AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Configuration](https://tailwindcss.com/docs/configuration)
- [Design System Best Practices](https://www.designsystems.com/)

## Updates

- **2025-01-27**: Initial design system implementation
  - Color palette defined
  - Typography scale established
  - Spacing system implemented
  - Shadow system added
  - Component patterns documented


