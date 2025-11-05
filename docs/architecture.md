# Architecture - Socratica

**Author:** xvanov  
**Date:** 2025-11-03  
**Version:** 1.0

---

## Executive Summary

Socratica is built using Next.js 15 with App Router for the frontend, Firebase (Firestore, Auth, Storage) for backend services, OpenAI GPT-4 Turbo with Vision for AI capabilities, and deployed on Vercel. The architecture prioritizes rapid MVP development while maintaining flexibility for future integration and scalability.

---

## Project Initialization

**First Implementation Story:** Project initialization using Next.js 15 starter template.

```bash
npx create-next-app@latest socratica --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

This establishes the base architecture with these decisions:
- ✅ Framework: Next.js 15 with App Router
- ✅ Language: TypeScript
- ✅ Styling: Tailwind CSS
- ✅ Project structure: App Router organization
- ✅ Build tooling: Turbopack (built-in)
- ✅ Linting: ESLint configured
- ✅ API pattern: REST via `/app/api/` routes

---

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| **Framework** | Next.js 15 (App Router) | 15.0.0 | All | Full-stack framework with built-in API routes, SSR, and optimal deployment |
| **Language** | TypeScript | Latest | All | Type safety and developer experience |
| **Styling** | Tailwind CSS | Latest | Epic 5 | Utility-first CSS for rapid development |
| **LLM API** | OpenAI GPT-4 Turbo | gpt-4-turbo | Epic 2, Epic 3 | Excellent instruction following, built-in Vision API, cost-effective |
| **Vision API** | OpenAI Vision (same model) | gpt-4-turbo | Epic 1 | Integrated with GPT-4 Turbo, handles OCR |
| **Database** | Firebase Firestore | Latest SDK | Epic 2 | NoSQL database, real-time capabilities, easy setup |
| **Authentication** | Firebase Auth (Google Sign-In) | Latest SDK | Epic 5 | Minimal setup, one-click sign-in, COPPA compliant |
| **File Storage** | Firebase Storage | Latest SDK | Epic 1 | Built-in image upload handling |
| **LaTeX Rendering** | KaTeX | Latest | Epic 4 | Fast rendering, lightweight, sufficient for algebra |
| **State Management** | React Context API | Built-in | Epic 2 | No extra dependencies, sufficient for MVP |
| **Deployment** | Vercel | Platform | All | Zero-config deployment, Next.js optimized |
| **Error Handling** | Try-catch + Error Boundaries | Built-in | All | Consistent error handling across app |
| **Logging** | Console (dev) + Firebase Analytics (prod) | Built-in + SDK | All | Simple dev experience, production metrics |
| **Date Format** | ISO 8601 strings (UTC) | Standard | All | Consistent date handling |

---

## Project Structure

```
socratica/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chat/                 # Chat/LLM endpoints
│   │   │   └── route.ts          # POST /api/chat - LLM integration
│   │   ├── ocr/                  # OCR/Vision endpoints
│   │   │   └── route.ts          # POST /api/ocr - Image processing
│   │   └── auth/                 # Auth endpoints (if needed)
│   │       └── route.ts          # Auth utilities
│   ├── (auth)/                   # Auth route group
│   │   └── page.tsx              # Google Sign-In page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home/Chat interface
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── chat/                     # Epic 2: Chat Interface
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── TypingIndicator.tsx
│   ├── problem-input/            # Epic 1: Problem Input
│   │   ├── TextInput.tsx
│   │   ├── ImageUpload.tsx
│   │   └── ProblemPreview.tsx
│   ├── math-renderer/            # Epic 4: Math Rendering
│   │   ├── MathDisplay.tsx
│   │   └── LaTeXParser.tsx
│   └── ui/                       # Epic 5: UI Polish
│       ├── Button.tsx
│       ├── Loading.tsx
│       └── ErrorBoundary.tsx
├── lib/                          # Utilities and configurations
│   ├── firebase/                 # Firebase setup
│   │   ├── config.ts             # Firebase config
│   │   ├── auth.ts               # Auth utilities
│   │   └── firestore.ts          # Firestore utilities
│   ├── openai/                   # OpenAI integration
│   │   ├── client.ts             # OpenAI client
│   │   ├── prompts.ts            # Socratic system prompts
│   │   └── context.ts            # Conversation context management
│   ├── utils/                    # General utilities
│   │   ├── error-handling.ts
│   │   └── validation.ts
│   └── constants.ts              # App constants
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Firebase Auth hook
│   ├── useChat.ts                # Chat state management
│   └── useConversation.ts        # Conversation context hook
├── types/                        # TypeScript types
│   ├── chat.ts                   # Chat-related types
│   ├── user.ts                   # User-related types
│   └── api.ts                    # API-related types
├── public/                       # Static assets
├── firebase.json                 # Firebase config
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json
```

---

## Epic to Architecture Mapping

| Epic | Architecture Components | Location |
| ---- | ----------------------- | -------- |
| **Epic 1: Problem Input** | Text input component, Image upload component, OCR API route | `components/problem-input/`, `app/api/ocr/` |
| **Epic 2: Chat Interface & LLM Integration** | Chat components, LLM API route, OpenAI client | `components/chat/`, `app/api/chat/`, `lib/openai/` |
| **Epic 3: Socratic Dialogue Logic** | System prompts, context management | `lib/openai/prompts.ts`, `lib/openai/context.ts` |
| **Epic 4: Math Rendering** | Math renderer components, KaTeX integration | `components/math-renderer/` |
| **Epic 5: UI Polish** | UI components, global styles, error boundaries | `components/ui/`, `app/globals.css` |
| **Epic 6: Interactive Whiteboard** (Future) | Whiteboard components, real-time sync | `components/whiteboard/`, Firestore real-time |
| **Epic 7: Step Visualization** (Future) | Step breakdown components | `components/step-visualization/` |
| **Epic 8: Voice Interface** (Future) | Voice components, Web Speech API | `components/voice/` |
| **Epic 9: Animated Avatar** (Future) | Avatar components | `components/avatar/` |
| **Epic 10: Difficulty Modes** (Future) | Difficulty selection, adaptive prompts | `components/difficulty/`, `lib/openai/prompts.ts` |
| **Epic 11: Problem Generation** (Future) | Problem generator, LLM integration | `components/problem-generator/`, `lib/openai/` |

---

## Technology Stack Details

### Core Technologies

**Next.js 15**
- **Version:** 15.0.0
- **Features:** App Router, Server Components, API Routes, Turbopack
- **Rationale:** Full-stack framework with built-in optimizations

**TypeScript**
- **Version:** Latest stable
- **Configuration:** Strict mode enabled
- **Rationale:** Type safety and developer experience

**Tailwind CSS**
- **Version:** Latest stable
- **Configuration:** Default with custom colors for educational theme
- **Rationale:** Rapid UI development with utility-first approach

**Firebase SDK**
- **Version:** Latest stable (v10+)
- **Services:** Firestore, Auth, Storage
- **Rationale:** Integrated backend services, real-time capabilities

**OpenAI SDK**
- **Version:** Latest stable
- **Model:** gpt-4-turbo
- **Rationale:** Best instruction following for Socratic method, built-in Vision

**KaTeX**
- **Version:** Latest stable
- **Package:** `katex` + `react-katex`
- **Rationale:** Fast rendering, lightweight, sufficient for algebra

### Integration Points

**Frontend ↔ Backend API**
- `/app/api/chat/route.ts` → OpenAI GPT-4 Turbo API
- `/app/api/ocr/route.ts` → OpenAI Vision API

**Frontend ↔ Firebase**
- `lib/firebase/auth.ts` → Firebase Auth (Google Sign-In)
- `lib/firebase/firestore.ts` → Firestore (conversation history)
- `lib/firebase/storage.ts` → Firebase Storage (image uploads)

**Frontend ↔ Math Rendering**
- `components/math-renderer/MathDisplay.tsx` → KaTeX library
- Client-side only (dynamic imports for SSR)

---

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### Naming Patterns

**API Routes:**
- Pattern: `/app/api/{feature}/route.ts`
- Example: `/app/api/chat/route.ts`, `/app/api/ocr/route.ts`

**Components:**
- Pattern: PascalCase matching file name
- Example: `ChatInterface.tsx` contains `ChatInterface` component

**Files:**
- Pattern: Match component name exactly
- Example: `ChatInterface.tsx` for `ChatInterface` component

**Functions:**
- Pattern: camelCase
- Example: `handleSubmit()`, `processImage()`

**Constants:**
- Pattern: UPPER_SNAKE_CASE
- Example: `MAX_MESSAGE_LENGTH`, `API_TIMEOUT`

**Types/Interfaces:**
- Pattern: PascalCase
- Example: `Message`, `ChatState`, `User`

### Structure Patterns

**Tests:**
- Pattern: Co-located with components
- Example: `ChatInterface.test.tsx` next to `ChatInterface.tsx`

**Components:**
- Pattern: Organized by feature/epic
- Example: `components/chat/` for chat-related components

**Utilities:**
- Pattern: Grouped by domain
- Example: `lib/openai/` for OpenAI utilities, `lib/firebase/` for Firebase utilities

**Hooks:**
- Pattern: In `hooks/` directory, prefixed with `use`
- Example: `hooks/useChat.ts`, `hooks/useAuth.ts`

### Format Patterns

**API Requests:**
```typescript
POST /api/chat
{
  "message": string,
  "conversationHistory": Message[]
}

POST /api/ocr
{
  "image": string (base64 or URL),
  "format": "base64" | "url"
}
```

**API Responses:**
```typescript
{
  "success": boolean,
  "data": T | null,
  "error": string | null
}
```

**Error Format:**
```typescript
{
  "message": string,
  "code": string,
  "details": any
}
```

**Chat Messages:**
```typescript
interface Message {
  role: "user" | "assistant" | "system",
  content: string,
  timestamp: string (ISO 8601),
  messageId?: string
}
```

### Communication Patterns

**State Updates:**
- Use React Context API for conversation state
- Context provider wraps chat interface
- Hooks (`useChat`, `useConversation`) access context

**Firebase Auth:**
- Use `onAuthStateChanged` for auth state monitoring
- Protect routes with middleware or component guards

**Real-time Updates:**
- Use Firestore real-time listeners for chat messages (future)
- Use React Context for immediate UI updates

### Lifecycle Patterns

**Loading States:**
- Show loading indicators during API calls
- Disable buttons during processing
- Use `isLoading` state flags

**Error Recovery:**
- Display user-friendly error messages
- Provide retry mechanisms for transient failures
- Log errors to console (dev) or Firebase Analytics (prod)

**Retry Logic:**
- Retry failed API calls up to 3 times with exponential backoff
- Show retry button to user on final failure

### Location Patterns

**API Routes:**
- Structure: `/app/api/{feature}/route.ts`
- All routes in `app/api/` directory

**Static Assets:**
- Location: `/public/` directory
- Access: `/asset-name.ext`

**Environment Variables:**
- File: `.env.local` (local), `.env` (production)
- Prefix: `NEXT_PUBLIC_` for client-side variables
- Secrets: Never commit to git

**Config Files:**
- Firebase: `firebase.json` at root
- Next.js: `next.config.js` at root
- Tailwind: `tailwind.config.js` at root

### Consistency Patterns

**Date Format:**
- Storage: ISO 8601 strings (e.g., `2024-11-03T12:00:00Z`)
- Display: Format for user locale
- Internal: Always use UTC

**Logging:**
- Development: `console.log`, `console.error`
- Production: Firebase Analytics for user events, structured logging for errors

**User-Facing Errors:**
- Friendly messages (no technical jargon)
- Actionable guidance
- Example: "Unable to process image. Please try again or use text input."

**Mathematical Notation:**
- Input: Accept LaTeX syntax
- Storage: Store as LaTeX strings
- Display: Render with KaTeX
- Format: Inline (`$...$`) and block (`$$...$$`)

---

## Data Architecture

### Firestore Collections

**conversations**
- Document ID: Auto-generated
- Fields:
  - `userId` (string): Firebase Auth UID
  - `messages` (array): Array of Message objects
  - `createdAt` (timestamp): ISO 8601 string
  - `updatedAt` (timestamp): ISO 8601 string
  - `problemType` (string): "algebra" | "geometry" | etc.

**users**
- Document ID: Firebase Auth UID
- Fields:
  - `email` (string): User email
  - `displayName` (string): User display name
  - `ageVerified` (boolean): COPPA compliance
  - `createdAt` (timestamp): ISO 8601 string

**sessions**
- Document ID: Auto-generated (sessionId)
- Fields:
  - `userId` (string): Firebase Auth UID
  - `problemText` (string, optional): Text input problem
  - `problemImageUrl` (string, optional): Image URL if problem was uploaded
  - `messages` (array): Array of Message objects (full conversation history)
  - `completionStatus` (string): "solved" | "not_solved" | "in_progress"
  - `createdAt` (timestamp): ISO 8601 string (UTC)
  - `updatedAt` (timestamp): ISO 8601 string (UTC)
  - `stuckState` (object, optional): StuckState object for stuck detection

### Data Models

**Message:**
```typescript
interface Message {
  role: "user" | "assistant" | "system",
  content: string,
  timestamp: string, // ISO 8601
  messageId: string
}
```

**Conversation:**
```typescript
interface Conversation {
  id: string,
  userId: string,
  messages: Message[],
  createdAt: string, // ISO 8601
  updatedAt: string, // ISO 8601
  problemType: string
}
```

**User:**
```typescript
interface User {
  id: string, // Firebase Auth UID
  email: string,
  displayName: string,
  ageVerified: boolean,
  createdAt: string // ISO 8601
}
```

**Session:**
```typescript
interface Session {
  sessionId: string, // Auto-generated document ID from Firestore
  userId: string, // Firebase Auth UID
  problemText?: string, // Text input problem (optional)
  problemImageUrl?: string, // Image URL if problem was uploaded (optional)
  messages: Message[], // Full conversation history array
  completionStatus: "solved" | "not_solved" | "in_progress",
  createdAt: string, // ISO 8601 timestamp (UTC)
  updatedAt: string, // ISO 8601 timestamp (UTC)
  stuckState?: StuckState // Optional stuck detection state
}
```

---

## API Contracts

### POST /api/chat

**Request:**
```typescript
{
  message: string,
  conversationHistory: Message[],
  userId?: string
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    message: string,
    messageId: string,
    timestamp: string
  } | null,
  error: string | null
}
```

**Error Codes:**
- `INVALID_REQUEST`: Missing required fields
- `API_ERROR`: OpenAI API error
- `RATE_LIMIT`: Rate limit exceeded
- `UNAUTHORIZED`: User not authenticated (if required)

### POST /api/ocr

**Request:**
```typescript
{
  image: string, // base64 or URL
  format: "base64" | "url"
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    extractedText: string,
    confidence?: number
  } | null,
  error: string | null
}
```

**Error Codes:**
- `INVALID_IMAGE`: Invalid image format
- `API_ERROR`: OpenAI Vision API error
- `SIZE_LIMIT`: Image too large

---

## Security Architecture

### Authentication

**Method:** Firebase Auth (Google Sign-In)
- OAuth 2.0 flow handled by Firebase
- User tokens stored securely in Firebase
- Session management via Firebase Auth state

### Authorization

**MVP Approach:** Minimal auth
- Age verification required (COPPA compliance)
- No role-based access control initially
- Public access to tutoring features

### Data Protection

**Encryption:**
- In transit: HTTPS (automatic via Vercel)
- At rest: Firebase encryption (managed)

**Privacy:**
- COPPA compliance: Age verification required
- Minimal data collection: Only necessary for functionality
- No persistent tracking: Privacy-first approach

### Input Validation

**Text Input:**
- Sanitize user input
- Validate message length
- Prevent injection attacks

**Image Upload:**
- Validate file type (JPG, PNG, WebP)
- Enforce size limits (max 10MB)
- Scan for malicious content

---

## Performance Considerations

### Frontend Performance

**Code Splitting:**
- Automatic via Next.js App Router
- Lazy load math rendering components
- Dynamic imports for heavy libraries

**Image Optimization:**
- Next.js Image component for optimization
- Firebase Storage CDN for image delivery

**Caching:**
- Static assets cached via Vercel CDN
- API responses cached when appropriate

### Backend Performance

**API Optimization:**
- Stream responses from OpenAI API
- Implement request queuing for rate limits
- Cache frequent prompts

**Database:**
- Firestore indexes for query optimization
- Pagination for large conversation histories

### Target Metrics

- **Initial Load Time:** < 3 seconds (3G)
- **Time to Interactive:** < 5 seconds
- **Chat Response Time:** < 2 seconds
- **Image Upload/Processing:** < 5 seconds
- **Math Rendering:** < 1 second

---

## Deployment Architecture

### Deployment Platform: Vercel

**Configuration:**
- Automatic deployments from Git
- Environment variables via Vercel dashboard
- Preview deployments for PRs

**Environment Variables:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `OPENAI_API_KEY` (server-side only)

### Deployment Process

1. Push to `main` branch → Automatic production deployment
2. Push to feature branch → Preview deployment
3. Environment variables configured in Vercel dashboard
4. Firebase project linked for hosting (optional)

### CI/CD Pipeline

**Automatic:**
- Linting on commit
- Type checking on build
- Tests run on deployment (when configured)

**Manual:**
- Production deployments require approval (configurable)

---

## Development Environment

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn package manager
- Git for version control
- Firebase account for backend services
- OpenAI account for API access

### Setup Commands

```bash
# Clone repository (when available)
git clone <repository-url>
cd socratica

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Initialize Firebase (if using Firebase CLI)
firebase login
firebase init

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

**Required:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `OPENAI_API_KEY`

**Optional:**
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## Architecture Decision Records (ADRs)

### ADR-001: Next.js 15 with App Router

**Decision:** Use Next.js 15 with App Router as the primary framework.

**Rationale:**
- Full-stack framework reduces complexity
- Built-in API routes eliminate need for separate backend
- Optimal deployment on Vercel
- Modern React patterns with Server Components

**Alternatives Considered:**
- Vite + React: Faster dev experience but requires separate backend
- Remix: Good but less Next.js ecosystem integration

**Status:** Accepted

---

### ADR-002: Firebase for Backend Services

**Decision:** Use Firebase (Firestore, Auth, Storage) for all backend services.

**Rationale:**
- Rapid MVP development
- Integrated authentication and storage
- Real-time capabilities for future features
- Generous free tier

**Alternatives Considered:**
- Supabase: More flexible but slightly more setup
- PostgreSQL + Prisma: More control but more setup

**Status:** Accepted

---

### ADR-003: OpenAI GPT-4 Turbo with Vision

**Decision:** Use OpenAI GPT-4 Turbo with Vision API for LLM and OCR capabilities.

**Rationale:**
- Excellent instruction following (critical for Socratic method)
- Built-in Vision API eliminates need for separate OCR service
- Cost-effective for MVP
- Strong ecosystem support

**Alternatives Considered:**
- Anthropic Claude: Good alternative but less mature Vision API
- Separate OCR service: More complex integration

**Status:** Accepted

---

### ADR-004: Minimal Authentication (Google Sign-In)

**Decision:** Use Firebase Auth with Google Sign-In only, minimal auth requirements.

**Rationale:**
- Fast setup
- One-click sign-in reduces friction
- COPPA compliant
- Email available for age verification

**Alternatives Considered:**
- Age verification only: Too minimal, no user identity
- Full user accounts: More complex, not needed for MVP

**Status:** Accepted

---

### ADR-005: KaTeX for Math Rendering

**Decision:** Use KaTeX instead of MathJax for mathematical notation rendering.

**Rationale:**
- Faster rendering performance
- Smaller bundle size
- Sufficient for algebra and most math needs
- Good React integration

**Alternatives Considered:**
- MathJax: More comprehensive but slower and larger

**Status:** Accepted

---

### ADR-006: React Context API for State Management

**Decision:** Use React Context API instead of external state management libraries.

**Rationale:**
- No extra dependencies
- Sufficient for MVP conversation state
- Works well with Next.js App Router
- Can migrate to Zustand/Redux if needed later

**Alternatives Considered:**
- Zustand: Good but unnecessary for MVP
- Redux: Overkill for MVP

**Status:** Accepted

---

## Future Considerations

### Scalability

- **Database:** Firestore scales automatically but may need query optimization
- **API:** OpenAI API rate limits may require queuing system
- **Storage:** Firebase Storage CDN handles scaling automatically

### Migration Paths

- **Database:** Can migrate to PostgreSQL if needed (Firestore data export available)
- **State Management:** Can add Zustand/Redux if Context becomes insufficient
- **Authentication:** Can add more providers or custom auth if needed

### Phase 2 Features

- **Interactive Whiteboard:** Firestore real-time listeners
- **Voice Interface:** Web Speech API integration
- **Difficulty Modes:** Extend OpenAI prompts with grade level
- **Problem Generation:** Additional LLM calls for problem creation

---

_Generated by BMAD Decision Architecture Workflow v1.3.2_  
_Date: 2025-11-03_  
_For: xvanov_

