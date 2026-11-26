// src/lib/rpc.ts
// Typed results for the money RPCs. The database never throws for business failures; it returns
// { success:false, code } so counters/audit rows are committed. The UI maps `code` -> i18n text.

export type RpcErrorCode =
  | 'invalid_amount' | 'invalid_request' | 'wallet_not_found' | 'invalid_beneficiary'
  | 'per_tx_limit' | 'daily_limit' | 'insufficient_funds'
  | 'mfa_required' | 'mfa_not_enrolled'
  | 'pin_not_set' | 'pin_locked' | 'wrong_pin' | 'pin_format' | 'pin_too_weak'
  | 'goal_not_found' | 'exceeds_target' | 'insufficient_goal_funds'
  | 'not_authenticated' | 'network' | 'unknown';

const KNOWN: ReadonlySet<string> = new Set<RpcErrorCode>([
  'invalid_amount', 'invalid_request', 'wallet_not_found', 'invalid_beneficiary',
  'per_tx_limit', 'daily_limit', 'insufficient_funds', 'mfa_required', 'mfa_not_enrolled',
  'pin_not_set', 'pin_locked', 'wrong_pin', 'pin_format', 'pin_too_weak',
  'goal_not_found', 'exceeds_target', 'insufficient_goal_funds',
  'not_authenticated', 'network', 'unknown',
]);

export interface RpcFailure {
  success: false;
  code: RpcErrorCode;
  attempts_left?: number;
  limit?: number;
  used_today?: number;
  available?: number;
  threshold?: number;
}

export interface TransferSuccess {
  success: true;
  replayed: boolean;
  transaction_id: string;
  reference: string;
  new_balance: number;
  amount: number;
  created_at: string;
  beneficiary?: { name: string; bank: string; iban_masked: string };
}

export type TransferResult = TransferSuccess | RpcFailure;

export function asCode(value: unknown): RpcErrorCode {
  return typeof value === 'string' && KNOWN.has(value) ? (value as RpcErrorCode) : 'unknown';
}

/** Converts a PostgREST / fetch error into a failure object without leaking raw messages to the UI. */
export function failureFromError(err: unknown): RpcFailure {
  const message = (err instanceof Error ? err.message : (err as { message?: string } | null)?.message) ?? '';
  const lower = message.toLowerCase();
  if (lower.includes('not_authenticated') || lower.includes('jwt')) return { success: false, code: 'not_authenticated' };
  if (lower.includes('fetch') || lower.includes('network') || lower.includes('timeout') || lower.includes('offline')) {
    return { success: false, code: 'network' };
  }
  return { success: false, code: 'unknown' };
}

/** Normalises whatever the RPC returned (object, null, malformed) into a typed result. */
export function parseRpcResult<T extends { success: true }>(data: unknown): T | RpcFailure {
  if (data && typeof data === 'object' && 'success' in data) {
    const obj = data as Record<string, unknown>;
    if (obj.success === true) return obj as unknown as T;
    return { ...(obj as object), success: false, code: asCode(obj.code) } as RpcFailure;
  }
  return { success: false, code: 'unknown' };
}

/** i18n key for a failure code. Keep in sync with locales (a unit test enforces parity). */
export const errorKey = (code: RpcErrorCode): string => `errors.${code}`;

export function errorParams(f: RpcFailure): Record<string, string | number> {
  const fmt = (n?: number) => (n === undefined ? '' : new Intl.NumberFormat('en-PK').format(n));
  return {
    attempts: f.attempts_left ?? 0,
    limit: fmt(f.limit),
    used: fmt(f.used_today),
    available: fmt(f.available),
    threshold: fmt(f.threshold),
  };
}
