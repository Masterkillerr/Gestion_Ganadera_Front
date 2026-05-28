import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'https://gestion-ganadera-front.proyectowebvacavaquera.workers.dev';

test.describe('Frontend UI Tests', () => {
  test('homepage loads with title', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await expect(page).toHaveTitle(/GestGan/);
  });

  test('has login and register navigation', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await expect(page.getByRole('link', { name: /Iniciar Sesión/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Registrarse/i })).toBeVisible();
  });

  test('login page accessible with form fields', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.getByRole('link', { name: /Iniciar Sesión/i }).click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Iniciar Sesión/i })).toBeVisible();
  });

  test('register page accessible with form fields', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.getByRole('link', { name: /Registrarse/i }).click();
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('input[type="text"]')).toBeVisible();
  });

  test('home hero section renders', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await expect(page.getByText(/Gestión Ganadera/)).toBeVisible();
  });

  test('feature cards present on home', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    const cards = page.locator('.glass-card');
    await expect(cards).toHaveCount(4);
  });
});