import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'https://d3gw8tv95pui9q.cloudfront.net';
const API_BASE = 'https://Gestionganaderabackend-env.eba-kmujbtjg.us-east-2.elasticbeanstalk.com/api';

test.describe('Complete Flow: Login & Create Animal', () => {
  test('full user journey: login, create animal, verify', async ({ page, request }) => {
    // === 1. GET API TOKEN (for setting up test data) ===
    const loginResp = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'admin@test.com', password: 'Admin123!' }
    });

    // Skip if credentials invalid - just test UI flow
    if (loginResp.status() !== 200) {
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
    await page.fill('input[type="password"]', 'Admin123!');

    // Handle reCAPTCHA v2 checkbox
    try {
      const frame = page.frameLocator('iframe[title="reCAPTCHA"]');
      await frame.getByRole('checkbox').click({ timeout: 5000 });
      await expect(frame.getByRole('checkbox')).toBeChecked();
    } catch (e) {
      console.log('reCAPTCHA checkbox not found or already solved');
    }

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