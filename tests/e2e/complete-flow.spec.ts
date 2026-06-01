import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'https://gestion-ganadera-front.proyectowebvacavaquera.workers.dev';
const API_BASE = process.env.API_BASE || 'http://localhost:8080/api';

test.describe('Complete Flow: Login & Create Animal', () => {
  test('full user journey: login, create animal, verify', async ({ page, request }) => {
    // === 1. GET API TOKEN (for setting up test data) ===
    const loginResp = await request.post(`${API_BASE}/auth/login`, {
      data: { 
        email: process.env.TEST_ADMIN_EMAIL, 
        password: process.env.TEST_ADMIN_PASSWORD,
        testMode: true // Backend bypass for reCAPTCHA
      }
    });

    console.log('Login response status:', loginResp.status());
    // Skip if credentials invalid - just test UI flow
    if (loginResp.status() !== 200) {
      console.log('Skipping test due to login failure');
      test.skip(true, 'Invalid test credentials');
    }

    const loginData = await loginResp.json();
    const token = loginData.token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // === 2. GET OR CREATE TEST DATA (raza, finca) ===
    let razaId, fincaId;

    const razas = await request.get(`${API_BASE}/razas`, authHeaders);
    if (razas.status() === 200) {
      const razaList = await razas.json();
      if (razaList.length > 0) {
        razaId = razaList[0].id;
      } else {
        const createRaza = await request.post(`${API_BASE}/razas`, { data: { nombre: 'Holstein' } }, authHeaders);
        if (createRaza.status() === 200 || createRaza.status() === 201) {
          const newRaza = await createRaza.json();
          razaId = newRaza.id;
        }
      }
    }

    const fincas = await request.get(`${API_BASE}/fincas`, authHeaders);
    if (fincas.status() === 200) {
      const fincaList = await fincas.json();
      if (fincaList.length > 0) {
        fincaId = fincaList[0].id;
      } else {
        const createFinca = await request.post(`${API_BASE}/fincas`, { data: { nombre: 'Finca Principal', ubicacion: 'Test' } }, authHeaders);
        if (createFinca.status() === 200 || createFinca.status() === 201) {
          const newFinca = await createFinca.json();
          fincaId = newFinca.id;
        }
      }
    }

    // === 3. UI FLOW: Login ===
    await page.goto(FRONTEND_URL);
    await page.getByRole('link', { name: /Iniciar Sesión/i }).click();
    await expect(page).toHaveURL(/.*login/);

    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'defaultPassword');

    // reCAPTCHA is bypassed in test mode via login request, skip UI interaction
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // === 4. NAVIGATE TO GANADO FORM ===
    await page.getByRole('link', { name: /Ganado/i }).click();
    await expect(page).toHaveURL(/.*ganado$/);
    await page.getByRole('link', { name: /Nuevo/i }).click();
    await expect(page).toHaveURL(/.*ganado\/nuevo/);

    // === 5. FILL ANIMAL FORM ===
    const animalName = `Vaca-${Date.now()}`;
    const arete = `ARE-${Date.now()}`;

    await page.fill('input[name="identificadorArete"]', arete);
    await page.fill('input[name="nombre"]', animalName);

    if (razaId) {
      await page.selectOption('select[name="raza"]', { value: razaId.toString() });
    }
    if (fincaId) {
      await page.selectOption('select[name="finca"]', { value: fincaId.toString() });
    }

    // Submit
    await page.click('button[type="submit"]');

    // === 6. VERIFY CREATION ===
    await expect(page).toHaveURL(/.*ganado$/);
    await expect(page.locator(`text=${animalName}`)).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${arete}`)).toBeVisible();
  }, 60000);
});