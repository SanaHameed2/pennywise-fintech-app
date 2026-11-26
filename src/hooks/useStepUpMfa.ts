// src/hooks/useStepUpMfa.ts
// Step-up authentication for large transfers. The server does the real check (fresh TOTP in the
// signed JWT); this hook only performs the challenge so the session is upgraded to aal2.
import { useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export type MfaVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'not_enrolled' | 'invalid_code' | 'error' };

const FRESH_FOR_MS = 4 * 60 * 1000; // server window is 5 min; stay safely inside it

export function useStepUpMfa() {
  const verifiedAt = useRef<number | null>(null);

  const isFresh = useCallback(
    () => verifiedAt.current !== null && Date.now() - verifiedAt.current < FRESH_FOR_MS,
    [],
  );

  const hasEnrolledFactor = useCallback(async (): Promise<boolean> => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return false;
    return (data?.totp?.length ?? 0) > 0;
  }, []);

  const verify = useCallback(async (code: string): Promise<MfaVerifyResult> => {
    try {
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) return { ok: false, reason: 'error' };
      const factor = factors?.totp?.[0];
      if (!factor) return { ok: false, reason: 'not_enrolled' };

      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
      if (error) {
        return { ok: false, reason: /invalid|expired/i.test(error.message) ? 'invalid_code' : 'error' };
      }
      verifiedAt.current = Date.now();
      return { ok: true };
    } catch {
      return { ok: false, reason: 'error' };
    }
  }, []);

  const reset = useCallback(() => { verifiedAt.current = null; }, []);

  return { isFresh, verify, hasEnrolledFactor, reset };
}
