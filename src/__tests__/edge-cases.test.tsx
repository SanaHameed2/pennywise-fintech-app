// src/__tests__/edge-cases.test.tsx
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, truncate } from '../utils/format';

describe('Edge Cases - Formatting', () => {
  it('handles negative currency values', () => {
    expect(formatCurrency(-100, 'PKR')).toBe('Rs. -100.00');
  });

  it('handles large numbers', () => {
    expect(formatCurrency(1000000000, 'USD')).toBe('$1,000,000,000.00');
  });

  it('handles invalid date strings', () => {
    expect(formatDate('invalid-date')).toBe('Invalid Date');
  });

  it('handles empty text in truncate', () => {
    expect(truncate('')).toBe('');
  });

  it('handles null values gracefully', () => {
    // ✅ `unknown as number` — same cast as `any`, but satisfies @typescript-eslint/no-explicit-any
    expect(() => formatCurrency(null as unknown as number)).not.toThrow();
  });
});