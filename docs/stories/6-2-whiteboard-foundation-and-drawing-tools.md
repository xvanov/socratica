# Story 6.2: Whiteboard Foundation & Drawing Tools

Status: drafted

## Story

As a student,
I want a shared drawing canvas with comprehensive drawing tools and mathematical diagram support,
so that I can visually represent geometric problems and graphs.

## Acceptance Criteria

1. Canvas element is available in chat interface
2. Canvas supports drawing with mouse/touch input
3. Canvas dimensions are responsive to screen size
4. Basic drawing tools: pen tool for freehand drawing, eraser tool for corrections
5. Advanced drawing tools: line tool for straight lines, shape tools (circle, rectangle, polygon)
6. Color picker for drawing elements
7. Tool selection UI is intuitive
8. Supports geometric shapes (triangles, circles, polygons)
9. Supports coordinate grid for graphing
10. Supports axis labels and annotations
11. Supports equation rendering on canvas
12. Supports angle and measurement tools
13. Drawings are visible in real-time

## Tasks / Subtasks

- [ ] Task 1: Research and select canvas/drawing library (AC: 1, 2, 3, 13)
  - [ ] Research canvas libraries (Fabric.js, Konva.js, Paper.js, React-Canvas-Draw, etc.)
  - [ ] Evaluate library capabilities: mouse/touch support, responsive sizing, performance
  - [ ] Select library based on requirements and architecture alignment
  - [ ] Document library selection decision in Dev Notes
  - [ ] Install selected library package

- [ ] Task 2: Create Whiteboard component foundation (AC: 1, 2, 3)
  - [ ] Create `components/whiteboard/Whiteboard.tsx` file
  - [ ] Initialize canvas element with selected library
  - [ ] Implement responsive canvas sizing (mobile, tablet, desktop)
  - [ ] Configure canvas for mouse input handling
  - [ ] Configure canvas for touch input handling (mobile support)
  - [ ] Test canvas rendering and basic interaction
  - [ ] Style with Tailwind CSS following architecture patterns
  - [ ] Ensure accessibility (ARIA labels, keyboard navigation)

- [ ] Task 3: Implement basic drawing tools (AC: 4)
  - [ ] Implement pen tool for freehand drawing
  - [ ] Implement eraser tool for corrections
  - [ ] Add tool selection UI (button group or toolbar)
  - [ ] Handle tool switching logic
  - [ ] Test pen tool drawing with mouse
  - [ ] Test pen tool drawing with touch
  - [ ] Test eraser tool functionality

- [ ] Task 4: Implement advanced drawing tools (AC: 5, 8)
  - [ ] Implement line tool for straight lines
  - [ ] Implement circle shape tool
  - [ ] Implement rectangle shape tool
  - [ ] Implement polygon shape tool
  - [ ] Implement triangle shape tool (specialized polygon)
  - [ ] Add shape tool selection to UI
  - [ ] Test each shape tool functionality
  - [ ] Ensure geometric shapes render correctly

- [ ] Task 5: Implement color picker and styling (AC: 6)
  - [ ] Add color picker component or integrate library color picker
  - [ ] Connect color picker to drawing tools
  - [ ] Apply selected color to pen, shapes, and lines
  - [ ] Store current color selection in state
  - [ ] Display current color in UI
  - [ ] Test color application across all tools

- [ ] Task 6: Create intuitive tool selection UI (AC: 7)
  - [ ] Design toolbar layout (horizontal or vertical)
  - [ ] Create tool buttons with icons
  - [ ] Implement active tool highlighting
  - [ ] Add tooltips for each tool
  - [ ] Ensure responsive design (mobile-friendly toolbar)
  - [ ] Style toolbar following design system patterns
  - [ ] Test tool selection usability

- [ ] Task 7: Implement coordinate grid for graphing (AC: 9)
  - [ ] Add coordinate grid overlay to canvas
  - [ ] Configure grid spacing (adjustable or fixed)
  - [ ] Style grid lines (color, thickness, dashed/solid)
  - [ ] Ensure grid scales with canvas size
  - [ ] Add toggle to show/hide grid
  - [ ] Test grid rendering and visibility toggle

- [ ] Task 8: Implement axis labels and annotations (AC: 10)
  - [ ] Add x-axis and y-axis labels
  - [ ] Implement axis numbering/tick marks
  - [ ] Add text annotation tool for labels
  - [ ] Support custom text annotations on canvas
  - [ ] Ensure labels scale with canvas size
  - [ ] Test axis labels and annotations

- [ ] Task 9: Integrate equation rendering on canvas (AC: 11)
  - [ ] Integrate KaTeX rendering into canvas (reuse Epic 4 patterns)
  - [ ] Create text tool that supports LaTeX syntax
  - [ ] Render equations as images or SVG on canvas
  - [ ] Position equations on canvas
  - [ ] Test equation rendering with various math expressions
  - [ ] Ensure equation rendering maintains quality when zoomed

- [ ] Task 10: Implement angle and measurement tools (AC: 12)
  - [ ] Implement angle measurement tool
  - [ ] Implement distance measurement tool
  - [ ] Display measurements on canvas
  - [ ] Add measurement units (degrees for angles, pixels/units for distance)
  - [ ] Test measurement accuracy
  - [ ] Ensure measurements update when shapes are modified

- [ ] Task 11: Integrate whiteboard into chat interface (AC: 1)
  - [ ] Add whiteboard toggle/button to chat interface
  - [ ] Create whiteboard panel or modal integration
  - [ ] Ensure whiteboard and chat can coexist in UI
  - [ ] Test whiteboard integration with chat layout
  - [ ] Ensure responsive design (whiteboard adapts to available space)
  - [ ] Test accessibility of whiteboard integration

- [ ] Task 12: Ensure real-time visibility (AC: 13)
  - [ ] Verify drawings appear immediately as user draws
  - [ ] Optimize rendering performance for smooth drawing
  - [ ] Test drawing responsiveness on different devices
  - [ ] Handle performance edge cases (large drawings, many elements)
  - [ ] Test real-time rendering with various tools

- [ ] Task 13: Testing and verification (AC: 1-13)
  - [ ] Test canvas rendering across browsers (Chrome, Firefox, Safari, Edge)
  - [ ] Test responsive design (mobile, tablet, desktop)
  - [ ] Test touch input on mobile devices
  - [ ] Test all drawing tools functionality
  - [ ] Test color picker integration
  - [ ] Test geometric shapes rendering
  - [ ] Test coordinate grid and axis labels
  - [ ] Test equation rendering on canvas
  - [ ] Test angle and measurement tools
  - [ ] Test accessibility (keyboard navigation, screen reader)
  - [ ] Test performance with complex drawings
  - [ ] Create E2E tests for whiteboard functionality
  - [ ] Create unit tests for whiteboard utilities

## Dev Notes

### Learnings from Previous Story

**From Story 6-1-session-history-tracking (Status: done)**

- **Session Management Integration**: SessionHistory component exists at `components/sessions/SessionHistory.tsx` and integrates with ChatInterface. Whiteboard state should be saved as part of session data (next story will handle persistence). Current session structure supports storing additional state - consider adding `whiteboardState` field to Session interface for future integration.

- **Firestore Service Patterns**: Session service functions (`lib/firebase/sessions.ts`) demonstrate patterns for saving/loading state. When implementing whiteboard persistence in Story 6.3, follow similar patterns for saving whiteboard state to Firestore.

- **Component Architecture**: Session components follow established patterns: PascalCase matching file name, Tailwind CSS styling, accessibility features. Whiteboard components should follow same patterns.

- **Testing Patterns**: E2E tests (`tests/e2e/session-history.test.ts`) and unit tests (`lib/firebase/__tests__/sessions-local.test.ts`) demonstrate comprehensive testing patterns. Whiteboard tests should follow similar patterns.

- **Design System Integration**: Components use design system patterns from Epic 5. Whiteboard UI should integrate with existing design system (buttons, toolbars, color picker styling).

**Files from Story 6.1:**
- `socratica/components/sessions/SessionHistory.tsx` - Component patterns (reference for whiteboard component structure)
- `socratica/components/sessions/SessionListItem.tsx` - List item patterns (reference for whiteboard tool UI)
- `socratica/lib/firebase/sessions.ts` - Firestore service patterns (reference for future whiteboard persistence)
- `socratica/types/session.ts` - Session data model (reference for adding whiteboardState field in future)

**From Story 5-6-testing-suite-5-algebra-problems (Status: done)**

- **E2E Testing Framework**: Playwright E2E test framework established with patterns in `tests/e2e/algebra-problems.test.ts`. Whiteboard E2E tests should follow these patterns to verify drawing functionality, tool selection, and canvas interactions.

- **Test Fixtures Pattern**: JSON fixture files in `__fixtures__/` directory provide reusable test data. Consider creating whiteboard fixtures for test data (e.g., `__fixtures__/whiteboard/sample-drawings.json`).

**Files from Story 5.6:**
- `socratica/tests/e2e/algebra-problems.test.ts` - E2E test patterns (reference for whiteboard E2E tests)
- `socratica/tests/utils/e2e-helpers.ts` - E2E helper utilities (reusable patterns)

**From Story 4-2-math-rendering-in-chat-messages (Status: done)**

- **KaTeX Integration**: KaTeX library is integrated for math rendering (`components/math-renderer/`). Whiteboard equation rendering (AC 11) should reuse KaTeX integration patterns from Epic 4. Consider rendering equations as SVG or images that can be positioned on canvas.

**Files from Story 4.2:**
- `socratica/components/math-renderer/` - Math rendering components (reference for equation rendering on canvas)

**From Story 5-4-accessibility-features (Status: done)**

- **Accessibility Patterns**: Components follow WCAG AA accessibility standards with ARIA labels, keyboard navigation, and screen reader support. Whiteboard components must maintain accessibility despite being a visual/interactive canvas. Consider keyboard shortcuts for tools, screen reader descriptions of drawings, and high contrast mode support.

**Files from Story 5.4:**
- `socratica/components/ui/` - UI components with accessibility patterns (reference for whiteboard UI accessibility)

[Source: docs/stories/6-1-session-history-tracking.md#Dev-Agent-Record]
[Source: docs/stories/5-6-testing-suite-5-algebra-problems.md#Dev-Agent-Record]
[Source: docs/stories/4-2-math-rendering-in-chat-messages.md#Dev-Agent-Record]
[Source: docs/stories/5-4-accessibility-features.md#Dev-Agent-Record]

### Architecture Patterns

**Canvas Library Selection:**
- Evaluate libraries: Fabric.js (rich features, complex), Konva.js (performance-focused, 2D), Paper.js (vector graphics), React-Canvas-Draw (simple, React-friendly)
- Consider: Performance on mobile devices, touch support, TypeScript support, React integration, bundle size
- Recommended: Konva.js or Fabric.js for comprehensive feature set and good mobile performance
- Decision should be documented in Dev Notes with rationale

**Whiteboard Component Structure:**
```typescript
components/whiteboard/
├── Whiteboard.tsx              # Main whiteboard component
├── WhiteboardToolbar.tsx      # Tool selection UI
├── WhiteboardCanvas.tsx       # Canvas wrapper/container
├── tools/
│   ├── PenTool.tsx            # Pen tool implementation
│   ├── EraserTool.tsx         # Eraser tool implementation
│   ├── LineTool.tsx           # Line tool implementation
│   ├── ShapeTool.tsx          # Base shape tool
│   └── MeasurementTool.tsx    # Angle/distance measurement
├── overlays/
│   ├── CoordinateGrid.tsx    # Grid overlay component
│   └── AxisLabels.tsx         # Axis labels component
└── utils/
    ├── canvas-utils.ts       # Canvas utility functions
    └── drawing-utils.ts       # Drawing calculation utilities
```

**Data Model for Whiteboard State:**
```typescript
interface WhiteboardState {
  elements: WhiteboardElement[];  // Array of drawn elements
  currentTool: ToolType;         // Currently selected tool
  currentColor: string;          // Currently selected color
  gridVisible: boolean;          // Grid visibility toggle
  // Additional state as needed
}

interface WhiteboardElement {
  id: string;
  type: 'pen' | 'line' | 'circle' | 'rectangle' | 'polygon' | 'text' | 'equation';
  data: ElementData;            // Tool-specific data
  color: string;
  createdAt: string;            // ISO 8601 timestamp
}
```

**Integration with Chat Interface:**
- Whiteboard can be displayed as a panel alongside chat or as a modal overlay
- Toggle button in chat interface to show/hide whiteboard
- Whiteboard state should be isolated from chat state initially (persistence in Story 6.3)
- Consider responsive layout: whiteboard on desktop sidebar, modal on mobile

**Performance Considerations:**
- Canvas rendering must be optimized for smooth drawing
- Consider using requestAnimationFrame for drawing updates
- Optimize redraw operations (only redraw changed elements)
- Test performance with many elements on canvas
- Consider virtualization for very large drawings

**Accessibility:**
- Keyboard shortcuts for tool selection (e.g., P for pen, E for eraser)
- Screen reader descriptions of canvas content
- ARIA labels for all interactive elements
- Focus management for tool selection
- High contrast mode support for drawings

**Naming Patterns:**
- Components: PascalCase matching file name (e.g., `Whiteboard.tsx` contains `Whiteboard` component)
- Files: Match component name exactly
- Functions: camelCase (e.g., `drawLine()`, `selectTool()`)
- Constants: UPPER_SNAKE_CASE (e.g., `TOOL_TYPES`, `DEFAULT_COLOR`)
- Types/Interfaces: PascalCase (e.g., `WhiteboardState`, `ToolType`)

### Project Structure Notes

**Expected Component Structure:**
```
socratica/
├── components/
│   ├── whiteboard/
│   │   ├── Whiteboard.tsx              # Main whiteboard component
│   │   ├── WhiteboardToolbar.tsx      # Tool selection UI
│   │   ├── WhiteboardCanvas.tsx        # Canvas wrapper
│   │   ├── tools/                      # Drawing tool components
│   │   ├── overlays/                   # Grid and axis overlays
│   │   ├── utils/                      # Canvas utilities
│   │   └── __tests__/
│   │       ├── Whiteboard.test.tsx
│   │       └── tools/
│   └── chat/
│       └── ChatInterface.tsx           # Will integrate whiteboard toggle
├── lib/
│   └── types/
│       └── whiteboard.ts               # Whiteboard types and interfaces
├── hooks/
│   └── useWhiteboard.ts                # Whiteboard state management hook (optional)
```

**Alignment with Architecture:**
- Whiteboard components follow `docs/architecture.md` component patterns
- Uses Tailwind CSS for styling (aligned with Epic 5 design system)
- Follows TypeScript strict mode patterns
- Integrates with existing chat interface (Epic 2)
- Reuses KaTeX integration from Epic 4 for equation rendering

**Integration Points:**
- Whiteboard will be integrated into ChatInterface component
- Whiteboard state will be saved to session in Story 6.3 (future story)
- Whiteboard uses design system components from Epic 5
- Whiteboard reuses math rendering patterns from Epic 4

**Dependencies:**
- Selected canvas library (TBD - see Task 1)
- KaTeX library (already installed from Epic 4)
- React hooks for state management
- Tailwind CSS (already configured)

### References

- [Source: docs/epics.md#Story-6.2]
- [Source: docs/architecture.md#Epic-to-Architecture-Mapping]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/architecture.md#Implementation-Patterns]
- [Source: docs/stories/6-1-session-history-tracking.md#Dev-Agent-Record]
- [Source: docs/stories/5-6-testing-suite-5-algebra-problems.md#Dev-Agent-Record]
- [Source: docs/stories/4-2-math-rendering-in-chat-messages.md#Dev-Agent-Record]
- [Source: docs/stories/5-4-accessibility-features.md#Dev-Agent-Record]

## Change Log

- 2025-01-27: Story created from epics.md and enhanced with learnings from previous stories

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

