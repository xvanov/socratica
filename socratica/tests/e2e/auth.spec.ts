/**
 * E2E tests for authentication flow
 * Tests complete authentication user journey using Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should show sign-in button when unauthenticated', async ({ page }) => {
    // Check that sign-in button is visible
    const signInButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(signInButton).toBeVisible();
  });

  test('should handle authentication state persistence', async ({ page, context }) => {
    // This test verifies that authentication state persists across page reloads
    // Note: Actual Google Sign-In popup cannot be automated in CI/CD
    // This test verifies UI state changes only
    
    // Mock authentication state by setting localStorage
    await page.addInitScript(() => {
      // Simulate authenticated state
      // In a real scenario, this would be set by Firebase Auth after successful sign-in
      window.localStorage.setItem('firebase:authUser:test', JSON.stringify({
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
      }));
    });

    await page.reload();
    
    // Check that sign-out button is visible instead of sign-in button
    const signOutButton = page.getByRole('button', { name: /sign out/i });
    await expect(signOutButton).toBeVisible();
  });

  test('should navigate to profile page when authenticated', async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      window.localStorage.setItem('firebase:authUser:test', JSON.stringify({
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
      }));
    });

    await page.goto('/');
    
    // Check that Profile link is visible in navigation
    const profileLink = page.getByRole('link', { name: /profile/i });
    await expect(profileLink).toBeVisible();

    // Navigate to profile page
    await profileLink.click();
    
    // Verify profile page content
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  });

  test('should navigate to settings page when authenticated', async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      window.localStorage.setItem('firebase:authUser:test', JSON.stringify({
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
      }));
    });

    await page.goto('/');
    
    // Check that Settings link is visible in navigation
    const settingsLink = page.getByRole('link', { name: /settings/i });
    await expect(settingsLink).toBeVisible();

    // Navigate to settings page
    await settingsLink.click();
    
    // Verify settings page content
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
  });

  test('should protect routes when unauthenticated', async ({ page }) => {
    // Try to access profile page without authentication
    await page.goto('/profile');
    
    // Should show authentication required message or redirect
    // The exact behavior depends on ProtectedRoute implementation
    const authRequired = page.getByText(/authentication required/i).or(
      page.getByText(/please sign in/i)
    );
    
    // Either show auth prompt or redirect
    await expect(authRequired.first()).toBeVisible();
  });

  test('should show user information when authenticated', async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      window.localStorage.setItem('firebase:authUser:test', JSON.stringify({
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
      }));
    });

    await page.goto('/');
    
    // Check that user email or name is displayed
    const userInfo = page.getByText(/test@example.com/).or(
      page.getByText(/test user/i)
    );
    await expect(userInfo.first()).toBeVisible();
  });

  test('should handle sign-out flow', async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      window.localStorage.setItem('firebase:authUser:test', JSON.stringify({
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
      }));
    });

    await page.goto('/');
    
    // Click sign-out button
    const signOutButton = page.getByRole('button', { name: /sign out/i });
    await signOutButton.click();
    
    // After sign-out, should show sign-in button
    // Note: In real scenario, Firebase Auth would clear the auth state
    // This test verifies UI state change
    await page.waitForTimeout(500); // Wait for state update
    
    // Check that sign-in button appears (or page redirects)
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton.first()).toBeVisible();
  });
});

test.describe('Account Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state for account management tests
    await page.addInitScript(() => {
      window.localStorage.setItem('firebase:authUser:test', JSON.stringify({
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
      }));
    });
  });

  test('should display profile information on profile page', async ({ page }) => {
    await page.goto('/profile');
    
    // Verify profile page elements
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
    await expect(page.getByText(/test@example.com/i)).toBeVisible();
    await expect(page.getByLabelText(/display name/i)).toBeVisible();
  });

  test('should display settings on settings page', async ({ page }) => {
    await page.goto('/settings');
    
    // Verify settings page elements
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
    await expect(page.getByLabelText(/theme preference/i)).toBeVisible();
    await expect(page.getByLabelText(/enable notifications/i)).toBeVisible();
  });

  test('should show delete account option in settings', async ({ page }) => {
    await page.goto('/settings');
    
    // Verify delete account button exists
    const deleteButton = page.getByRole('button', { name: /delete account/i });
    await expect(deleteButton).toBeVisible();
  });
});


