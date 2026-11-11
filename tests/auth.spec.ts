// tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Pennywise E2E - Authentication Flow', () => {
  
  test('should perform 1-Click Demo Login', async ({ page }) => {
    // 1. Login page par jayein
    await page.goto('/login');

    // 2. network calls (Supabase auth) complete
    await page.waitForLoadState('networkidle');

    // 3. "Try Demo Account" button
    const demoButton = page.getByRole('button', { name: /try demo account/i });

    // 4. Check button visible
    await expect(demoButton).toBeVisible({ timeout: 15000 });
    await expect(demoButton).toBeEnabled({ timeout: 15000 });

    // 5. Button
    await demoButton.click();

    // 6. Dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 30000 });
  });
});