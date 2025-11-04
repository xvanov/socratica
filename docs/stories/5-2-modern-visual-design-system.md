# Story 5.2: Modern Visual Design System

Status: ready-for-dev

## Story

As a student,
I want a clean, modern interface that doesn't distract from learning,
so that I can focus on understanding my math problems.

## Acceptance Criteria

1. Cohesive color palette (educational, not flashy)
2. Consistent typography hierarchy
3. Appropriate spacing and padding throughout
4. Subtle shadows and depth where appropriate
5. Professional, trustworthy aesthetic
6. Design system documented for consistency

## Tasks / Subtasks

- [ ] Task 1: Define cohesive color palette (AC: 1, 5)
  - [ ] Review PRD visual personality requirements (calming colors, educational aesthetic)
  - [ ] Define primary color palette (educational, not flashy)
  - [ ] Define accent colors for encouragement and feedback
  - [ ] Define neutral colors for backgrounds and text
  - [ ] Ensure colors meet WCAG contrast requirements (4.5:1 minimum)
  - [ ] Configure colors in Tailwind CSS config
  - [ ] Document color palette decisions and usage guidelines
  - [ ] Add unit tests for color contrast ratios
- [ ] Task 2: Establish consistent typography hierarchy (AC: 2, 5)
  - [ ] Review PRD typography requirements (clear, readable fonts with math rendering support)
  - [ ] Define typography scale (headings, body, captions)
  - [ ] Configure font families in Tailwind CSS (Geist Sans/Mono already loaded)
  - [ ] Ensure typography supports math notation readability
  - [ ] Define line heights and letter spacing for readability
  - [ ] Apply typography hierarchy consistently across components
  - [ ] Document typography system and usage guidelines
  - [ ] Add unit tests for typography scaling
- [ ] Task 3: Implement consistent spacing and padding (AC: 3, 5)
  - [ ] Define spacing scale (Tailwind spacing utilities)
  - [ ] Apply consistent spacing to all components
  - [ ] Ensure spacing works with responsive layout (from Story 5.1)
  - [ ] Review component spacing for visual consistency
  - [ ] Document spacing system and usage guidelines
  - [ ] Add unit tests for spacing consistency
- [ ] Task 4: Add subtle shadows and depth (AC: 4, 5)
  - [ ] Define shadow system (subtle, not overwhelming)
  - [ ] Apply shadows to elevated elements (cards, buttons, modals)
  - [ ] Ensure shadows support dark mode
  - [ ] Test shadow visibility across different backgrounds
  - [ ] Document shadow system and usage guidelines
  - [ ] Add unit tests for shadow application
- [ ] Task 5: Ensure professional, trustworthy aesthetic (AC: 5)
  - [ ] Review all UI components for professional appearance
  - [ ] Ensure design aligns with educational context (not childish)
  - [ ] Verify aesthetic supports learning focus (not distracting)
  - [ ] Test visual consistency across all components
  - [ ] Document design principles and aesthetic guidelines
  - [ ] Add integration tests for visual consistency
- [ ] Task 6: Document design system (AC: 6)
  - [ ] Create design system documentation file
  - [ ] Document color palette with hex codes and usage
  - [ ] Document typography system with examples
  - [ ] Document spacing system with examples
  - [ ] Document shadow system with examples
  - [ ] Include design principles and guidelines
  - [ ] Add examples of component usage following design system
  - [ ] Create design system reference for developers

## Dev Notes

### Learnings from Previous Story

**From Story 5-1-responsive-layout-design (Status: ready-for-dev)**

- **Responsive Layout Foundation**: Story 5.1 establishes responsive breakpoints and layout system. This story builds on that foundation by applying visual design system across all breakpoints. Design system must work seamlessly with responsive layout patterns established in Story 5.1.
- **Tailwind CSS Integration**: Tailwind CSS is already configured with responsive utilities. Design system should leverage Tailwind's configuration system for colors, typography, spacing, and shadows.
- **Component Integration**: All existing components (chat, problem input, math rendering) will need visual design system updates. Design system should be applied consistently across all components while maintaining responsive behavior.
- **Touch-Friendly Design**: Story 5.1 establishes touch target requirements (minimum 44x44px). Design system should support these requirements with appropriate spacing and sizing.

**Note**: Story 5.1 is currently ready-for-dev but not yet completed. Design system implementation should account for responsive layout patterns that will be established in Story 5.1.

[Source: stories/5-1-responsive-layout-design.md#Dev-Notes]

### Architecture Patterns

**Design System Approach:**
- Use Tailwind CSS configuration system for design tokens (colors, typography, spacing, shadows)
- Define design tokens in `tailwind.config.js` for consistency
- Leverage Tailwind utility classes for applying design system
- Create reusable component patterns following design system

**Color System:**
- Primary colors: Educational, calming (not flashy)
- Accent colors: For encouragement and feedback
- Neutral colors: For backgrounds and text
- WCAG contrast requirements: Minimum 4.5:1 for text
- Dark mode support: All colors must work in dark mode

**Typography System:**
- Font families: Geist Sans (already loaded) for body text, Geist Mono for code/math
- Hierarchy: Clear distinction between headings, body, and captions
- Math rendering: Typography must support KaTeX math notation readability
- Responsive typography: Scales appropriately across breakpoints

**Spacing System:**
- Use Tailwind spacing scale (4px base unit)
- Consistent spacing across components
- Responsive spacing that adapts to screen size
- Adequate spacing for touch targets (minimum 8px between elements)

**Shadow System:**
- Subtle shadows for depth (not overwhelming)
- Elevation levels: Different shadow intensities for different element types
- Dark mode shadows: Adjusted for dark backgrounds
- Performance: Optimize shadow rendering for performance

**Component Structure:**
- Design system applies to all UI components (`components/ui/`, `components/chat/`, `components/problem-input/`)
- Consistent visual language across all components
- Design system supports existing functionality while improving aesthetics

**Integration Points:**
- Design system integrates with Tailwind CSS configuration
- Design system works with responsive layout from Story 5.1
- Design system supports dark mode (already configured)
- Design system maintains accessibility requirements

**Naming Patterns:**
- Components: PascalCase matching file name (e.g., `DesignSystem.tsx` contains `DesignSystem` component)
- Files: Match component name exactly
- Design tokens: Use Tailwind CSS naming conventions
- Constants: UPPER_SNAKE_CASE for design tokens (e.g., `COLOR_PRIMARY`, `SPACING_BASE`)
- Types/Interfaces: PascalCase (e.g., `ColorPalette`, `TypographyScale`)

### Project Structure Notes

**Expected File Structure:**
```
socratica/
├── app/
│   ├── layout.tsx                 # Root layout (design system applied)
│   └── globals.css                # Global styles (design system utilities)
├── components/
│   ├── ui/                        # Epic 5: UI Polish
│   │   ├── Button.tsx             # Design system applied to buttons
│   │   ├── Card.tsx              # Design system applied to cards
│   │   └── DesignSystem.tsx      # Design system documentation component (optional)
│   ├── chat/                      # Epic 2: Chat Interface
│   │   ├── ChatInterface.tsx     # Design system applied
│   │   ├── MessageList.tsx        # Design system applied
│   │   ├── Message.tsx            # Design system applied
│   │   └── MessageInput.tsx       # Design system applied
│   ├── problem-input/            # Epic 1: Problem Input
│   │   ├── TextInput.tsx          # Design system applied
│   │   └── ImageUpload.tsx        # Design system applied
│   └── math-renderer/            # Epic 4: Math Rendering
│       └── MessageContent.tsx     # Design system applied
├── tailwind.config.js            # Design system configuration (colors, typography, spacing, shadows)
└── docs/
    └── design-system.md           # Design system documentation
```

**Alignment with Architecture:**
- Design system matches `docs/architecture.md` patterns for Epic 5
- Components follow design system patterns from architecture
- Tailwind CSS choice matches architecture decision (ADR-001)
- Component structure aligns with existing component patterns

**Integration Points:**
- Design system integrates with Tailwind CSS setup
- Design system works with responsive layout from Story 5.1
- Design system maintains existing functionality while improving aesthetics
- Design system supports dark mode (already configured in Tailwind)

**Dependencies:**
- Story 5.1 must be completed (responsive layout provides foundation)
- Tailwind CSS configuration must be set up (from Story 0.1)
- Existing components (Epic 1, 2, 4) provide foundation for design system application

**Design System Patterns:**
- Token-based design system (colors, typography, spacing, shadows)
- Utility-first approach (Tailwind CSS utilities)
- Component-level application (consistent across all components)
- Responsive design system (adapts to screen sizes)
- Dark mode support (design tokens work in both light and dark modes)

### References

- [Source: docs/epics.md#Story-5.2]
- [Source: docs/architecture.md#Epic-5]
- [Source: docs/architecture.md#Technology-Stack-Details]
- [Source: docs/PRD.md#User-Experience-Principles]
- [Source: docs/PRD.md#Visual-Personality]
- [Source: docs/PRD.md#Accessibility-Requirements]
- [Source: docs/stories/5-1-responsive-layout-design.md#Dev-Notes]
- [Source: Tailwind CSS Configuration](https://tailwindcss.com/docs/configuration)
- [Source: WCAG 2.1 Level AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa)

## Dev Agent Record

### Context Reference

- `docs/stories/5-2-modern-visual-design-system.context.xml`

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2025-01-27: Story created from epics.md

