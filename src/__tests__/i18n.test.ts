import { describe, it, expect } from 'vitest';
import en from '../locales/en.json';
import ur from '../locales/ur.json';

const flatten = (obj: Record<string, unknown>, prefix = ''): Record<string, string> =>
  Object.entries(obj).reduce<Record<string, string>>((acc, [k, v]) => {
    if (v && typeof v === 'object') Object.assign(acc, flatten(v as Record<string, unknown>, `${prefix}${k}.`));
    else acc[`${prefix}${k}`] = String(v);
    return acc;
  }, {});

const fe = flatten(en);
const fu = flatten(ur);

// Every source file (except tests), loaded as raw text by Vite.
const sources = import.meta.glob(['../**/*.ts', '../**/*.tsx', '!../**/__tests__/**', '!../test/**'], {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;

describe('translations', () => {
  it('English and Urdu have exactly the same keys', () => {
    expect(Object.keys(fu).filter((k) => !(k in fe))).toEqual([]);
    expect(Object.keys(fe).filter((k) => !(k in fu))).toEqual([]);
  });

  it('keeps {{placeholders}} identical in both languages', () => {
    const ph = (s: string) => [...s.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort().join(',');
    const bad = Object.keys(fe).filter((k) => ph(fe[k]) !== ph(fu[k] ?? ''));
    expect(bad).toEqual([]);
  });

  it('has no empty strings', () => {
    expect(Object.entries(fe).filter(([, v]) => !v.trim())).toEqual([]);
    expect(Object.entries(fu).filter(([, v]) => !v.trim())).toEqual([]);
  });

  it('every literal t("key") used in the source exists (no silent English fallbacks)', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(20);   // guard: the glob really found the source
    const used = new Set<string>();
    for (const src of Object.values(sources)) {
      for (const m of src.matchAll(/\bt\(\s*['"]([A-Za-z0-9_.]+)['"]/g)) used.add(m[1]);
    }
    expect([...used].filter((k) => !(k in fe))).toEqual([]);
    expect([...used].filter((k) => !(k in fu))).toEqual([]);
  });

  it('has a message for every server error code and beneficiary error', () => {
    const codes = ['invalid_amount','invalid_request','wallet_not_found','invalid_beneficiary','per_tx_limit','daily_limit',
      'insufficient_funds','mfa_required','mfa_not_enrolled','pin_not_set','pin_locked','wrong_pin','pin_format','pin_too_weak',
      'goal_not_found','exceeds_target','insufficient_goal_funds','not_authenticated','network','unknown'];
    for (const c of codes) { expect(fe[`errors.${c}`], c).toBeTruthy(); expect(fu[`errors.${c}`], c).toBeTruthy(); }
    for (const c of ['required','iban_format','iban_checksum','duplicate','unknown']) {
      expect(fe[`transfer.beneficiaryErrors.${c}`], c).toBeTruthy();
      expect(fu[`transfer.beneficiaryErrors.${c}`], c).toBeTruthy();
    }
  });

  it('makes no unverifiable claims (regulators, certifications, user counts)', () => {
    const forbidden = /bank-grade|256-bit|cryptographic|military|FDIC|SOC ?2|PCI|licensed by|regulated by|\d{2,3},\d{3}\+/i;
    const hits = Object.entries(fe).filter(([, v]) => forbidden.test(v) && !/not (a bank|licensed)/i.test(v));
    expect(hits).toEqual([]);
  });
});
