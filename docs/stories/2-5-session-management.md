# Story 2.5: Session Management

Status: ready-for-dev

## Story

As a student,
I want to start a new problem session when needed,
so that I can work on multiple problems without confusion.

## Acceptance Criteria

1. "New Problem" or "Clear Chat" button is available
2. Clearing chat resets conversation history
3. Confirmation dialog prevents accidental clearing
4. New session starts fresh conversation context
5. Previous session is not automatically saved (for MVP)

## Tasks / Subtasks

- [ ] Task 1: Create ClearChat button component (AC: 1)
  - [ ] Create `components/chat/ClearChatButton.tsx` file (or add to ChatInterface)
  - [ ] Implement "New Problem" or "Clear Chat" button
  - [ ] Style button with Tailwind CSS following architecture patterns
  - [ ] Position button appropriately in chat interface (e.g., top-right or header)
  - [ ] Ensure button is accessible (ARIA labels, keyboard navigation)
  - [ ] Add icon or text label for button
- [ ] Task 2: Create confirmation dialog component (AC: 3)
  - [ ] Create `components/ui/ConfirmationDialog.tsx` file (or inline in ChatInterface)
  - [ ] Implement confirmation dialog for clearing chat
  - [ ] Dialog shows confirmation message: "Are you sure you want to clear the chat? This will reset the conversation."
  - [ ] Dialog has "Cancel" and "Clear Chat" buttons
  - [ ] Dialog can be dismissed (Escape key, click outside, or Cancel button)
  - [ ] Style dialog with Tailwind CSS following architecture patterns
  - [ ] Ensure dialog is accessible (ARIA labels, focus management, keyboard navigation)
- [ ] Task 3: Integrate ClearChat button into ChatInterface (AC: 1, 3)
  - [ ] Add ClearChat button to ChatInterface layout
  - [ ] Position button appropriately (e.g., top-right or header area)
  - [ ] Connect button to confirmation dialog
  - [ ] Show confirmation dialog when button is clicked
  - [ ] Handle dialog confirmation and cancellation
- [ ] Task 4: Implement clear chat functionality (AC: 2, 4)
  - [ ] Create clearChat function in ChatInterface
  - [ ] Clear conversation history (reset messages array to empty)
  - [ ] Clear error state and retry message state
  - [ ] Clear loading state (isAIResponding)
  - [ ] Reset conversation context for new session
  - [ ] Verify conversation history is cleared correctly
- [ ] Task 5: Handle confirmation dialog state (AC: 3)
  - [ ] Add showConfirmDialog state to ChatInterface
  - [ ] Show confirmation dialog when ClearChat button is clicked
  - [ ] Hide confirmation dialog when Cancel is clicked or dialog is dismissed
  - [ ] Hide confirmation dialog when Clear Chat is confirmed
  - [ ] Handle Escape key to dismiss dialog
  - [ ] Handle click outside to dismiss dialog (optional)
- [ ] Task 6: Ensure session persistence rules (AC: 5)
  - [ ] Verify previous session is not automatically saved (for MVP)
  - [ ] Verify conversation history is cleared when starting new problem
  - [ ] Verify new session starts with fresh conversation context
  - [ ] Verify conversation history persists during single problem solving session (until cleared)
  - [ ] Document session persistence rules for MVP
- [ ] Task 7: Testing and verification (AC: 1-5)
  - [ ] Test "New Problem" or "Clear Chat" button is available
  - [ ] Test button appears in chat interface
  - [ ] Test button is accessible (keyboard navigation, screen reader)
  - [ ] Test confirmation dialog appears when button is clicked
  - [ ] Test confirmation dialog shows correct message
  - [ ] Test confirmation dialog can be dismissed (Escape key, Cancel button)
  - [ ] Test clearing chat resets conversation history
  - [ ] Test new session starts fresh conversation context
  - [ ] Test previous session is not automatically saved
  - [ ] Test conversation history is cleared correctly
  - [ ] Test error state and loading state are cleared
  - [ ] Test conversation context is reset for new session
  - [ ] Verify accessibility (keyboard navigation, screen reader, focus management)
  - [ ] Test responsive design (mobile, tablet, desktop)

## Dev Notes

### Learnings from Previous Story

**From Story 2-4-conversation-context-management (Status: ready-for-dev)**

- **Conversation History Management**: ChatInterface maintains conversation history array with all messages (student and tutor). Conversation history is maintained in chronological order. Conversation history is sent with each API call. Conversation history persists during single problem solving session. Ready for enhancement to clear conversation history when starting new problem.
- **ChatInterface State Management**: ChatInterface uses React useState for message state management. Component manages messages, isAIResponding, error, and retryMessage states. Ready for enhancement to add clearChat function and confirmation dialog state.
- **Context Window Management**: Context window management implemented in API route or context utility functions. Context window management truncates messages if too long. Context window management preserves system prompt and most recent messages. Ready for enhancement to reset context window when starting new problem.

**Files from Story 2.4:**
- `socratica/components/chat/ChatInterface.tsx` - Main chat interface (reference for clearChat function implementation)
- `socratica/app/api/chat/route.ts` - Chat API route (reference for conversation context handling)
- `socratica/lib/openai/context.ts` - Conversation context management (reference for context reset)

**From Story 2-3-llm-api-integration (Status: review)**

- **ChatInterface Integration**: ChatInterface integrated with chat API route. ChatInterface sends conversation history with each API call. ChatInterface maintains message state with React useState. ChatInterface handles loading states, error states, and retry functionality. Ready for enhancement to clear conversation history.
- **Message State Management**: ChatInterface uses React useState for message state management. Component manages messages, isAIResponding, error, and retryMessage states. Ready for enhancement to add clearChat function.

**Files from Story 2.3:**
- `socratica/components/chat/ChatInterface.tsx` - Main chat interface (reference for state management patterns)

**From Story 2-2-message-sending-and-display (Status: review)**

- **MessageInput Component Created**: MessageInput component created in `components/chat/MessageInput.tsx`. Component handles message input, validation, submission, and loading states. Component integrates with ChatInterface. Ready for enhancement to work with cleared chat state.

**Files from Story 2.2:**
- `socratica/components/chat/MessageInput.tsx` - Message input component (reference for component patterns)

### Architecture Patterns

**Session Management:**
- "New Problem" or "Clear Chat" button is available
- Clearing chat resets conversation history
- Confirmation dialog prevents accidental clearing
- New session starts fresh conversation context
- Previous session is not automatically saved (for MVP)

**Confirmation Dialog:**
- Dialog shows confirmation message for clearing chat
- Dialog has "Cancel" and "Clear Chat" buttons
- Dialog can be dismissed (Escape key, click outside, or Cancel button)
- Dialog is accessible (ARIA labels, focus management, keyboard navigation)
- Dialog follows existing modal/dialog patterns

**Clear Chat Functionality:**
- Clear conversation history (reset messages array to empty)
- Clear error state and retry message state
- Clear loading state (isAIResponding)
- Reset conversation context for new session
- Verify conversation history is cleared correctly

**State Management:**
- ChatInterface manages conversation history with React useState
- Add showConfirmDialog state to ChatInterface
- Clear all relevant states when clearing chat
- Reset conversation context for new session

**UI Components:**
- ClearChat button component (or inline in ChatInterface)
- Confirmation dialog component (or inline in ChatInterface)
- Button styling follows existing patterns
- Dialog styling follows existing patterns

**Naming Patterns:**
- Components: PascalCase matching file name (e.g., `ClearChatButton.tsx` contains `ClearChatButton` component)
- Files: Match component name exactly
- Functions: camelCase (e.g., `clearChat()`, `handleClearChat()`)
- Constants: UPPER_SNAKE_CASE (e.g., `CONFIRMATION_MESSAGE`)
- Types/Interfaces: PascalCase (e.g., `ClearChatButtonProps`, `ConfirmationDialogProps`)

### Project Structure Notes

**Expected Component Structure:**
```
socratica/
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx        # Main chat interface (exists, needs clearChat function)
│   │   ├── MessageInput.tsx         # Message input component (exists)
│   │   ├── MessageList.tsx          # Message list component (exists)
│   │   ├── ClearChatButton.tsx      # Clear chat button component (to be created)
│   │   └── TypingIndicator.tsx       # Future: Typing indicator component
│   └── ui/
│       ├── Button.tsx               # Future: Reusable button component
│       ├── ConfirmationDialog.tsx   # Confirmation dialog component (to be created)
│       ├── Loading.tsx              # Future: Loading component
│       └── ErrorBoundary.tsx        # Future: Error boundary component
```

**Alignment with Architecture:**
- Session management matches `docs/architecture.md` patterns
- Confirmation dialog follows existing modal/dialog patterns
- Clear chat functionality follows existing state management patterns
- Button and dialog components follow existing component patterns

**Integration Points:**
- ClearChat button will be integrated into ChatInterface component
- Confirmation dialog will be shown when ClearChat button is clicked
- Clear chat function will reset conversation history in ChatInterface
- Clear chat function will reset all relevant states (messages, error, retryMessage, isAIResponding)
- New session will start with fresh conversation context

**Clear Chat Functionality:**
- Clear conversation history (reset messages array to empty)
- Clear error state and retry message state
- Clear loading state (isAIResponding)
- Reset conversation context for new session
- Verify conversation history is cleared correctly

**Confirmation Dialog:**
- Dialog shows confirmation message: "Are you sure you want to clear the chat? This will reset the conversation."
- Dialog has "Cancel" and "Clear Chat" buttons
- Dialog can be dismissed (Escape key, click outside, or Cancel button)
- Dialog is accessible (ARIA labels, focus management, keyboard navigation)
- Dialog follows existing modal/dialog patterns

**Session Persistence:**
- Previous session is not automatically saved (for MVP)
- Conversation history is cleared when starting new problem
- New session starts with fresh conversation context
- Conversation history persists during single problem solving session (until cleared)

### References

- [Source: docs/epics.md#Story-2.5]
- [Source: docs/architecture.md#Epic-2]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/PRD.md#Goalpost-2]
- [Source: docs/stories/2-4-conversation-context-management.md#Dev-Agent-Record]
- [Source: docs/stories/2-3-llm-api-integration.md#Dev-Agent-Record]
- [Source: docs/stories/2-2-message-sending-and-display.md#Dev-Agent-Record]

## Dev Agent Record

### Context Reference

- [Story Context XML: docs/stories/2-5-session-management.context.xml](./2-5-session-management.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

