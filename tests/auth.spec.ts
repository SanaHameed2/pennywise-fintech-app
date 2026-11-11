// tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Pennywise E2E - Authentication Flow', () => {
  
  test('should perform 1-Click Demo Login', async ({ page }) => {
    // ✅ 1. Login page
    await page.goto('/login');

    // ✅ 2. Wait 
    await expect(page.getByText('Sign in to Pennywise')).toBeVisible({ timeout: 15000 });

    // ✅ 3. "Try Demo Account" 
    await page.getByRole('button', { name: /try demo account/i }).click();

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 30000 });
    
    // ✅ 5. Dashboard
    await expect(page.getByText(/Good (Morning|Afternoon|Evening)/i)).toBeVisible({ timeout: 15000 });
  });
});