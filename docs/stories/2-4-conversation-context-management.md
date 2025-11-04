# Story 2.4: Conversation Context Management

Status: ready-for-dev

## Story

As a student,
I want the AI tutor to remember our previous messages in the session,
so that we can have a multi-turn conversation about solving my problem.

## Acceptance Criteria

1. Maintains conversation history array for current session
2. Sends full conversation context with each API call
3. Context includes all previous messages in chronological order
4. Context window management (truncates if too long)
5. Each message includes role (student/tutor) and content
6. Session persists during single problem solving session

## Tasks / Subtasks

- [ ] Task 1: Enhance ChatInterface to maintain conversation history (AC: 1, 5)
  - [ ] Update ChatInterface to maintain conversation history array
  - [ ] Ensure conversation history includes all messages (student and tutor)
  - [ ] Ensure each message includes role (student/tutor) and content
  - [ ] Ensure messages are stored in chronological order
  - [ ] Ensure conversation history persists during session
  - [ ] Verify conversation history is maintained correctly
- [ ] Task 2: Create conversation context utility functions (AC: 2, 3, 4)
  - [ ] Create `lib/openai/context.ts` file (if not exists)
  - [ ] Implement function to convert Message[] to OpenAI API format
  - [ ] Implement function to maintain chronological order of messages
  - [ ] Implement context window management (truncate if too long)
  - [ ] Implement function to calculate context window size
  - [ ] Implement function to truncate messages if context window exceeded
  - [ ] Export context utility functions for use in chat API route
- [ ] Task 3: Update chat API route to use conversation context (AC: 2, 3, 4)
  - [ ] Update chat API route to receive conversation history from request
  - [ ] Convert conversation history from Message[] to OpenAI API format
  - [ ] Ensure context includes all previous messages in chronological order
  - [ ] Implement context window management (truncate if too long)
  - [ ] Send full conversation context with system prompt to OpenAI API
  - [ ] Verify conversation context is sent correctly to API
- [ ] Task 4: Update ChatInterface to send conversation context (AC: 2, 3)
  - [ ] Update ChatInterface to send conversation history with API call
  - [ ] Ensure conversation history includes all previous messages
  - [ ] Ensure conversation history is sent in chronological order
  - [ ] Verify conversation context is sent correctly to API
  - [ ] Handle API response with updated conversation context
- [ ] Task 5: Implement context window management (AC: 4)
  - [ ] Define context window size limit (e.g., 4096 tokens for GPT-4 Turbo)
  - [ ] Implement function to calculate message token count
  - [ ] Implement function to truncate messages if context window exceeded
  - [ ] Ensure system prompt is preserved when truncating
  - [ ] Ensure most recent messages are preserved when truncating
  - [ ] Handle context window overflow gracefully
  - [ ] Log context window truncation (dev only)
- [ ] Task 6: Ensure session persistence (AC: 6)
  - [ ] Verify conversation history persists during single problem solving session
  - [ ] Ensure conversation history is maintained across page refreshes (optional)
  - [ ] Ensure conversation history is cleared when starting new problem (future)
  - [ ] Verify session persistence works correctly
- [ ] Task 7: Testing and verification (AC: 1-6)
  - [ ] Test conversation history array maintains all messages
  - [ ] Test conversation history includes all previous messages in chronological order
  - [ ] Test conversation context is sent with each API call
  - [ ] Test context window management (truncates if too long)
  - [ ] Test each message includes role (student/tutor) and content
  - [ ] Test session persists during single problem solving session
  - [ ] Test context window truncation preserves system prompt
  - [ ] Test context window truncation preserves most recent messages
  - [ ] Test conversation context conversion (Message[] to OpenAI API format)
  - [ ] Test conversation history is maintained correctly across multiple turns
  - [ ] Test conversation context is sent correctly to OpenAI API
  - [ ] Test API responses maintain conversation context
  - [ ] Verify accessibility (keyboard navigation, screen reader)
  - [ ] Test responsive design (mobile, tablet, desktop)

## Dev Notes

### Learnings from Previous Story

**From Story 2-3-llm-api-integration (Status: in-progress)**

- **Chat API Route Created**: Chat API route created in `app/api/chat/route.ts` with POST handler. Route integrates with OpenAI client to send messages to GPT-4 Turbo model. Route receives student message and conversation history from request. Route sends system prompt and conversation context to OpenAI API. Route receives AI response and returns it in API response format. Ready for enhancement to use conversation context management.
- **ChatInterface Integration**: ChatInterface updated to call chat API route when student message is sent. ChatInterface sends student message and conversation history to API. ChatInterface receives AI response and adds it as tutor message. ChatInterface maintains message state with React useState. Ready for enhancement to maintain conversation context properly.
- **Message State Management**: ChatInterface uses React useState for message state management. Message array structure supports chronological display. Messages include role (student | tutor), content (string), and timestamp (Date | string). Ready for conversation context management enhancement.
- **System Prompt Created**: Socratic system prompt created in `lib/openai/prompts.ts` for math tutoring. Prompt guides AI to ask questions, not give answers. Prompt encourages Socratic method for math tutoring. Ready for use in conversation context management.

**Files from Story 2.3:**
- `socratica/app/api/chat/route.ts` - Chat API route (reference for conversation context integration)
- `socratica/lib/openai/prompts.ts` - Socratic system prompt (reference for system prompt in context)
- `socratica/components/chat/ChatInterface.tsx` - Main chat interface (reference for conversation history management)

**From Story 2-2-message-sending-and-display (Status: review)**

- **MessageInput Component Created**: MessageInput component created in `components/chat/MessageInput.tsx`. Component handles message input, validation, submission, and loading states. Component calls `onMessageSubmit` callback with message text when message is submitted. Component adds student messages to ChatInterface message state.
- **ChatInterface Message State**: ChatInterface maintains message state with React useState. Message array structure supports chronological display. Messages include role (student | tutor), content (string), and timestamp (Date | string). Ready for conversation context management enhancement.

**Files from Story 2.2:**
- `socratica/components/chat/MessageInput.tsx` - Message input component (reference for message submission patterns)
- `socratica/components/chat/ChatInterface.tsx` - Main chat interface (reference for message state management)

### Architecture Patterns

**Conversation Context Management:**
- Maintain conversation history array for current session
- Send full conversation context with each API call
- Context includes all previous messages in chronological order
- Context window management (truncates if too long)
- Each message includes role (student/tutor) and content
- Session persists during single problem solving session

**Context Window Management:**
- Define context window size limit (e.g., 4096 tokens for GPT-4 Turbo)
- Calculate message token count
- Truncate messages if context window exceeded
- Preserve system prompt when truncating
- Preserve most recent messages when truncating
- Handle context window overflow gracefully

**Message Conversion:**
- Convert Message[] (role: student | tutor) to OpenAI API format (role: user | assistant | system)
- Map student role to "user" role in OpenAI API format
- Map tutor role to "assistant" role in OpenAI API format
- Maintain chronological order of messages
- Include system prompt in conversation context

**State Management:**
- ChatInterface manages conversation history with React useState
- Conversation history array includes all messages (student and tutor)
- Messages are stored in chronological order
- Conversation history persists during session
- Conversation history is sent with each API call

**API Integration:**
- Chat API route receives conversation history from request
- Chat API route converts conversation history to OpenAI API format
- Chat API route implements context window management
- Chat API route sends full conversation context to OpenAI API
- Chat API route receives AI response and returns it

**Naming Patterns:**
- Utilities: `lib/openai/{feature}.ts` (e.g., `lib/openai/context.ts`)
- Functions: camelCase (e.g., `convertMessagesToOpenAIFormat()`, `truncateContextWindow()`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_CONTEXT_WINDOW_TOKENS`)
- Types/Interfaces: PascalCase (e.g., `ConversationContext`, `OpenAIMessage`)

### Project Structure Notes

**Expected Utility Structure:**
```
socratica/
├── lib/
│   ├── openai/
│   │   ├── client.ts             # OpenAI client (exists, reference)
│   │   ├── prompts.ts            # Socratic system prompt (exists, reference)
│   │   └── context.ts            # Conversation context management (to be created)
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API route (exists, needs context integration)
├── components/
│   └── chat/
│       ├── ChatInterface.tsx     # Main chat interface (exists, needs context enhancement)
│       ├── MessageInput.tsx      # Message input component (exists)
│       └── MessageList.tsx       # Message list component (exists)
├── types/
│   └── chat.ts                    # Chat-related types (exists, Message interface ready)
```

**Alignment with Architecture:**
- Conversation context management matches `docs/architecture.md` Communication Patterns section
- Uses React Context API patterns for conversation state (optional, can use useState)
- Follows OpenAI API format patterns from architecture document
- Follows context window management patterns from architecture document

**Integration Points:**
- ChatInterface maintains conversation history array
- ChatInterface sends conversation history with API call
- Chat API route receives conversation history from request
- Chat API route converts conversation history to OpenAI API format
- Chat API route implements context window management
- Chat API route sends full conversation context to OpenAI API
- OpenAI API receives conversation context and returns AI response
- ChatInterface receives AI response and adds it to conversation history

**Context Window Management:**
- Define context window size limit (e.g., 4096 tokens for GPT-4 Turbo)
- Calculate message token count (approximate: 4 characters per token)
- Truncate messages if context window exceeded
- Preserve system prompt when truncating (always keep system prompt)
- Preserve most recent messages when truncating (keep latest messages)
- Handle context window overflow gracefully (log truncation, maintain conversation flow)

**Message Conversion:**
- Convert Message[] (role: student | tutor) to OpenAI API format (role: user | assistant | system)
- Map student role to "user" role in OpenAI API format
- Map tutor role to "assistant" role in OpenAI API format
- Maintain chronological order of messages
- Include system prompt in conversation context (first message with role: "system")

**Session Persistence:**
- Conversation history persists during single problem solving session
- Conversation history is maintained in ChatInterface component state
- Conversation history is cleared when starting new problem (future: Story 2.5)
- Conversation history is not automatically saved (for MVP)

### References

- [Source: docs/epics.md#Story-2.4]
- [Source: docs/architecture.md#Epic-2]
- [Source: docs/architecture.md#Communication-Patterns]
- [Source: docs/architecture.md#Data-Architecture]
- [Source: docs/PRD.md#Goalpost-2]
- [Source: docs/stories/2-3-llm-api-integration.md#Dev-Agent-Record]
- [Source: docs/stories/2-2-message-sending-and-display.md#Dev-Agent-Record]
- [Source: docs/stories/2-1-basic-chat-ui-layout.md#Dev-Agent-Record]

## Dev Agent Record

### Context Reference

- [Story Context XML: docs/stories/2-4-conversation-context-management.context.xml](./2-4-conversation-context-management.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

