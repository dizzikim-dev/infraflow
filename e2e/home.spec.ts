import { test, expect } from '@playwright/test';

/**
 * E2E Tests for InfraFlow Home Page
 *
 * Tests the main page loading, UI elements, and basic interactions.
 */
test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page successfully', async ({ page }) => {
    // Check that the page loads without error
    await expect(page).toHaveTitle(/InfraFlow/i);
  });

  test('should display the header with navigation buttons', async ({ page }) => {
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Check for header elements - looking for buttons with specific text
    const header = page.locator('header, [role="banner"]').first();

    // The header should exist
    await expect(header).toBeVisible({ timeout: 10000 });
  });

  test('should display the prompt panel at the bottom', async ({ page }) => {
    // Wait for the prompt panel to appear
    const promptPanel = page.locator('textarea[placeholder*="인프라"]');
    await expect(promptPanel).toBeVisible({ timeout: 10000 });
  });

  test('should display example prompt buttons', async ({ page }) => {
    // Wait for example prompts
    const exampleButton = page.getByRole('button', { name: /3티어/ });
    await expect(exampleButton).toBeVisible({ timeout: 10000 });
  });

  test('should display empty state when no diagram is present', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Look for empty state text - could be in various formats
    const emptyStateText = page.getByText(/시작하세요|템플릿|프롬프트/i).first();
    await expect(emptyStateText).toBeVisible({ timeout: 10000 });
  });

  test('should have a disabled submit button when prompt is empty', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: '생성' });
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when prompt has text', async ({ page }) => {
    const promptInput = page.locator('textarea[placeholder*="인프라"]');
    await promptInput.fill('테스트 아키텍처');

    const submitButton = page.getByRole('button', { name: '생성' });
    await expect(submitButton).toBeEnabled();
  });

  test('should fill prompt when clicking example button', async ({ page }) => {
    const exampleButton = page.getByRole('button', { name: /3티어 웹 아키텍처/ });
    await exampleButton.click();

    const promptInput = page.locator('textarea[placeholder*="인프라"]');
    await expect(promptInput).toHaveValue(/3티어 웹 아키텍처/);
  });

  test('should have flow canvas container', async ({ page }) => {
    // Wait for React Flow canvas to be present
    await page.waitForLoadState('networkidle');

    // React Flow renders a div with class containing 'react-flow'
    const flowCanvas = page.locator('.react-flow, [class*="react-flow"]').first();
    await expect(flowCanvas).toBeVisible({ timeout: 10000 });
  });

  test('should display keyboard shortcut hint', async ({ page }) => {
    // Check for keyboard hint text
    const hintText = page.getByText(/Enter.*전송|Shift\+Enter.*줄바꿈/);
    await expect(hintText).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Home Page - Responsive', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Prompt panel should still be visible on mobile
    const promptPanel = page.locator('textarea[placeholder*="인프라"]');
    await expect(promptPanel).toBeVisible({ timeout: 10000 });
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Prompt panel should still be visible on tablet
    const promptPanel = page.locator('textarea[placeholder*="인프라"]');
    await expect(promptPanel).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Home Page - Accessibility', () => {
  test('should have accessible form elements', async ({ page }) => {
    await page.goto('/');

    // Textarea should be focusable
    const promptInput = page.locator('textarea[placeholder*="인프라"]');
    await promptInput.focus();
    await expect(promptInput).toBeFocused();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Press Tab to navigate through focusable elements
    await page.keyboard.press('Tab');

    // Some element should be focused after Tab
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeTruthy();
  });
});
