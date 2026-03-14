import { type Page } from '@playwright/test';

export const TEST_USER = {
  name: 'Test Agent',
  email: 'test@assist.dev',
  password: 'TestPassword123!',
  workspaceName: 'E2E Workspace',
};

export const API_URL = 'http://localhost:3000';

export async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(TEST_USER.email);
  await page.getByLabel('Password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/conversations');
}

export async function seedData(endpoint: string, data: unknown) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Seed failed: ${res.status}`);
  return res.json();
}
