# Story 3.3: Hint Generation Logic

Status: ready-for-dev

## Story

As a student,
I want helpful hints when I'm stuck,
so that I can make progress without getting direct answers.

## Acceptance Criteria

1. When stuck detected, system prompt instructs AI to provide hints (not answers)
2. Hints are progressively more revealing (not immediate solutions)
3. Hints guide student toward next step in solution
4. Hints maintain Socratic approach (questions within hints)
5. Hints are algebra-specific and problem-appropriate

## Tasks / Subtasks

- [ ] Task 1: Create hint generation prompt enhancement (AC: 1, 4, 5)
  - [ ] Create or update `lib/openai/prompts.ts` with hint generation prompt enhancement
  - [ ] Implement function to generate enhanced prompt when student is stuck
  - [ ] Enhance prompt to instruct AI to provide hints (not answers) when stuck detected
  - [ ] Ensure hints maintain Socratic approach (questions within hints)
  - [ ] Ensure hints are algebra-specific and problem-appropriate
  - [ ] Export hint generation prompt function for use in chat API route
  - [ ] Add TypeScript types for hint generation configuration
- [ ] Task 2: Integrate hint generation with stuck detection (AC: 1, 2, 3)
  - [ ] Update chat API route to check stuck state from stuck detection
  - [ ] When stuck detected, use enhanced prompt with hint generation instructions
  - [ ] Ensure hints are progressively more revealing based on stuck duration
  - [ ] Ensure hints guide student toward next step in solution
  - [ ] Pass stuck state and hint level to prompt generation function
  - [ ] Verify hint generation works correctly with stuck detection
- [ ] Task 3: Implement progressive hint escalation (AC: 2, 3)
  - [ ] Track hint level based on consecutive stuck turns (2+ turns = level 1, 3+ turns = level 2, etc.)
  - [ ] Create hint level escalation logic
  - [ ] Adjust prompt based on hint level (more revealing hints for higher levels)
  - [ ] Ensure hints remain progressive (not immediate solutions)
  - [ ] Ensure hints guide toward next step without giving away solution
  - [ ] Reset hint level when student makes progress
- [ ] Task 4: Update system prompt to support hint generation (AC: 1, 4, 5)
  - [ ] Enhance SOCRATIC_MATH_TUTOR_PROMPT or create separate hint prompt
  - [ ] Add instructions for hint generation when student is stuck
  - [ ] Specify that hints should be questions (maintain Socratic approach)
  - [ ] Specify that hints should be algebra-specific and problem-appropriate
  - [ ] Ensure hint instructions align with progressive hint escalation
  - [ ] Verify prompt maintains encouraging, patient tone
- [ ] Task 5: Testing and verification (AC: 1-5)
  - [ ] Test hint generation when stuck detected (after 2+ stuck turns)
  - [ ] Test hints are progressively more revealing (not immediate solutions)
  - [ ] Test hints guide student toward next step in solution
  - [ ] Test hints maintain Socratic approach (questions within hints)
  - [ ] Test hints are algebra-specific and problem-appropriate
  - [ ] Test progressive hint escalation (level 1, level 2, etc.)
  - [ ] Test hint level resets when student makes progress
  - [ ] Test hint generation integrates with stuck detection
  - [ ] Test hint generation integrates with chat API route
  - [ ] Verify accessibility (keyboard navigation, screen reader)
  - [ ] Test responsive design (mobile, tablet, desktop)

## Dev Notes

### Learnings from Previous Story

**From Story 3-2-stuck-detection-logic (Status: ready-for-dev)**

- **Stuck Detection Logic**: Stuck detection utilities created in `lib/openai/stuck-detection.ts`. Stuck detection analyzes student responses for confusion indicators. Stuck detection flags student as "stuck" after 2 consecutive confused responses. Stuck state tracked per problem session. Stuck state passed to OpenAI API. Ready for enhancement to integrate hint generation when stuck detected.

**Files from Story 3.2:**
- `socratica/lib/openai/stuck-detection.ts` - Stuck detection utilities (reference for stuck state detection)
- `socratica/app/api/chat/route.ts` - Chat API route (reference for stuck state integration)
- `socratica/components/chat/ChatInterface.tsx` - Main chat interface (reference for stuck state tracking)

**From Story 3-1-socratic-system-prompt-design (Status: ready-for-dev)**

- **Socratic System Prompt Created**: Socratic system prompt created in `lib/openai/prompts.ts` for math tutoring. Prompt guides AI to ask questions, not give answers. Prompt includes examples of Socratic questioning approach. Prompt defines when hints are appropriate (after 2+ stuck turns). Prompt maintains encouraging, patient tone. Prompt focuses on algebra problems for MVP. Ready for enhancement to integrate hint generation instructions.

**Files from Story 3.1:**
- `socratica/lib/openai/prompts.ts` - Socratic system prompt (reference for prompt structure and hint timing)

**From Story 2-4-conversation-context-management (Status: ready-for-dev)**

- **Conversation Context Management**: Conversation context management utilities created in `lib/openai/context.ts`. Context utilities convert Message[] to OpenAI API format. Context utilities maintain chronological order of messages. Context utilities implement context window management. Conversation history array maintained in ChatInterface. Ready for enhancement to include hint generation state.

**Files from Story 2.4:**
- `socratica/lib/openai/context.ts` - Conversation context management utilities (reference for context structure)
- `socratica/app/api/chat/route.ts` - Chat API route (reference for conversation context integration)

### Architecture Patterns

**Hint Generation Logic:**
- When stuck detected, system prompt instructs AI to provide hints (not answers)
- Hints are progressively more revealing (not immediate solutions)
- Hints guide student toward next step in solution
- Hints maintain Socratic approach (questions within hints)
- Hints are algebra-specific and problem-appropriate

**Progressive Hint Escalation:**
- Track hint level based on consecutive stuck turns
- Level 1 (2-3 stuck turns): Subtle hint with guiding question
- Level 2 (4-5 stuck turns): More specific hint with guiding question
- Level 3 (6+ stuck turns): Most specific hint (but still not direct answer)
- Reset hint level when student makes progress
- Maintain Socratic approach at all hint levels

**Hint Generation Integration:**
- Integrate with stuck detection from Story 3.2
- Check stuck state before generating response
- Enhance system prompt when stuck detected
- Pass hint level to prompt generation function
- Maintain conversation context with hint instructions

**Prompt Enhancement Strategy:**
- Enhance existing SOCRATIC_MATH_TUTOR_PROMPT with hint instructions
- Or create separate hint prompt function that appends to base prompt
- Include instructions for progressive hint escalation
- Specify that hints should be questions (maintain Socratic approach)
- Specify algebra-specific and problem-appropriate hints

**Integration Points:**
- Hint generation utilities stored in `lib/openai/prompts.ts` or new file
- Hint generation integrated into chat API route
- Hint level tracked alongside stuck state
- Hint instructions included in conversation context
- Hint generation works with existing Socratic prompt

**Naming Patterns:**
- Utilities: `lib/openai/{feature}.ts` (e.g., `lib/openai/prompts.ts` or `lib/openai/hints.ts`)
- Functions: camelCase (e.g., `generateHintPrompt()`, `getHintLevel()`, `escalateHintLevel()`)
- Constants: UPPER_SNAKE_CASE (e.g., `HINT_PROMPT_TEMPLATE`, `MAX_HINT_LEVEL`)
- Types/Interfaces: PascalCase (e.g., `HintLevel`, `HintConfig`)

### Project Structure Notes

**Expected File Structure:**
```
socratica/
├── lib/
│   └── openai/
│       ├── client.ts              # OpenAI client (exists)
│       ├── prompts.ts             # Socratic system prompt (exists, needs hint enhancement)
│       ├── context.ts             # Conversation context management (exists, reference)
│       └── stuck-detection.ts     # Stuck detection logic (exists, reference)
├── app/
│   └── api/
│       └── chat/
│           └── route.ts            # Chat API route (exists, needs hint generation integration)
├── components/
│   └── chat/
│       └── ChatInterface.tsx       # Main chat interface (exists, reference)
├── types/
│   └── chat.ts                     # Chat-related types (exists, may need HintLevel type)
```

**Alignment with Architecture:**
- Hint generation logic matches `docs/architecture.md` patterns for Epic 3
- Hint generation integrates with Socratic system prompt from Story 3.1
- Hint generation integrates with stuck detection from Story 3.2
- Hint generation follows existing OpenAI integration patterns

**Integration Points:**
- Hint generation utilities created in `lib/openai/prompts.ts` (enhance existing) or new file
- Hint generation integrated into chat API route (`app/api/chat/route.ts`)
- Hint level tracked alongside stuck state
- Hint instructions included in conversation context
- Hint generation works with existing Socratic prompt

**Progressive Hint Escalation Strategy:**
- Track consecutive stuck turns to determine hint level
- Level 1 (2-3 turns): Subtle hint with guiding question (e.g., "What operation could you use to isolate the variable?")
- Level 2 (4-5 turns): More specific hint with guiding question (e.g., "Think about what happens when you subtract 5 from both sides of the equation")
- Level 3 (6+ turns): Most specific hint (but still not direct answer) (e.g., "Remember: to solve for x, you need to undo the operations. What do you do first?")
- Reset hint level when student makes progress (provides correct step or shows understanding)

**Hint Generation Prompt Design:**
- Enhance SOCRATIC_MATH_TUTOR_PROMPT with hint instructions when stuck detected
- Instructions should specify: hints are questions, hints are progressive, hints guide toward next step
- Instructions should emphasize: NEVER give direct answers, even in hints
- Instructions should specify: hints are algebra-specific and problem-appropriate
- Instructions should maintain encouraging, patient tone

### References

- [Source: docs/epics.md#Story-3.3]
- [Source: docs/architecture.md#Epic-3]
- [Source: docs/architecture.md#Socratic-Dialogue-Capability]
- [Source: docs/PRD.md#FR-9]
- [Source: docs/stories/3-2-stuck-detection-logic.md#Dev-Agent-Record]
- [Source: docs/stories/3-1-socratic-system-prompt-design.md#Dev-Agent-Record]
- [Source: docs/stories/2-4-conversation-context-management.md#Dev-Agent-Record]

## Dev Agent Record

### Context Reference

- [Story Context XML: docs/stories/3-3-hint-generation-logic.context.xml](./3-3-hint-generation-logic.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2025-11-03: Story created from epics.md

