// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import i18n from '../lib/i18n'; // ✅ Import i18n instance


i18n.changeLanguage('en');

afterEach(() => {
  cleanup();
});