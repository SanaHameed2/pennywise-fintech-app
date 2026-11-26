// src/utils/iban.ts
// Pakistani IBAN = "PK" + 2 check digits + 4-letter bank code + 16-digit account number (24 chars).
// Mirrors public.is_valid_pk_iban() in the database so the UI and the DB agree.

export const PK_IBAN_FORMAT = /^PK\d{2}[A-Z]{4}\d{16}$/;

/** Strips spaces/dashes and upper-cases, so "pk36 scbl 0000 0011 2345 6702" works. */
export function normalizeIban(input: string): string {
  return input.replace(/[\s-]+/g, '').toUpperCase();
}

/** ISO 13616 mod-97 check without big-number arithmetic. */
export function hasValidIbanChecksum(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    const digits = code >= 65 && code <= 90 ? String(code - 55) : ch;
    for (const d of digits) remainder = (remainder * 10 + Number(d)) % 97;
  }
  return remainder === 1;
}

export type IbanProblem = 'format' | 'checksum';

/** Returns null when valid, otherwise why it is not. */
export function validatePkIban(input: string): IbanProblem | null {
  const iban = normalizeIban(input);
  if (!PK_IBAN_FORMAT.test(iban)) return 'format';
  if (!hasValidIbanChecksum(iban)) return 'checksum';
  return null;
}

export function maskIban(iban: string): string {
  const n = normalizeIban(iban);
  return n.length <= 8 ? n : `${n.slice(0, 4)}${'•'.repeat(n.length - 8)}${n.slice(-4)}`;
}

/** Groups in blocks of 4 for display: PK36 SCBL 0000 0011 2345 6702 */
export function formatIban(iban: string): string {
  return normalizeIban(iban).replace(/(.{4})/g, '$1 ').trim();
}
