# Story 3.5: Adaptive Questioning Logic

Status: ready-for-dev

## Story

As a student,
I want the AI tutor to ask questions appropriate to my understanding level,
so that I'm neither overwhelmed nor bored.

## Acceptance Criteria

1. AI adjusts question complexity based on student responses
2. Simplifies questions if student shows confusion
3. Increases difficulty if student shows strong understanding
4. Questions build progressively toward solution
5. Maintains logical sequence in problem-solving approach

## Tasks / Subtasks

- [ ] Task 1: Create adaptive questioning utility functions (AC: 1, 2, 3)
  - [ ] Create `lib/openai/adaptive-questioning.ts` file
  - [ ] Implement function to determine student understanding level from responses
  - [ ] Implement function to adjust question complexity based on understanding level
  - [ ] Implement function to simplify questions when student shows confusion
  - [ ] Implement function to increase difficulty when student shows strong understanding
  - [ ] Track understanding level per problem session
  - [ ] Export adaptive questioning functions for use in chat API route
  - [ ] Add TypeScript types for understanding level and question complexity
- [ ] Task 2: Enhance system prompt for adaptive questioning (AC: 1, 2, 3, 4, 5)
  - [ ] Update `lib/openai/prompts.ts` with adaptive questioning instructions
  - [ ] Add instructions for adjusting question complexity based on student responses
  - [ ] Add instructions for simplifying questions when student shows confusion
  - [ ] Add instructions for increasing difficulty when student shows strong understanding
  - [ ] Add instructions for building questions progressively toward solution
  - [ ] Add instructions for maintaining logical sequence in problem-solving approach
  - [ ] Ensure adaptive questioning instructions maintain Socratic approach
  - [ ] Ensure adaptive questioning instructions maintain encouraging, patient tone
- [ ] Task 3: Integrate adaptive questioning with response validation (AC: 1, 2, 3, 4, 5)
  - [ ] Update chat API route to use response validation to determine understanding level
  - [ ] Pass understanding level to adaptive questioning functions
  - [ ] Adjust system prompt based on understanding level
  - [ ] Ensure questions simplify when confusion detected
  - [ ] Ensure questions increase difficulty when strong understanding detected
  - [ ] Ensure questions build progressively toward solution
  - [ ] Ensure questions maintain logical sequence
  - [ ] Verify adaptive questioning integrates with conversation context
- [ ] Task 4: Implement understanding level tracking (AC: 1, 2, 3)
  - [ ] Create function to track understanding level from response validation results
  - [ ] Map response validation results to understanding levels (confused, struggling, progressing, strong)
  - [ ] Track understanding level per problem session
  - [ ] Update understanding level based on consecutive responses
  - [ ] Reset understanding level when starting new problem
  - [ ] Export understanding level tracking functions
- [ ] Task 5: Implement progressive question building (AC: 4, 5)
  - [ ] Create function to determine next question based on problem-solving progress
  - [ ] Ensure questions build progressively toward solution
  - [ ] Ensure questions maintain logical sequence (e.g., isolate variable before solving)
  - [ ] Map understanding level to appropriate question complexity
  - [ ] Provide question templates for different understanding levels
  - [ ] Export progressive question building functions
- [ ] Task 6: Testing and verification (AC: 1-5)
  - [ ] Test AI adjusts question complexity based on student responses
  - [ ] Test simplifies questions if student shows confusion
  - [ ] Test increases difficulty if student shows strong understanding
  - [ ] Test questions build progressively toward solution
  - [ ] Test questions maintain logical sequence in problem-solving approach
  - [ ] Test understanding level tracking per problem session
  - [ ] Test understanding level resets when starting new problem
  - [ ] Test adaptive questioning integrates with response validation
  - [ ] Test adaptive questioning integrates with chat API route
  - [ ] Test adaptive questioning integrates with conversation context
  - [ ] Verify accessibility (keyboard navigation, screen reader)
  - [ ] Test responsive design (mobile, tablet, desktop)

## Dev Notes

### Learnings from Previous Story

**From Story 3-4-response-validation-framework (Status: ready-for-dev)**

- **Response Validation Framework**: Response validation utilities created in `lib/openai/response-validation.ts`. Response validation evaluates student responses for correctness. Response validation provides feedback for correct/incorrect steps. Response validation recognizes partial progress. Ready for enhancement to use validation results for determining understanding level and adjusting question complexity.

**Files from Story 3.4:**
- `socratica/lib/openai/response-validation.ts` - Response validation utilities (reference for correctness evaluation)
- `socratica/lib/openai/prompts.ts` - System prompt (reference for prompt enhancement patterns)
- `socratica/app/api/chat/route.ts` - Chat API route (reference for integration patterns)

**From Story 3-3-hint-generation-logic (Status: ready-for-dev)**

- **Hint Generation Logic**: Hint generation utilities created in `lib/openai/prompts.ts` or separate file. Hint generation integrates with stuck detection. Progressive hint escalation based on stuck duration. Ready for enhancement to integrate with adaptive questioning to adjust hint complexity based on understanding level.

**Files from Story 3.3:**
- `socratica/lib/openai/prompts.ts` - System prompt (reference for prompt enhancement patterns)
- `socratica/app/api/chat/route.ts` - Chat API route (reference for integration patterns)

**From Story 3-2-stuck-detection-logic (Status: ready-for-dev)**

- **Stuck Detection Logic**: Stuck detection utilities created in `lib/openai/stuck-detection.ts`. Stuck detection analyzes student responses for confusion indicators. Stuck state tracked per problem session. Ready for enhancement to use stuck detection results for understanding level determination.

**Files from Story 3.2:**
- `socratica/lib/openai/stuck-detection.ts` - Stuck detection utilities (reference for confusion detection)

**From Story 2-4-conversation-context-management (Status: done)**

- **Conversation Context Management**: Conversation context management utilities created in `lib/openai/context.ts`. Context utilities maintain conversation history and context window management. Ready for enhancement to include understanding level context.

**Files from Story 2.4:**
- `socratica/lib/openai/context.ts` - Conversation context management utilities (reference for context structure)
- `socratica/app/api/chat/route.ts` - Chat API route (reference for conversation context integration)

### Architecture Patterns

**Adaptive Questioning Logic:**
- AI adjusts question complexity based on student responses
- Simplifies questions if student shows confusion
- Increases difficulty if student shows strong understanding
- Questions build progressively toward solution
- Maintains logical sequence in problem-solving approach

**Understanding Level Determination:**
- Use response validation results to determine understanding level
- Use stuck detection results to identify confusion
- Map validation results to understanding levels: confused, struggling, progressing, strong
- Track understanding level per problem session
- Update understanding level based on consecutive responses

**Question Complexity Adjustment:**
- Confused: Simplify questions, break into smaller steps, use more guidance
- Struggling: Provide scaffolding, simpler questions, more examples
- Progressing: Standard complexity, normal progression
- Strong: Increase difficulty, more challenging questions, less scaffolding

**Progressive Question Building:**
- Questions build progressively toward solution
- Maintain logical sequence (e.g., understand problem → isolate variable → solve)
- Each question builds on previous understanding
- Questions adapt to understanding level while maintaining progression

**Integration Points:**
- Adaptive questioning utilities stored in `lib/openai/adaptive-questioning.ts`
- Adaptive questioning integrates with response validation from Story 3.4
- Adaptive questioning integrates with stuck detection from Story 3.2
- Understanding level passed to system prompt or conversation context
- Adaptive questioning works with existing Socratic prompt

**Naming Patterns:**
- Utilities: `lib/openai/{feature}.ts` (e.g., `lib/openai/adaptive-questioning.ts`)
- Functions: camelCase (e.g., `determineUnderstandingLevel()`, `adjustQuestionComplexity()`, `buildProgressiveQuestions()`)
- Constants: UPPER_SNAKE_CASE (e.g., `UNDERSTANDING_LEVELS`, `QUESTION_COMPLEXITY_LEVELS`)
- Types/Interfaces: PascalCase (e.g., `UnderstandingLevel`, `QuestionComplexity`)

### Project Structure Notes

**Expected File Structure:**
```
socratica/
├── lib/
│   └── openai/
│       ├── client.ts              # OpenAI client (exists)
│       ├── prompts.ts             # Socratic system prompt (exists, needs adaptive questioning enhancement)
│       ├── context.ts             # Conversation context management (exists, reference)
│       ├── stuck-detection.ts     # Stuck detection logic (exists, reference)
│       ├── response-validation.ts # Response validation logic (exists, reference)
│       └── adaptive-questioning.ts # Adaptive questioning logic (to be created)
├── app/
│   └── api/
│       └── chat/
│           └── route.ts            # Chat API route (exists, needs adaptive questioning integration)
├── components/
│   └── chat/
│       └── ChatInterface.tsx       # Main chat interface (exists, reference)
├── types/
│   └── chat.ts                     # Chat-related types (exists, may need UnderstandingLevel type)
```

**Alignment with Architecture:**
- Adaptive questioning logic matches `docs/architecture.md` patterns for Epic 3
- Adaptive questioning integrates with response validation from Story 3.4
- Adaptive questioning integrates with stuck detection from Story 3.2
- Adaptive questioning integrates with Socratic system prompt from Story 3.1
- Adaptive questioning follows existing OpenAI integration patterns

**Integration Points:**
- Adaptive questioning utilities created in `lib/openai/adaptive-questioning.ts`
- Adaptive questioning integrated into chat API route (`app/api/chat/route.ts`)
- Understanding level determined from response validation and stuck detection
- Understanding level passed to system prompt or conversation context
- Adaptive questioning works with existing Socratic prompt

**Understanding Level Mapping:**
- Confused: Multiple incorrect responses, stuck detection triggered, confusion indicators
- Struggling: Some incorrect responses, partial progress, occasional confusion
- Progressing: Mix of correct and incorrect, making progress, occasional confusion
- Strong: Mostly correct responses, few errors, clear understanding

**Question Complexity Levels:**
- Simplified: Break into smaller steps, more guidance, simpler language, examples
- Scaffolded: Provide hints, guide through steps, check understanding frequently
- Standard: Normal progression, standard complexity, balanced guidance
- Advanced: More challenging, less scaffolding, deeper questions, faster progression

**Progressive Question Building Strategy:**
- Identify problem-solving steps (e.g., understand problem → isolate variable → solve)
- Determine current step based on conversation history
- Build next question based on current step and understanding level
- Ensure questions build logically toward solution
- Adapt question complexity to understanding level while maintaining progression

**Adaptive Questioning Prompt Design:**
- Enhance SOCRATIC_MATH_TUTOR_PROMPT with adaptive questioning instructions
- Instructions should specify: adjust complexity based on understanding level
- Instructions should specify: simplify when confused, increase difficulty when strong
- Instructions should specify: build questions progressively toward solution
- Instructions should specify: maintain logical sequence in problem-solving approach
- Instructions should maintain Socratic approach (questions, not direct answers)
- Instructions should maintain encouraging, patient tone

### References

- [Source: docs/epics.md#Story-3.5]
- [Source: docs/architecture.md#Epic-3]
- [Source: docs/architecture.md#Socratic-Dialogue-Capability]
- [Source: docs/PRD.md#FR-17]
- [Source: docs/stories/3-4-response-validation-framework.md#Dev-Agent-Record]
- [Source: docs/stories/3-3-hint-generation-logic.md#Dev-Agent-Record]
- [Source: docs/stories/3-2-stuck-detection-logic.md#Dev-Agent-Record]
- [Source: docs/stories/2-4-conversation-context-management.md#Dev-Agent-Record]

## Dev Agent Record

### Context Reference

- [Story Context XML: docs/stories/3-5-adaptive-questioning-logic.context.xml](./3-5-adaptive-questioning-logic.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2025-11-03: Story created from epics.md

