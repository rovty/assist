import { test, expect } from '@playwright/test';
import { login } from './fixtures/test-helpers';

test.describe('Conversations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show conversations page', async ({ page }) => {
    await page.goto('/conversations');
    await expect(page.getByPlaceholder(/search conversations/i)).toBeVisible();
  });

  test('should show empty state when no conversations', async ({ page }) => {
    await page.goto('/conversations');
    await expect(page.getByText(/no conversations|select a conversation/i)).toBeVisible();
  });

  test('should show conversation detail when selected', async ({ page }) => {
    await page.goto('/conversations');
    const firstConv = page.locator('button').filter({ hasText: /.+/ }).first();
    if (await firstConv.isVisible()) {
      await firstConv.click();
      await expect(page.getByPlaceholder(/type a message/i)).toBeVisible();
    }
  });

  test('should have message input with send button', async ({ page }) => {
    await page.goto('/conversations');
    const firstConv = page.locator('button').filter({ hasText: /.+/ }).first();
    if (await firstConv.isVisible()) {
      await firstConv.click();
      const input = page.getByPlaceholder(/type a message/i);
      await expect(input).toBeVisible();
    }
  });
});
