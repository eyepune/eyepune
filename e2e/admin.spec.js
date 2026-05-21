import { test, expect } from '@playwright/test';

test.describe('Admin Guard', () => {
  test('unauthorized access to admin redirects to login or shows error', async ({ page }) => {
    await page.goto('/Admin-Dashboard');

    // Because the user isn't authenticated, they should be redirected to Login or Home.
    // Or it might render an unauthorized message.
    // We will check if it eventually redirects to a login or home URL, or if the unauthorized text is visible.
    
    await expect(async () => {
      const url = page.url();
      const isRedirected = url.toLowerCase().includes('/login') || url === 'http://localhost:3000/';
      const isShowingError = await page.getByText(/unauthorized|access denied|login/i).isVisible();
      expect(isRedirected || isShowingError).toBeTruthy();
    }).toPass({ timeout: 15000 });
  });
});
