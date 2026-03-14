import { test, expect } from '@playwright/test';
import { login } from './fixtures/test-helpers';

test.describe('Billing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show billing page with current plan', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.getByRole('heading', { name: /billing/i })).toBeVisible();
    await expect(page.getByText(/current plan/i)).toBeVisible();
  });

  test('should show plan cards', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.getByText('Starter')).toBeVisible();
    await expect(page.getByText('Pro')).toBeVisible();
    await expect(page.getByText('Enterprise')).toBeVisible();
  });

  test('should show usage meters', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.getByText('Conversations')).toBeVisible();
    await expect(page.getByText('Agents')).toBeVisible();
  });
});
