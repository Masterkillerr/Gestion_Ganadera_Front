import { test, expect } from '@playwright/test';

const API_BASE = 'https://Gestionganaderabackend-env.eba-kmujbtjg.us-east-2.elasticbeanstalk.com/api';

test.describe('Backend API Tests', () => {
  test('API root requires authentication (returns 401)', async ({ request }) => {
    const response = await request.get(API_BASE);
    expect(response.status()).toBe(401);
  });

  test('auth endpoint should reject invalid login', async ({ request }) => {
    const loginUrl = `${API_BASE}/auth/login`;
    const response = await request.post(loginUrl, {
      data: { email: 'test@test.com', password: 'wrong' }
    });
    expect(response.status()).toBe(401);
  });

  test('protected endpoint returns 401 or 404 without token', async ({ request }) => {
    const response = await request.get(`${API_BASE}/auth/me`);
    expect([401, 404]).toContain(response.status());
  });

  test('GET animales endpoint (if exists) requires auth', async ({ request }) => {
    const response = await request.get(`${API_BASE}/animales`);
    expect([401, 404]).toContain(response.status());
  });
});