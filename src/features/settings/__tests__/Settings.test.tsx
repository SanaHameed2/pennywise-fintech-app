import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'sana@pennywise.pk', user_metadata: { full_name: 'Sana Hameed' } }, logout: vi.fn().mockResolvedValue({ success: true }) }),
}));
vi.mock('../../../hooks/useTransactionPin', () => ({ useTransactionPin: () => ({ hasPin: false, refresh: vi.fn(), savePin: vi.fn() }) }));
vi.mock('../../../lib/supabaseClient', () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { full_name: 'Sana Hameed' } }) }) }) }),
    auth: { mfa: { listFactors: async () => ({ data: { all: [], totp: [] } }) } },
  },
}));
vi.mock('../../../app/components/MfaSetup', () => ({ default: () => <div>mfa</div> }));

import SettingsPage from '../index';

const renderPage = () => render(<MemoryRouter><SettingsPage /></MemoryRouter>);

describe('Settings page', () => {
  it('implements the WAI-ARIA tabs pattern', async () => {
    renderPage();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tabs[0].id);
  });

  it('arrow keys move between tabs and switch the panel', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getAllByRole('tab')[0]);
    await user.keyboard('{ArrowRight}');
    expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByRole('tab')[1]).toHaveFocus();
    expect(await screen.findByRole('heading', { name: /Account security/i })).toBeInTheDocument();
    await user.keyboard('{End}');
    expect(screen.getAllByRole('tab')[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('profile: email is read-only and currency is fixed to PKR', async () => {
    renderPage();
    expect(await screen.findByLabelText(/Email address/i)).toHaveAttribute('readonly');
    expect(screen.getByText(/PKR/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save profile/i })).toBeInTheDocument();
  });

  it('security: PIN card prompts to set a PIN; every password field has a label', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getAllByRole('tab')[1]);
    expect(await screen.findByRole('button', { name: /Set PIN/i })).toBeInTheDocument();
    for (const label of [/Current password/i, /^New password/i, /Confirm new password/i]) {
      expect(screen.getByLabelText(label)).toHaveAttribute('type', 'password');
    }
  });

  it('preferences: language is a radio group and reduce-motion is a labelled switch', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getAllByRole('tab')[2]);
    expect(await screen.findAllByRole('radio')).toHaveLength(2);
    const sw = screen.getByRole('switch', { name: /Reduce motion/i });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await user.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.dataset.reduceMotion).toBe('true');
  });

  it.each([0, 1, 2])('has no axe violations on tab %i', async (index) => {
    const user = userEvent.setup();
    const { container } = renderPage();
    await user.click(screen.getAllByRole('tab')[index]);
    await screen.findByRole('tabpanel');
    expect((await axe(container)).violations).toEqual([]);
  });
});
