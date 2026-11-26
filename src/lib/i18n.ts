// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.json';
import ur from '../locales/ur.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    fallbackLng: 'en',
    // Browsers report regional tags such as "ur-PK" or "en-US"; map them onto our two languages.
    supportedLngs: ['en', 'ur'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'pennywise_lang',
    },
  });

// Keep <html lang> and <html dir> in sync with the active language (Urdu is right-to-left).
// Matching on the language *prefix* matters: Pakistani browsers report "ur-PK", not "ur".
export function applyDocumentLanguage(lng?: string): void {
  const code = (lng ?? i18n.resolvedLanguage ?? i18n.language ?? 'en').toLowerCase().startsWith('ur') ? 'ur' : 'en';
  document.documentElement.lang = code;
  document.documentElement.dir = code === 'ur' ? 'rtl' : 'ltr';
}

i18n.on('languageChanged', applyDocumentLanguage);
applyDocumentLanguage();

export default i18n;
