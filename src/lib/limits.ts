// src/lib/limits.ts
// Display-only mirrors of the limits enforced inside public.execute_transfer().
// The database is authoritative: changing a number here does NOT change what is allowed.
export const TRANSFER_LIMITS = {
  perTransaction: 50_000,
  daily: 100_000,
  /** Transfers at or above this amount need a fresh authenticator-app (TOTP) code. */
  mfaThreshold: 10_000,
} as const;
