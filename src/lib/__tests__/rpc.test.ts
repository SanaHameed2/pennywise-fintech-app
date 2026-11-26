import { describe, it, expect } from 'vitest';
import { parseRpcResult, failureFromError, asCode, errorParams, errorKey } from '../rpc';

describe('RPC result parsing', () => {
  it('passes a successful result through', () => {
    const r = parseRpcResult<{ success: true; reference: string }>({ success: true, reference: 'PW-1' });
    expect(r.success).toBe(true);
  });

  it('turns a business failure into a typed failure (never a success)', () => {
    const r = parseRpcResult({ success: false, code: 'wrong_pin', attempts_left: 3 });
    expect(r).toMatchObject({ success: false, code: 'wrong_pin', attempts_left: 3 });
  });

  it('treats malformed / empty responses as failures', () => {
    expect(parseRpcResult(null)).toMatchObject({ success: false, code: 'unknown' });
    expect(parseRpcResult('ok')).toMatchObject({ success: false, code: 'unknown' });
    expect(parseRpcResult({})).toMatchObject({ success: false, code: 'unknown' });
  });

  it('does not trust unknown codes', () => {
    expect(asCode('drop_table')).toBe('unknown');
    expect(asCode('insufficient_funds')).toBe('insufficient_funds');
  });

  it('classifies network and auth errors', () => {
    expect(failureFromError(new TypeError('Failed to fetch')).code).toBe('network');
    expect(failureFromError({ message: 'not_authenticated' }).code).toBe('not_authenticated');
    expect(failureFromError({ message: 'something else' }).code).toBe('unknown');
  });

  it('builds i18n params and keys', () => {
    expect(errorKey('daily_limit')).toBe('errors.daily_limit');
    expect(errorParams({ success: false, code: 'daily_limit', limit: 100000, used_today: 80000 })).toMatchObject({ limit: '100,000', used: '80,000' });
  });
});
