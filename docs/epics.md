# socratica - Epic Breakdown

**Author:** xvanov
**Date:** 2025-11-03
**Project Level:** Level 3 (Greenfield)
**Target Scale:** MVP → Full Platform

---

## Overview

This document provides the detailed epic breakdown for socratica, transforming Phase 1 and Phase 2 goalposts from the product brief into actionable epics and bite-sized stories for development.

Each epic includes:

- Expanded goal and value proposition
- Complete story breakdown with user stories
- Acceptance criteria for each story
- Story sequencing and dependencies

**Epic Sequencing Principles:**

- Epic 1 establishes foundational infrastructure and initial functionality
- Subsequent epics build progressively, each delivering significant end-to-end value
- Stories within epics are vertically sliced and sequentially ordered
- No forward dependencies - each story builds only on previous work

---

## Summary

**Epic Breakdown Complete!**

This document breaks down Phase 1 and Phase 2 goalposts into implementable epics and stories:

**Phase 1 (MVP) - Foundation + 5 Epics, 28 Stories:**
- Foundation: Project Setup (2 stories)
1. Epic 1: Problem Input (4 stories)
2. Epic 2: Chat Interface & LLM Integration (5 stories)
3. Epic 3: Socratic Dialogue Logic (5 stories)
4. Epic 4: Math Rendering (4 stories)
5. Epic 5: UI Polish (6 stories)

**Phase 2 (Post-MVP) - 7 Epics, 9 Stories:**
6. Epic 6: Interactive Whiteboard (3 stories)
7. Epic 7: Step Visualization (1 story)
8. Epic 8: Voice Interface (1 story)
9. Epic 9: Animated Avatar (1 story)
10. Epic 10: Difficulty Modes (1 story)
11. Epic 11: Problem Generation (1 story)
12. Epic 12: Authentication & Account Management (1 story)

**Total: Foundation (2 stories) + 12 Epics, 39 Stories**

**Estimated Timeline:**
- Phase 1 (MVP): 5-6 weeks
- Phase 2 (Post-MVP): 8-10 weeks

Each story is sized for a single dev agent to complete independently (2-4 hour sessions). Dependencies are clearly mapped to enable parallel development where possible.

**Development Approach:**
- ✅ **Test-Driven Development (TDD)**: All stories follow Red-Green-Refactor cycle
- ✅ **Tests First**: Write failing tests before implementing code
- ✅ **Meaningful Tests**: Tests verify acceptance criteria, not just coverage
- ✅ **CI/CD Pipeline**: Automated formatting, linting, testing, and deployment
- ✅ **Early Deployment**: Public deployment starts on Day 1 with "Hello World"

**Related Documents:**
- [Implementation Plan](./implementation-plan.md) - Detailed TDD implementation guide
- [Test Specifications](./test-specifications.md) - Test specifications for each story

---

## Phase 1 Epics (MVP - Required)

### Epic 1: Problem Input
**Goal:** Enable students to input math problems via text or image upload with accurate OCR parsing.
**Value:** Students can easily share problems without manual typing, supporting real-world homework scenarios.

### Epic 2: Chat Interface & LLM Integration
**Goal:** Build conversational interface with LLM backend that maintains context throughout sessions.
**Value:** Provides the foundation for natural, multi-turn tutoring dialogue.

### Epic 3: Socratic Dialogue Logic
**Goal:** Implement pedagogical logic that asks guiding questions rather than giving answers, with adaptive hinting.
**Value:** Core differentiator - teaches through discovery, not rote answers.

### Epic 4: Math Rendering
**Goal:** Display mathematical equations and notation correctly using LaTeX rendering.
**Value:** Professional presentation of math problems and solutions.

### Epic 5: UI Polish
**Goal:** Create modern, intuitive interface that provides excellent user experience.
**Value:** Ensures accessibility and ease of use for target student population.

## Phase 2 Epics (Post-MVP - After Validation)

### Epic 6: Interactive Whiteboard
**Goal:** Shared visual canvas for diagrams, graphs, and geometric problem solving.
**Value:** Enables visual learning for geometry and graphing concepts.

### Epic 7: Step Visualization
**Goal:** Animated breakdown of solution steps with progressive reveal.
**Value:** Helps students understand logical flow of problem-solving.

### Epic 8: Voice Interface
**Goal:** Speech-to-text input and text-to-speech output for hands-free learning.
**Value:** Accessibility and convenience for different learning preferences.

### Epic 9: Animated Avatar
**Goal:** 2D/3D tutor character with emotional expressions and gestures.
**Value:** Makes AI tutor more engaging and approachable.

### Epic 10: Difficulty Modes
**Goal:** Grade-level adaptive questioning and scaffolding.
**Value:** Personalized difficulty appropriate to student's academic level.

### Epic 11: Problem Generation
**Goal:** Generate practice problems based on student's current work.
**Value:** Enables independent practice and mastery building.

### Epic 12: Authentication & Account Management
**Goal:** Provide secure user authentication and account management capabilities to enable cross-device session persistence and personalized learning experiences.
**Value:** Enables students to access their learning history across devices, personalize their experience, and maintain progress continuity. Critical foundation for session history (Epic 6 Story 6.1) and future personalized features.

---

## Detailed Epic Breakdown

---

## Project Setup (Foundation Stories)

These stories must be completed before starting Epic 1. They establish the foundational infrastructure and project initialization.

### Story 0.1: Project Initialization

As a developer,
I want to initialize the Next.js 15 project with TypeScript and Tailwind CSS,
So that I have a working foundation to build upon.

**Acceptance Criteria:**
1. Run `npx create-next-app@latest socratica --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
2. Project structure matches architecture document (`docs/architecture.md`)
3. TypeScript configuration is correct (strict mode enabled)
4. Tailwind CSS is configured and working
5. ESLint is configured and working
6. Project builds successfully (`npm run build`)
7. Development server runs successfully (`npm run dev`)
8. Project structure includes:
   - `app/` directory with App Router structure
   - `components/` directory
   - `lib/` directory
   - `hooks/` directory
   - `types/` directory
   - `public/` directory

**Prerequisites:** None (first story)

**Technical Notes:**
- Follow architecture document project structure exactly
- Use TypeScript strict mode
- Ensure Tailwind CSS is properly configured
- Verify all directories from architecture are created

### Story 0.2: Firebase Project Setup

As a developer,
I want to set up Firebase project with Firestore, Auth, and Storage,
So that backend services are ready for integration.

**Acceptance Criteria:**
1. Firebase project created in Firebase Console
2. Firestore database initialized (start in test mode for MVP)
3. Firebase Authentication enabled with Google Sign-In provider
4. Firebase Storage bucket created with appropriate security rules
5. Firebase configuration values added to `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (optional)
   - `NEXT_PUBLIC_FIREBASE_APP_ID` (optional)
6. Firebase SDK installed (`npm install firebase`)
7. Firebase config file created at `lib/firebase/config.ts` following architecture patterns
8. Firebase initialization code properly structured and tested
9. Firebase Auth instance exported from `lib/firebase/auth.ts`
10. Firestore instance exported from `lib/firebase/firestore.ts`
11. Firebase Storage instance exported from `lib/firebase/storage.ts`
12. Environment variables properly loaded (test with `console.log` in dev mode)

**Prerequisites:** Story 0.1 (project initialized)

**Technical Notes:**
- Follow architecture document Firebase setup patterns
- Use latest Firebase SDK version
- Configure security rules for MVP (can be tightened later)
- Ensure `.env.local` is in `.gitignore`
- Test Firebase connection before proceeding

**Security Rules (MVP):**
- Firestore: Test mode initially (restrict later)
- Storage: Authenticated users only (can refine later)
- Auth: Google Sign-In only (as per architecture decision)

---

### Epic 1: Problem Input

**Goal:** Enable students to input math problems via text or image upload with accurate OCR parsing.
**Value:** Students can easily share problems without manual typing, supporting real-world homework scenarios.

#### Story 1.1: Text Input Interface

As a student,
I want to type my math problem into a text input field,
So that I can easily share my homework problem with the AI tutor.

**Acceptance Criteria:**
1. Text input field is visible and accessible on the main interface
2. Input field accepts multi-line text for complex problems
3. Input field has placeholder text that guides students
4. Submit button or Enter key sends the problem text
5. Input field clears after submission

**Prerequisites:** None (foundation story)

#### Story 1.2: Image Upload Interface

As a student,
I want to upload a screenshot or photo of my math problem,
So that I don't have to manually type complex equations or problems from textbooks.

**Acceptance Criteria:**
1. Image upload button/file picker is visible on interface
2. Supports common image formats (JPG, PNG, WebP)
3. Image preview displays after selection
4. Image can be removed/cleared before submission
5. File size limits are enforced with user feedback (max 10MB)
6. Loading state shows during upload process
7. **Error Handling:**
   - Validates file type before upload (reject non-image files)
   - Shows user-friendly error message for invalid file types
   - Handles file size errors gracefully with clear messaging
   - Handles corrupted image files with appropriate error message
   - Provides retry option for failed uploads
   - Handles network errors during upload with retry mechanism

**Prerequisites:** Story 1.1 (text input interface exists)

#### Story 1.3: OCR/Vision LLM Integration

As a student,
I want the system to automatically extract text from my uploaded image,
So that I don't need to manually transcribe problems from photos or screenshots.

**Acceptance Criteria:**
1. Image is sent to Vision LLM API (OpenAI GPT-4 Turbo Vision) for text extraction
2. Extracted problem text is displayed in text input field for review/editing
3. Loading indicator shows during OCR processing
4. Extracted text maintains mathematical notation where possible
5. Student can edit extracted text before submitting
6. **Error Handling:**
   - Handles OpenAI API errors gracefully with user-friendly messages
   - Implements retry logic (up to 3 attempts with exponential backoff)
   - Handles rate limit errors with appropriate messaging and retry suggestion
   - Handles network timeout errors with retry option
   - Handles invalid image format errors (image too blurry, no text detected)
   - Shows specific error messages: "Unable to read image. Please try a clearer photo or use text input."
   - Logs errors to console (dev) or Firebase Analytics (prod) for debugging
   - Provides fallback option to switch to text input if OCR fails

**Prerequisites:** Story 1.2 (image upload exists)

#### Story 1.4: Problem Input Validation

As a student,
I want feedback if my problem input is invalid or unclear,
So that I can correct issues before starting a tutoring session.

**Acceptance Criteria:**
1. Validates problem text is not empty before submission
2. Provides helpful error messages for invalid inputs
3. Validates image files are valid images before processing
4. Handles edge cases (corrupted images, text-only images, etc.)
5. Error messages are clear and actionable

**Prerequisites:** Stories 1.1, 1.2, 1.3 (all input methods exist)

---

### Epic 2: Chat Interface & LLM Integration

**Goal:** Build conversational interface with LLM backend that maintains context throughout sessions.
**Value:** Provides the foundation for natural, multi-turn tutoring dialogue.

#### Story 2.1: Basic Chat UI Layout

As a student,
I want a chat interface where I can see my conversation with the AI tutor,
So that I can follow our dialogue as we work through problems.

**Acceptance Criteria:**
1. Chat message container displays messages in chronological order
2. Student messages appear on right side with distinct styling
3. AI tutor messages appear on left side with distinct styling
4. Messages include timestamp or sequence indicator
5. Chat area scrolls automatically to latest message
6. Clean, readable typography and spacing

**Prerequisites:** None (can start in parallel with Epic 1)

#### Story 2.2: Message Sending and Display

As a student,
I want to send messages and see them appear immediately in the chat,
So that I can communicate naturally with the AI tutor.

**Acceptance Criteria:**
1. Message input field at bottom of chat interface
2. Send button or Enter key submits message
3. Student message appears immediately in chat after sending
4. Input field clears after sending
5. Message appears with student's text and styling
6. Disable send button while message is being processed

**Prerequisites:** Story 2.1 (chat UI layout exists)

#### Story 2.3: LLM API Integration

As a student,
I want the AI tutor to respond to my messages,
So that I can have a conversation about my math problem.

**Acceptance Criteria:**
1. Integrates with LLM API (OpenAI GPT-4 Turbo) using architecture patterns
2. Sends student message to API with appropriate system prompt
3. Receives and displays AI response in chat
4. Shows loading indicator while waiting for AI response
5. API response time is acceptable (< 5 seconds typical)
6. **Error Handling:**
   - Handles OpenAI API errors gracefully with user-friendly messages
   - Implements retry logic (up to 3 attempts with exponential backoff)
   - Handles rate limit errors with appropriate messaging: "Too many requests. Please wait a moment and try again."
   - Handles network timeout errors (API taking too long) with retry option
   - Handles authentication errors (invalid API key) with clear error message
   - Handles context window overflow errors (conversation too long) with graceful handling
   - Handles invalid response format errors with fallback handling
   - Shows specific error messages: "Unable to get tutor response. Please try again."
   - Logs errors to console (dev) or Firebase Analytics (prod) for debugging
   - Displays error state in UI with retry button
   - Maintains conversation context even after errors

**Prerequisites:** Story 2.2 (message sending exists)

#### Story 2.4: Conversation Context Management

As a student,
I want the AI tutor to remember our previous messages in the session,
So that we can have a multi-turn conversation about solving my problem.

**Acceptance Criteria:**
1. Maintains conversation history array for current session
2. Sends full conversation context with each API call
3. Context includes all previous messages in chronological order
4. Context window management (truncates if too long)
5. Each message includes role (student/tutor) and content
6. Session persists during single problem solving session

**Prerequisites:** Story 2.3 (LLM API integration exists)

#### Story 2.5: Session Management

As a student,
I want to start a new problem session when needed,
So that I can work on multiple problems without confusion.

**Acceptance Criteria:**
1. "New Problem" or "Clear Chat" button is available
2. Clearing chat resets conversation history
3. Confirmation dialog prevents accidental clearing
4. New session starts fresh conversation context
5. Previous session is not automatically saved (for MVP)

**Prerequisites:** Story 2.4 (conversation context exists)

---

### Epic 3: Socratic Dialogue Logic

**Goal:** Implement pedagogical logic that asks guiding questions rather than giving answers, with adaptive hinting.
**Value:** Core differentiator - teaches through discovery, not rote answers.

#### Story 3.1: Socratic System Prompt Design

As a student,
I want the AI tutor to ask guiding questions instead of giving direct answers,
So that I learn through discovery rather than just copying solutions.

**Acceptance Criteria:**
1. System prompt instructs AI to NEVER give direct answers
2. System prompt emphasizes asking guiding questions
3. System prompt includes examples of Socratic questioning approach
4. System prompt defines when hints are appropriate (after 2+ stuck turns)
5. System prompt maintains encouraging, patient tone
6. System prompt focuses on algebra problems for MVP

**Prerequisites:** Story 2.3 (LLM API integration exists)

#### Story 3.2: Stuck Detection Logic

As a student,
I want the AI tutor to recognize when I'm stuck,
So that I can receive helpful hints when I need them most.

**Acceptance Criteria:**
1. Tracks number of consecutive responses indicating confusion
2. Detects patterns: "I don't know", "I'm stuck", repeated questions
3. Flags student as "stuck" after 2 consecutive confused responses
4. Logic considers response content, not just length
5. Stuck state is tracked per problem session

**Prerequisites:** Story 3.1 (Socratic prompt exists), Story 2.4 (context management exists)

#### Story 3.3: Hint Generation Logic

As a student,
I want helpful hints when I'm stuck,
So that I can make progress without getting direct answers.

**Acceptance Criteria:**
1. When stuck detected, system prompt instructs AI to provide hints (not answers)
2. Hints are progressively more revealing (not immediate solutions)
3. Hints guide student toward next step in solution
4. Hints maintain Socratic approach (questions within hints)
5. Hints are algebra-specific and problem-appropriate

**Prerequisites:** Story 3.2 (stuck detection exists)

#### Story 3.4: Response Validation Framework

As a student,
I want the AI tutor to validate whether my responses are correct,
So that I know if I'm on the right track.

**Acceptance Criteria:**
1. AI evaluates student responses for correctness
2. Provides positive feedback for correct steps
3. Provides gentle correction for incorrect steps with guiding questions
4. Validates mathematical expressions and equations
5. Recognizes partial progress and encourages continuation

**Prerequisites:** Story 3.1 (Socratic prompt exists)

#### Story 3.5: Adaptive Questioning Logic

As a student,
I want the AI tutor to ask questions appropriate to my understanding level,
So that I'm neither overwhelmed nor bored.

**Acceptance Criteria:**
1. AI adjusts question complexity based on student responses
2. Simplifies questions if student shows confusion
3. Increases difficulty if student shows strong understanding
4. Questions build progressively toward solution
5. Maintains logical sequence in problem-solving approach

**Prerequisites:** Story 3.4 (response validation exists)

---

### Epic 4: Math Rendering

**Goal:** Display mathematical equations and notation correctly using LaTeX rendering.
**Value:** Professional presentation of math problems and solutions.

#### Story 4.1: LaTeX Rendering Library Integration

As a student,
I want mathematical equations to display properly with correct notation,
So that I can read problems and solutions accurately.

**Acceptance Criteria:**
1. Integrates LaTeX rendering library (KaTeX or MathJax)
2. Library is loaded and initialized on page load
3. Basic inline math expressions render correctly (e.g., $x^2 + 5$)
4. Basic block math expressions render correctly (e.g., $$\frac{a}{b}$$)
5. Library configuration supports common math symbols

**Prerequisites:** None (can start in parallel)

#### Story 4.2: Math Rendering in Chat Messages

As a student,
I want math equations in chat messages to render as proper mathematical notation,
So that I can read problems and solutions clearly.

**Acceptance Criteria:**
1. Detects LaTeX syntax in chat messages (both student and AI messages)
2. Renders detected LaTeX expressions as formatted math
3. Handles both inline ($...$) and block ($$...$$) math
4. Renders fractions, exponents, roots, and basic operations correctly
5. Maintains message styling while rendering math

**Prerequisites:** Story 4.1 (LaTeX library integrated), Story 2.1 (chat UI exists)

#### Story 4.3: Math Rendering in Problem Input

As a student,
I want to see math notation rendered when I type or paste problem text,
So that I can verify my problem input is correct.

**Acceptance Criteria:**
1. Problem input field shows preview of rendered math
2. Real-time rendering as user types LaTeX syntax
3. Preview appears below or beside input field
4. Handles common algebra notation (variables, exponents, fractions)
5. Preview updates dynamically

**Prerequisites:** Story 4.1 (LaTeX library integrated), Story 1.1 (text input exists)

#### Story 4.4: Advanced Math Notation Support

As a student,
I want to see complex mathematical expressions rendered correctly,
So that I can work with advanced algebra problems.

**Acceptance Criteria:**
1. Supports matrix notation
2. Supports summation and product notation
3. Supports integrals and derivatives notation
4. Supports Greek letters and special symbols
5. Handles nested expressions correctly
6. Error handling for malformed LaTeX with fallback display

**Prerequisites:** Stories 4.2, 4.3 (basic rendering exists)

---

### Epic 5: UI Polish

**Goal:** Create modern, intuitive interface that provides excellent user experience.
**Value:** Ensures accessibility and ease of use for target student population.

#### Story 5.1: Responsive Layout Design

As a student,
I want the interface to work well on my phone, tablet, or computer,
So that I can access help from any device I have.

**Acceptance Criteria:**
1. Layout adapts to mobile, tablet, and desktop screen sizes
2. Touch-friendly controls on mobile devices
3. Text is readable at all screen sizes
4. Navigation is accessible at all breakpoints
5. No horizontal scrolling on any device
6. Tested on iOS, Android, and desktop browsers

**Prerequisites:** None (foundation)

#### Story 5.2: Modern Visual Design System

As a student,
I want a clean, modern interface that doesn't distract from learning,
So that I can focus on understanding my math problems.

**Acceptance Criteria:**
1. Cohesive color palette (educational, not flashy)
2. Consistent typography hierarchy
3. Appropriate spacing and padding throughout
4. Subtle shadows and depth where appropriate
5. Professional, trustworthy aesthetic
6. Design system documented for consistency

**Prerequisites:** Story 5.1 (responsive layout exists)

#### Story 5.3: Loading States and Feedback

As a student,
I want to know when the system is processing my request,
So that I understand the system is working and not frozen.

**Acceptance Criteria:**
1. Loading spinner/indicator shows during API calls
2. Disabled states for buttons during processing
3. Progress feedback for image uploads
4. Smooth transitions between states
5. Error states are clearly communicated
6. Success confirmations where appropriate

**Prerequisites:** Stories 2.2, 1.2 (message sending and image upload exist)

#### Story 5.4: Accessibility Features

As a student,
I want the interface to be accessible regardless of my abilities,
So that all students can benefit from the tutoring platform.

**Acceptance Criteria:**
1. Proper ARIA labels for screen readers
2. Keyboard navigation support throughout interface
3. Sufficient color contrast ratios (WCAG AA minimum)
4. Focus indicators visible and clear
5. Alt text for images and icons
6. Semantic HTML structure

**Prerequisites:** Story 5.2 (design system exists)

#### Story 5.5: Error Handling and User Guidance

As a student,
I want clear messages when something goes wrong,
So that I know how to fix issues or proceed.

**Acceptance Criteria:**
1. User-friendly error messages (no technical jargon)
2. Actionable guidance for each error type
3. Graceful degradation for network failures
4. Retry mechanisms for transient failures
5. Help text and tooltips where appropriate
6. Clear instructions for each feature

**Prerequisites:** All previous stories (full feature set exists)

#### Story 5.6: Testing Suite - 5+ Algebra Problems

As a student,
I want the system to work correctly for various algebra problem types,
So that I can trust it will help me with my homework.

**Acceptance Criteria:**
1. Successfully guides through 5+ different algebra problem types:
   - Linear equations (e.g., solve for x: 2x + 5 = 13)
   - Quadratic equations (e.g., solve: x^2 - 5x + 6 = 0)
   - Systems of equations (e.g., solve: 2x + y = 7, x - y = 2)
   - Factoring problems (e.g., factor: x^2 + 7x + 12)
   - Word problems converted to equations
2. No direct answers provided in any test case
3. Socratic questioning maintained throughout
4. Math rendering works correctly for all problem types
5. Complete end-to-end workflows tested and documented

**Prerequisites:** All Phase 1 stories complete

---

## Phase 2 Epic Breakdown (Post-MVP)

### Epic 6: Interactive Whiteboard

**Goal:** Shared visual canvas for diagrams, graphs, and geometric problem solving.
**Value:** Enables visual learning for geometry and graphing concepts.

#### Story 6.1: Session History Tracking

As a student,
I want to see a history of all problems I've attempted and be able to resume or delete previous sessions,
So that I can track my learning progress and return to problems I was working on.

**Acceptance Criteria:**
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

**Prerequisites:** Epic 5 complete (UI foundation exists), Story 2.5 complete (session management exists), Story 0.2 complete (Firebase setup exists)

#### Story 6.2: Whiteboard Foundation & Drawing Tools

As a student,
I want a shared drawing canvas with comprehensive drawing tools and mathematical diagram support,
So that I can visually represent geometric problems and graphs.

**Acceptance Criteria:**
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

**Prerequisites:** Epic 5 complete (UI foundation exists)

#### Story 6.3: Real-Time Synchronization & Persistence

As a student,
I want to collaborate with the AI tutor on the whiteboard and have my drawings persist,
So that we can work together visually and I don't lose my work while solving a problem.

**Acceptance Criteria:**
1. AI tutor can draw on whiteboard through API
2. AI drawings appear instantly on student's canvas
3. Student drawings are sent to backend
4. Bidirectional synchronization works correctly
5. Handles network latency gracefully
6. Drawings saved to session state
7. Drawings restored when returning to session
8. Whiteboard state synchronized across client/server
9. Handles session timeout gracefully
10. Export/import whiteboard state

**Prerequisites:** Story 6.2 (whiteboard foundation and tools exist)

---

### Epic 7: Step Visualization

**Goal:** Animated breakdown of solution steps with progressive reveal.
**Value:** Helps students understand logical flow of problem-solving.

#### Story 7.1: Complete Step Visualization System

As a student,
I want to see solution steps broken down and revealed progressively with clear visualizations, animations, and explanations,
So that I can learn step-by-step at my own pace without being overwhelmed and understand the mathematical transformations and reasoning behind them.

**Acceptance Criteria:**

**Step Breakdown & Progressive Reveal:**
1. Solution steps are identified and parsed
2. Steps are numbered sequentially
3. Each step shows one logical transformation
4. Steps are displayed in order
5. Step breakdown is algebra-aware
6. Steps reveal one at a time (not all at once)
7. Next step appears after student acknowledges current step
8. "Show next step" button is available
9. Progress indicator shows step position
10. Student can go back to previous steps

**Visual Representation & Animations:**
11. Each step shows before/after equation state
12. Highlighted portions show what changed
13. Mathematical notation renders correctly in steps
14. Visual indicators show transformation type
15. Steps are formatted for readability
16. Animated transitions between step states
17. Highlighting draws attention to changes
18. Smooth fade/slide animations
19. Animation speed is configurable
20. Animations don't interfere with readability

**Explanations & Insights:**
21. Each step includes brief explanation
22. Insights highlight key decision points
23. Explanations use student-friendly language
24. Links steps together logically
25. Socratic questions accompany insights

**Prerequisites:** Epic 3 complete (Socratic logic exists), Epic 4 complete (math rendering exists)

---

### Epic 8: Voice Interface

**Goal:** Speech-to-text input and text-to-speech output for hands-free learning.
**Value:** Accessibility and convenience for different learning preferences.

#### Story 8.1: Complete Voice Interface System

As a student,
I want to interact with the AI tutor using voice input and output, with customizable settings,
So that I can learn hands-free and more naturally without learning special syntax, and control the app through voice commands.

**Acceptance Criteria:**

**Voice Input & Natural Language Processing:**
1. Microphone button available in chat interface
2. Browser speech recognition API integrated
3. Speech converted to text accurately
4. Text appears in input field for review
5. Handles speech recognition errors gracefully
6. Processes spoken math expressions
7. Converts spoken math to LaTeX format
8. Handles common math phrases ("two x plus five")
9. Corrects common speech recognition errors
10. Supports algebraic expressions

**Voice Output & Commands:**
11. Text-to-speech API integrated
12. AI responses are spoken automatically (optional)
13. Play/pause controls for speech output
14. Natural-sounding voice synthesis
15. Handles math notation in speech (reads equations naturally)
16. Recognizes navigation commands ("new problem", "clear chat")
17. Recognizes interaction commands ("show next step", "read again")
18. Commands are executed reliably
19. Provides feedback for recognized commands
20. Handles misrecognitions gracefully

**Voice Settings and Preferences:**
21. Enable/disable voice input and output
22. Adjust speech rate and volume
23. Choose voice gender/accent (if available)
24. Set default voice input/output behavior
25. Settings persist across sessions

**Prerequisites:** Epic 2 complete (chat interface exists)

---

### Epic 9: Animated Avatar

**Goal:** 2D/3D tutor character with emotional expressions and gestures.
**Value:** Makes AI tutor more engaging and approachable.

#### Story 9.1: Complete Animated Avatar System

As a student,
I want to see a friendly tutor character with facial expressions, gestures, animations, and customizable appearance,
So that the AI tutor feels more human and approachable, provides visual cues that help me understand mathematical concepts, and feels personal to me.

**Acceptance Criteria:**

**Avatar Character & Expression System:**
1. 2D or 3D avatar character displayed in interface
2. Character design is friendly and educational
3. Character appearance is consistent
4. Character size/position doesn't obstruct content
5. Character is culturally appropriate and inclusive
6. Facial expressions change based on context
7. Expressions include: encouraging, thoughtful, celebratory
8. Expressions match dialogue tone
9. Smooth transitions between expressions
10. Expressions enhance (not distract from) learning

**Animations & Voice Synchronization:**
11. Gestures accompany verbal explanations
12. Gestures highlight key points
13. Animated gestures for math concepts (pointing, counting, indicating)
14. Gestures are synchronized with dialogue
15. Gestures enhance comprehension
16. Avatar mouth movements sync with text-to-speech (if Epic 8 is complete)
17. Lip-sync is accurate and natural
18. Eye contact with student (avatar looks at camera)
19. Subtle idle animations when not speaking
20. Synchronization doesn't cause performance issues

**Avatar Customization:**
21. Avatar appearance options (style, colors, features)
22. Options are age-appropriate
23. Customizations persist across sessions
24. Options don't impact functionality
25. Default avatar if no customization chosen

**Prerequisites:** Epic 5 complete (UI foundation exists), Epic 8 Story 8.1 complete (voice interface exists for lip-sync)

---

### Epic 10: Difficulty Modes

**Goal:** Grade-level adaptive questioning and scaffolding.
**Value:** Personalized difficulty appropriate to student's academic level.

#### Story 10.1: Complete Difficulty Modes System

As a student,
I want to select my grade level, have the AI tutor adjust question complexity accordingly, and receive adaptive guidance based on my performance,
So that I'm challenged but not overwhelmed with questions appropriate to my level, get the right amount of support, and continue to be challenged and grow.

**Acceptance Criteria:**

**Difficulty Level Selection & Adaptation:**
1. Grade level selector on initial setup or settings
2. Options: Middle School, High School, College
3. Selection persists across sessions
4. Can change difficulty level later
5. Selection is clearly labeled
6. System prompt includes student's selected grade level
7. Questions use grade-appropriate language
8. Question complexity matches grade level
9. Concepts align with grade curriculum
10. Difficulty is adjustable mid-session

**Adaptive Scaffolding & Progressive Adjustment:**
11. Tracks student performance within grade level
12. Increases scaffolding for struggling students
13. Decreases scaffolding for excelling students
14. Adjusts hint frequency based on performance
15. Maintains learning objectives while adapting
16. Tracks improvement over multiple sessions
17. Suggests moving to higher grade level when ready
18. Progress indicators show advancement
19. Smooth transitions between difficulty levels
20. Validates readiness before advancement
21. Current difficulty level displayed in UI
22. Visual indicator of progress within level
23. Clear labeling of difficulty mode
24. Progress toward next level is visible
25. Indicators don't distract from learning

**Prerequisites:** Epic 5 complete (UI foundation exists), Epic 3 complete (Socratic logic exists)

---

### Epic 11: Problem Generation

**Goal:** Generate practice problems based on student's current work.
**Value:** Enables independent practice and mastery building.

#### Story 11.1: Complete Problem Generation System

As a student,
I want the system to understand the type of problem I'm working on, generate similar practice problems, and provide an interface that adapts to my skill level,
So that I can reinforce my understanding with problems that match my difficulty level and practice independently to build mastery with appropriately challenging problems.

**Acceptance Criteria:**

**Problem Analysis & Generation Algorithm:**
1. Analyzes current problem to identify type (linear, quadratic, etc.)
2. Extracts key concepts and patterns
3. Categorizes problem by difficulty and topic
4. Identifies core skills being practiced
5. Analysis is accurate for algebra problems
6. Generates problems of same type as current problem
7. Varies problem parameters while maintaining type
8. Problems match student's difficulty level
9. Generated problems are solvable and valid
10. Problems test same concepts but with different numbers

**Practice Problem Interface & Adaptive Generation:**
11. "Generate Practice Problem" button after solving
12. Generated problem displayed clearly
13. Can work on practice problem in same interface
14. Can generate multiple practice problems
15. Practice problems are clearly distinguished from original
16. "Generate Problem Set" option available
17. Creates 3-5 related practice problems
18. Problems progress in difficulty within set
19. Set maintains focus on same concept
20. Can navigate through problem set sequentially
21. Tracks student performance on practice problems
22. Adjusts difficulty based on success rate
23. Generates easier problems if student struggles
24. Generates harder problems if student excels
25. Maintains concept focus while adapting difficulty

**Prerequisites:** Epic 3 complete (Socratic logic exists), Epic 10 complete (difficulty modes exist)

---

### Epic 12: Authentication & Account Management

**Goal:** Provide secure user authentication and account management capabilities to enable cross-device session persistence and personalized learning experiences.
**Value:** Enables students to access their learning history across devices, personalize their experience, and maintain progress continuity. Critical foundation for session history (Epic 6 Story 6.1) and future personalized features.

**Note:** This epic should be prioritized early as it's required for proper session history functionality. Story 6.1 currently uses localStorage fallback but needs proper authentication for cross-device persistence.

#### Story 12.1: Complete Authentication & Account Management System

As a student,
I want secure authentication and complete account management capabilities,
So that I can access my learning history across all my devices, personalize my experience, and maintain progress continuity.

**Acceptance Criteria:**

**Authentication & Sign-In:**
1. Google Sign-In button is visible and accessible on the main interface
2. Clicking sign-in initiates Firebase Auth Google Sign-In flow
3. OAuth consent screen displays correctly
4. After successful authentication, user is signed in and session persists
5. Authentication state persists across page reloads
6. Error handling for authentication failures (network errors, user cancellation, etc.)
7. Loading states shown during authentication process
8. User-friendly error messages for authentication failures
9. Sign-out functionality is available and works correctly

**Authentication State Management:**
10. Authentication state is tracked throughout the application using React Context
11. Protected routes/components check authentication state
12. Unauthenticated users see sign-in prompts where appropriate
13. Authenticated users see personalized content
14. Token refresh happens automatically when needed
15. Authentication state updates in real-time across all components
16. Proper handling of expired sessions
17. Redirect to sign-in when authentication is required
18. Clear distinction between authenticated and guest states

**User Profile:**
19. User profile information (name, email, photo) is displayed when signed in
20. Profile page/section displays user information
21. User can view their profile information
22. User can update display name (if supported by Firebase Auth)
23. User profile photo displays correctly (from Google account or custom)
24. Profile information is synced with Firebase Auth
25. Changes are saved and persist across sessions
26. Loading states shown during profile updates
27. Success feedback when profile is updated
28. Error handling for profile update failures
29. Form validation for profile fields

**Account Settings & Preferences:**
30. Settings page/section is accessible from user profile
31. User can view current settings
32. User can update preferences (e.g., notifications, theme, difficulty level)
33. Settings are saved to Firestore user profile document
34. Settings persist across sessions and devices
35. Settings sync in real-time across open tabs
36. Default settings are applied for new users
37. Settings validation prevents invalid configurations
38. Success feedback when settings are saved
39. Error handling for settings save failures

**Account Deletion & Data Privacy:**
40. Account deletion option is available in settings
41. Confirmation dialog prevents accidental deletion
42. Deletion process clearly explains what data will be removed
43. All user sessions are deleted from Firestore
44. User profile document is deleted from Firestore
45. Firebase Auth account is deleted
46. Deletion confirmation is shown to user
47. User is signed out after account deletion
48. Error handling for deletion failures
49. Option to cancel deletion process

**Prerequisites:** Story 0.2 complete (Firebase setup exists)

**Technical Notes:**

**Authentication:**
- Use Firebase Auth Google Sign-In provider (already configured in Story 0.2)
- Replace current localStorage-based AuthButton with Firebase Auth implementation
- Handle authentication state with Firebase Auth state observer
- Create React Context for authentication state management
- Implement protected route wrapper component
- Manage session persistence via Firebase Auth persistence settings

**Profile Management:**
- Store user profile information in application state
- Use Firebase Auth `updateProfile()` for name updates
- Create Firestore `users` collection for extended user data
- Sync profile photo from Google account or allow custom upload
- Validate profile updates before saving

**Settings & Preferences:**
- Store preferences in Firestore user profile document
- Use React Context or state management for settings
- Implement settings validation
- Sync settings across devices via Firestore

**Account Deletion:**
- Use Firebase Auth `deleteUser()` method
- Delete all user sessions from Firestore
- Delete user profile document
- Handle cascading deletions
- Provide clear warning about data permanence
- Implement proper error recovery

**Error Handling:**
- Implement proper error handling for OAuth flow
- Handle network errors, user cancellation, expired sessions
- Provide user-friendly error messages throughout
- Log errors appropriately for debugging

---

## Implementation Sequence and Dependencies

### Phase 1 Implementation Roadmap (MVP)

**Phase 1 Foundation - Week 1:**

**Foundation Stories (Must Complete First):**
1. **Story 0.1: Project Initialization** - Run `npx create-next-app` command
2. **Story 0.2: Firebase Project Setup** - Configure Firebase services

**Phase 1 Foundation - Week 1-2:**

**Parallel Development Streams (can start simultaneously after Foundation):**
- Stream A: Epic 1 Stories 1.1, 1.2 (Text Input, Image Upload) + Epic 2 Stories 2.1, 2.2 (Chat UI, Message Sending) + Epic 4 Story 4.1 (LaTeX Library Integration) + Epic 5 Story 5.1 (Responsive Layout)
- Stream B: Epic 2 Story 2.3 (LLM API Integration) + Epic 3 Story 3.1 (Socratic System Prompt)

**Sequential Dependencies:**
1. **Story 0.1** (Project Init) → **Story 0.2** (Firebase Setup) → **All other stories**
2. **Story 1.1** → **Story 1.2** → **Story 1.3** → **Story 1.4** (Problem Input Epic)
3. **Story 2.1** → **Story 2.2** → **Story 2.3** → **Story 2.4** → **Story 2.5** (Chat & LLM Epic)
4. **Story 3.1** → **Story 3.2** → **Story 3.3** (Socratic Logic Epic - requires Story 2.3)
5. **Story 3.1** → **Story 3.4** → **Story 3.5** (Socratic Logic Epic - alternative path)
6. **Story 4.1** → **Story 4.2** → **Story 4.3** → **Story 4.4** (Math Rendering Epic)
7. **Story 5.1** → **Story 5.2** → **Story 5.3** → **Story 5.4** → **Story 5.5** → **Story 5.6** (UI Polish Epic)

**Critical Path:**
Epic 2 (Chat & LLM) must complete Story 2.3 before Epic 3 (Socratic Logic) can begin Story 3.1.
Epic 4 (Math Rendering) Story 4.1 can run in parallel with other foundation stories.

**Phase 1 Core Features - Week 3-4:**

1. Complete Epic 1 (Problem Input) - All stories
2. Complete Epic 2 (Chat & LLM) - All stories
3. Complete Epic 3 (Socratic Logic) - All stories (depends on Epic 2 Story 2.3)
4. Complete Epic 4 (Math Rendering) - All stories
5. Complete Epic 5 (UI Polish) - All stories

**Phase 1 Validation - Week 5:**

6. Story 5.6: Testing Suite - 5+ Algebra Problems
   - Validates entire MVP functionality
   - Ensures Socratic questioning works
   - Verifies math rendering
   - Confirms UI polish

**MVP Complete Criteria:**
- All 5 Phase 1 Epics complete
- Testing suite validates 5+ algebra problem types
- No direct answers provided
- Socratic questioning maintained
- Math rendering correct
- Modern UI functional

### Phase 2 Implementation Roadmap (Post-MVP)

**Phase 2 can begin after MVP validation is successful.**

**Parallel Development Opportunities:**
- Epic 6 (Whiteboard) and Epic 7 (Step Visualization) can run in parallel
- Epic 8 (Voice Interface) and Epic 9 (Avatar) can run in parallel (Epic 9 requires Epic 8 for lip-sync)
- Epic 10 (Difficulty Modes) and Epic 11 (Problem Generation) can run in parallel (Epic 11 depends on Epic 10)

**Phase 2 Sequencing:**

1. **Epic 12: Authentication & Account Management** (requires Story 0.2, recommended early for Epic 6 Story 6.1)
   - Story 12.1 (Complete Authentication & Account Management System)

2. **Epic 6: Interactive Whiteboard** (requires Epic 5, Epic 12 Story 12.1 for proper session history)
   - Story 6.1 → 6.2 → 6.3

3. **Epic 7: Step Visualization** (requires Epic 3, Epic 4)
   - Story 7.1 (Complete Step Visualization System)

4. **Epic 8: Voice Interface** (requires Epic 2)
   - Story 8.1 (Complete Voice Interface System)

5. **Epic 9: Animated Avatar** (requires Epic 5, Epic 8 Story 8.1 for lip-sync)
   - Story 9.1 (Complete Animated Avatar System)

6. **Epic 10: Difficulty Modes** (requires Epic 3, Epic 5)
   - Story 10.1 (Complete Difficulty Modes System)

7. **Epic 11: Problem Generation** (requires Epic 3, Epic 10)
   - Story 11.1 (Complete Problem Generation System)

### Dependency Graph Summary

**Phase 1 Dependencies:**
```
Epic 1: Independent (foundation)
Epic 2: Independent (foundation)
Epic 3: Depends on Epic 2 Story 2.3
Epic 4: Independent (foundation)
Epic 5: Depends on multiple epics for polish
```

**Phase 2 Dependencies:**
```
Epic 12: Depends on Story 0.2 (Firebase setup), recommended before Epic 6 Story 6.1
Epic 6: Depends on Epic 5, Epic 12 Story 12.1 (for proper session history)
Epic 7: Depends on Epic 3, Epic 4
Epic 8: Depends on Epic 2
Epic 9: Depends on Epic 5, Epic 8 Story 8.1 (for lip-sync)
Epic 10: Depends on Epic 3, Epic 5
Epic 11: Depends on Epic 3, Epic 10
```

### Estimated Timeline

**Phase 1 (MVP):** 5-6 weeks
- Weeks 1-2: Foundation stories (parallel development)
- Weeks 3-4: Core features integration
- Week 5: Testing and validation

**Phase 2 (Post-MVP):** 8-10 weeks (after MVP validation)
- Week 1-2: Epics 6, 7 (Whiteboard, Step Visualization)
- Week 3-4: Epics 8, 9 (Voice, Avatar)
- Week 5-6: Epics 10, 11 (Difficulty Modes, Problem Generation)
- Week 7-8: Integration and polish
- Week 9-10: Testing and validation

---

## Development Guidance

### Getting Started

**Phase 1 Start:**
1. **First: Complete Foundation Stories:**
   - Story 0.1: Project Initialization (must be first)
   - Story 0.2: Firebase Project Setup (after Story 0.1)

2. **Then: Begin with foundation stories that can run in parallel:**
   - Epic 1 Story 1.1 (Text Input Interface)
   - Epic 2 Story 2.1 (Basic Chat UI Layout)
   - Epic 4 Story 4.1 (LaTeX Rendering Library Integration)
   - Epic 5 Story 5.1 (Responsive Layout Design)

3. Critical path: Epic 2 Story 2.3 (LLM API Integration) must complete before Epic 3 can begin.

4. Key files to create first:
   - Frontend: Chat component, Input component, LaTeX renderer
   - Backend: LLM API integration layer, Conversation context manager
   - Configuration: System prompts, API keys management

5. Recommended agent allocation:
   - Frontend developer: Epics 1, 2, 4, 5 (UI and rendering)
   - Backend developer: Epic 2 Story 2.3, Epic 3 (LLM integration and Socratic logic)

### Technical Notes

**Architecture Decisions Needed:**

1. **LLM API Selection** affects Epic 2 Story 2.3 and Epic 3:
   - Must support Vision API for OCR (Epic 1 Story 1.3)
   - Must support structured outputs for Socratic logic (Epic 3)
   - Must support system prompts and conversation context
   - Recommended: OpenAI GPT-4 with Vision or Claude with Vision

2. **Math Rendering Library** affects Epic 4:
   - KaTeX: Fast, server-side rendering support
   - MathJax: More comprehensive, slower
   - Recommendation: KaTeX for MVP (faster, lighter)

3. **State Management** affects Epic 2 Story 2.4:
   - Conversation context must persist during session
   - Context window management for long conversations
   - Consider React Context or Redux for conversation state

4. **Image Processing** affects Epic 1 Story 1.3:
   - Vision LLM API for OCR (OpenAI Vision or equivalent)
   - Image upload and storage (client-side or temporary server storage)
   - Error handling for API failures

**Critical Implementation Patterns:**

1. **Socratic System Prompt Design** (Epic 3 Story 3.1):
   - Prompt must NEVER instruct AI to give direct answers
   - Prompt must emphasize guiding questions
   - Prompt must include examples of Socratic questioning
   - Prompt must define hint escalation (after 2+ stuck turns)

2. **Context Management** (Epic 2 Story 2.4):
   - Maintain conversation history array
   - Include full context with each API call
   - Implement context window truncation for long conversations
   - Persist session during single problem solving

3. **Stuck Detection** (Epic 3 Story 3.2):
   - Track consecutive confused responses
   - Detect patterns: "I don't know", "I'm stuck", repeated questions
   - Flag stuck state after 2 consecutive confused responses
   - Consider response content, not just length

### Risk Mitigation

**Watch out for:**

1. **Pedagogical Risk** in Epic 3:
   - LLM may give direct answers despite system prompt
   - Mitigation: Strong system prompt design, response validation, monitoring
   - Test extensively with various problem types

2. **Context Window Limits** in Epic 2 Story 2.4:
   - Long conversations may exceed token limits
   - Mitigation: Implement context truncation strategy, summarize older messages

3. **Image OCR Accuracy** in Epic 1 Story 1.3:
   - Vision LLM may misread math problems from photos
   - Mitigation: Allow student to edit extracted text, provide clear error feedback

4. **Performance Issues** with Math Rendering in Epic 4:
   - Complex LaTeX expressions may slow rendering
   - Mitigation: Use efficient rendering library (KaTeX), lazy load expressions

5. **Mobile Responsiveness** in Epic 5:
   - Chat interface must work well on small screens
   - Mitigation: Test on actual devices, prioritize touch interactions

### Success Metrics

**You'll know Phase 1 is complete when:**

1. **Functional Requirements Met:**
   - Students can input problems via text or image (Epic 1)
   - Chat interface works with LLM integration (Epic 2)
   - Socratic questioning works (never gives direct answers) (Epic 3)
   - Math equations render correctly (Epic 4)
   - Modern UI is polished and accessible (Epic 5)

2. **MVP Success Criteria Validated:**
   - Successfully guides through 5+ algebra problem types
   - No direct answers provided in any test case
   - Socratic questioning maintained throughout
   - Math rendering works correctly
   - Modern UI is intuitive and accessible

3. **Testing Suite Passes:**
   - All 5+ algebra problem types tested successfully
   - End-to-end workflows validated
   - Edge cases handled (invalid inputs, API failures, etc.)

### Phase 2 Preparation

**Before starting Phase 2:**

1. Validate MVP is successful:
   - User testing with target students
   - Socratic questioning effectiveness verified
   - Performance and scalability assessed

2. Gather user feedback:
   - What features are most requested?
   - What pain points exist in MVP?
   - What learning preferences do users have?

3. Prioritize Phase 2 features:
   - Based on user feedback and strategic value
   - Consider technical complexity
   - Balance with mission alignment (accessibility, affordability)

**Phase 2 Considerations:**

1. **Authentication & Account Management (Epic 12)** requires:
   - Firebase Auth Google Sign-In provider (already configured)
   - Firestore user profile collection design
   - Should be prioritized early to support Epic 6 Story 6.1

2. **Interactive Whiteboard (Epic 6)** requires:
   - WebSocket or similar for real-time synchronization
   - Canvas/drawing library selection
   - Performance optimization for mobile devices
   - Proper authentication (Epic 12) for session persistence

3. **Voice Interface (Epic 8)** requires:
   - Browser API support (Web Speech API)
   - Math-to-speech conversion for equations
   - Cross-browser compatibility considerations

4. **Difficulty Modes (Epic 10)** requires:
   - Student progress tracking
   - Grade-level curriculum alignment
   - Performance metrics for adaptation

---

## Story Guidelines Reference

**Story Format:**

```
**Story [EPIC.N]: [Story Title]**

As a [user type],
I want [goal/desire],
So that [benefit/value].

**Acceptance Criteria:**
1. [Specific testable criterion]
2. [Another specific criterion]
3. [etc.]

**Prerequisites:** [Dependencies on previous stories, if any]
```

**Story Requirements:**

- **Vertical slices** - Complete, testable functionality delivery
- **Sequential ordering** - Logical progression within epic
- **No forward dependencies** - Only depend on previous work
- **AI-agent sized** - Completable in 2-4 hour focused session
- **Value-focused** - Integrate technical enablers into value-delivering stories

---

**For implementation:** Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown.

