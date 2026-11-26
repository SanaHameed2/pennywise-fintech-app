// src/lib/preferences.ts
const KEY = 'pennywise_reduce_motion';

export function getReduceMotion(): boolean {
  try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
}

export function setReduceMotion(on: boolean): void {
  try { localStorage.setItem(KEY, String(on)); } catch { /* storage unavailable: keep in-memory only */ }
  applyReduceMotion();
}

/** Mirrors the saved choice onto <html data-reduce-motion>, which index.css reads. */
export function applyReduceMotion(): void {
  document.documentElement.dataset.reduceMotion = String(getReduceMotion());
}
