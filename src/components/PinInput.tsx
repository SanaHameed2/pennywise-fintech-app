// src/components/PinInput.tsx
// Accessible N-digit code input (PIN / authenticator code). One real <input> per digit, with
// per-digit labels, paste support, arrow/backspace navigation and numeric mobile keyboard.
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  length?: number;
  masked?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  focusOnMount?: boolean;
  describedBy?: string;
  autoComplete?: 'off' | 'one-time-code' | 'current-password' | 'new-password';
  onComplete?: (value: string) => void;
}

export function PinInput({
  value, onChange, label, length = 6, masked = false, disabled = false, invalid = false,
  focusOnMount = false, describedBy, autoComplete = 'off', onComplete,
}: PinInputProps) {
  const { t } = useTranslation();
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (focusOnMount) refs.current[0]?.focus();
  }, [focusOnMount]);

  const commit = useCallback((next: string) => {
    onChange(next);
    if (next.length === length) onComplete?.(next);
  }, [length, onChange, onComplete]);

  const setDigit = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, '');
    if (!clean) {
      commit(value.slice(0, index) + value.slice(index + 1));
      return;
    }
    // typing (or paste of several digits) fills this box and the following ones
    const next = (value.slice(0, index) + clean + value.slice(index + 1)).slice(0, length);
    commit(next);
    refs.current[Math.min(index + clean.length, length - 1)]?.focus();
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      commit(value.slice(0, index - 1) + value.slice(index));
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault(); refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault(); refs.current[index + 1]?.focus();
    }
  };

  return (
    // dir="ltr": digits keep their order even when the page is right-to-left (Urdu)
    <div role="group" aria-label={label} dir="ltr" className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type={masked ? 'password' : 'text'}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length}  // allows pasting a whole code into one box; setDigit trims it
          autoComplete={i === 0 ? autoComplete : 'off'}
          value={digit}
          disabled={disabled}
          aria-label={t('common.digitOf', { n: i + 1, total: length })}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onFocus={(e) => e.currentTarget.select()}
          className={`w-10 h-12 sm:w-11 sm:h-14 text-center text-xl font-bold rounded-xl border-2 bg-white/5 text-white
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]/60 disabled:opacity-50
            ${invalid ? 'border-red-400' : 'border-white/25 focus:border-[#FF7F50]'}`}
        />
      ))}
    </div>
  );
}
