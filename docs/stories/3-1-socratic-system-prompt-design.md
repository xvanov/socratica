# Story 3.1: Socratic System Prompt Design

Status: drafted

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

- [ ] Task 1: Create Socratic system prompt (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Create or update `lib/openai/prompts.ts` file
  - [ ] Implement Socratic system prompt that instructs AI to NEVER give direct answers
  - [ ] Emphasize asking guiding questions instead of giving answers
  - [ ] Include examples of Socratic questioning approach
  - [ ] Define when hints are appropriate (after 2+ stuck turns)
  - [ ] Maintain encouraging, patient tone throughout prompt
  - [ ] Focus prompt on algebra problems for MVP
  - [ ] Export system prompt function for use in chat API route
- [ ] Task 2: Integrate Socratic prompt into chat API route (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Update `app/api/chat/route.ts` to use Socratic system prompt
  - [ ] Replace existing system prompt with Socratic prompt
  - [ ] Ensure prompt is sent with each API call to OpenAI
  - [ ] Verify prompt is included in conversation context
  - [ ] Test prompt is correctly formatted for OpenAI API
- [ ] Task 3: Test Socratic prompt behavior (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Test AI does not give direct answers
  - [ ] Test AI asks guiding questions
  - [ ] Test prompt examples are effective
  - [ ] Test hint timing (after 2+ stuck turns)
  - [ ] Test encouraging, patient tone
  - [ ] Test focus on algebra problems
  - [ ] Verify prompt maintains Socratic approach throughout conversation

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

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2025-11-03: Story created from epics.md


