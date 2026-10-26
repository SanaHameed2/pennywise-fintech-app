// src/utils/format.ts

/**
 * Format currency with proper symbol
 * Handles null, undefined, and NaN gracefully
 */
export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  // ✅ Handle null/undefined/NaN gracefully
  if (amount === null || amount === undefined || isNaN(amount)) {
    const symbols: Record<string, string> = {
      PKR: 'Rs. ',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    const symbol = symbols[currency] || 'Rs. ';
    return `${symbol}0.00`;
  }

  const symbols: Record<string, string> = {
    PKR: 'Rs. ',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const symbol = symbols[currency] || 'Rs. ';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  if (!date) return 'Invalid Date';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  if (!date) return 'Invalid Date';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format transaction type
 */
export function formatTransactionType(type: string): string {
  const types: Record<string, string> = {
    income: 'Income',
    expense: 'Expense',
    transfer: 'Transfer',
  };
  return types[type] || type;
}

/**
 * Format IBAN (mask middle digits)
 */
export function formatIBAN(iban: string): string {
  if (!iban) return '';
  if (iban.length <= 8) return iban;
  const first4 = iban.slice(0, 4);
  const last4 = iban.slice(-4);
  return `${first4} •••• •••• ${last4}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number = 30): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}