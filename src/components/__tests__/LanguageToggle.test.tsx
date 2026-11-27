import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../../lib/i18n';
import { LanguageToggle } from '../LanguageToggle';

afterEach(async () => { await act(async () => { await i18n.changeLanguage('en'); }); });

function Page() {
  return (
    <>
      <header><LanguageToggle /></header>
      <main id="main-content"><input aria-label="work field" /></main>
    </>
  );
}

describe('LanguageToggle', () => {
  it('in English its accessible name is the English word; the Urdu script is decorative (no voice needed)', () => {
    render(<Page />);
    const toggle = screen.getByRole('button', { name: 'Urdu' });
    const script = toggle.querySelector('[lang="ur"]');
    expect(script).toHaveAttribute('aria-hidden', 'true');
  });

  it('keyboard activation hands focus back to the control the user was working on', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByLabelText('work field'));
    await user.tab({ shift: true });                         // move to the toggle in the header (keyboard)
    screen.getByRole('button', { name: 'Urdu' }).focus();
    await user.keyboard('{Enter}');
    await act(async () => { await new Promise((r) => requestAnimationFrame(() => r(null))); });
    expect(screen.getByLabelText('work field')).toHaveFocus();
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('a mouse click leaves focus on the toggle (no surprise focus jump)', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByLabelText('work field'));
    await user.click(screen.getByRole('button', { name: 'Urdu' }));
    await act(async () => { await new Promise((r) => requestAnimationFrame(() => r(null))); });
    expect(screen.getByRole('button', { name: 'English' })).toHaveFocus();
  });
});
