import AxeBuilder from '@axe-core/playwright';
import { test, expect, setLang } from './fixtures';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
/** Wait for the page's own content (not the loading spinner) and for entrance animations to finish. */
async function ready(page: import('@playwright/test').Page) {
  await page.locator('main h1').first().waitFor({ timeout: 20_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
}

const PUBLIC = ['/', '/about', '/login', '/signup', '/forgot-password'];
const PRIVATE = ['/dashboard', '/transactions', '/cards', '/settings', '/transfer'];

for (const lang of ['en', 'ur'] as const) {
  test.describe(`axe (${lang})`, () => {
    for (const path of PUBLIC) {
      test(`public ${path}`, async ({ page }) => {
        await setLang(page, lang);
        await page.route('https://qa.supabase.co/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '[]' }));
        await page.goto(path);
        await ready(page);
        const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html.slice(0, 80)}`)).toEqual([]);
      });
    }
    for (const path of PRIVATE) {
      test(`signed in ${path}`, async ({ page, authed }) => {
        void authed;
        await setLang(page, lang);
        await page.goto(path);
        await ready(page);
        const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html.slice(0, 80)}`)).toEqual([]);
      });
    }
  });
}

test('skip link is the first focusable element and moves focus to <main>', async ({ page }) => {
  await page.route('https://qa.supabase.co/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '[]' }));
  await page.goto('/about');
  await ready(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /Skip to main content/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('browser language "ur-PK" selects Urdu and right-to-left layout', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'ur-PK' });
  const page = await context.newPage();
  await page.route('https://qa.supabase.co/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '[]' }));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await context.close();
});
