# Story 3.4: Response Validation Framework

Status: ready-for-dev

## Story

As a student,
I want the AI tutor to validate whether my responses are correct,
so that I know if I'm on the right track.

## Acceptance Criteria

1. AI evaluates student responses for correctness
2. Provides positive feedback for correct steps
3. Provides gentle correction for incorrect steps with guiding questions
4. Validates mathematical expressions and equations
5. Recognizes partial progress and encourages continuation

## Tasks / Subtasks

- [ ] Task 1: Create response validation utility functions (AC: 1, 4)
  - [ ] Create `lib/openai/response-validation.ts` file
  - [ ] Implement function to evaluate student responses for correctness
  - [ ] Implement function to validate mathematical expressions and equations
  - [ ] Validate algebra expressions (e.g., "2x + 5", "x = 4")
  - [ ] Validate equation correctness (e.g., "2x + 5 = 13")
  - [ ] Handle common algebraic notation and symbols
  - [ ] Export validation functions for use in chat API route
  - [ ] Add TypeScript types for validation results
- [ ] Task 2: Enhance system prompt for response validation (AC: 1, 2, 3, 5)
  - [ ] Update `lib/openai/prompts.ts` with response validation instructions
  - [ ] Add instructions for evaluating student responses for correctness
  - [ ] Add instructions for providing positive feedback for correct steps
  - [ ] Add instructions for gentle correction with guiding questions for incorrect steps
  - [ ] Add instructions for recognizing partial progress and encouraging continuation
  - [ ] Ensure validation instructions maintain Socratic approach
  - [ ] Ensure validation instructions maintain encouraging, patient tone
- [ ] Task 3: Integrate response validation into chat API route (AC: 1, 2, 3, 4, 5)
  - [ ] Update chat API route to evaluate student responses
  - [ ] Validate mathematical expressions before sending to OpenAI API
  - [ ] Include validation context in system prompt or conversation context
  - [ ] Ensure AI provides positive feedback for correct steps
  - [ ] Ensure AI provides gentle correction with guiding questions for incorrect steps
  - [ ] Ensure AI recognizes partial progress and encourages continuation
  - [ ] Verify validation integrates with conversation context
- [ ] Task 4: Implement mathematical expression validation (AC: 4)
  - [ ] Create function to parse and validate algebraic expressions
  - [ ] Validate expression syntax (e.g., "2x + 5" is valid, "2x +" is invalid)
  - [ ] Validate equation format (e.g., "2x + 5 = 13" is valid)
  - [ ] Validate mathematical correctness (e.g., "2x + 5 = 13" is correct if x = 4)
  - [ ] Handle common algebraic notation (variables, operators, parentheses)
  - [ ] Handle edge cases (empty expressions, invalid syntax, etc.)
  - [ ] Export validation functions for reuse
- [ ] Task 5: Testing and verification (AC: 1-5)
  - [ ] Test AI evaluates student responses for correctness
  - [ ] Test provides positive feedback for correct steps
  - [ ] Test provides gentle correction with guiding questions for incorrect steps
  - [ ] Test validates mathematical expressions and equations
  - [ ] Test recognizes partial progress and encourages continuation
  - [ ] Test validation handles various algebra expression formats
  - [ ] Test validation handles edge cases (empty, invalid syntax, etc.)
  - [ ] Test response validation integrates with chat API route
  - [ ] Test response validation integrates with conversation context
  - [ ] Verify accessibility (keyboard navigation, screen reader)
  - [ ] Test responsive design (mobile, tablet, desktop)

## Dev Notes

### Learnings from Previous Story

**From Story 3-3-hint-generation-logic (Status: ready-for-dev)**

- **Hint Generation Logic**: Hint generation utilities created in `lib/openai/prompts.ts` or separate file. Hint generation integrates with stuck detection. Hint generation provides progressive hints when stuck detected. Enhanced prompt system supports hint generation. Ready for enhancement to integrate response validation for determining correctness.

**Files from Story 3.3:**
- `socratica/lib/openai/prompts.ts` - System prompt (reference for prompt enhancement patterns)
- `socratica/app/api/chat/route.ts` - Chat API route (reference for integration patterns)

**From Story 3-1-socratic-system-prompt-design (Status: ready-for-dev)**

- **Socratic System Prompt Created**: Socratic system prompt created in `lib/openai/prompts.ts` for math tutoring. Prompt guides AI to ask questions, not give answers. Prompt includes examples of Socratic questioning approach. Prompt maintains encouraging, patient tone. Prompt focuses on algebra problems for MVP. Ready for enhancement to include response validation instructions.

**Files from Story 3.1:**
- `socratica/lib/openai/prompts.ts` - Socratic system prompt (reference for prompt structure and enhancement patterns)

**From Story 2-4-conversation-context-management (Status: review)**

- **Conversation Context Management**: Conversation context management utilities created in `lib/openai/context.ts`. Context utilities convert Message[] to OpenAI API format. Context utilities maintain chronological order of messages. Context utilities implement context window management. Conversation history array maintained in ChatInterface. Ready for enhancement to include response validation context.

**Files from Story 2.4:**
- `socratica/lib/openai/context.ts` - Conversation context management utilities (reference for context structure)
- `socratica/app/api/chat/route.ts` - Chat API route (reference for conversation context integration)

### Architecture Patterns

**Response Validation Framework:**
- AI evaluates student responses for correctness
- Provides positive feedback for correct steps
- Provides gentle correction with guiding questions for incorrect steps
- Validates mathematical expressions and equations
- Recognizes partial progress and encourages continuation

**Validation Strategy:**
- Validate mathematical expressions before sending to OpenAI API
- Use LLM to evaluate correctness (semantic understanding)
- Use mathematical expression parser for syntax validation
- Combine syntax validation with semantic evaluation for accuracy
- Provide validation context to OpenAI API for better responses

**Positive Feedback Pattern:**
- Acknowledge correct steps with encouraging language
- Ask follow-up questions to guide next step
- Celebrate progress and understanding
- Maintain Socratic approach (questions, not just "correct!")

**Gentle Correction Pattern:**
- Provide gentle correction for incorrect steps
- Use guiding questions (not direct answers) to help student understand
- Maintain encouraging, patient tone
- Focus on understanding, not just getting right answer

**Partial Progress Recognition:**
- Recognize when student makes partial progress
- Encourage continuation toward solution
- Acknowledge steps taken correctly
- Guide toward next step without overwhelming

**Integration Points:**
- Response validation utilities stored in `lib/openai/response-validation.ts`
- Response validation integrated into chat API route
- Validation instructions included in system prompt
- Validation context passed to OpenAI API
- Validation works with existing Socratic prompt

**Naming Patterns:**
- Utilities: `lib/openai/{feature}.ts` (e.g., `lib/openai/response-validation.ts`)
- Functions: camelCase (e.g., `validateResponse()`, `evaluateCorrectness()`, `validateMathematicalExpression()`)
- Constants: UPPER_SNAKE_CASE (e.g., `VALIDATION_PATTERNS`, `MATH_EXPRESSION_REGEX`)
- Types/Interfaces: PascalCase (e.g., `ValidationResult`, `CorrectnessLevel`)

### Project Structure Notes

**Expected File Structure:**
```
socratica/
├── lib/
│   └── openai/
│       ├── client.ts              # OpenAI client (exists)
│       ├── prompts.ts             # Socratic system prompt (exists, needs validation enhancement)
│       ├── context.ts             # Conversation context management (exists, reference)
│       ├── stuck-detection.ts     # Stuck detection logic (exists, reference)
│       └── response-validation.ts # Response validation logic (to be created)
├── app/
│   └── api/
│       └── chat/
│           └── route.ts            # Chat API route (exists, needs validation integration)
├── components/
│   └── chat/
│       └── ChatInterface.tsx       # Main chat interface (exists, reference)
├── types/
│   └── chat.ts                     # Chat-related types (exists, may need ValidationResult type)
```

**Alignment with Architecture:**
- Response validation logic matches `docs/architecture.md` patterns for Epic 3
- Response validation integrates with Socratic system prompt from Story 3.1
- Response validation integrates with conversation context management from Story 2.4
- Response validation follows existing OpenAI integration patterns

**Integration Points:**
- Response validation utilities created in `lib/openai/response-validation.ts`
- Response validation integrated into chat API route (`app/api/chat/route.ts`)
- Validation instructions included in system prompt
- Validation context passed to OpenAI API
- Validation works with existing Socratic prompt

**Mathematical Expression Validation Strategy:**
- Parse and validate algebraic expression syntax
- Validate equation format (left side = right side)
- Validate mathematical correctness using LLM semantic evaluation
- Handle common algebraic notation (variables, operators, parentheses, exponents)
- Handle edge cases (empty expressions, invalid syntax, malformed equations)
- Provide clear error messages for invalid expressions

**Response Evaluation Strategy:**
- Use LLM to evaluate semantic correctness of student responses
- Compare student response with expected solution steps
- Recognize partial progress (correct reasoning but incomplete)
- Recognize correct steps (complete understanding)
- Recognize incorrect steps (wrong approach or answer)
- Maintain Socratic approach in all feedback (questions, not direct answers)

**Feedback Generation Pattern:**
- Correct steps: "Great! You're on the right track. What's the next step?"
- Incorrect steps: "Let's think about this differently. What operation would you use here?"
- Partial progress: "You're getting there! You've done [X] correctly. What comes next?"
- Maintain encouraging, patient tone in all feedback
- Use guiding questions to help student understand

### References

- [Source: docs/epics.md#Story-3.4]
- [Source: docs/architecture.md#Epic-3]
- [Source: docs/architecture.md#Socratic-Dialogue-Capability]
- [Source: docs/PRD.md#FR-8]
- [Source: docs/stories/3-3-hint-generation-logic.md#Dev-Agent-Record]
- [Source: docs/stories/3-1-socratic-system-prompt-design.md#Dev-Agent-Record]
- [Source: docs/stories/2-4-conversation-context-management.md#Dev-Agent-Record]

## Dev Agent Record

### Context Reference

- [Story Context XML: docs/stories/3-4-response-validation-framework.context.xml](./3-4-response-validation-framework.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2025-11-03: Story created from epics.md

