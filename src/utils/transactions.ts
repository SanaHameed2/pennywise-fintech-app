// src/utils/transactions.ts
// Single source of truth for money direction.
// Database convention (see supabase/migrations/20261121000000): amount is SIGNED,
// income > 0, expense / transfer < 0.  Never infer direction from `type` alone.

export type Direction = 'in' | 'out';

export function directionOf(amount: number | string): Direction {
  return Number(amount) >= 0 ? 'in' : 'out';
}

export function absAmount(amount: number | string): number {
  return Math.abs(Number(amount) || 0);
}

/** "+" for money in, "−" (U+2212) for money out; used visually, with a text alternative for screen readers. */
export function signSymbol(amount: number | string): '+' | '−' {
  return directionOf(amount) === 'in' ? '+' : '−';
}
