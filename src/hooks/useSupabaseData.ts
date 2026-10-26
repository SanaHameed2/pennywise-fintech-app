// src/hooks/useSupabaseData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

interface Wallet {
  id: string;
  balance: number;
  currency: string;
  wallet_type: string;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  status: string;
  created_at: string;
}

interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number;
  color: string;
}

export function useSupabaseData() {
  const { user } = useAuth();
  // ✅ Capture primitive userId so React Compiler can preserve memoization
  const userId = user?.id;

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtime, setIsRealtime] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!userId) {
      await Promise.resolve();
      setLoading(false);
      return;
    }

    try {
      await Promise.resolve();
      setError(null);

      const [walletResult, transactionsResult, budgetsResult, goalsResult] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('savings_goals').select('*').eq('user_id', userId),
      ]);

      if (walletResult.error) throw walletResult.error;
      if (transactionsResult.error) throw transactionsResult.error;
      if (budgetsResult.error) throw budgetsResult.error;
      if (goalsResult.error) throw goalsResult.error;

      setWallet(walletResult.data);
      setTransactions(transactionsResult.data || []);
      setBudgets(budgetsResult.data || []);
      setSavingsGoals(goalsResult.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]); // ✅ primitive dep — compiler can preserve memoization

  // ✅ Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('dashboard_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔴 Realtime update:', payload);
          setIsRealtime(true);
          void fetchAllData();
        }
      )
      .subscribe((status) => {
        console.log('🔴 Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchAllData]);

  // ✅ Initial fetch — async IIFE with cancellation guard
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await fetchAllData();
      if (cancelled) return;
    };

    void run();
    return () => { cancelled = true; };
  }, [fetchAllData]);

  return {
    wallet,
    transactions,
    budgets,
    savingsGoals,
    loading,
    error,
    isRealtime,
    refresh: fetchAllData,
  };
}