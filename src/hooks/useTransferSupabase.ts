// src/hooks/useTransferSupabase.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

interface Beneficiary {
  id: number;
  name: string;
  iban: string;
  bank: string;
  avatar: string;
}

export function useTransferSupabase() {
  const { user } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchBeneficiaries = async () => {
      if (!user) {
        await Promise.resolve();
        if (cancelled) return;
        setBeneficiaries([]);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        await Promise.resolve();
        if (cancelled) return;

        const { data, error } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (cancelled) return;
        if (error) throw error;

        setBeneficiaries(data || []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to load beneficiaries';
        setError(errorMessage);
        setBeneficiaries([]);
        console.error('Failed to load beneficiaries:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchBeneficiaries();
    return () => { cancelled = true; };
  }, [user]);

  const addBeneficiary = useCallback(async (name: string, iban: string, bank: string) => {
    if (!user) throw new Error('User not authenticated');
    if (isAdding) throw new Error('Already adding beneficiary');
    if (!name.trim() || !iban.trim() || !bank.trim()) throw new Error('All fields are required');

    // ✅ Day 16: Strict Pakistani IBAN Format Validation (24 chars)
    // Format: PK + 2 digits + 4 uppercase letters (Bank) + 16 digits
    const ibanRegex = /^PK\d{2}[A-Z]{4}\d{16}$/;
    const formattedIban = iban.trim().toUpperCase();

    if (!ibanRegex.test(formattedIban)) {
      throw new Error('Invalid Pakistani IBAN. Must be 24 characters (e.g., PK36SCBL0000001123456702).');
    }

    setIsAdding(true);
    setError(null);

    try {
      const avatar = name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      const { data, error } = await supabase
        .from('beneficiaries')
        .insert([{
          user_id: user.id,
          name: name.trim(),
          iban: formattedIban, // ✅ Save the uppercase formatted IBAN
          bank: bank.trim(),
          avatar: avatar || '??',
        }])
        .select()
        .single();

      if (error) throw error;

      const newBeneficiary: Beneficiary = {
        id: data.id,
        name: data.name,
        iban: data.iban,
        bank: data.bank,
        avatar: data.avatar || avatar || '??',
      };

      setBeneficiaries(prev => {
        const updated = [...prev, newBeneficiary];
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });

      return newBeneficiary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add beneficiary';
      setError(errorMessage);
      throw new Error(errorMessage, { cause: err });
    } finally {
      setIsAdding(false);
    }
  }, [user, isAdding]);

  const executeTransfer = useCallback(async (amount: number, recipientId: number, note: string) => {
    if (!user) throw new Error('User not authenticated');
    if (isExecuting) throw new Error('Transfer already in progress');
    if (amount <= 0) throw new Error('Amount must be greater than 0');

    const recipient = beneficiaries.find(b => b.id === recipientId);
    if (!recipient) throw new Error('Recipient not found');

    setIsExecuting(true);
    setError(null);

    try {
      // ✅ Generate a unique idempotency key for this specific request
      const idempotencyKey = crypto.randomUUID();

      // ✅ SECURE RPC CALL with Idempotency Key (Limits are handled inside DB)
      const { data, error: rpcError } = await supabase.rpc('execute_transfer', {
        p_amount: amount,
        p_recipient_id: recipientId,
        p_recipient_name: recipient.name,
        p_note: note || null,
        p_idempotency_key: idempotencyKey,
      });

      if (rpcError) {
        // This will catch the Daily Limit or Per-Transaction Limit errors from DB
        throw new Error(rpcError.message);
      }

      // Data comes back from RPC as a JSON object
      const rpcData = data as { success: boolean; new_balance: number };

      return {
        data: {
          success: true,
          transaction_id: Date.now(),
          new_balance: rpcData.new_balance,
          amount: amount,
          recipient: recipient.name,
        },
        error: null,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setIsExecuting(false);
    }
  }, [user, beneficiaries, isExecuting]);

  return {
    beneficiaries,
    loading,
    error,
    isAdding,
    isExecuting,
    addBeneficiary,
    executeTransfer,
  };
}