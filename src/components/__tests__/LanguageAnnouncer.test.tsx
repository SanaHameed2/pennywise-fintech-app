import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import i18n from '../../lib/i18n';
import { LanguageAnnouncer } from '../LanguageAnnouncer';

afterEach(async () => { await act(async () => { await i18n.changeLanguage('en'); }); });

describe('LanguageAnnouncer', () => {
  it('is silent until the language actually changes', () => {
    render(<LanguageAnnouncer />);
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('switching to Urdu: English sentence first (speakable by any voice), then Urdu, each with its own lang', async () => {
    render(<LanguageAnnouncer />);
    await act(async () => { await i18n.changeLanguage('ur'); });
    const region = screen.getByRole('status');
    const parts = [...region.querySelectorAll('span')];
    expect(parts.map((p) => p.getAttribute('lang'))).toEqual(['en', 'ur']);
    expect(parts[0]).toHaveTextContent('Language changed to Urdu.');
    expect(parts[1]).toHaveTextContent('زبان اردو میں تبدیل ہو گئی');
  });

  it('switching to English announces in English only', async () => {
    render(<LanguageAnnouncer />);
    await act(async () => { await i18n.changeLanguage('ur'); });
    await act(async () => { await i18n.changeLanguage('en'); });
    const parts = [...screen.getByRole('status').querySelectorAll('span')];
    expect(parts).toHaveLength(1);
    expect(parts[0]).toHaveAttribute('lang', 'en');
    expect(parts[0]).toHaveTextContent('Language changed to English.');
  });
});
