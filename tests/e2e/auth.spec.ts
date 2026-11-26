import { test, expect } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.route('https://qa.supabase.co/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '[]' }));
});

test('signed-out visitors are sent to the login page from protected routes', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});

test('login form has labelled fields, a named password toggle and a working reset link', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Email', { exact: false }).first()).toBeVisible();
  const toggle = page.getByRole('button', { name: /Show password/i });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(page.getByRole('button', { name: /Hide password/i })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: /forgot/i }).click();
  await expect(page).toHaveURL(/forgot-password/);
  await expect(page.getByRole('heading', { name: /Reset your password/i })).toBeVisible();
});

test('forgot-password never reveals whether an account exists', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.getByLabel(/email/i).fill('nobody@example.com');
  await page.getByRole('button', { name: /Send reset link/i }).click();
  await expect(page.getByRole('status')).toContainText(/If an account exists/i);
});

test('the footer has no dead (#) links and claims nothing it cannot back up', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('footer a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs.filter((h) => !h || h === '#')).toEqual([]);
  await expect(page.locator('body')).not.toContainText(/FDIC|SOC ?2|bank-grade|95,000/i);
});
