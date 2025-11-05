# Algebra Problems Test Fixtures

This directory contains test fixtures for E2E testing of algebra problem types in Socratica.

## Structure

Each fixture file contains:
- **type**: Problem type (linear, quadratic, systems, factoring, word)
- **description**: Description of the problem category
- **problems**: Array of problem objects with:
  - `id`: Unique identifier
  - `problem`: Problem text (as student would submit)
  - `difficulty`: Difficulty level
  - `category`: Problem category
  - `method`: Solving method (if applicable)
  - `expectedMathNotation`: Array of math notation elements expected in rendering
  - `expectedQuestions`: Array of expected Socratic questioning patterns
  - `expectedWorkflow`: Array describing expected E2E workflow steps
- **testMetadata**: Metadata about the fixture set

## Problem Types

### Linear Equations (`linear-equations.json`)
- Simple linear equations: `2x + 5 = 13`
- Multi-step linear equations: `4x + 2 = 3x + 10`
- Fractional linear equations: `(x + 3)/2 = 5`

### Quadratic Equations (`quadratic-equations.json`)
- Factoring method: `x^2 - 5x + 6 = 0`
- Difference of squares: `x^2 - 9 = 0`
- Perfect square trinomials: `x^2 + 4x + 4 = 0`
- AC method: `2x^2 - 7x + 3 = 0`
- Quadratic formula: `x^2 + 6x + 1 = 0`

### Systems of Equations (`systems-of-equations.json`)
- Substitution method: `y = 2x + 1, 3x + y = 10`
- Elimination method: `2x + y = 7, x - y = 2`
- 2x2 systems: Various combinations

### Factoring Problems (`factoring-problems.json`)
- Simple trinomials: `x^2 + 7x + 12`
- Difference of squares: `x^2 - 9`
- Perfect square trinomials: `x^2 - 4x + 4`
- AC method: `2x^2 + 7x + 3`

### Word Problems (`word-problems.json`)
- Number problems: "A number is 5 more than twice another number..."
- Geometry problems: "The perimeter of a rectangle is 30 meters..."
- Money problems: "Sarah has $45. She spends some money..."
- Rate problems: "A train travels 120 miles in 3 hours..."

## Usage

Load fixtures in tests:

```typescript
import linearProblems from '@/__fixtures__/algebra-problems/linear-equations.json';
import quadraticProblems from '@/__fixtures__/algebra-problems/quadratic-equations.json';

// Use in E2E tests
test('linear equation workflow', async ({ page }) => {
  const problem = linearProblems.problems[0];
  await page.fill('textarea[aria-label*="problem"]', problem.problem);
  // ... rest of test
});
```

## Expected Socratic Questioning Patterns

All problems include `expectedQuestions` that describe patterns of Socratic questioning the AI should use. These are NOT direct answers but guiding questions that help students discover solutions.

## Expected Math Notation

Each problem includes `expectedMathNotation` array listing math elements that should render correctly in the UI (e.g., exponents, fractions, variables).

## Expected Workflow

Each problem includes `expectedWorkflow` describing the expected E2E interaction flow from problem submission to completion.

## Validation Rules

- **No Direct Answers**: AI must NEVER provide direct answers (e.g., "x = 5")
- **Socratic Questioning**: AI must ask guiding questions
- **Math Rendering**: All math notation must render correctly
- **Complete Workflows**: Tests verify complete problem-solving workflows

## Created

2025-01-27

## Purpose

E2E testing for Story 5.6: Testing Suite - 5+ Algebra Problems

