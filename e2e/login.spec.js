import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page loads and requires credentials', async ({ page }) => {
    await page.goto('/login');

    // Verify title
    await expect(page).toHaveTitle(/Login|EyE PunE/i);

    // Find form elements (assumes standard input names/types)
    const emailInput = page.getByPlaceholder(/you@example.com|email/i).or(page.locator('input[type="email"]'));
    const passwordInput = page.getByPlaceholder(/password/i).or(page.locator('input[type="password"]'));
    const submitButton = page.getByRole('button', { name: /sign in|login|submit/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Try submitting empty form (HTML5 validation or JS validation should catch it)
    await submitButton.click();
    
    // Depending on the implementation, there might be a toast or inline error
    // For now, just ensure we don't immediately redirect without credentials
    await expect(page).toHaveURL(/\/login/);
  });
});
