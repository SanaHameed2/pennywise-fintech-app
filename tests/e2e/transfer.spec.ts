import { test, expect, setLang } from './fixtures';
import { CORRECT_PIN } from './support/mockSupabase';

async function toConfirmStep(page: import('@playwright/test').Page, amount: string) {
  await page.goto('/transfer');
  await page.locator('button[aria-pressed]').first().click();
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.locator('#transfer-amount').fill(amount);
  await page.keyboard.press('Enter');
  // focus lands on the first PIN digit (the step title is announced through the live region)
  await expect(page.getByLabel('Digit 1 of 6').first()).toBeFocused();
}
const typePin = async (page: import('@playwright/test').Page, pin: string) => {
  await page.getByLabel('Digit 1 of 6').first().click();
  await page.keyboard.type(pin);
};

test.describe('transfer wizard (mocked backend, real browser)', () => {
  test.beforeEach(async ({ page, authed }) => { void authed; await setLang(page, 'en'); });

  test('a wrong PIN shows an error and never a receipt', async ({ page }) => {
    await toConfirmStep(page, '1500');
    await typePin(page, '111222');
    await page.keyboard.press('Enter');
    await expect(page.locator('#confirm-error')).toContainText(/Incorrect PIN/);
    await expect(page.getByRole('heading', { name: /Transfer Successful/i })).toHaveCount(0);
  });

  test('the correct PIN produces a receipt with the server reference and updates the balance', async ({ page, backend }) => {
    await toConfirmStep(page, '1500');
    await typePin(page, CORRECT_PIN);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: /Transfer Successful/i })).toBeFocused();
    await expect(page.getByText('PW-7C41D9A02E')).toBeVisible();
    expect(backend.balance).toBe(40850.5);
  });

  test('a repeated submit reuses one idempotency key (no double charge)', async ({ page, backend }) => {
    const keys: string[] = [];
    page.on('request', (r) => { if (r.url().includes('rpc/execute_transfer')) keys.push(JSON.parse(r.postData() || '{}').p_idempotency_key); });
    backend.failWith = 'network';
    await toConfirmStep(page, '500');
    await typePin(page, CORRECT_PIN);
    await page.keyboard.press('Enter');
    await expect(page.locator('#confirm-error')).toBeVisible();
    backend.failWith = undefined;
    await page.getByRole('button', { name: /Confirm Transfer/i }).click();
    await expect(page.getByRole('heading', { name: /Transfer Successful/i })).toBeVisible();
    expect(keys.length).toBe(2);
    expect(keys[0]).toBe(keys[1]);
  });

  test('a transfer of Rs. 10,000 or more asks for the authenticator code', async ({ page }) => {
    await toConfirmStep(page, '20000');
    await expect(page.getByText('Authenticator app code')).toBeVisible();
    await expect(page.getByRole('button', { name: /Confirm Transfer/i })).toBeDisabled();
  });

  test('Urdu: right-to-left document, Urdu strings, same behaviour', async ({ page }) => {
    await setLang(page, 'ur');
    await page.goto('/transfer');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ur');
    await page.locator('button[aria-pressed]').first().click();
    await expect(page.locator('button[aria-pressed="true"]')).toHaveCount(1);
  });
});
