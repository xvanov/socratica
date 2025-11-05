# End-to-End Workflow Documentation

**Story 5.6: Testing Suite - 5+ Algebra Problems**  
**Created:** 2025-01-27  
**Purpose:** Document complete E2E workflows for all algebra problem types

---

## Overview

This document describes the complete end-to-end workflows for each algebra problem type tested in Story 5.6. Each workflow includes problem submission, chat interaction, Socratic questioning, problem solving steps, and completion verification.

---

## Workflow Structure

Each workflow follows this general structure:

1. **Problem Submission**: Student submits problem via text input or image upload
2. **Chat Interaction**: AI responds with Socratic questioning
3. **Socratic Questioning**: AI guides student through problem-solving process
4. **Problem Solving Steps**: Student works through problem with AI guidance
5. **Completion**: Student solves problem, AI confirms understanding

---

## Problem Type Workflows

### 1. Linear Equations

**Problem Example:** `Solve for x: 2x + 5 = 13`

#### Expected Workflow:

1. **Student submits problem**
   - Problem text entered in input field
   - Problem submitted via Enter key or Submit button

2. **AI asks guiding question**
   - Example: "What operation could you use to isolate the variable?"
   - AI does NOT provide direct answer (e.g., "x = 4")

3. **Student responds**
   - Student identifies operation (e.g., "subtract 5")
   - Or student asks for clarification

4. **AI guides through next steps**
   - Example: "That's right! What would you do next?"
   - AI continues Socratic questioning

5. **Student completes solution**
   - Student works through steps
   - Student arrives at answer

6. **AI confirms understanding**
   - AI confirms student's solution
   - AI may ask follow-up questions to deepen understanding

#### Socratic Questioning Patterns:

- "What operation could you use to isolate the variable?"
- "What's happening to the x in this equation?"
- "What do you need to do to both sides?"
- "Can you think about what number plus 5 equals 13?"

#### Math Rendering Verification:

- Problem displays correctly: `2x + 5 = 13`
- Math notation renders properly (variables, operators, numbers)
- Inline math ($...$) renders correctly
- Block math ($$...$$) renders correctly if used

---

### 2. Quadratic Equations

**Problem Example:** `Solve: x^2 - 5x + 6 = 0`

#### Expected Workflow:

1. **Student submits problem**
   - Problem text entered or uploaded

2. **AI asks about factoring approach**
   - Example: "What two numbers multiply to give you 6?"
   - AI guides toward factoring method

3. **Student identifies factors**
   - Student finds factors (e.g., "2 and 3")
   - Or student asks for help

4. **AI guides through factoring process**
   - Example: "Good! What do those numbers need to add up to?"
   - AI continues Socratic questioning

5. **Student factors quadratic**
   - Student writes factored form: `(x - 2)(x - 3) = 0`
   - Student finds roots

6. **AI confirms solution**
   - AI confirms student's factoring
   - AI may ask about verification

#### Socratic Questioning Patterns:

- "What two numbers multiply to give you 6?"
- "What two numbers add to give you -5?"
- "Can you factor this quadratic?"
- "What factors of 6 could work?"

#### Math Rendering Verification:

- Problem displays correctly: `x^2 - 5x + 6 = 0`
- Exponents render properly: `x^2`
- Factored form renders correctly: `(x - 2)(x - 3)`

---

### 3. Systems of Equations

**Problem Example:** `Solve: 2x + y = 7, x - y = 2`

#### Expected Workflow:

1. **Student submits problem**
   - Problem text entered

2. **AI asks about method choice**
   - Example: "What do you notice about the y terms?"
   - AI guides toward elimination or substitution

3. **Student chooses method**
   - Student identifies elimination opportunity
   - Or student chooses substitution

4. **AI guides through chosen method**
   - Example: "What happens if you add the equations?"
   - AI continues Socratic questioning

5. **Student solves for one variable**
   - Student eliminates variable
   - Student finds first variable value

6. **AI guides to find second variable**
   - Example: "Now that you know x, how can you find y?"
   - AI continues Socratic questioning

7. **Student completes solution**
   - Student finds both variables
   - Student verifies solution

8. **AI confirms solution**
   - AI confirms student's work
   - AI may ask about verification

#### Socratic Questioning Patterns:

- "What do you notice about the y terms?"
- "Which method might work well here?"
- "Can you eliminate one variable?"
- "What happens if you add the equations?"

#### Math Rendering Verification:

- Problem displays correctly: `2x + y = 7, x - y = 2`
- Multiple equations render correctly
- Variables render properly

---

### 4. Factoring Problems

**Problem Example:** `Factor: x^2 + 7x + 12`

#### Expected Workflow:

1. **Student submits problem**
   - Problem text entered

2. **AI asks about factors**
   - Example: "What two numbers multiply to give you 12?"
   - AI guides toward factoring

3. **Student identifies factors**
   - Student finds factors (e.g., "3 and 4")
   - Or student asks for help

4. **AI guides through factoring process**
   - Example: "Good! What do those numbers add up to?"
   - AI continues Socratic questioning

5. **Student writes factored form**
   - Student writes: `(x + 3)(x + 4)`
   - Student verifies factoring

6. **AI confirms factoring**
   - AI confirms student's work
   - AI may ask about verification

#### Socratic Questioning Patterns:

- "What two numbers multiply to give you 12?"
- "What two numbers add to give you 7?"
- "Can you find factors of 12 that sum to 7?"
- "How can you write this as two binomials?"

#### Math Rendering Verification:

- Problem displays correctly: `x^2 + 7x + 12`
- Factored form renders correctly: `(x + 3)(x + 4)`
- Exponents render properly

---

### 5. Word Problems

**Problem Example:** `A number is 5 more than twice another number. Their sum is 23. Find the numbers.`

#### Expected Workflow:

1. **Student submits problem**
   - Problem text entered

2. **AI asks about what to find**
   - Example: "What are you trying to find?"
   - AI guides toward setting up equation

3. **Student identifies variables**
   - Student defines variables (e.g., "x and y")
   - Or student asks for help

4. **AI guides through translation**
   - Example: "Can you translate '5 more than twice another number' into an equation?"
   - AI continues Socratic questioning

5. **Student sets up equation**
   - Student writes: `x + (2x + 5) = 23` or system of equations
   - Student identifies relationships

6. **AI guides through solving**
   - Example: "Now that you have the equation, how can you solve it?"
   - AI continues Socratic questioning

7. **Student solves equation**
   - Student solves for variables
   - Student verifies solution makes sense

8. **AI confirms solution**
   - AI confirms student's work
   - AI may ask about verification

#### Socratic Questioning Patterns:

- "What are you trying to find?"
- "Can you translate '5 more than twice another number' into an equation?"
- "What variable should you use?"
- "How can you set up the equation?"

#### Math Rendering Verification:

- Problem displays correctly
- Converted equation renders correctly: `x + (2x + 5) = 23`
- Math notation renders properly

---

## Common Workflow Elements

### Socratic Questioning Validation

All workflows verify:
- ✅ AI asks questions (not provides answers)
- ✅ Questions are pedagogically sound
- ✅ Questions adapt to student responses
- ✅ No direct answers provided

### Math Rendering Validation

All workflows verify:
- ✅ LaTeX syntax renders correctly
- ✅ Inline math ($...$) renders correctly
- ✅ Block math ($$...$$) renders correctly if used
- ✅ Complex notation (fractions, exponents, roots) renders correctly

### End-to-End Verification

All workflows verify:
- ✅ Problem submission works correctly
- ✅ Chat interaction works correctly
- ✅ Socratic questioning maintained throughout
- ✅ Math rendering works correctly
- ✅ Complete workflow from submission to completion

---

## Test Execution Steps

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Run E2E tests**
   ```bash
   npm run test:e2e
   ```

3. **Run specific test suite**
   ```bash
   npm run test:e2e tests/e2e/algebra-problems.test.ts
   ```

4. **Run tests in headed mode (for debugging)**
   ```bash
   npm run test:e2e:headed
   ```

5. **Run tests with UI (for debugging)**
   ```bash
   npm run test:e2e:ui
   ```

---

## Expected Test Results

### All Tests Should Pass:

- ✅ Linear Equations workflow test
- ✅ Quadratic Equations workflow test
- ✅ Systems of Equations workflow test
- ✅ Factoring Problems workflow test
- ✅ Word Problems workflow test
- ✅ No direct answers verification (all problem types)
- ✅ Socratic questioning verification (all problem types)
- ✅ Math rendering verification (all problem types)
- ✅ Complete workflow verification (all problem types)

### Test Coverage:

- **5+ problem types** tested ✅
- **25+ total problems** tested ✅
- **All acceptance criteria** verified ✅
- **Complete workflows** documented ✅

---

## Workflow Diagrams

### Linear Equation Workflow:

```
[Student] → Submit Problem → [AI] → Ask Guiding Question
    ↓                                      ↓
[Student] → Respond → [AI] → Continue Socratic Questioning
    ↓                                      ↓
[Student] → Solve → [AI] → Confirm Understanding
```

### Quadratic Equation Workflow:

```
[Student] → Submit Problem → [AI] → Ask About Factoring
    ↓                                      ↓
[Student] → Identify Factors → [AI] → Guide Through Factoring
    ↓                                      ↓
[Student] → Factor → [AI] → Confirm Solution
```

---

## Notes

- All workflows maintain Socratic questioning throughout
- No direct answers provided in any workflow
- Math rendering verified for all problem types
- Complete end-to-end workflows tested and documented
- Tests use fixtures for consistent test data
- Tests mock OpenAI API responses for reliability

---

## Created

2025-01-27

## Author

BMAD Story 5.6 Implementation

