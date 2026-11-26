import { test as base, expect } from '@playwright/test';
import { installMock, makeState, type MockState } from './support/mockSupabase';

type Fixtures = { backend: MockState; authed: void };

export const test = base.extend<Fixtures>({
  backend: async ({}, use) => { await use(makeState()); },
  authed: [async ({ page, backend }, use) => { await installMock(page, backend); await use(); }, { auto: false }],
});
export { expect };

export const setLang = (page: import('@playwright/test').Page, lang: 'en' | 'ur') =>
  page.addInitScript((l) => localStorage.setItem('pennywise_lang', l), lang);
