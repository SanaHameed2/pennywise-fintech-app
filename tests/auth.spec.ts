import { test, expect } from '@playwright/test';

test.describe('Pennywise E2E - Authentication Flow', () => {
  
  test('should perform 1-Click Demo Login', async ({ page }) => {
    page.on('pageerror', (error) => {
      console.log(`[PAGE ERROR] App crashed: ${error.message}`);
    });

    // 2. Login page par jayein
    await page.goto('/login');
    
    // 3. Page properly load
    await page.waitForLoadState('networkidle');

    // 4. Button 
    const demoButton = page.getByRole('button', { name: /try demo account|ڈیمو اکاؤنٹ/i });

    // 5. Check button visible
    await expect(demoButton).toBeVisible({ timeout: 15000 });
    
    // 6. Click 
    await demoButton.click();

    // 7. Dashboard 
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 30000 });
  });
  
});