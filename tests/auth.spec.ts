// tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Pennywise E2E - Authentication Flow', () => {
  
  test('should navigate to login page and perform 1-Click Demo Login', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /login/i }).first().click();

    await expect(page).toHaveURL(/.*login/);

    await expect(page.getByText('Sign in to Pennywise')).toBeVisible();

    await page.getByRole('button', { name: /try demo account/i }).click();

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    
    await expect(page.getByText(/Good (Morning|Afternoon|Evening)/i)).toBeVisible();
  });
});