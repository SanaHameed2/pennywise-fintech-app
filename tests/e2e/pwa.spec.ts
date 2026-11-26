import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

test('manifest is valid and every icon it lists exists', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const manifest = await (await request.get(href!)).json();
  expect(manifest).toMatchObject({ name: 'Pennywise', display: 'standalone', start_url: '/' });
  const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
  expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
  for (const icon of manifest.icons) expect((await request.get(icon.src)).status(), icon.src).toBe(200);
});

test('the app shell loads offline and an offline notice is shown', async ({ page, context }) => {
  await page.goto('/about');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  // wait until the worker controls the page, so the shell is served from its cache
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /About Pennywise/ })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: /offline/i })).toBeVisible();
  await context.setOffline(false);
});
