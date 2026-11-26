import { describe, it, expect, afterEach } from 'vitest';
import i18n, { applyDocumentLanguage } from '../i18n';

afterEach(async () => { await i18n.changeLanguage('en'); });

describe('language detection and document direction', () => {
  it('treats the regional tag "ur-PK" (what Pakistani browsers send) as Urdu, right-to-left', async () => {
    await i18n.changeLanguage('ur-PK');
    expect(i18n.resolvedLanguage).toBe('ur');
    expect(document.documentElement.lang).toBe('ur');
    expect(document.documentElement.dir).toBe('rtl');
    expect(i18n.t('nav.home')).not.toBe('Home');
  });

  it('maps "en-US" to English, left-to-right', async () => {
    await i18n.changeLanguage('en-US');
    expect(i18n.resolvedLanguage).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('falls back to English for unsupported languages', async () => {
    await i18n.changeLanguage('fr-FR');
    expect(i18n.resolvedLanguage).toBe('en');
    applyDocumentLanguage('fr');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
