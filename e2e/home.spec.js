import { test, expect } from '@playwright/test';

test('homepage has correct title and elements', async ({ page }) => {
  await page.goto('/');

  // Check the title of the page
  await expect(page).toHaveTitle(/EyE PunE/i);

  // Check that the navbar or main element is visible
  // We can look for common elements like "Services" or "Login"
  const body = page.locator('body');
  await expect(body).toBeVisible();
});
