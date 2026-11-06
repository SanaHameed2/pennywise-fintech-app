// src/utils/money.ts

// ✅ Paison ko hamesha 2 decimal places (paisa) mein show karne ke liye
export const formatMoney = (amount: number | string | null | undefined): string => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// ✅ Safe parsing (taake NaN ya floating point error na aaye)
export const safeParseMoney = (amountStr: string | number | null | undefined): number => {
  if (amountStr === null || amountStr === undefined) return 0;
  
  // Remove commas if user typed them (e.g. "10,000")
  const cleanStr = typeof amountStr === 'string' ? amountStr.replace(/,/g, '') : amountStr;
  
  const num = Number(cleanStr);
  if (isNaN(num)) return 0;
  
  // Number ko 100 se multiply karke round karein, phir wapas divide karein
  return Math.round(num * 100) / 100;
};