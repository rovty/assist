import { test, expect } from '@playwright/test';
import { login } from './fixtures/test-helpers';

test.describe('Leads', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show leads page with pipeline stages', async ({ page }) => {
    await page.goto('/leads');
    await expect(page.getByRole('heading', { name: /leads/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add lead/i })).toBeVisible();
  });

  test('should show pipeline board with stage columns', async ({ page }) => {
    await page.goto('/leads');
    await expect(page.getByText('New')).toBeVisible();
    await expect(page.getByText('Contacted')).toBeVisible();
    await expect(page.getByText('Qualified')).toBeVisible();
    await expect(page.getByText('Proposal')).toBeVisible();
    await expect(page.getByText('Won')).toBeVisible();
  });
});
