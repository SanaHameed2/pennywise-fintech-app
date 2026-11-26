// src/hooks/useTransactionPin.ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import { failureFromError, parseRpcResult, type RpcFailure } from '../lib/rpc';

export type PinResult = { success: true } | RpcFailure;

export function useTransactionPin() {
  const { user } = useAuth();
  const userId = user?.id;
  const [hasPin, setHasPin] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) { setHasPin(null); return; }
    const { data, error } = await supabase.rpc('has_transaction_pin');
    setHasPin(error ? null : Boolean(data));
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      await refresh();
    };
    void run();
    return () => { cancelled = true; };
  }, [refresh]);

  const savePin = useCallback(async (pin: string, currentPin?: string): Promise<PinResult> => {
    try {
      const { data, error } = await supabase.rpc('set_transaction_pin', {
        p_pin: pin,
        p_current_pin: currentPin ?? null,
      });
      if (error) return failureFromError(error);
      const result = parseRpcResult<{ success: true }>(data);
      if (result.success) setHasPin(true);
      return result;
    } catch (err) {
      return failureFromError(err);
    }
  }, []);

  return { hasPin, refresh, savePin };
}
