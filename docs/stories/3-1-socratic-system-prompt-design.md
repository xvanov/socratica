# Story 3.1: Socratic System Prompt Design

Status: review

## Story

As a student,
I want the AI tutor to ask guiding questions instead of giving direct answers,
so that I learn through discovery rather than just copying solutions.

## Acceptance Criteria

1. System prompt instructs AI to NEVER give direct answers
2. System prompt emphasizes asking guiding questions
3. System prompt includes examples of Socratic questioning approach
4. System prompt defines when hints are appropriate (after 2+ stuck turns)
5. System prompt maintains encouraging, patient tone
6. System prompt focuses on algebra problems for MVP

## Tasks / Subtasks

- [x] Task 1: Create Socratic system prompt (AC: 1, 2, 3, 4, 5, 6)
  - [x] Create or update `lib/openai/prompts.ts` file
  - [x] Implement Socratic system prompt that instructs AI to NEVER give direct answers
  - [x] Emphasize asking guiding questions instead of giving answers
  - [x] Include examples of Socratic questioning approach
  - [x] Define when hints are appropriate (after 2+ stuck turns)
  - [x] Maintain encouraging, patient tone throughout prompt
  - [x] Focus prompt on algebra problems for MVP
  - [x] Export system prompt function for use in chat API route
- [x] Task 2: Integrate Socratic prompt into chat API route (AC: 1, 2, 3, 4, 5, 6)
  - [x] Update `app/api/chat/route.ts` to use Socratic system prompt
  - [x] Replace existing system prompt with Socratic prompt
  - [x] Ensure prompt is sent with each API call to OpenAI
  - [x] Verify prompt is included in conversation context
  - [x] Test prompt is correctly formatted for OpenAI API
- [x] Task 3: Test Socratic prompt behavior (AC: 1, 2, 3, 4, 5, 6)
  - [x] Test AI does not give direct answers
  - [x] Test AI asks guiding questions
  - [x] Test prompt examples are effective
  - [x] Test hint timing (after 2+ stuck turns)
  - [x] Test encouraging, patient tone
  - [x] Test focus on algebra problems
  - [x] Verify prompt maintains Socratic approach throughout conversation

## Dev Notes

### Learnings from Previous Story

**From Story 2-5-session-management (Status: ready-for-dev)**

- **Session Management**: ChatInterface has clearChat function and confirmation dialog. Session management implemented. Ready for enhancement to integrate Socratic system prompt.
- **ChatInterface State Management**: ChatInterface uses React useState for message state management. Component manages messages, isAIResponding, error, retryMessage, and showConfirmDialog states. Ready for enhancement to work with Socratic prompt.

**Files from Story 2.5:**
- `socratica/components/chat/ChatInterface.tsx` - Main chat interface (reference for integration)

**From Story 2-3-llm-api-integration (Status: review)**

- **Chat API Route**: Chat API route created in `app/api/chat/route.ts` with POST handler. Route integrates with OpenAI client to send messages to GPT-4 Turbo model. Route sends system prompt and conversation context to OpenAI API. Ready for enhancement to use Socratic system prompt.
- **System Prompt**: Basic system prompt exists in `lib/openai/prompts.ts` or inline in chat API route. Ready for enhancement to implement Socratic system prompt.

**Files from Story 2.3:**
- `socratica/app/api/chat/route.ts` - Chat API route (reference for system prompt integration)
- `socratica/lib/openai/prompts.ts` - System prompt file (reference for prompt structure)

### Architecture Patterns

**Socratic System Prompt Design:**
- System prompt instructs AI to NEVER give direct answers
- System prompt emphasizes asking guiding questions
- System prompt includes examples of Socratic questioning approach
- System prompt defines when hints are appropriate (after 2+ stuck turns)
- System prompt maintains encouraging, patient tone
- System prompt focuses on algebra problems for MVP

**Prompt Structure:**
- Prompt should be clear and specific
- Prompt should include examples of good Socratic questioning
- Prompt should define boundaries (no direct answers)
- Prompt should specify hint escalation (after 2+ stuck turns)
- Prompt should maintain encouraging tone
- Prompt should focus on algebra problems for MVP

**Integration Points:**
- System prompt will be stored in `lib/openai/prompts.ts`
- System prompt will be imported and used in `app/api/chat/route.ts`
- System prompt will be sent with each API call to OpenAI
- System prompt will be included in conversation context

**Naming Patterns:**
- Functions: camelCase (e.g., `getSocraticSystemPrompt()`, `createSocraticPrompt()`)
- Constants: UPPER_SNAKE_CASE (e.g., `SOCRATIC_PROMPT_TEMPLATE`)
- Types/Interfaces: PascalCase (e.g., `PromptConfig`, `SocraticPromptOptions`)

### Project Structure Notes

**Expected File Structure:**
```
socratica/
├── lib/
│   └── openai/
│       ├── client.ts              # OpenAI client (exists)
│       ├── prompts.ts             # Socratic system prompts (to be created/updated)
│       └── context.ts             # Conversation context management (exists)
├── app/
│   └── api/
│       └── chat/
│           └── route.ts            # Chat API route (exists, needs prompt integration)
```

**Alignment with Architecture:**
- Socratic system prompt matches `docs/architecture.md` patterns for Epic 3
- Prompt structure follows OpenAI API requirements
- Prompt integration follows existing chat API route patterns

**Integration Points:**
- System prompt will be created in `lib/openai/prompts.ts`
- System prompt will be imported into `app/api/chat/route.ts`
- System prompt will be sent with each API call to OpenAI
- System prompt will be included in conversation context

**Prompt Design Considerations:**
- Prompt should be clear and specific about NEVER giving direct answers
- Prompt should emphasize asking guiding questions
- Prompt should include examples of Socratic questioning
- Prompt should define when hints are appropriate (after 2+ stuck turns)
- Prompt should maintain encouraging, patient tone
- Prompt should focus on algebra problems for MVP

### References

- [Source: docs/epics.md#Story-3.1]
- [Source: docs/architecture.md#Epic-3]
- [Source: docs/architecture.md#LLM-API]
- [Source: docs/PRD.md#Goalpost-3]
- [Source: docs/stories/2-5-session-management.md#Dev-Agent-Record]
- [Source: docs/stories/2-3-llm-api-integration.md#Dev-Agent-Record]

## Dev Agent Record

### Context Reference

- [Story Context XML: docs/stories/3-1-socratic-system-prompt-design.context.xml](./3-1-socratic-system-prompt-design.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Refined `SOCRATIC_MATH_TUTOR_PROMPT` in `lib/openai/prompts.ts` to meet all acceptance criteria:
  - Added explicit "CRITICAL RULE: NEVER GIVE DIRECT ANSWERS" section with multiple emphases
  - Enhanced Core Principles to specify "NEVER give answers" and "hints ONLY after 2+ stuck turns"
  - Expanded Socratic Questioning Examples section with 3 comprehensive examples
  - Added Hint Escalation section explicitly defining timing as "after 2+ stuck turns"
  - Changed focus from general math to specifically "algebra problems for MVP"
  - Maintained encouraging, patient tone throughout with explicit language
- Integration verified: Prompt already integrated via `context.ts` → `prepareConversationContext()` → chat API route
- Created comprehensive test suite (`lib/openai/__tests__/prompts.test.ts`) with 29 tests covering all ACs:
  - AC1: 3 tests verifying NEVER give direct answers instruction
  - AC2: 3 tests verifying guiding questions emphasis
  - AC3: 4 tests verifying Socratic questioning examples
  - AC4: 4 tests verifying hint timing (after 2+ stuck turns)
  - AC5: 4 tests verifying encouraging, patient tone
  - AC6: 4 tests verifying algebra focus for MVP
  - Integration and behavioral validation tests
- All tests pass (29/29). Integration tests confirm prompt is correctly included in conversation context.

### File List

- `socratica/lib/openai/prompts.ts` - Updated Socratic system prompt to meet all ACs
- `socratica/lib/openai/__tests__/prompts.test.ts` - Created comprehensive test suite (29 tests)

## Change Log

- 2025-11-03: Story created from epics.md
- 2025-11-03: Story implementation complete - Refined Socratic system prompt to meet all ACs, verified integration, added comprehensive test suite (29 tests). All tests passing.
- 2025-11-03: Senior Developer Review notes appended

## Senior Developer Review (AI)

**Reviewer:** xvanov  
**Date:** 2025-11-03  
**Outcome:** Approve

### Summary

Story 3.1 successfully implements a comprehensive Socratic system prompt that meets all acceptance criteria. The implementation is well-structured, thoroughly tested (29/29 tests passing), and properly integrated into the chat API route. The prompt explicitly enforces the Socratic method with clear instructions to NEVER give direct answers, emphasizes guiding questions, includes examples, defines hint timing (after 2+ stuck turns), maintains an encouraging tone, and focuses on algebra problems for MVP.

**Key Strengths:**
- All 6 acceptance criteria fully implemented with clear evidence
- Comprehensive test coverage (29 tests covering all ACs)
- Proper integration via context.ts into chat API route
- Well-structured prompt with multiple emphases on critical rules
- Clear separation of concerns (prompts.ts, context.ts, route.ts)

**No blockers or critical issues found.**

### Key Findings

**No HIGH severity issues found.**

**No MEDIUM severity issues found.**

**LOW severity observations:**
- Epic tech spec not found (no tech-spec-epic-3*.md) - informational only, does not impact review

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC1 | System prompt instructs AI to NEVER give direct answers | IMPLEMENTED | `prompts.ts:13-16` - "CRITICAL RULE: NEVER GIVE DIRECT ANSWERS" section with multiple emphases<br>`prompts.ts:14-16` - Multiple NEVER statements forbidding direct answers<br>`prompts.ts:29` - "NEVER provide direct answers, solutions, or final results"<br>`prompts.test.ts:6-22` - 3 tests verifying AC1 |
| AC2 | System prompt emphasizes asking guiding questions | IMPLEMENTED | `prompts.ts:20` - "Ask guiding questions, NEVER give answers"<br>`prompts.ts:28` - "ALWAYS respond with questions that guide the student's thinking"<br>`prompts.ts:37` - "Socratic Questioning Examples" section<br>`prompts.test.ts:24-39` - 3 tests verifying AC2 |
| AC3 | System prompt includes examples of Socratic questioning approach | IMPLEMENTED | `prompts.ts:37-45` - "Socratic Questioning Examples" section with 3 comprehensive examples<br>`prompts.ts:39-45` - Examples demonstrate Student/You dialogue pattern<br>`prompts.test.ts:41-62` - 4 tests verifying AC3 including example count verification |
| AC4 | System prompt defines when hints are appropriate (after 2+ stuck turns) | IMPLEMENTED | `prompts.ts:22` - "Provide hints ONLY after 2+ stuck turns"<br>`prompts.ts:47-50` - "Hint Escalation" section explicitly defines timing<br>`prompts.ts:31` - "Track when students are stuck: If they show confusion or lack progress for 2+ consecutive turns"<br>`prompts.test.ts:64-85` - 4 tests verifying AC4 |
| AC5 | System prompt maintains encouraging, patient tone | IMPLEMENTED | `prompts.ts:11` - "patient and encouraging algebra tutor"<br>`prompts.ts:23` - "Celebrate progress - Acknowledge correct thinking"<br>`prompts.ts:35` - "Maintain a patient, encouraging, and supportive tone throughout"<br>`prompts.ts:105-107` - Examples use encouraging language ("Great!", "That's okay!")<br>`prompts.test.ts:87-109` - 4 tests verifying AC5 |
| AC6 | System prompt focuses on algebra problems for MVP | IMPLEMENTED | `prompts.ts:11` - "algebra tutor"<br>`prompts.ts:53` - "This MVP focuses specifically on algebra problems"<br>`prompts.ts:53` - Lists specific algebra problem types (linear equations, systems, quadratic equations)<br>`prompts.test.ts:111-133` - 4 tests verifying AC6 |

**Summary:** 6 of 6 acceptance criteria fully implemented (100% coverage)

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Task 1: Create Socratic system prompt (AC: 1, 2, 3, 4, 5, 6) | ✅ Complete | ✅ VERIFIED COMPLETE | `prompts.ts:11-56` - Complete SOCRATIC_MATH_TUTOR_PROMPT implementation<br>All 8 subtasks verified:<br>- File created/updated ✓<br>- NEVER give direct answers ✓<br>- Emphasize guiding questions ✓<br>- Include examples ✓<br>- Define hint timing ✓<br>- Encouraging tone ✓<br>- Algebra focus ✓<br>- Exported for use ✓ |
| Task 2: Integrate Socratic prompt into chat API route (AC: 1, 2, 3, 4, 5, 6) | ✅ Complete | ✅ VERIFIED COMPLETE | `context.ts:8` - Import of SOCRATIC_MATH_TUTOR_PROMPT<br>`context.ts:54` - Prompt included as system message<br>`context.ts:152-161` - prepareConversationContext function uses prompt<br>`route.ts:103` - Chat API route uses prepareConversationContext<br>`route.test.ts:105-135` - Tests verify prompt is sent with API calls |
| Task 3: Test Socratic prompt behavior (AC: 1, 2, 3, 4, 5, 6) | ✅ Complete | ✅ VERIFIED COMPLETE | `prompts.test.ts` - Comprehensive test suite (29 tests)<br>All 7 subtasks verified:<br>- Tests for no direct answers ✓<br>- Tests for guiding questions ✓<br>- Tests for examples ✓<br>- Tests for hint timing ✓<br>- Tests for encouraging tone ✓<br>- Tests for algebra focus ✓<br>- Integration tests ✓<br>All 29 tests passing ✓ |

**Summary:** 3 of 3 completed tasks verified (100% verification rate, 0 false completions, 0 questionable completions)

### Test Coverage and Gaps

**Test Coverage:** Excellent

**Test Files:**
- `socratica/lib/openai/__tests__/prompts.test.ts` - 29 tests covering all ACs
- `socratica/app/api/chat/__tests__/route.test.ts` - Integration tests verify prompt is sent with API calls

**Test Breakdown by AC:**
- AC1: 3 tests (prompts.test.ts:6-22)
- AC2: 3 tests (prompts.test.ts:24-39)
- AC3: 4 tests (prompts.test.ts:41-62)
- AC4: 4 tests (prompts.test.ts:64-85)
- AC5: 4 tests (prompts.test.ts:87-109)
- AC6: 4 tests (prompts.test.ts:111-133)
- Integration: 2 tests (prompts.test.ts:135-181)
- Behavioral validation: 3 tests (prompts.test.ts:164-181)

**Test Execution:** All 29 tests passing ✓

**Test Quality:**
- Tests are well-structured with clear descriptions
- Tests verify specific requirements with concrete assertions
- Tests check both content presence and behavioral patterns
- Integration tests verify prompt is correctly included in conversation context

**No test gaps identified.**

### Architectural Alignment

**Tech Spec Compliance:** 
- Epic tech spec not found (no tech-spec-epic-3*.md) - informational note only
- Architecture doc reviewed - implementation aligns with Epic 3 patterns from `docs/architecture.md:126`

**Architecture Patterns Verified:**
- ✅ System prompt stored in `lib/openai/prompts.ts` (matches architecture.md)
- ✅ Prompt integrated into chat API route via `context.ts` (matches architecture.md)
- ✅ Prompt sent with each API call to OpenAI (verified in route.ts:103-106)
- ✅ Prompt included in conversation context (verified in context.ts:54)
- ✅ Follows naming patterns: UPPER_SNAKE_CASE for constants (SOCRATIC_MATH_TUTOR_PROMPT)
- ✅ TypeScript strict mode used
- ✅ Proper separation of concerns (prompts.ts, context.ts, route.ts)

**No architecture violations found.**

### Security Notes

**Security Review:**
- Prompt content is static (no user input injection risk)
- Prompt is properly exported and imported (no exposure risk)
- API route validation prevents malicious input (route.ts:68-100)
- No secrets or sensitive data in prompt content
- Prompt length is reasonable (no DoS risk)

**No security issues identified.**

### Best-Practices and References

**Best Practices Observed:**
- ✅ Clear separation of concerns (prompts.ts for prompt definition, context.ts for integration)
- ✅ Comprehensive test coverage (29 tests covering all ACs)
- ✅ Proper TypeScript typing (prompt is string type)
- ✅ Well-documented code with JSDoc comments
- ✅ Consistent naming conventions (UPPER_SNAKE_CASE for constants)
- ✅ Proper error handling in integration (route.ts)

**References:**
- Architecture: `docs/architecture.md` - Epic 3: Socratic Dialogue Logic
- Story Context: `docs/stories/3-1-socratic-system-prompt-design.context.xml`
- Related Stories: 2-3-llm-api-integration, 2-4-conversation-context-management

**Tech Stack:**
- Next.js 15 with App Router
- TypeScript (strict mode)
- OpenAI GPT-4 Turbo
- Vitest for testing

### Action Items

**Code Changes Required:**
*(None - all requirements met)*

**Advisory Notes:**
- Note: Epic tech spec not found (tech-spec-epic-3*.md) - consider creating tech spec for Epic 3 if needed for future stories
- Note: Prompt is well-structured and maintainable - good foundation for future enhancements (hint generation, adaptive questioning, etc.)


