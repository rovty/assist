import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000';

test.describe('API Gateway', () => {
  test('should return health check', async ({ request }) => {
    const res = await request.get(`${API_URL}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('should return 401 for protected endpoints without token', async ({ request }) => {
    const res = await request.get(`${API_URL}/conversations`);
    expect(res.status()).toBe(401);
  });

  test('should proxy to auth service', async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'test@test.com', password: 'wrong' },
    });
    // Should reach the auth service (not 404)
    expect(res.status()).not.toBe(404);
  });

  test('should return CORS headers', async ({ request }) => {
    const res = await request.get(`${API_URL}/health`);
    const headers = res.headers();
    // API Gateway should set access-control headers
    expect(headers['access-control-allow-origin'] || headers['vary']).toBeTruthy();
  });
});
