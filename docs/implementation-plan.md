# Socratica - Detailed Implementation Plan

**Author:** xvanov  
**Date:** 2025-11-03  
**Approach:** Test-Driven Development (TDD)  
**Deployment Strategy:** Deploy Early, Deploy Often

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Early Deployment Strategy](#early-deployment-strategy)
3. [Technology Stack](#technology-stack)
4. [TDD Methodology](#tdd-methodology)
5. [Test Strategy](#test-strategy)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Project Setup & Initial Stories](#project-setup--initial-stories)
8. [Phase 1 Story Implementation Plans](#phase-1-story-implementation-plans)
9. [Deployment Infrastructure](#deployment-infrastructure)

---

## Executive Summary

This implementation plan provides a **Test-Driven Development (TDD)** approach for building Socratica, ensuring:

- ✅ **Tests First**: Every story starts with tests before code
- ✅ **Meaningful Tests**: Tests verify acceptance criteria and actual functionality
- ✅ **CI/CD**: Automated formatting, linting, testing, and deployment
- ✅ **Early Deployment**: Public deployment of "Hello World" on Day 1
- ✅ **Continuous Deployment**: Each passing story can be deployed independently

### Key Principles

1. **Red-Green-Refactor Cycle**: Write failing test → Write code to pass → Refactor
2. **Test-Driven**: No production code without tests
3. **Strategic Testing**: Tests verify acceptance criteria, not just coverage
4. **Deploy Fast**: Get something public immediately, iterate from there
5. **Automation First**: CI/CD pipeline runs on every commit

---

## Early Deployment Strategy

### Phase 0: Hello World Deployment (Day 1)

**Goal:** Get a public URL working immediately, even if it just says "Hello World!"

**Story 0.0: Deploy Hello World**

**As a** developer,  
**I want** to deploy a basic "Hello World" page to production,  
**So that** we have a working public URL immediately.

**Acceptance Criteria:**
1. Public URL is accessible (e.g., socratica.app or socratica.vercel.app)
2. Page displays "Hello World!" or "Welcome to Socratica"
3. Deployment is automated via CI/CD
4. Changes to main branch automatically deploy

**Implementation:**
1. Choose deployment platform (Vercel recommended for Next.js)
2. Create minimal Next.js app with single page
3. Set up GitHub Actions for auto-deploy
4. Deploy and verify public URL works

**Tests:**
- E2E test: Visit public URL, verify "Hello World!" is displayed
- CI test: Verify deployment succeeds on push to main

**Timeline:** Complete within first 2 hours of project start

**Why This Matters:**
- Establishes deployment pipeline early
- Gives team confidence in deployment process
- Provides URL for sharing progress
- Sets up infrastructure for future stories

---

## Technology Stack

### Recommended Stack

Based on product requirements (web interface, accessible, free deployment):

**Frontend:**
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (accessible, customizable)
- **Math Rendering**: KaTeX (fast LaTeX rendering)
- **State Management**: React Context + React Query (for API state)

**Backend:**
- **Runtime**: Node.js 20+
- **API**: Next.js API Routes (serverless functions)
- **LLM Integration**: OpenAI SDK (GPT-4 with Vision)
- **Environment**: Vercel Edge Functions (for low latency)

**Testing:**
- **E2E**: Playwright (browser testing)
- **Unit/Integration**: Vitest (fast, Vite-native)
- **Component Testing**: Testing Library (React)
- **Visual Regression**: Playwright + Percy (optional)

**Development Tools:**
- **Linting**: ESLint + Next.js config
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Pre-commit**: Husky + lint-staged

**CI/CD:**
- **Platform**: GitHub Actions
- **Deployment**: Vercel (automatic preview + production)
- **Checks**: Format, lint, type-check, test, build

**Why This Stack:**
- ✅ Next.js: Built-in routing, API routes, optimized for Vercel
- ✅ TypeScript: Type safety, better DX, catches errors early
- ✅ Vercel: Free tier, automatic deployments, edge functions
- ✅ Playwright: Modern E2E testing, better than Cypress for modern apps
- ✅ Vitest: Fast unit tests, compatible with Jest patterns

---

## TDD Methodology

### Red-Green-Refactor Cycle

For **every story**, follow this exact sequence:

1. **🔴 Red**: Write failing test(s) that verify acceptance criteria
2. **🟢 Green**: Write minimal code to make tests pass
3. **🔄 Refactor**: Improve code while keeping tests green

### Test Structure

Each story must include:

1. **Unit Tests** (for functions, utilities, business logic)
2. **Component Tests** (for React components, UI interactions)
3. **Integration Tests** (for API routes, LLM interactions)
4. **E2E Tests** (for user flows, acceptance criteria validation)

### Test Requirements

**Tests MUST:**
- ✅ Verify acceptance criteria explicitly
- ✅ Test actual functionality (not just happy paths)
- ✅ Be simple and maintainable
- ✅ Run fast (< 5 seconds for unit tests)
- ✅ Be independent (no shared state between tests)

**Tests MUST NOT:**
- ❌ Test implementation details
- ❌ Test third-party library internals
- ❌ Have dependencies on external services (use mocks)
- ❌ Be brittle (avoid testing CSS classes, exact text matches)

### Example Test Structure

```typescript
// Good: Tests behavior, not implementation
test('should display error message when problem input is empty', async () => {
  render(<ProblemInput onSubmit={handleSubmit} />);
  await user.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/please enter a problem/i)).toBeInTheDocument();
});

// Bad: Tests implementation details
test('should have error class when error exists', () => {
  const { container } = render(<ProblemInput />);
  expect(container.querySelector('.error')).toBeTruthy();
});
```

---

## Test Strategy

### Test Pyramid

```
        /\
       /E2E\         ← Few, high-level user flows
      /------\
     /  INT  \       ← API routes, LLM integration
    /--------\
   / COMPONENT\      ← React components, UI interactions
  /-----------\
 /   UNIT      \     ← Business logic, utilities
/--------------\
```

### Test Levels by Story Type

**UI Components (Epic 1, Epic 2, Epic 5):**
- Component tests (80%)
- E2E tests (20%)

**Business Logic (Epic 3):**
- Unit tests (70%)
- Integration tests (20%)
- E2E tests (10%)

**API Integration (Epic 2, Epic 1):**
- Integration tests (60%)
- Unit tests (30%)
- E2E tests (10%)

### Test Categories

**1. Acceptance Criteria Tests**
- One test per acceptance criterion
- Tests verify the criterion is met
- Named after the criterion (e.g., `test('should display extracted text in input field after OCR')`)

**2. User Flow Tests**
- Test complete user journeys
- Verify end-to-end functionality
- Match product brief scenarios

**3. Error Handling Tests**
- Test error states and edge cases
- Verify graceful degradation
- Test invalid inputs, API failures

**4. Accessibility Tests**
- Verify ARIA labels
- Test keyboard navigation
- Verify screen reader compatibility

### Testing Acceptance Criteria

For each story, create a test file that mirrors the acceptance criteria:

```typescript
// Story 1.1: Text Input Interface
// Acceptance Criteria:
// 1. Text input field is visible and accessible
// 2. Input field accepts multi-line text
// 3. Input field has placeholder text
// 4. Submit button or Enter key sends the problem text
// 5. Input field clears after submission

describe('Story 1.1: Text Input Interface', () => {
  test('should display text input field', () => {
    render(<ProblemInput />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('should accept multi-line text', async () => {
    const { user } = render(<ProblemInput />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'Solve for x:\n2x + 5 = 13');
    expect(input).toHaveValue('Solve for x:\n2x + 5 = 13');
  });

  test('should display placeholder text', () => {
    render(<ProblemInput />);
    expect(screen.getByPlaceholderText(/enter your math problem/i)).toBeInTheDocument();
  });

  test('should submit problem when button is clicked', async () => {
    const onSubmit = vi.fn();
    const { user } = render(<ProblemInput onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '2x + 5 = 13');
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledWith('2x + 5 = 13');
  });

  test('should submit problem when Enter key is pressed', async () => {
    const onSubmit = vi.fn();
    const { user } = render(<ProblemInput onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '2x + 5 = 13');
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('2x + 5 = 13');
  });

  test('should clear input after submission', async () => {
    const { user } = render(<ProblemInput onSubmit={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '2x + 5 = 13');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('');
  });
});
```

---

## CI/CD Pipeline

### Pipeline Stages

Every commit triggers:

1. **Lint** - ESLint checks
2. **Format Check** - Prettier validation
3. **Type Check** - TypeScript compilation
4. **Unit Tests** - Fast unit/component tests
5. **Integration Tests** - API and integration tests
6. **E2E Tests** - Full browser tests (can run in parallel)
7. **Build** - Production build verification
8. **Deploy Preview** - Deploy to preview URL
9. **Deploy Production** - Deploy to production (main branch only)

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm run lint
      
      - name: Format check
        run: pnpm run format:check
      
      - name: Type check
        run: pnpm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run unit tests
        run: pnpm run test:unit
      
      - name: Run integration tests
        run: pnpm run test:integration
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
      
      - name: Run E2E tests
        run: pnpm run test:e2e

  build:
    runs-on: ubuntu-latest
    needs: [quality-checks, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm run build
        env:
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}

  deploy:
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Pre-commit Hooks

**Husky** + **lint-staged** for fast feedback:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Quality Gates

**PRs must pass:**
- ✅ All linting checks
- ✅ All formatting checks
- ✅ All type checks
- ✅ All unit tests (> 80% coverage)
- ✅ All integration tests
- ✅ All E2E tests
- ✅ Production build succeeds

**Main branch additionally requires:**
- ✅ Deploy to preview succeeds
- ✅ Manual review approval
- ✅ Production deployment ready

---

## Project Setup & Initial Stories

### Story 0.1: Project Initialization

**As a** developer,  
**I want** a Next.js project with TypeScript and testing configured,  
**So that** I can start implementing features immediately.

**Acceptance Criteria:**
1. Next.js 14+ project initialized with TypeScript
2. ESLint and Prettier configured
3. Vitest and Playwright installed
4. Tailwind CSS configured
5. Basic project structure created
6. CI/CD workflow file created (GitHub Actions)
7. Package.json scripts configured

**Implementation Steps:**
1. Run `npx create-next-app@latest --typescript --tailwind --app`
2. Install testing dependencies: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@playwright/test`
3. Install dev dependencies: `eslint`, `prettier`, `husky`, `lint-staged`
4. Configure ESLint with Next.js rules
5. Configure Prettier
6. Create test setup files
7. Set up GitHub Actions workflow
8. Create basic folder structure

**Tests:**
- Verify Next.js app starts: `pnpm run dev` succeeds
- Verify tests run: `pnpm run test` succeeds
- Verify linting works: `pnpm run lint` succeeds

---

## Phase 1 Story Implementation Plans

### Epic 1: Problem Input

#### Story 1.1: Text Input Interface

**Test-First Implementation:**

1. **Write Failing Tests** (`tests/components/ProblemInput.test.tsx`):
   ```typescript
   describe('ProblemInput Component', () => {
     test('should display text input field', () => {
       render(<ProblemInput />);
       expect(screen.getByRole('textbox')).toBeInTheDocument();
     });
     
     test('should accept multi-line text', async () => {
       const { user } = render(<ProblemInput />);
       const input = screen.getByRole('textbox');
       await user.type(input, 'Solve for x:\n2x + 5 = 13');
       expect(input).toHaveValue('Solve for x:\n2x + 5 = 13');
     });
     
     // ... all acceptance criteria tests
   });
   ```

2. **Run Tests** (should fail - RED)
3. **Implement Component** (`components/ProblemInput.tsx`)
4. **Run Tests** (should pass - GREEN)
5. **Refactor** if needed
6. **E2E Test** (`tests/e2e/problem-input.spec.ts`):
   ```typescript
   test('user can type and submit problem', async ({ page }) => {
     await page.goto('/');
     await page.fill('textarea[aria-label="Problem input"]', '2x + 5 = 13');
     await page.click('button:has-text("Submit")');
     // Verify submission (depends on chat implementation)
   });
   ```

**Files to Create:**
- `components/ProblemInput.tsx`
- `tests/components/ProblemInput.test.tsx`
- `tests/e2e/problem-input.spec.ts`

**Acceptance Criteria Mapping:**
- Each acceptance criterion = 1 test
- E2E test verifies complete flow

---

#### Story 1.2: Image Upload Interface

**Test-First Implementation:**

1. **Write Tests** (unit + E2E):
   - File picker opens on button click
   - Image preview displays after selection
   - Supports JPG, PNG, WebP
   - File size validation
   - Remove/clear functionality

2. **Implement Component:**
   - File input element
   - Image preview component
   - File validation logic
   - Error handling

3. **Integration Tests:**
   - File upload flow
   - Error handling for invalid files

**Files to Create:**
- `components/ImageUpload.tsx`
- `components/ImagePreview.tsx`
- `utils/fileValidation.ts`
- `tests/components/ImageUpload.test.tsx`
- `tests/components/ImagePreview.test.tsx`
- `tests/integration/image-upload.test.ts`
- `tests/e2e/image-upload.spec.ts`

**Mock Strategy:**
- Mock File API for unit tests
- Use real file selection in E2E tests
- Mock image preview rendering

---

#### Story 1.3: OCR/Vision LLM Integration

**Test-First Implementation:**

1. **Write Tests:**
   - **Unit Tests**: Mock LLM API calls
   - **Integration Tests**: Real API call (with test key)
   - **E2E Tests**: Full upload → OCR → display flow

2. **Implement:**
   - API route: `app/api/ocr/route.ts`
   - Client function: `lib/api/ocr.ts`
   - Error handling
   - Loading states

**Critical Tests:**
```typescript
// Unit test with mock
test('should extract text from image using Vision API', async () => {
  const mockResponse = { text: 'Solve for x: 2x + 5 = 13' };
  vi.spyOn(openaiClient, 'extractText').mockResolvedValue(mockResponse);
  
  const result = await extractTextFromImage(mockImageFile);
  expect(result).toBe('Solve for x: 2x + 5 = 13');
});

// Integration test (runs against real API in CI)
test('should handle API failures gracefully', async () => {
  // Simulate API failure
  vi.spyOn(openaiClient, 'extractText').mockRejectedValue(new Error('API Error'));
  
  const result = await extractTextFromImage(mockImageFile);
  expect(result.error).toBeTruthy();
  expect(result.error.message).toContain('Unable to extract text');
});
```

**Files to Create:**
- `app/api/ocr/route.ts`
- `lib/api/ocr.ts`
- `lib/api/openai.ts`
- `tests/api/ocr.test.ts`
- `tests/integration/ocr.test.ts`
- `tests/e2e/ocr.spec.ts`

**Environment Variables:**
- `OPENAI_API_KEY` (required)
- Mock in tests, use real key in CI/CD

---

### Epic 2: Chat Interface & LLM Integration

#### Story 2.1: Basic Chat UI Layout

**Test-First Implementation:**

1. **Write Component Tests:**
   - Chat container renders
   - Messages display in order
   - Student messages on right
   - AI messages on left
   - Auto-scroll to latest

2. **Write E2E Tests:**
   - Full chat interface renders
   - Messages appear correctly

**Accessibility Tests:**
```typescript
test('should have proper ARIA labels', () => {
  render(<ChatInterface />);
  expect(screen.getByRole('log', { name: /conversation/i })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /message input/i })).toBeInTheDocument();
});

test('should support keyboard navigation', async () => {
  const { user } = render(<ChatInterface />);
  await user.tab();
  expect(screen.getByRole('textbox')).toHaveFocus();
});
```

**Files to Create:**
- `components/ChatInterface.tsx`
- `components/ChatMessage.tsx`
- `components/ChatContainer.tsx`
- `tests/components/ChatInterface.test.tsx`
- `tests/components/ChatMessage.test.tsx`
- `tests/e2e/chat-interface.spec.ts`

---

#### Story 2.3: LLM API Integration

**Critical Test Strategy:**

**Mock Strategy for Tests:**
- Unit tests: Mock OpenAI SDK
- Integration tests: Use OpenAI test API key
- E2E tests: Mock API responses (don't hit real API in CI)

**Test Implementation:**

```typescript
// Unit test - mock OpenAI
describe('LLM API Integration', () => {
  test('should send message to OpenAI and return response', async () => {
    const mockResponse = 'Let\'s work through this step by step. What do you think we should do first?';
    vi.spyOn(openaiClient, 'chat').mockResolvedValue(mockResponse);
    
    const response = await sendMessage('Solve for x: 2x + 5 = 13', []);
    expect(response).toBe(mockResponse);
    expect(openaiClient.chat).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: 'user', content: 'Solve for x: 2x + 5 = 13' })
      ])
    );
  });
  
  test('should include conversation context', async () => {
    const history = [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello! How can I help?' }
    ];
    
    await sendMessage('2x + 5 = 13', history);
    
    expect(openaiClient.chat).toHaveBeenCalledWith(
      expect.arrayContaining(history)
    );
  });
  
  test('should handle API errors gracefully', async () => {
    vi.spyOn(openaiClient, 'chat').mockRejectedValue(new Error('API Error'));
    
    await expect(sendMessage('test', [])).rejects.toThrow('API Error');
  });
});
```

**Integration Test (Real API):**
```typescript
// tests/integration/llm-api.test.ts
// Runs against real OpenAI API in CI (with test key)
describe('LLM API Integration (Real)', () => {
  test('should successfully call OpenAI API', async () => {
    const response = await sendMessage('What is 2+2?', []);
    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
  }, 10000); // Longer timeout for API call
});
```

**Files to Create:**
- `app/api/chat/route.ts`
- `lib/api/openai.ts`
- `lib/api/chat.ts`
- `tests/api/chat.test.ts`
- `tests/integration/openai.test.ts`
- `tests/e2e/chat-api.spec.ts`

---

### Epic 3: Socratic Dialogue Logic

#### Story 3.1: Socratic System Prompt Design

**Test Strategy:**

**Critical Test: Verify AI Never Gives Direct Answers**

```typescript
// Integration test - this is crucial
describe('Socratic System Prompt', () => {
  test('should never give direct answers to algebra problems', async () => {
    const problem = 'Solve for x: 2x + 5 = 13';
    const response = await sendMessage(problem, []);
    
    // Should NOT contain direct answer
    expect(response).not.toMatch(/x\s*=\s*4/);
    expect(response).not.toMatch(/the answer is/i);
    expect(response).not.toMatch(/solution is/i);
    
    // Should contain questions
    expect(response).toMatch(/\?/);
    expect(response.toLowerCase()).toMatch(/what|how|why|can you/i);
  }, 15000);
  
  test('should provide hints after 2 stuck responses', async () => {
    const problem = 'Solve for x: 2x + 5 = 13';
    const conversation = [
      { role: 'user', content: problem },
      { role: 'assistant', content: 'What operation should we do first?' },
      { role: 'user', content: 'I don\'t know' },
      { role: 'assistant', content: 'Let\'s think about isolating x...' },
      { role: 'user', content: 'I\'m stuck' }
    ];
    
    const response = await sendMessage('Help!', conversation);
    
    // After 2 stuck responses, should provide hint
    expect(response.toLowerCase()).toMatch(/hint|try|consider/i);
  }, 15000);
});
```

**Files to Create:**
- `lib/prompts/socratic.ts`
- `lib/prompts/system.ts`
- `tests/prompts/socratic.test.ts`
- `tests/integration/socratic-prompt.test.ts`

---

#### Story 3.2: Stuck Detection Logic

**Test-First Implementation:**

```typescript
describe('Stuck Detection', () => {
  test('should detect "I don\'t know" as stuck', () => {
    expect(isStuckResponse('I don\'t know')).toBe(true);
  });
  
  test('should detect "I\'m stuck" as stuck', () => {
    expect(isStuckResponse('I\'m stuck')).toBe(true);
  });
  
  test('should detect repeated question as stuck', () => {
    const conversation = [
      { role: 'user', content: 'How do I solve this?' },
      { role: 'assistant', content: 'Let\'s isolate x...' },
      { role: 'user', content: 'How do I solve this?' }
    ];
    expect(isStuckResponse('How do I solve this?', conversation)).toBe(true);
  });
  
  test('should flag stuck after 2 consecutive stuck responses', () => {
    const conversation = [
      { role: 'user', content: 'I don\'t know' },
      { role: 'assistant', content: 'Let\'s think...' },
      { role: 'user', content: 'I\'m stuck' }
    ];
    expect(detectStuckState(conversation)).toBe(true);
  });
  
  test('should not flag stuck after 1 stuck response', () => {
    const conversation = [
      { role: 'user', content: 'I don\'t know' },
      { role: 'assistant', content: 'Let\'s think...' },
      { role: 'user', content: 'I see, so I subtract 5?' }
    ];
    expect(detectStuckState(conversation)).toBe(false);
  });
});
```

**Files to Create:**
- `lib/detection/stuck.ts`
- `utils/stuckDetection.ts`
- `tests/detection/stuck.test.ts`

---

### Epic 4: Math Rendering

#### Story 4.1: LaTeX Rendering Library Integration

**Test-First Implementation:**

```typescript
describe('LaTeX Rendering', () => {
  test('should render inline math expressions', () => {
    const { container } = render(<MathRenderer content="$x^2 + 5$" />);
    expect(container.querySelector('.katex')).toBeInTheDocument();
  });
  
  test('should render block math expressions', () => {
    const { container } = render(<MathRenderer content="$$\\frac{a}{b}$$" />);
    expect(container.querySelector('.katex-display')).toBeInTheDocument();
  });
  
  test('should handle multiple math expressions in text', () => {
    const content = 'The equation $x^2 + 5 = 13$ has solution $x = \\pm 2\\sqrt{2}$';
    const { container } = render(<MathRenderer content={content} />);
    expect(container.querySelectorAll('.katex')).toHaveLength(2);
  });
  
  test('should handle invalid LaTeX gracefully', () => {
    const { container } = render(<MathRenderer content="$\\invalid{" />);
    expect(container.querySelector('.katex-error')).toBeInTheDocument();
  });
});
```

**E2E Test:**
```typescript
test('should render math in chat messages', async ({ page }) => {
  await page.goto('/');
  await page.fill('textarea', 'Solve $x^2 = 4$');
  await page.click('button:has-text("Submit")');
  
  await expect(page.locator('.katex')).toBeVisible();
});
```

---

### Epic 5: UI Polish

#### Story 5.1: Responsive Layout Design

**Test Strategy:**

**Visual Regression Testing:**
```typescript
test('should render correctly on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page).toHaveScreenshot('mobile-layout.png');
});

test('should render correctly on tablet', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  await expect(page).toHaveScreenshot('tablet-layout.png');
});

test('should render correctly on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await expect(page).toHaveScreenshot('desktop-layout.png');
});
```

**Breakpoint Tests:**
```typescript
test('should show mobile menu on small screens', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
});

test('should hide mobile menu on large screens', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeHidden();
});
```

---

## Deployment Infrastructure

### Vercel Configuration

**vercel.json:**
```json
{
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

### Environment Variables

**Required:**
- `OPENAI_API_KEY` - OpenAI API key for LLM
- `NEXT_PUBLIC_APP_URL` - Public app URL

**Secrets Management:**
- Store in Vercel dashboard
- Use `.env.local` for local development
- Never commit to git

### Deployment Strategy

1. **Preview Deployments**: Every PR gets a preview URL
2. **Production Deployments**: Main branch auto-deploys
3. **Rollback**: Vercel provides one-click rollback
4. **Monitoring**: Vercel Analytics (free tier)

---

## Test Execution Strategy

### Local Development

```bash
# Run all tests
pnpm test

# Run unit tests (fast)
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### CI/CD Execution

- **Unit tests**: Run on every commit (fast feedback)
- **Integration tests**: Run on PR (slower, but necessary)
- **E2E tests**: Run on PR, can run in parallel
- **Coverage**: Must maintain > 80% coverage

### Test Data Strategy

- **Unit tests**: Use fixtures/mocks
- **Integration tests**: Use test API keys
- **E2E tests**: Use mock responses (don't hit real APIs)

---

## Success Metrics

### Development Metrics

- ✅ All tests pass before PR merge
- ✅ Code coverage > 80%
- ✅ Zero linting/formatting errors
- ✅ All E2E tests pass

### Deployment Metrics

- ✅ Public URL accessible
- ✅ Zero-downtime deployments
- ✅ Rollback capability
- ✅ Preview deployments work

### Quality Metrics

- ✅ All acceptance criteria have tests
- ✅ Tests verify actual functionality
- ✅ Tests are maintainable and fast
- ✅ CI/CD pipeline prevents bad code

---

## Next Steps

1. **Day 1**: Deploy Hello World, set up CI/CD
2. **Day 2**: Story 0.1 - Project initialization
3. **Week 1**: Epic 1 Stories 1.1, 1.2 (Text Input, Image Upload)
4. **Week 2**: Epic 2 Stories 2.1, 2.2, 2.3 (Chat UI, LLM Integration)
5. **Week 3**: Epic 3 Stories 3.1-3.5 (Socratic Logic)
6. **Week 4**: Epic 4, Epic 5 (Math Rendering, UI Polish)
7. **Week 5**: Story 5.6 (Testing Suite, MVP Validation)

Each story follows TDD: Write tests → Implement → Deploy → Verify

---

**This implementation plan ensures:**
- ✅ Tests come first (TDD)
- ✅ Meaningful tests (verify acceptance criteria)
- ✅ Automated quality checks (CI/CD)
- ✅ Early deployment (Hello World Day 1)
- ✅ Continuous deployment (every story deployable)


