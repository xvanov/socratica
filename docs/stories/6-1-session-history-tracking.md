# Story 6.1: Session History Tracking

Status: backlog

## Story

As a student,
I want to see a history of all problems I've attempted and be able to resume or delete previous sessions,
so that I can track my learning progress and return to problems I was working on.

## Acceptance Criteria

1. Session history list displays all previous problem sessions
2. Each session shows: problem text/image preview, completion status (solved/not solved/in progress), timestamp
3. Sessions are sorted by most recent first
4. Clicking a session loads that session's conversation history
5. Resuming a session restores the full conversation context
6. Problem input (text/image) is restored when resuming a session
7. Delete button is available for each session
8. Deletion requires confirmation dialog
9. Deleted sessions are removed from history and Firestore
10. Sessions are automatically saved when starting a new problem or when conversation ends
11. Session completion status updates automatically when student solves the problem (or can be marked manually)
12. Empty state shows when no sessions exist
13. History persists across browser sessions and devices (for authenticated users)

## Tasks / Subtasks

- [ ] Task 1: Design Session data model and Firestore schema (AC: 2, 13)
  - [ ] Define Session interface/type
  - [ ] Define completion status enum (solved/not solved/in progress)
  - [ ] Design Firestore collection structure (`sessions` collection)
  - [ ] Define document fields: sessionId, userId, problemText, problemImageUrl, messages, completionStatus, createdAt, updatedAt
  - [ ] Document data model in architecture notes

- [ ] Task 2: Create Firestore service functions for session operations (AC: 9, 10, 13)
  - [ ] Create `lib/firebase/sessions.ts` file
  - [ ] Implement `saveSession()` function to create/update session in Firestore
  - [ ] Implement `getUserSessions()` function to fetch user's sessions
  - [ ] Implement `getSessionById()` function to fetch specific session
  - [ ] Implement `deleteSession()` function to remove session from Firestore
  - [ ] Implement `updateSessionCompletionStatus()` function
  - [ ] Handle Firestore errors gracefully
  - [ ] Export all session service functions

- [ ] Task 3: Create SessionHistory component (AC: 1, 2, 3, 12)
  - [ ] Create `components/sessions/SessionHistory.tsx` file
  - [ ] Display list of sessions sorted by most recent first
  - [ ] Show problem preview (text truncation or image thumbnail)
  - [ ] Show completion status badge (solved/not solved/in progress)
  - [ ] Show timestamp (formatted for user locale)
  - [ ] Implement empty state when no sessions exist
  - [ ] Style with Tailwind CSS following architecture patterns
  - [ ] Ensure responsive design (mobile, tablet, desktop)
  - [ ] Ensure accessibility (ARIA labels, keyboard navigation)

- [ ] Task 4: Create SessionListItem component (AC: 2, 7)
  - [ ] Create `components/sessions/SessionListItem.tsx` file
  - [ ] Display session preview (problem text/image, status, timestamp)
  - [ ] Add "Resume" button/action
  - [ ] Add "Delete" button/action
  - [ ] Style with Tailwind CSS following architecture patterns
  - [ ] Ensure accessibility (ARIA labels, keyboard navigation)

- [ ] Task 5: Integrate session saving into ChatInterface (AC: 10)
  - [ ] Update ChatInterface to save session when starting new problem
  - [ ] Auto-save session periodically or on conversation updates
  - [ ] Save session when conversation ends or student navigates away
  - [ ] Link session to current problem input (text/image)
  - [ ] Handle save errors gracefully (show user-friendly messages)

- [ ] Task 6: Implement session resume functionality (AC: 4, 5, 6)
  - [ ] Create `resumeSession()` function in ChatInterface or parent component
  - [ ] Load session data from Firestore
  - [ ] Restore conversation history (messages array)
  - [ ] Restore problem input (text/image)
  - [ ] Restore session state (stuckState, etc.)
  - [ ] Update UI to show resumed session
  - [ ] Handle resume errors gracefully

- [ ] Task 7: Implement session deletion functionality (AC: 8, 9)
  - [ ] Create delete handler in SessionListItem
  - [ ] Show ConfirmationDialog (reuse existing component)
  - [ ] Dialog message: "Are you sure you want to delete this session? This action cannot be undone."
  - [ ] Call deleteSession() Firestore function
  - [ ] Remove session from local state
  - [ ] Handle deletion errors gracefully
  - [ ] Show success feedback

- [ ] Task 8: Implement completion status tracking (AC: 11)
  - [ ] Detect when problem is solved (via conversation analysis or manual marking)
  - [ ] Update session completion status in Firestore
  - [ ] Show completion status badge in SessionListItem
  - [ ] Allow manual status update (optional: dropdown/button)
  - [ ] Handle status update errors gracefully

- [ ] Task 9: Create session history API route (AC: 4, 5, 6)
  - [ ] Create `app/api/sessions/route.ts` for GET (list sessions) and POST (create session)
  - [ ] Create `app/api/sessions/[sessionId]/route.ts` for GET (get session), PUT (update session), DELETE (delete session)
  - [ ] Implement Firebase Auth verification
  - [ ] Implement user authorization (users can only access their own sessions)
  - [ ] Handle errors and return appropriate status codes
  - [ ] Return data in consistent format

- [ ] Task 10: Add session history UI to main application layout (AC: 1)
  - [ ] Add "Session History" button/link to main navigation or header
  - [ ] Create sessions page (`app/sessions/page.tsx`) or modal/sidebar
  - [ ] Integrate SessionHistory component
  - [ ] Style navigation element following architecture patterns
  - [ ] Ensure accessible navigation

- [ ] Task 11: Update "New Problem" flow to save previous session (AC: 10)
  - [ ] Update ClearChatButton handler to save current session before clearing
  - [ ] Determine completion status before saving
  - [ ] Create new session document in Firestore
  - [ ] Show save confirmation (optional: toast notification)
  - [ ] Handle save errors gracefully

- [ ] Task 12: Testing and verification (AC: 1-13)
  - [ ] Test session creation on new problem start
  - [ ] Test session auto-save during conversation
  - [ ] Test session list displays correctly
  - [ ] Test session sorting (most recent first)
  - [ ] Test resume session functionality
  - [ ] Test session deletion with confirmation
  - [ ] Test completion status updates
  - [ ] Test empty state display
  - [ ] Test error handling (network errors, Firestore errors)
  - [ ] Test responsive design (mobile, tablet, desktop)
  - [ ] Test accessibility (keyboard navigation, screen reader)
  - [ ] Test persistence across browser sessions
  - [ ] Test authorization (users can only access their own sessions)

## Dev Notes

### Learnings from Previous Story

**From Story 2-5-session-management (Status: done)**

- **Session Management**: ClearChatButton allows starting new problem sessions. Previous sessions are not automatically saved (for MVP). Conversation history is cleared when starting new problem. New session starts with fresh conversation context. Ready for enhancement to save sessions before clearing.

- **ChatInterface State Management**: ChatInterface uses React useState for message state management. Component manages messages, isAIResponding, error, and retryMessage states. Ready for enhancement to integrate session saving and loading.

- **ConfirmationDialog Component**: ConfirmationDialog component exists and can be reused for session deletion confirmation.

**Files from Story 2.5:**
- `socratica/components/chat/ChatInterface.tsx` - Main chat interface (reference for session state management)
- `socratica/components/chat/ClearChatButton.tsx` - Clear chat button (needs enhancement to save session before clearing)
- `socratica/components/ui/ConfirmationDialog.tsx` - Confirmation dialog (can be reused for deletion)

**From Story 2-4-conversation-context-management (Status: done)**

- **Conversation History Management**: ChatInterface maintains conversation history array with all messages (student and tutor). Conversation history is maintained in chronological order. Conversation history is sent with each API call. Ready for enhancement to save conversation history to Firestore.

**Files from Story 2.4:**
- `socratica/components/chat/ChatInterface.tsx` - Main chat interface (reference for conversation history structure)
- `socratica/app/api/chat/route.ts` - Chat API route (reference for message handling)

**From Story 0-2-firebase-project-setup (Status: done)**

- **Firebase Setup**: Firebase project configured with Firestore, Auth, and Storage. Firestore instance exported from `lib/firebase/firestore.ts`. Firebase Auth available for user authentication. Ready for session persistence implementation.

**Files from Story 0.2:**
- `socratica/lib/firebase/firestore.ts` - Firestore instance export
- `socratica/lib/firebase/auth.ts` - Firebase Auth instance export
- `socratica/lib/firebase/config.ts` - Firebase configuration

### Architecture Patterns

**Session Data Model:**
```typescript
interface Session {
  sessionId: string; // Auto-generated document ID
  userId: string; // Firebase Auth UID
  problemText?: string; // Text input problem
  problemImageUrl?: string; // Image URL if problem was uploaded
  messages: Message[]; // Full conversation history
  completionStatus: 'solved' | 'not_solved' | 'in_progress';
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  stuckState?: StuckState; // Optional: stuck detection state
}
```

**Firestore Collection Structure:**
- Collection: `sessions`
- Document ID: Auto-generated (sessionId)
- Fields: userId, problemText, problemImageUrl, messages, completionStatus, createdAt, updatedAt, stuckState

**Session Persistence:**
- Sessions saved to Firestore when starting new problem
- Sessions auto-saved periodically during conversation
- Sessions persist across browser sessions and devices (for authenticated users)
- Sessions can be resumed by loading from Firestore

**Session Deletion:**
- Confirmation dialog prevents accidental deletion
- Deletion removes session from Firestore and local state
- Deletion is permanent (cannot be undone)

**Completion Status Tracking:**
- Status updates automatically when problem is solved
- Status can be manually updated by student
- Status displayed as badge in session list

**Naming Patterns:**
- Components: PascalCase matching file name (e.g., `SessionHistory.tsx` contains `SessionHistory` component)
- Files: Match component name exactly
- Functions: camelCase (e.g., `saveSession()`, `resumeSession()`)
- Constants: UPPER_SNAKE_CASE (e.g., `SESSION_COLLECTION_NAME`)
- Types/Interfaces: PascalCase (e.g., `Session`, `SessionListItemProps`)

### Project Structure Notes

**Expected Component Structure:**
```
socratica/
├── components/
│   ├── sessions/
│   │   ├── SessionHistory.tsx        # Session history list component
│   │   ├── SessionListItem.tsx       # Individual session item component
│   │   └── __tests__/
│   │       ├── SessionHistory.test.tsx
│   │       └── SessionListItem.test.tsx
│   ├── chat/
│   │   └── ChatInterface.tsx         # Main chat interface (needs session integration)
│   └── ui/
│       └── ConfirmationDialog.tsx    # Reuse for deletion confirmation
├── lib/
│   ├── firebase/
│   │   ├── sessions.ts               # Session Firestore service functions
│   │   └── firestore.ts              # Firestore instance (exists)
│   └── types/
│       └── session.ts                # Session types and interfaces
├── app/
│   ├── api/
│   │   └── sessions/
│   │       ├── route.ts              # GET (list), POST (create)
│   │       └── [sessionId]/
│   │           └── route.ts         # GET, PUT, DELETE
│   └── sessions/
│       └── page.tsx                  # Sessions page (optional)
```

**Alignment with Architecture:**
- Session persistence matches `docs/architecture.md` Firestore patterns
- Data model follows existing Message and Conversation patterns
- API routes follow existing `/api/chat` route patterns
- Components follow existing component patterns

**Integration Points:**
- SessionHistory component will be integrated into main navigation/page
- ChatInterface will save sessions when starting new problem
- ClearChatButton will save session before clearing
- SessionListItem will handle resume and delete actions
- API routes will handle session CRUD operations with Firebase Auth

**Security Considerations:**
- Firebase Auth required for session access
- Users can only access their own sessions (enforced in API routes)
- Firestore security rules should restrict session access to owner
- Session data includes user ID for authorization checks

### References

- [Source: docs/epics.md#Story-6.1]
- [Source: docs/architecture.md#Data-Architecture]
- [Source: docs/architecture.md#Firestore-Collections]
- [Source: docs/stories/2-5-session-management.md#Dev-Agent-Record]
- [Source: docs/stories/2-4-conversation-context-management.md#Dev-Agent-Record]
- [Source: docs/stories/0-2-firebase-project-setup.md#Dev-Agent-Record]

## Dev Agent Record

### Context Reference

- [Story Context XML: docs/stories/6-1-session-history-tracking.context.xml](./6-1-session-history-tracking.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

_To be filled after implementation_

