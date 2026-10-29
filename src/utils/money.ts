// src/utils/money.ts

// ✅ Paison ko hamesha 2 decimal places (paisa) mein show karne ke liye
export const formatMoney = (amount: number | string): string => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// ✅ Safe parsing (taake NaN ya floating point error na aaye)
export const safeParseMoney = (amountStr: string): number => {
  const num = Number(amountStr);
  if (isNaN(num)) return 0;
  // Number ko 100 se multiply karke round karein, phir wapas divide karein (Standard JS trick for money)
  return Math.round(num * 100) / 100;
};