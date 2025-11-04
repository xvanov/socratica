# TDD Quick Start Guide - Socratica

**Author:** xvanov  
**Date:** 2025-11-03  
**Purpose:** Quick reference for TDD implementation

---

## 🚀 Day 1: Hello World Deployment

**Goal:** Get something public immediately

### Steps:

1. **Create Next.js app:**
   ```bash
   npx create-next-app@latest socratica --typescript --tailwind --app
   ```

2. **Set up GitHub Actions:**
   - Create `.github/workflows/ci.yml`
   - Configure auto-deploy to Vercel

3. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

4. **Verify:**
   - Visit public URL
   - Verify "Hello World" displays

**✅ Success:** Public URL working, deployment pipeline established

---

## 📋 TDD Workflow for Each Story

### Step 1: Red (Write Failing Test)

```bash
# Create test file
touch tests/components/ProblemInput.test.tsx

# Write tests that verify acceptance criteria
# Run tests - they should FAIL (RED)
pnpm test
```

### Step 2: Green (Write Code)

```bash
# Create component
touch components/ProblemInput.tsx

# Write minimal code to make tests pass
# Run tests - they should PASS (GREEN)
pnpm test
```

### Step 3: Refactor

```bash
# Improve code while keeping tests green
# Run tests after each refactor
pnpm test
```

### Step 4: Commit & Deploy

```bash
# Commit changes
git add .
git commit -m "feat(story-1.1): Text Input Interface"

# Push to trigger CI/CD
git push origin main

# Verify deployment
# Visit preview URL (from PR) or production URL
```

---

## ✅ Checklist for Each Story

**Before Starting:**
- [ ] Read story acceptance criteria
- [ ] Review test specifications document
- [ ] Understand dependencies

**Test Phase (Red):**
- [ ] Write unit tests for all acceptance criteria
- [ ] Write component tests (if applicable)
- [ ] Write integration tests (if applicable)
- [ ] Write E2E tests for user flow
- [ ] Run tests - verify they FAIL
- [ ] Commit failing tests

**Implementation Phase (Green):**
- [ ] Implement minimal code to pass tests
- [ ] Run tests - verify they PASS
- [ ] Verify all acceptance criteria met
- [ ] Check code coverage (>80%)

**Refactor Phase:**
- [ ] Improve code quality
- [ ] Remove duplication
- [ ] Optimize performance
- [ ] Run tests after each change

**Quality Checks:**
- [ ] Linting passes: `pnpm lint`
- [ ] Formatting correct: `pnpm format:check`
- [ ] Type check passes: `pnpm type-check`
- [ ] All tests pass: `pnpm test`
- [ ] Build succeeds: `pnpm build`

**Deployment:**
- [ ] PR created
- [ ] CI/CD pipeline passes
- [ ] Preview deployment successful
- [ ] Manual testing on preview
- [ ] PR approved and merged
- [ ] Production deployment successful

---

## 📚 Test File Structure

```
tests/
├── components/        # Component tests
│   ├── ProblemInput.test.tsx
│   ├── ChatInterface.test.tsx
│   └── ...
├── api/              # API route tests
│   ├── chat.test.ts
│   ├── ocr.test.ts
│   └── ...
├── integration/      # Integration tests
│   ├── llm-api.test.ts
│   ├── ocr.test.ts
│   └── ...
├── e2e/              # End-to-end tests
│   ├── problem-input.spec.ts
│   ├── chat-interface.spec.ts
│   └── ...
├── fixtures/         # Test data
│   ├── test-image.jpg
│   ├── problems.json
│   └── ...
└── utils/            # Test utilities
    ├── test-helpers.ts
    ├── mock-factories.ts
    └── ...
```

---

## 🔄 Red-Green-Refactor Example

### Story 1.1: Text Input Interface

**Red Phase:**
```typescript
// tests/components/ProblemInput.test.tsx
describe('ProblemInput', () => {
  test('should display text input field', () => {
    render(<ProblemInput />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});

// Run: pnpm test → FAIL ❌ (expected - component doesn't exist yet)
```

**Green Phase:**
```typescript
// components/ProblemInput.tsx
export function ProblemInput() {
  return <textarea aria-label="Problem input" />;
}

// Run: pnpm test → PASS ✅
```

**Refactor Phase:**
```typescript
// components/ProblemInput.tsx
export function ProblemInput({ onSubmit }: Props) {
  const [value, setValue] = useState('');
  
  const handleSubmit = () => {
    onSubmit?.(value);
    setValue('');
  };
  
  return (
    <div>
      <textarea
        aria-label="Problem input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter your math problem"
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

// Run: pnpm test → PASS ✅ (still green after refactor)
```

---

## 🧪 Test Execution Commands

```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test:unit
pnpm test:component
pnpm test:integration
pnpm test:e2e

# Watch mode (development)
pnpm test:watch

# Coverage report
pnpm test:coverage

# Run specific test file
pnpm test ProblemInput.test.tsx

# Run tests matching pattern
pnpm test --testNamePattern="should display"
```

---

## 🚢 CI/CD Pipeline

**Every Commit Triggers:**
1. ✅ Lint check
2. ✅ Format check
3. ✅ Type check
4. ✅ Unit tests
5. ✅ Integration tests
6. ✅ E2E tests
7. ✅ Build verification

**PR Merge Triggers:**
1. ✅ All quality checks
2. ✅ Preview deployment
3. ✅ E2E tests on preview

**Main Branch Push:**
1. ✅ All quality checks
2. ✅ Production deployment

---

## 📝 Story Implementation Template

### 1. Read Story
- Review acceptance criteria
- Check dependencies
- Review test specifications

### 2. Write Tests (Red)
```typescript
// One test per acceptance criterion
test('acceptance criterion 1', () => { /* ... */ });
test('acceptance criterion 2', () => { /* ... */ });
// ...
```

### 3. Implement (Green)
```typescript
// Minimal code to pass tests
export function Component() {
  // Implementation
}
```

### 4. Refactor
- Improve code quality
- Maintain test coverage
- Keep tests green

### 5. Quality Checks
```bash
pnpm lint && pnpm format:check && pnpm type-check && pnpm test && pnpm build
```

### 6. Deploy
- Create PR
- Wait for CI/CD
- Test on preview
- Merge to main

---

## 🎯 Success Metrics

**Development:**
- ✅ All tests pass before PR
- ✅ Code coverage > 80%
- ✅ Zero linting errors
- ✅ All E2E tests pass

**Deployment:**
- ✅ Public URL accessible
- ✅ Zero-downtime deployments
- ✅ Rollback capability

**Quality:**
- ✅ All acceptance criteria have tests
- ✅ Tests verify actual functionality
- ✅ Tests are maintainable and fast

---

## 📖 Reference Documents

- **[Epic Breakdown](./epics.md)** - All stories and acceptance criteria
- **[Implementation Plan](./implementation-plan.md)** - Detailed TDD guide
- **[Test Specifications](./test-specifications.md)** - Detailed test cases

---

## 🆘 Quick Troubleshooting

**Tests failing?**
- Verify test setup
- Check mocks/stubs
- Review test utilities

**CI/CD failing?**
- Check logs
- Verify environment variables
- Test locally first

**Deployment failing?**
- Check build logs
- Verify Vercel configuration
- Check environment variables

**Need help?**
- Review test specifications document
- Check example tests in test files
- Review implementation plan

---

**Remember:** Tests first, code second, refactor third. Always keep tests green! 🟢


