// src/hooks/useTransferSupabase.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import { normalizeIban, validatePkIban } from '../utils/iban';
import { failureFromError, parseRpcResult, type TransferResult, type TransferSuccess } from '../lib/rpc';

export interface Beneficiary {
  id: number;
  name: string;
  iban: string;
  bank: string;
  avatar?: string;
}

/** Validation problems the form can show next to the right field (translated by the caller). */
export class BeneficiaryError extends Error {
  constructor(public readonly code: 'required' | 'iban_format' | 'iban_checksum' | 'duplicate' | 'unknown', cause?: unknown) {
    super(code, { cause });
    this.name = 'BeneficiaryError';
  }
}

export interface ExecuteTransferInput {
  amount: number;
  beneficiaryId: number;
  note?: string;
  pin: string;
  /** One key per transfer *attempt*. Re-send the same key when retrying so the server can de-duplicate. */
  idempotencyKey: string;
}

export function useTransferSupabase() {
  const { user } = useAuth();
  const userId = user?.id;
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (!userId) {
        setBeneficiaries([]);
        setLoading(false);
        return;
      }
      try {
        const { data, error: dbError } = await supabase
          .from('beneficiaries')
          .select('id, name, iban, bank, avatar')
          .eq('user_id', userId)
          .order('name');
        if (cancelled) return;
        if (dbError) throw dbError;
        setBeneficiaries((data as Beneficiary[]) ?? []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setBeneficiaries([]);
        setError(err instanceof Error ? err.message : 'Failed to load beneficiaries');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [userId]);

  const addBeneficiary = useCallback(async (name: string, ibanInput: string, bank: string): Promise<Beneficiary> => {
    if (!userId) throw new BeneficiaryError('unknown');
    if (!name.trim() || !ibanInput.trim() || !bank.trim()) throw new BeneficiaryError('required');

    const problem = validatePkIban(ibanInput);
    if (problem === 'format') throw new BeneficiaryError('iban_format');
    if (problem === 'checksum') throw new BeneficiaryError('iban_checksum');

    setIsAdding(true);
    try {
      const iban = normalizeIban(ibanInput);
      const avatar = name.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';
      const { data, error: dbError } = await supabase
        .from('beneficiaries')
        .insert([{ user_id: userId, name: name.trim(), iban, bank: bank.trim(), avatar }])
        .select('id, name, iban, bank, avatar')
        .single();

      if (dbError) {
        throw new BeneficiaryError(dbError.code === '23505' ? 'duplicate' : 'unknown', dbError);
      }

      const created = data as Beneficiary;
      setBeneficiaries((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      return created;
    } finally {
      setIsAdding(false);
    }
  }, [userId]);

  /** Never throws: always resolves with a typed success or failure. */
  const executeTransfer = useCallback(async (input: ExecuteTransferInput): Promise<TransferResult> => {
    if (!userId) return { success: false, code: 'not_authenticated' };
    setIsExecuting(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('execute_transfer', {
        p_amount: input.amount,
        p_beneficiary_id: input.beneficiaryId,
        p_note: input.note?.trim() || null,
        p_idempotency_key: input.idempotencyKey,
        p_pin: input.pin,
      });
      if (rpcError) return failureFromError(rpcError);
      return parseRpcResult<TransferSuccess>(data);
    } catch (err) {
      return failureFromError(err);
    } finally {
      setIsExecuting(false);
    }
  }, [userId]);

  return { beneficiaries, loading, error, isAdding, isExecuting, addBeneficiary, executeTransfer };
}
