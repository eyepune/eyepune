import { test, expect } from '@playwright/test';

test.describe('Lead Capture Flow', () => {
  test('contact form loads and validates required fields', async ({ page }) => {
    await page.goto('/contact');

    // Verify title
    await expect(page).toHaveTitle(/Contact|EyE PunE/i);

    // Look for form
    const submitButton = page.getByRole('button', { name: /send|submit|message/i });
    await expect(submitButton).toBeVisible();

    // Try to submit without filling fields
    await submitButton.click();

    // Assuming there are required fields, the form should not redirect or succeed
    await expect(page).toHaveURL(/\/contact/);
  });
});
