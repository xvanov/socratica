# Story 3.2: Stuck Detection Logic

Status: ready-for-dev

## Story

As a student,
I want the AI tutor to recognize when I'm stuck,
so that I can receive helpful hints when I need them most.

## Acceptance Criteria

1. Tracks number of consecutive responses indicating confusion
2. Detects patterns: "I don't know", "I'm stuck", repeated questions
3. Flags student as "stuck" after 2 consecutive confused responses
4. Logic considers response content, not just length
5. Stuck state is tracked per problem session

## Tasks / Subtasks

- [ ] Task 1: Create stuck detection utility functions (AC: 1, 2, 3, 4)
  - [ ] Create `lib/openai/stuck-detection.ts` file
  - [ ] Implement function to analyze student response for confusion indicators
  - [ ] Detect patterns: "I don't know", "I'm stuck", repeated questions, confusion phrases
  - [ ] Consider response content (not just length) for confusion detection
  - [ ] Implement function to track consecutive confused responses
  - [ ] Implement function to flag student as "stuck" after 2 consecutive confused responses
  - [ ] Export stuck detection functions for use in chat API route
  - [ ] Add TypeScript types for stuck detection state
- [ ] Task 2: Integrate stuck detection into conversation context (AC: 1, 5)
  - [ ] Create stuck state tracking mechanism per problem session
  - [ ] Store stuck state in conversation context or session state
  - [ ] Reset stuck state when student makes progress or starts new problem
  - [ ] Ensure stuck state persists during single problem solving session
  - [ ] Update conversation context to include stuck detection state
- [ ] Task 3: Update chat API route to use stuck detection (AC: 1, 2, 3, 4)
  - [ ] Update chat API route to analyze student responses for confusion
  - [ ] Track consecutive confused responses in conversation context
  - [ ] Flag student as "stuck" after 2 consecutive confused responses
  - [ ] Pass stuck state to OpenAI API (via system prompt or context)
  - [ ] Ensure stuck detection logic considers response content, not just length
  - [ ] Verify stuck detection works correctly with conversation context
- [ ] Task 4: Update ChatInterface to track stuck state (AC: 5)
  - [ ] Add stuck state tracking to ChatInterface component
  - [ ] Update ChatInterface to send stuck state with conversation context
  - [ ] Ensure stuck state is tracked per problem session
  - [ ] Reset stuck state when student makes progress or starts new problem
  - [ ] Verify stuck state persists during session
- [ ] Task 5: Testing and verification (AC: 1-5)
  - [ ] Test tracks number of consecutive responses indicating confusion
  - [ ] Test detects patterns: "I don't know", "I'm stuck", repeated questions
  - [ ] Test flags student as "stuck" after 2 consecutive confused responses
  - [ ] Test logic considers response content, not just length
  - [ ] Test stuck state is tracked per problem session
  - [ ] Test stuck state resets when student makes progress
  - [ ] Test stuck state resets when starting new problem
  - [ ] Test stuck detection works correctly with conversation context
  - [ ] Test stuck detection integrates with chat API route
  - [ ] Verify accessibility (keyboard navigation, screen reader)
  - [ ] Test responsive design (mobile, tablet, desktop)

## Dev Notes

### Learnings from Previous Story

**From Story 3-1-socratic-system-prompt-design (Status: drafted)**

- **Socratic System Prompt Created**: Socratic system prompt created in `lib/openai/prompts.ts` for math tutoring. Prompt guides AI to ask questions, not give answers. Prompt includes examples of Socratic questioning approach. Prompt defines when hints are appropriate (after 2+ stuck turns). Prompt maintains encouraging, patient tone. Prompt focuses on algebra problems for MVP. Ready for enhancement to integrate stuck detection logic.

**Files from Story 3.1:**
- `socratica/lib/openai/prompts.ts` - Socratic system prompt (reference for prompt structure and hint timing)

**From Story 2-4-conversation-context-management (Status: ready-for-dev)**

- **Conversation Context Management**: Conversation context management utilities created in `lib/openai/context.ts`. Context utilities convert Message[] to OpenAI API format. Context utilities maintain chronological order of messages. Context utilities implement context window management (truncate if too long). Conversation history array maintained in ChatInterface. Conversation context sent with each API call. Ready for enhancement to include stuck detection state.

**Files from Story 2.4:**
- `socratica/lib/openai/context.ts` - Conversation context management utilities (reference for context structure)
- `socratica/app/api/chat/route.ts` - Chat API route (reference for conversation context integration)
- `socratica/components/chat/ChatInterface.tsx` - Main chat interface (reference for conversation state management)

### Architecture Patterns

**Stuck Detection Logic:**
- Tracks number of consecutive responses indicating confusion
- Detects patterns: "I don't know", "I'm stuck", repeated questions
- Flags student as "stuck" after 2 consecutive confused responses
- Logic considers response content, not just length
- Stuck state is tracked per problem session

**Confusion Detection Patterns:**
- Explicit confusion phrases: "I don't know", "I'm stuck", "I'm confused", "I don't understand"
- Repeated questions: Same question asked multiple times
- Short, vague responses: Very short responses that don't address the question
- Off-topic responses: Responses that don't relate to the problem
- Response content analysis: Semantic analysis of response content (not just length)

**Stuck State Management:**
- Stuck state tracked per problem session
- Stuck state reset when student makes progress
- Stuck state reset when starting new problem
- Stuck state persisted during single problem solving session
- Stuck state passed to OpenAI API for hint generation

**Integration Points:**
- Stuck detection utilities stored in `lib/openai/stuck-detection.ts`
- Stuck detection integrated into chat API route
- Stuck state included in conversation context
- Stuck state tracked in ChatInterface component
- Stuck state passed to OpenAI API (via system prompt or context)

**Naming Patterns:**
- Utilities: `lib/openai/{feature}.ts` (e.g., `lib/openai/stuck-detection.ts`)
- Functions: camelCase (e.g., `detectConfusion()`, `trackStuckState()`, `isStudentStuck()`)
- Constants: UPPER_SNAKE_CASE (e.g., `CONFUSION_PATTERNS`, `MAX_CONSECUTIVE_CONFUSED`)
- Types/Interfaces: PascalCase (e.g., `StuckState`, `ConfusionIndicators`)

### Project Structure Notes

**Expected File Structure:**
```
socratica/
├── lib/
│   └── openai/
│       ├── client.ts              # OpenAI client (exists)
│       ├── prompts.ts             # Socratic system prompt (exists, reference)
│       ├── context.ts             # Conversation context management (exists, reference)
│       └── stuck-detection.ts     # Stuck detection logic (to be created)
├── app/
│   └── api/
│       └── chat/
│           └── route.ts            # Chat API route (exists, needs stuck detection integration)
├── components/
│   └── chat/
│       └── ChatInterface.tsx       # Main chat interface (exists, needs stuck state tracking)
├── types/
│   └── chat.ts                     # Chat-related types (exists, needs StuckState type)
```

**Alignment with Architecture:**
- Stuck detection logic matches `docs/architecture.md` patterns for Epic 3
- Stuck detection integrates with Socratic system prompt from Story 3.1
- Stuck detection integrates with conversation context management from Story 2.4
- Stuck detection follows existing OpenAI integration patterns

**Integration Points:**
- Stuck detection utilities created in `lib/openai/stuck-detection.ts`
- Stuck detection integrated into chat API route (`app/api/chat/route.ts`)
- Stuck state tracked in ChatInterface component
- Stuck state included in conversation context
- Stuck state passed to OpenAI API (via system prompt or context)

**Confusion Detection Strategy:**
- Analyze response content for confusion indicators
- Detect explicit confusion phrases: "I don't know", "I'm stuck", "I'm confused"
- Detect repeated questions (same question asked multiple times)
- Detect short, vague responses that don't address the question
- Consider semantic meaning, not just response length
- Track consecutive confused responses across conversation turns

**Stuck State Tracking:**
- Track stuck state per problem session
- Reset stuck state when student makes progress (provides correct answer or shows understanding)
- Reset stuck state when starting new problem
- Persist stuck state during single problem solving session
- Pass stuck state to OpenAI API for hint generation (after 2+ stuck turns)

### References

- [Source: docs/epics.md#Story-3.2]
- [Source: docs/architecture.md#Epic-3]
- [Source: docs/architecture.md#Socratic-Dialogue-Capability]
- [Source: docs/PRD.md#FR-9]
- [Source: docs/stories/3-1-socratic-system-prompt-design.md#Dev-Agent-Record]
- [Source: docs/stories/2-4-conversation-context-management.md#Dev-Agent-Record]

## Dev Agent Record

### Context Reference

- [Story Context XML: docs/stories/3-2-stuck-detection-logic.context.xml](./3-2-stuck-detection-logic.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2025-11-03: Story created from epics.md

