// src/utils/__tests__/format.test.ts
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTransactionType,
  formatIBAN,
  truncate,
} from '../format';

describe('formatCurrency', () => {
  it('formats PKR currency correctly', () => {
    expect(formatCurrency(50000, 'PKR')).toBe('Rs. 50,000.00');
  });

  it('formats USD currency correctly', () => {
    expect(formatCurrency(50000, 'USD')).toBe('$50,000.00');
  });

  it('formats EUR currency correctly', () => {
    expect(formatCurrency(50000, 'EUR')).toBe('€50,000.00');
  });

  it('formats GBP currency correctly', () => {
    expect(formatCurrency(50000, 'GBP')).toBe('£50,000.00');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'PKR')).toBe('Rs. 0.00');
  });

  it('handles decimal values', () => {
    expect(formatCurrency(1234.56, 'PKR')).toBe('Rs. 1,234.56');
  });

  it('defaults to PKR when no currency provided', () => {
    expect(formatCurrency(50000)).toBe('Rs. 50,000.00');
  });
});

describe('formatDate', () => {
  it('formats Date object correctly', () => {
    const date = new Date('2026-07-09T10:00:00');
    expect(formatDate(date)).toBe('Jul 9, 2026');
  });

  it('formats date string correctly', () => {
    expect(formatDate('2026-07-09T10:00:00')).toBe('Jul 9, 2026');
  });
});

describe('formatDateTime', () => {
  it('formats Date object with time', () => {
    const date = new Date('2026-07-09T14:30:00');
    expect(formatDateTime(date)).toBe('Jul 9, 2026, 02:30 PM');
  });

  it('formats date string with time', () => {
    expect(formatDateTime('2026-07-09T14:30:00')).toBe('Jul 9, 2026, 02:30 PM');
  });
});

describe('formatTransactionType', () => {
  it('formats income', () => {
    expect(formatTransactionType('income')).toBe('Income');
  });

  it('formats expense', () => {
    expect(formatTransactionType('expense')).toBe('Expense');
  });

  it('formats transfer', () => {
    expect(formatTransactionType('transfer')).toBe('Transfer');
  });

  it('returns original for unknown type', () => {
    expect(formatTransactionType('unknown')).toBe('unknown');
  });
});

describe('formatIBAN', () => {
  it('masks middle digits of IBAN', () => {
    expect(formatIBAN('PK99VAUL0000987654321098')).toBe('PK99 •••• •••• 1098');
  });

  it('returns original for short IBAN', () => {
    expect(formatIBAN('PK123')).toBe('PK123');
  });
});

describe('truncate', () => {
  it('truncates text longer than length', () => {
    expect(truncate('Hello World! This is a long text', 10)).toBe('Hello Worl...');
  });

  it('returns original text if shorter than length', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('uses default length 30', () => {
    const longText = 'a'.repeat(40);
    expect(truncate(longText)).toBe('a'.repeat(30) + '...');
  });
});