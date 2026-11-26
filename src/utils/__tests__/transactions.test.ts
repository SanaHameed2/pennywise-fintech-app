import { describe, it, expect } from 'vitest';
import { directionOf, absAmount, signSymbol } from '../transactions';

describe('transaction direction (signed amounts)', () => {
  it('positive is money in, negative is money out', () => {
    expect(directionOf(500)).toBe('in');
    expect(directionOf(-500)).toBe('out');
    expect(directionOf('-12.50')).toBe('out');   // PostgREST can return numerics as strings
  });

  it('absAmount never returns a negative number', () => {
    expect(absAmount(-1200.5)).toBe(1200.5);
    expect(absAmount('abc')).toBe(0);
  });

  it('uses a real minus sign for display', () => {
    expect(signSymbol(10)).toBe('+');
    expect(signSymbol(-10)).toBe('−');
  });
});
