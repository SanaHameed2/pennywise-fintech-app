// Regression tests for the transfer flow.
// The original bug: ANY error (wrong PIN, no balance, network down) still showed the "Transfer successful" receipt.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { TransferResult } from '../../../lib/rpc';

const executeTransfer = vi.fn<(input: any) => Promise<TransferResult>>();
const savePin = vi.fn();

vi.mock('../../../hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1', email: 'a@b.pk' } }) }));
vi.mock('../../../hooks/useTransferSupabase', async (importActual) => ({
  ...(await importActual<typeof import('../../../hooks/useTransferSupabase')>()),
  useTransferSupabase: () => ({
    beneficiaries: [{ id: 7, name: 'Ali Raza', iban: 'PK36SCBL0000001123456702', bank: 'Standard Chartered' }],
    loading: false, error: null, isAdding: false, isExecuting: false,
    addBeneficiary: vi.fn(), executeTransfer,
  }),
}));
vi.mock('../../../hooks/useTransactionPin', () => ({ useTransactionPin: () => ({ hasPin: true, refresh: vi.fn(), savePin }) }));
vi.mock('../../../hooks/useStepUpMfa', () => ({
  useStepUpMfa: () => ({ isFresh: () => false, verify: vi.fn(), hasEnrolledFactor: vi.fn(), reset: vi.fn() }),
}));
vi.mock('../../../lib/supabaseClient', () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { balance: 50000 } }) }) }) }) },
}));
vi.mock('../../components/Footer', () => ({ default: () => null }));

import TransferWizard from '../TransferWizard';

const renderWizard = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter><TransferWizard /></MemoryRouter>
    </QueryClientProvider>,
  );

async function goToConfirm(user: ReturnType<typeof userEvent.setup>, amount = '500') {
  await user.click(await screen.findByRole('button', { name: /Ali Raza/ }));
  await user.click(screen.getByRole('button', { name: /Continue/i }));
  await user.type(await screen.findByLabelText(/Amount to send/i), amount);
  await user.click(screen.getByRole('button', { name: /Review/i }));
  await screen.findByRole('heading', { name: /Secure PIN/i });
}

async function enterPinAndConfirm(user: ReturnType<typeof userEvent.setup>, pin = '482915') {
  await user.click(screen.getByLabelText('Digit 1 of 6'));
  await user.keyboard(pin);
  await user.click(screen.getByRole('button', { name: /Confirm transfer/i }));
}

describe('TransferWizard', () => {
  beforeEach(() => { executeTransfer.mockReset(); });

  it('shows the receipt only for a server-confirmed transfer, with the server reference', async () => {
    executeTransfer.mockResolvedValue({
      success: true, replayed: false, transaction_id: 'tx-1', reference: 'PW-A1B2C3D4E5',
      new_balance: 49500, amount: 500, created_at: '2026-11-21T10:00:00Z',
    });
    const user = userEvent.setup();
    renderWizard();
    await goToConfirm(user);
    await enterPinAndConfirm(user);

    expect(await screen.findByRole('heading', { name: /Transfer successful/i })).toBeInTheDocument();
    expect(screen.getByText('PW-A1B2C3D4E5')).toBeInTheDocument();
    expect(executeTransfer).toHaveBeenCalledWith(expect.objectContaining({ amount: 500, beneficiaryId: 7, pin: '482915' }));
  });

  it('a wrong PIN stays on the confirm step with an error and NEVER shows a receipt', async () => {
    executeTransfer.mockResolvedValue({ success: false, code: 'wrong_pin', attempts_left: 3 });
    const user = userEvent.setup();
    renderWizard();
    await goToConfirm(user);
    await enterPinAndConfirm(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Incorrect PIN\. 3 attempts left/i);
    expect(screen.queryByRole('heading', { name: /Transfer successful/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Secure PIN/i })).toBeInTheDocument();
  });

  it.each([
    ['insufficient_funds', /not enough/i],
    ['network', /couldn't reach the server/i],
    ['unknown', /Something went wrong/i],
    ['pin_locked', /locked for 15 minutes/i],
  ] as const)('%s is reported as an error, not a success', async (code, message) => {
    executeTransfer.mockResolvedValue({ success: false, code, available: 120 });
    const user = userEvent.setup();
    renderWizard();
    await goToConfirm(user);
    await enterPinAndConfirm(user);
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByRole('heading', { name: /Transfer successful/i })).not.toBeInTheDocument();
  });

  it('retries with the SAME idempotency key so a repeated tap can never charge twice', async () => {
    executeTransfer.mockResolvedValueOnce({ success: false, code: 'network' });
    executeTransfer.mockResolvedValueOnce({ success: false, code: 'network' });
    const user = userEvent.setup();
    renderWizard();
    await goToConfirm(user);
    await enterPinAndConfirm(user);
    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: /Confirm transfer/i }));
    await waitFor(() => expect(executeTransfer).toHaveBeenCalledTimes(2));
    const [first, second] = executeTransfer.mock.calls.map((c) => c[0].idempotencyKey);
    expect(first).toBeTruthy();
    expect(second).toBe(first);
  });

  it('refuses a transfer above the balance before calling the server', async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.click(await screen.findByRole('button', { name: /Ali Raza/ }));
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await user.type(await screen.findByLabelText(/Amount to send/i), '60000');
    await user.click(screen.getByRole('button', { name: /Review/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(executeTransfer).not.toHaveBeenCalled();
  });

  it('exposes the step list with the current step marked', async () => {
    renderWizard();
    const nav = await screen.findByRole('navigation', { name: /Transfer progress/i });
    const items = within(nav).getAllByRole('listitem');
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveAttribute('aria-current', 'step');
  });

  it('marks the selected beneficiary with aria-pressed (not colour alone)', async () => {
    const user = userEvent.setup();
    renderWizard();
    const card = await screen.findByRole('button', { name: /Ali Raza/ });
    expect(card).toHaveAttribute('aria-pressed', 'false');
    await user.click(card);
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });
});
