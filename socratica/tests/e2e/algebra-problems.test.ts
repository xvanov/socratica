/**
 * E2E tests for Story 5.6: Testing Suite - 5+ Algebra Problems
 * Tests complete workflows for all algebra problem types
 */

import { test, expect } from '@playwright/test';
import {
  submitProblem,
  waitForAIResponse,
  getMessages,
  verifySocraticQuestioning,
  verifyNoDirectAnswers,
  verifyMathRendering,
  verifyCompleteWorkflow,
  mockOpenAIResponse,
  createSocraticMockResponse,
  verifyAccessibility,
  verifyLoadingStates,
  ProblemFixture,
} from '../utils/e2e-helpers';
import linearProblems from '../../__fixtures__/algebra-problems/linear-equations.json';
import quadraticProblems from '../../__fixtures__/algebra-problems/quadratic-equations.json';
import systemsProblems from '../../__fixtures__/algebra-problems/systems-of-equations.json';
import factoringProblems from '../../__fixtures__/algebra-problems/factoring-problems.json';
import wordProblems from '../../__fixtures__/algebra-problems/word-problems.json';

test.describe('Story 5.6: Algebra Problems E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up route mocking BEFORE navigation
    // This ensures the mock is active when the page loads
    await mockOpenAIResponse(
      page,
      createSocraticMockResponse('What operation could you use to isolate the variable?')
    );

    await page.goto('/');
    // Wait for page to be ready - use more reliable wait strategy
    // networkidle can be unreliable in WebKit, so wait for specific elements instead
    await page.waitForLoadState('domcontentloaded');
    // Wait for chat interface to be visible
    await page.waitForSelector('textarea', { timeout: 10000 });
    // Small additional wait for any async initialization
    await page.waitForTimeout(500);
  });

  test.describe('AC1: Successfully guides through 5+ different algebra problem types', () => {
    test('Linear Equations: Submit problem → Verify Socratic questioning → Verify no direct answers → Verify math rendering', async ({
      page,
    }) => {
      const problem = linearProblems.problems[0] as ProblemFixture;
      
      // Mock OpenAI response with Socratic question (already set up in beforeEach, but override for this test)
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What operation could you use to isolate the variable?')
      );

      // Submit problem
      await submitProblem(page, problem.problem);

      // Wait for AI response
      await waitForAIResponse(page);

      // Get messages
      const messages = await getMessages(page);

      // Verify Socratic questioning
      expect(verifySocraticQuestioning(messages)).toBe(true);

      // Verify no direct answers
      expect(verifyNoDirectAnswers(messages)).toBe(true);

      // Verify math rendering
      const mathRendering = await verifyMathRendering(page, problem.expectedMathNotation);
      expect(mathRendering).toBe(true);
    });

    test('Quadratic Equations: Submit problem → Verify Socratic questioning → Verify no direct answers → Verify math rendering', async ({
      page,
    }) => {
      const problem = quadraticProblems.problems[0] as ProblemFixture;
      
      // Mock OpenAI response with Socratic question
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What two numbers multiply to give you 6?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifySocraticQuestioning(messages)).toBe(true);
      expect(verifyNoDirectAnswers(messages)).toBe(true);

      const mathRendering = await verifyMathRendering(page, problem.expectedMathNotation);
      expect(mathRendering).toBe(true);
    });

    test('Systems of Equations: Submit problem → Verify Socratic questioning → Verify no direct answers → Verify math rendering', async ({
      page,
    }) => {
      const problem = systemsProblems.problems[0] as ProblemFixture;
      
      // Mock OpenAI response with Socratic question
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What do you notice about the y terms?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifySocraticQuestioning(messages)).toBe(true);
      expect(verifyNoDirectAnswers(messages)).toBe(true);

      const mathRendering = await verifyMathRendering(page, problem.expectedMathNotation);
      expect(mathRendering).toBe(true);
    });

    test('Factoring Problems: Submit problem → Verify Socratic questioning → Verify no direct answers → Verify math rendering', async ({
      page,
    }) => {
      const problem = factoringProblems.problems[0] as ProblemFixture;
      
      // Mock OpenAI response with Socratic question
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What two numbers multiply to give you 12?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifySocraticQuestioning(messages)).toBe(true);
      expect(verifyNoDirectAnswers(messages)).toBe(true);

      const mathRendering = await verifyMathRendering(page, problem.expectedMathNotation);
      expect(mathRendering).toBe(true);
    });

    test('Word Problems: Submit problem → Verify Socratic questioning → Verify no direct answers → Verify math rendering', async ({
      page,
    }) => {
      const problem = wordProblems.problems[0] as ProblemFixture;
      
      // Mock OpenAI response with Socratic question
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What are you trying to find?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifySocraticQuestioning(messages)).toBe(true);
      expect(verifyNoDirectAnswers(messages)).toBe(true);

      // Word problems may have math notation after conversion
      if (problem.expectedMathNotation.length > 0) {
        const mathRendering = await verifyMathRendering(page, problem.expectedMathNotation);
        expect(mathRendering).toBe(true);
      }
    });
  });

  test.describe('AC2: No direct answers provided in any test case', () => {
    test('should verify no direct answers in linear equation workflow', async ({ page }) => {
      const problem = linearProblems.problems[0] as ProblemFixture;
      
      // Mock response that should NOT contain direct answers
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What operation could you use to isolate the variable?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifyNoDirectAnswers(messages)).toBe(true);
    });

    test('should verify no direct answers in quadratic equation workflow', async ({ page }) => {
      const problem = quadraticProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What two numbers multiply to give you 6?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifyNoDirectAnswers(messages)).toBe(true);
    });

    test('should verify no direct answers in systems of equations workflow', async ({ page }) => {
      const problem = systemsProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What do you notice about the y terms?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifyNoDirectAnswers(messages)).toBe(true);
    });

    test('should verify no direct answers in factoring workflow', async ({ page }) => {
      const problem = factoringProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What two numbers multiply to give you 12?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifyNoDirectAnswers(messages)).toBe(true);
    });

    test('should verify no direct answers in word problem workflow', async ({ page }) => {
      const problem = wordProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What are you trying to find?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifyNoDirectAnswers(messages)).toBe(true);
    });
  });

  test.describe('AC3: Socratic questioning maintained throughout', () => {
    test('should verify Socratic questioning in linear equation workflow', async ({ page }) => {
      const problem = linearProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What operation could you use to isolate the variable?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifySocraticQuestioning(messages)).toBe(true);
    });

    test('should verify Socratic questioning in quadratic equation workflow', async ({ page }) => {
      const problem = quadraticProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What two numbers multiply to give you 6?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifySocraticQuestioning(messages)).toBe(true);
    });

    test('should verify Socratic questioning in systems of equations workflow', async ({ page }) => {
      const problem = systemsProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What do you notice about the y terms?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifySocraticQuestioning(messages)).toBe(true);
    });

    test('should verify Socratic questioning in factoring workflow', async ({ page }) => {
      const problem = factoringProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What two numbers multiply to give you 12?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifySocraticQuestioning(messages)).toBe(true);
    });

    test('should verify Socratic questioning in word problem workflow', async ({ page }) => {
      const problem = wordProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What are you trying to find?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const messages = await getMessages(page);
      expect(verifySocraticQuestioning(messages)).toBe(true);
    });
  });

  test.describe('AC4: Math rendering works correctly for all problem types', () => {
    test('should verify math rendering in linear equation workflow', async ({ page }) => {
      const problem = linearProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What operation could you use to isolate the variable?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const mathRendering = await verifyMathRendering(page, problem.expectedMathNotation);
      expect(mathRendering).toBe(true);
    });

    test('should verify math rendering in quadratic equation workflow', async ({ page }) => {
      const problem = quadraticProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What two numbers multiply to give you 6?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const mathRendering = await verifyMathRendering(page, problem.expectedMathNotation);
      expect(mathRendering).toBe(true);
    });

    test('should verify math rendering in systems of equations workflow', async ({ page }) => {
      const problem = systemsProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What do you notice about the y terms?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const mathRendering = await verifyMathRendering(page, problem.expectedMathNotation);
      expect(mathRendering).toBe(true);
    });

    test('should verify math rendering in factoring workflow', async ({ page }) => {
      const problem = factoringProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What two numbers multiply to give you 12?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      const mathRendering = await verifyMathRendering(page, problem.expectedMathNotation);
      expect(mathRendering).toBe(true);
    });

    test('should verify math rendering in word problem workflow', async ({ page }) => {
      const problem = wordProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What are you trying to find?')
      );

      await submitProblem(page, problem.problem);
      await waitForAIResponse(page);

      // Word problems may have math notation after conversion
      if (problem.expectedMathNotation.length > 0) {
        const mathRendering = await verifyMathRendering(page, problem.expectedMathNotation);
        expect(mathRendering).toBe(true);
      }
    });
  });

  test.describe('AC5: Complete end-to-end workflows tested and documented', () => {
    test('should verify complete workflow for linear equation', async ({ page }) => {
      const problem = linearProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What operation could you use to isolate the variable?')
      );

      const workflowComplete = await verifyCompleteWorkflow(page, problem);
      expect(workflowComplete).toBe(true);
    });

    test('should verify complete workflow for quadratic equation', async ({ page }) => {
      const problem = quadraticProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What two numbers multiply to give you 6?')
      );

      const workflowComplete = await verifyCompleteWorkflow(page, problem);
      expect(workflowComplete).toBe(true);
    });

    test('should verify complete workflow for systems of equations', async ({ page }) => {
      const problem = systemsProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What do you notice about the y terms?')
      );

      const workflowComplete = await verifyCompleteWorkflow(page, problem);
      expect(workflowComplete).toBe(true);
    });

    test('should verify complete workflow for factoring', async ({ page }) => {
      const problem = factoringProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What two numbers multiply to give you 12?')
      );

      const workflowComplete = await verifyCompleteWorkflow(page, problem);
      expect(workflowComplete).toBe(true);
    });

    test('should verify complete workflow for word problem', async ({ page }) => {
      const problem = wordProblems.problems[0] as ProblemFixture;
      
      await mockOpenAIResponse(
        page,
        createSocraticMockResponse('What are you trying to find?')
      );

      const workflowComplete = await verifyCompleteWorkflow(page, problem);
      expect(workflowComplete).toBe(true);
    });
  });

  test.describe('Integration: Error handling and accessibility', () => {
    test('should verify error handling works correctly in test scenarios', async ({ page }) => {
      // Mock API error
      await page.route('**/api/chat', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Internal server error',
          }),
        });
      });

      await submitProblem(page, 'Test problem');
      
      // Verify error message appears - use more specific selector to avoid Next.js route announcer
      // ErrorMessage component has role="alert" with aria-label="Error message"
      const errorMessage = page.locator('[role="alert"][aria-label="Error message"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should verify accessibility features work in test scenarios', async ({ page }) => {
      const accessibilityPresent = await verifyAccessibility(page);
      expect(accessibilityPresent).toBe(true);
    });

    test('should verify loading states work correctly', async ({ page }) => {
      // Mock slow API response to ensure loading state is visible
      await page.route('**/api/chat', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay for loading test
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              message: 'Test response',
              timestamp: new Date().toISOString(),
            },
          }),
        });
      });

      // Submit a problem
      const input = page.locator('textarea').first();
      await input.fill('Test problem');
      
      // Submit and wait for loading state
      const submitButton = page.locator('button[type="submit"]').first();
      
      // Wait for button to be enabled
      await expect(submitButton).toBeEnabled({ timeout: 2000 });
      
      // Click button
      await submitButton.click();
      
      // Wait for loading indicator to appear (it's conditionally rendered when isAIResponding is true)
      // Check for both the aria-label and the text content
      const loadingIndicator = page.locator('[role="status"][aria-label="AI tutor is responding"]');
      const loadingText = page.locator('text=AI tutor is thinking');
      
      // Wait for loading indicator to appear
      const isVisible = await loadingIndicator.isVisible({ timeout: 2000 }).catch(() => false);
      const textVisible = await loadingText.isVisible({ timeout: 2000 }).catch(() => false);
      
      // Either indicator should be visible
      expect(isVisible || textVisible).toBe(true);
    });
  });
});

