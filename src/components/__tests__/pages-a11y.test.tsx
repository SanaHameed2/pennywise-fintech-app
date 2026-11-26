import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';

vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ user: null, logout: vi.fn(), loading: false }) }));
vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({ notifications: [{ id: 'n1', title: 'Transfer sent', message: 'Rs. 500 sent', type: 'transfer', is_read: false, created_at: '2026-11-21T10:00:00Z' }], unreadCount: 1, isLoading: false, markAsRead: vi.fn(), markAllAsRead: vi.fn() }),
}));

import Home from '../../app/pages/Home';
import About from '../../app/pages/About';
import RootLayout from '../../app/pages/RootLayout';
import { NotificationPanel } from '../../app/components/NotificationPanel';
import { TransactionRow } from '../transactions/TransactionRow';
import { LanguageToggle } from '../LanguageToggle';

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('public pages', () => {
  it('Home has one h1, honest copy and no axe violations', async () => {
    const { container } = wrap(<Home />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(container.textContent).not.toMatch(/FDIC|SOC ?2|95,000|bank-grade|256-bit/i);
    expect(screen.getAllByText(/Sample data/i).length).toBeGreaterThan(0);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('About states the sandbox clearly and has no axe violations', async () => {
    const { container } = wrap(<About />);
    expect(screen.getByRole('heading', { name: /Sandbox notice/i })).toBeInTheDocument();
    expect(container.textContent).toMatch(/not a bank/i);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('every footer link goes somewhere real', () => {
    const { container } = wrap(<About />);
    const hrefs = [...container.querySelectorAll('footer a')].map((a) => a.getAttribute('href'));
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.filter((h) => !h || h === '#')).toEqual([]);
  });
});

describe('app shell', () => {
  it('provides a skip link that targets the main landmark', async () => {
    const user = userEvent.setup();
    wrap(<RootLayout />);
    const skip = screen.getByRole('link', { name: /Skip to main content/i });
    expect(skip).toHaveAttribute('href', '#main-content');
    await user.click(skip);
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('language toggle accessible name is its visible text (the language you switch to)', () => {
    wrap(<LanguageToggle />);
    expect(screen.getByRole('button', { name: /اردو/ })).toBeInTheDocument();
  });

  it('notification bell reports the unread count, opens a region and closes on Escape', async () => {
    const user = userEvent.setup();
    const { container } = wrap(<NotificationPanel />);
    const bell = screen.getByRole('button', { name: /1 unread/i });
    expect(bell).toHaveAttribute('aria-expanded', 'false');
    await user.click(bell);
    expect(bell).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: /Notifications/i })).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
    await user.keyboard('{Escape}');
    expect(bell).toHaveAttribute('aria-expanded', 'false');
    expect(bell).toHaveFocus();
  });
});

describe('TransactionRow', () => {
  const base = { id: '1', description: 'Test', category: 'Transfer', status: 'completed', created_at: '2026-11-21T10:00:00Z', currency: 'PKR' } as const;

  it('shows a transfer (negative amount) as money OUT with a minus sign and a text alternative', () => {
    wrap(<TransactionRow tx={{ ...base, type: 'transfer', amount: -500 } as any} />);
    expect(screen.getByText(/−\s*Rs\.\s*500\.00/)).toBeInTheDocument();
    expect(screen.getByText(/Money out/i)).toBeInTheDocument();
  });

  it('never prints a doubled sign for negative expenses', () => {
    const { container } = wrap(<TransactionRow tx={{ ...base, type: 'expense', amount: -1200 } as any} />);
    expect(container.textContent).not.toMatch(/[-−]\s*Rs\.\s*[-−]/);
  });

  it('shows income as money IN', () => {
    wrap(<TransactionRow tx={{ ...base, type: 'income', amount: 90000 } as any} />);
    expect(screen.getByText(/\+\s*Rs\.\s*90,000\.00/)).toBeInTheDocument();
    expect(screen.getByText(/Money in/i)).toBeInTheDocument();
  });
});
