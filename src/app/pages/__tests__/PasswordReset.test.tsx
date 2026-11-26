import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const resetPasswordForEmail = vi.fn();
const updateUser = vi.fn();
let authState: { user: unknown; loading: boolean } = { user: null, loading: false };

vi.mock('../../../lib/supabaseClient', () => ({ supabase: { auth: { resetPasswordForEmail: (...a: unknown[]) => resetPasswordForEmail(...a), updateUser: (...a: unknown[]) => updateUser(...a) } } }));
vi.mock('../../../hooks/useAuth', () => ({ useAuth: () => authState }));

import ForgotPassword from '../ForgotPassword';
import ResetPassword from '../ResetPassword';

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ForgotPassword', () => {
  beforeEach(() => { resetPasswordForEmail.mockReset(); });

  it('rejects an invalid email without calling the server', async () => {
    const user = userEvent.setup();
    wrap(<ForgotPassword />);
    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /Send reset link/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('shows the same neutral message whether or not the account exists', async () => {
    resetPasswordForEmail.mockResolvedValue({ error: { message: 'User not found' } });
    const user = userEvent.setup();
    wrap(<ForgotPassword />);
    await user.type(screen.getByLabelText(/email/i), 'ghost@example.com');
    await user.click(screen.getByRole('button', { name: /Send reset link/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/If an account exists/i);
  });

  it('reports a network failure as an error', async () => {
    resetPasswordForEmail.mockResolvedValue({ error: { message: 'Failed to fetch' } });
    const user = userEvent.setup();
    wrap(<ForgotPassword />);
    await user.type(screen.getByLabelText(/email/i), 'a@b.pk');
    await user.click(screen.getByRole('button', { name: /Send reset link/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't send/i);
  });

  it('asks Supabase to redirect back to /reset-password', async () => {
    resetPasswordForEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    wrap(<ForgotPassword />);
    await user.type(screen.getByLabelText(/email/i), 'a@b.pk');
    await user.click(screen.getByRole('button', { name: /Send reset link/i }));
    await waitFor(() => expect(resetPasswordForEmail).toHaveBeenCalledWith('a@b.pk', { redirectTo: `${window.location.origin}/reset-password` }));
  });
});

describe('ResetPassword', () => {
  beforeEach(() => { updateUser.mockReset(); authState = { user: { id: 'u1' }, loading: false }; });

  it('explains an invalid or expired link when there is no recovery session', () => {
    authState = { user: null, loading: false };
    wrap(<ResetPassword />);
    expect(screen.getByRole('alert')).toHaveTextContent(/invalid or has expired/i);
    expect(screen.getByRole('link', { name: /Request a new link/i })).toHaveAttribute('href', '/forgot-password');
  });

  it('enforces the minimum length and matching passwords before calling the server', async () => {
    const user = userEvent.setup();
    wrap(<ResetPassword />);
    await user.type(screen.getByLabelText(/^New password/i), 'short');
    await user.type(screen.getByLabelText(/Confirm new password/i), 'short');
    await user.click(screen.getByRole('button', { name: /Save new password/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8/i);
    await user.clear(screen.getByLabelText(/^New password/i));
    await user.type(screen.getByLabelText(/^New password/i), 'longenough1');
    await user.click(screen.getByRole('button', { name: /Save new password/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/don't match/i);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('updates the password with a valid, matching pair', async () => {
    updateUser.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    wrap(<ResetPassword />);
    await user.type(screen.getByLabelText(/^New password/i), 'longenough1');
    await user.type(screen.getByLabelText(/Confirm new password/i), 'longenough1');
    await user.click(screen.getByRole('button', { name: /Save new password/i }));
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith({ password: 'longenough1' }));
  });
});
