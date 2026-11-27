// The scenario a fintech accessibility reviewer asked about:
// "Could a screen-reader user enter a transfer in English, switch to Urdu on the review screen, and still
//  check the recipient, amount and currency before confirming, without starting over?"
//
// This test proves the STATE and FOCUS half (automatable). What a screen reader actually SPEAKS must be
// checked by hand: see docs/ACCESSIBILITY_TESTING.md.
import { test, expect, setLang } from './fixtures';
import { CORRECT_PIN } from './support/mockSupabase';

test('switching English to Urdu on the review step keeps the transfer, the PIN digits and the focus', async ({ page, authed }) => {
  void authed;
  await setLang(page, 'en');
  await page.goto('/transfer');

  // enter a transfer in English, up to the review (PIN) step
  await page.locator('button[aria-pressed]').first().click();
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.locator('#transfer-amount').fill('1500');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Digit 1 of 6').first()).toBeFocused();
  await page.keyboard.type('48');                                   // a half-typed PIN

  // go up to the language button in the header with the keyboard and press Enter
  const toggle = page.getByRole('button', { name: 'Urdu' });
  await toggle.focus();
  await page.keyboard.press('Enter');

  // 1. the document is now Urdu and right-to-left
  await expect(page.locator('html')).toHaveAttribute('lang', 'ur');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  // 2. focus went BACK to the PIN digit the user was typing in (NVDA testing: they were left in the header)
  await expect(page.getByLabel('ہندسہ 3 از 6').first()).toBeFocused();

  // 3. a polite announcement: English sentence first (speakable without an Urdu voice), then Urdu
  const announcement = page.getByRole('status').filter({ hasText: 'Language changed to Urdu.' });
  await expect(announcement.locator('[lang="en"]')).toHaveText('Language changed to Urdu.');
  await expect(announcement.locator('[lang="ur"]')).toHaveText('زبان اردو میں تبدیل ہو گئی');

  // 4. still on the review step, still showing the same recipient, amount and currency (numbers stay LTR)
  const summary = page.locator('dl').first();
  await expect(summary).toContainText('Ayesha Khan');
  await expect(summary.locator('bdi[dir="ltr"]', { hasText: 'Rs. 1,500.00' })).toBeVisible();

  // 5. the half-typed PIN survived; the user did not have to start over
  await expect(page.getByLabel('ہندسہ 1 از 6').first()).toHaveValue('4');
  await expect(page.getByLabel('ہندسہ 2 از 6').first()).toHaveValue('8');

  // 6. and the transfer can be completed in Urdu
  await page.keyboard.type(CORRECT_PIN.slice(2));          // typing continues exactly where the user left off
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: /کامیاب/ })).toBeVisible();
  await expect(page.getByText('PW-7C41D9A02E')).toBeVisible();
});
