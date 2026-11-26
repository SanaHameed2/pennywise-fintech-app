// Network-level fake of the Supabase backend, so the real UI can be driven in a real browser
// with NO secrets and NO shared state. Business rules mirror public.execute_transfer closely enough
// for UI tests; the real rules are verified separately in supabase/tests (PostgreSQL).
import type { Page, Route } from '@playwright/test';

export const SB = 'https://qa.supabase.co';
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
const now = () => Math.floor(Date.now() / 1000);

function ibanFor(acct: string, bank = 'SCBL') {
  const num = BigInt([...(bank + acct + '252000')].map((c) => parseInt(c, 36)).join(''));
  return `PK${String(98n - (num % 97n)).padStart(2, '0')}${bank}${acct}`;
}

export interface MockState { hasPin: boolean; balance: number; transfers: any[]; failWith?: string; calls: string[] }
export const makeState = (): MockState => ({ hasPin: true, balance: 42350.5, transfers: [], calls: [] });
export const CORRECT_PIN = '482915';

export function session(guest = false) {
  const user = {
    id: 'u-123', aud: 'authenticated', role: 'authenticated', email: guest ? null : 'sana@pennywise.pk', is_anonymous: guest,
    user_metadata: { full_name: guest ? 'Demo Guest' : 'Sana Hameed' }, app_metadata: {}, created_at: new Date().toISOString(), factors: [],
  };
  const access_token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: user.id, exp: now() + 3600, aal: 'aal1', role: 'authenticated' })}.sig`;
  return { access_token, token_type: 'bearer', expires_in: 3600, expires_at: now() + 3600, refresh_token: 'r-token', user };
}

const ago = (d: number, h = 0) => new Date(Date.now() - d * 864e5 - h * 36e5).toISOString();
const TX = [
  { id: 't1', amount: -7650, type: 'transfer', category: 'Transfer', description: 'Transfer to Ayesha Khan', status: 'completed', created_at: ago(0, 2) },
  { id: 't2', amount: 90000, type: 'income', category: 'Salary', description: 'Salary – November', status: 'completed', created_at: ago(3) },
  { id: 't3', amount: -3200, type: 'expense', category: 'Food', description: 'Foodpanda', status: 'completed', created_at: ago(4) },
  { id: 't4', amount: -12000, type: 'expense', category: 'Bills', description: 'K-Electric', status: 'completed', created_at: ago(6) },
  { id: 't5', amount: 50000, type: 'income', category: 'Bonus', description: 'Welcome bonus (sandbox money)', status: 'completed', created_at: ago(40) },
];

function insights() {
  const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
  const inc = [50000, 20000, 22000, 18000, 25000, 30000], exp = [21000, 13000, 18500, 21000, 16500, 19650];
  let bal = 42350.5; const closing: number[] = [];
  for (let i = 5; i >= 0; i--) { closing[i] = bal; bal -= inc[i] - exp[i]; }
  return {
    currency: 'PKR', months: 6, balance: 42350.5,
    cashflow: months.map((m, i) => ({ month: m, income: inc[i], expenses: exp[i], net: inc[i] - exp[i], closing_balance: closing[i] })),
    categories: [{ category: 'Transfer', amount: 38650 }, { category: 'Bills', amount: 31000 }, { category: 'Food', amount: 22400 }],
    totals: { income: 165000, expenses: 109650, net: 55350, savings_rate: 33.5 }, generated_at: new Date().toISOString(),
  };
}

export async function installMock(page: Page, state: MockState, opts: { guest?: boolean } = {}) {
  await page.addInitScript((s) => { localStorage.setItem('sb-qa-auth-token', JSON.stringify(s)); }, session(opts.guest));
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': 'content-range' };
  const json = (route: Route, body: unknown, extra: Record<string, string> = {}) =>
    route.fulfill({ status: 200, contentType: 'application/json', headers: { ...cors, ...extra }, body: JSON.stringify(body) });

  await page.route(`${SB}/**`, async (route) => {
    const req = route.request(); const url = new URL(req.url()); const p = url.pathname;
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const wantsObject = (req.headers()['accept'] || '').includes('vnd.pgrst.object');
    const body = req.postData() ? JSON.parse(req.postData()!) : {};
    state.calls.push(`${req.method()} ${p}`);

    if (p === '/auth/v1/user') return json(route, session(opts.guest).user);
    if (p.startsWith('/auth/v1/token')) return json(route, session(opts.guest));
    if (p === '/rest/v1/wallets') { const w = { id: 'w1', user_id: 'u-123', balance: state.balance, currency: 'PKR', wallet_type: 'main' }; return json(route, wantsObject ? w : [w]); }
    if (p === '/rest/v1/transactions') {
      const rows = [...state.transfers, ...TX];
      if ((url.searchParams.get('select') || '').includes('category') && !(url.searchParams.get('select') || '').includes('*')) return json(route, rows.map(({ category, amount }) => ({ category, amount })));
      return json(route, rows, { 'content-range': `0-${rows.length - 1}/${rows.length}` });
    }
    if (p === '/rest/v1/budgets') return json(route, []);
    if (p === '/rest/v1/savings_goals') return json(route, [{ id: 'g1', name: 'Umrah', target_amount: 300000, current_amount: 90000, color: '#FF7F50' }]);
    if (p === '/rest/v1/beneficiaries') return json(route, [{ id: 7, name: 'Ayesha Khan', iban: ibanFor('0000001123456702'), bank: 'Standard Chartered', avatar: 'AK' }]);
    if (p === '/rest/v1/profiles') return json(route, wantsObject ? { full_name: 'Sana Hameed' } : [{ full_name: 'Sana Hameed' }]);
    if (p === '/rest/v1/notifications') return json(route, [{ id: 'n1', title: 'Transfer sent', message: 'Rs. 7,650.00 sent to Ayesha Khan (PW-3F9A21C4D0)', type: 'transfer', is_read: false, created_at: ago(0, 2) }]);
    if (p === '/rest/v1/rpc/get_insights') return json(route, insights());
    if (p === '/rest/v1/rpc/has_transaction_pin') return json(route, state.hasPin);
    if (p === '/rest/v1/rpc/set_transaction_pin') { state.hasPin = true; return json(route, { success: true, code: 'ok' }); }
    if (p === '/rest/v1/rpc/execute_transfer') {
      if (state.failWith) return json(route, { success: false, code: state.failWith });
      if (body.p_pin !== CORRECT_PIN) return json(route, { success: false, code: 'wrong_pin', attempts_left: 3 });
      if (body.p_amount >= 10000) return json(route, { success: false, code: 'mfa_not_enrolled', threshold: 10000 });
      const prior = state.transfers.find((t) => t.key === body.p_idempotency_key);   // idempotent replay
      if (prior) return json(route, { success: true, replayed: true, transaction_id: prior.id, reference: prior.reference, new_balance: state.balance, amount: -prior.amount, created_at: prior.created_at });
      state.balance -= body.p_amount;
      const tx = { id: 'new-' + state.transfers.length, key: body.p_idempotency_key, reference: 'PW-7C41D9A02E', amount: -body.p_amount, type: 'transfer', category: 'Transfer', description: 'Transfer to Ayesha Khan', status: 'completed', created_at: new Date().toISOString() };
      state.transfers.unshift(tx);
      return json(route, { success: true, replayed: false, transaction_id: tx.id, reference: tx.reference, new_balance: state.balance, amount: body.p_amount, created_at: tx.created_at,
        beneficiary: { name: 'Ayesha Khan', bank: 'Standard Chartered', iban_masked: 'PK36••••••••••••6702' } });
    }
    return json(route, []);
  });
}
