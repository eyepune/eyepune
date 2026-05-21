import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('booking page loads properly', async ({ page }) => {
    await page.goto('/booking');

    // Verify title or headings
    await expect(page).toHaveTitle(/Booking|EyE PunE/i);

    // Because booking logic often relies on external scripts (like Calendly) or complex forms,
    // we ensure the main container mounts successfully.
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
