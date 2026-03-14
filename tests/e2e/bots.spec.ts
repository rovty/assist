import { test, expect } from '@playwright/test';
import { login } from './fixtures/test-helpers';

test.describe('Bots', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show bots page with create button', async ({ page }) => {
    await page.goto('/bots');
    await expect(page.getByRole('heading', { name: /bots/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create bot/i })).toBeVisible();
  });

  test('should show empty state or bot list', async ({ page }) => {
    await page.goto('/bots');
    const hasBots = await page.locator('[class*="card"]').count();
    if (hasBots === 0) {
      await expect(page.getByText(/no bots/i)).toBeVisible();
    } else {
      await expect(page.locator('[class*="card"]').first()).toBeVisible();
    }
  });
});
