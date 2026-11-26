import { describe, it, expect } from 'vitest';
import { validatePkIban, normalizeIban, maskIban, formatIban, hasValidIbanChecksum } from '../iban';

const VALID = 'PK36SCBL0000001123456702'; // the ISO 13616 example for Pakistan

describe('IBAN utilities', () => {
  it('accepts a correct Pakistani IBAN', () => {
    expect(validatePkIban(VALID)).toBeNull();
    expect(hasValidIbanChecksum(VALID)).toBe(true);
  });

  it('accepts spaces, dashes and lower case', () => {
    expect(validatePkIban('pk36 scbl 0000 0011 2345 6702')).toBeNull();
    expect(normalizeIban('pk36-scbl 0000')).toBe('PK36SCBL0000');
  });

  it('rejects a single mistyped digit via the check digits', () => {
    const typo = VALID.slice(0, -1) + '3';
    expect(validatePkIban(typo)).toBe('checksum');
  });

  it('rejects wrong shape before checking digits', () => {
    expect(validatePkIban('PK36SCBL000000112345670')).toBe('format');   // 23 chars
    expect(validatePkIban('GB82WEST12345698765432')).toBe('format');    // not Pakistani
    expect(validatePkIban('')).toBe('format');
  });

  it('masks all but the first and last four characters', () => {
    expect(maskIban(VALID)).toBe('PK36' + '•'.repeat(16) + '6702');
  });

  it('formats in groups of four for display', () => {
    expect(formatIban(VALID)).toBe('PK36 SCBL 0000 0011 2345 6702');
  });
});
