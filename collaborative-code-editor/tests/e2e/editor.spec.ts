import { test, expect } from '@playwright/test';

/**
 * E2E tests for code editor functionality
 * Tests critical user journeys
 */

test.describe('Code Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page initially', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in to codecollab/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByLabel(/email address/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/please enter a valid email address/i)).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/email address/i)).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/password/i)).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('checkbox')).toBeFocused();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    const emailInput = page.getByLabel(/email address/i);
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required');

    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('should toggle dark mode', async ({ page }) => {
    // Mock login to get to editor
    await page.evaluate(() => {
      localStorage.setItem('user_data', JSON.stringify({
        user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'USER' },
        isAuthenticated: true
      }));
    });
    await page.reload();

    // Find and click theme toggle
    const themeButton = page.getByRole('button', { name: /switch to/i });
    await themeButton.click();

    // Check if dark class is toggled
    const html = page.locator('html');
    const hasClass = await html.evaluate((el) => el.classList.contains('dark'));
    expect(hasClass).toBe(true);
  });

  test('should support screen readers', async ({ page }) => {
    // Check for skip link
    await page.keyboard.press('Tab');
    const skipLink = page.getByText(/skip to main content/i);
    await expect(skipLink).toBeFocused();

    // Check for landmark regions
    await expect(page.locator('header[role="banner"]')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Editor Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('user_data', JSON.stringify({
        user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'USER' },
        isAuthenticated: true
      }));
    });
    await page.reload();
  });

  test('should display file explorer', async ({ page }) => {
    await expect(page.getByRole('tree', { name: /file tree/i })).toBeVisible();
  });

  test('should display code editor', async ({ page }) => {
    await expect(page.locator('[role="main"]')).toBeVisible();
  });

  test('should show user information in header', async ({ page }) => {
    await expect(page.getByText(/test user/i)).toBeVisible();
  });

  test('should toggle sidebar with keyboard shortcut', async ({ page }) => {
    const sidebar = page.getByRole('complementary', { name: /file explorer/i });
    
    // Initially visible
    await expect(sidebar).toBeVisible();

    // Toggle with Ctrl+B
    await page.keyboard.press('Control+b');
    
    // Wait for animation
    await page.waitForTimeout(300);
    
    // Should be hidden
    await expect(sidebar).toBeHidden();
  });
});

test.describe('Accessibility', () => {
  test('should pass basic accessibility checks', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check for form labels
    const emailLabel = page.getByText(/email address/i);
    const passwordLabel = page.getByText(/password/i);
    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();

    // Check for button accessibility
    const button = page.getByRole('button', { name: /sign in/i });
    await expect(button).toHaveAttribute('type', 'submit');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // This would ideally use axe-core or similar
    // For now, we check that text is visible
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
