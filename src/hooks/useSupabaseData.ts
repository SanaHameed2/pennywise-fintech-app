// src/hooks/useSupabaseData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

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

const CATEGORY_COLORS: Record<string, string> = {
  'Food': '#FF7F50',
  'Transport': '#A78BFA',
  'Shopping': '#34D399',
  'Bills': '#F59E0B',
  'Salary': '#10B981',
  'Freelance': '#3B82F6',
  'Transfer': '#EF4444',
  'Others': '#6B7280',
};

export function useSupabaseData() {
  const { user } = useAuth();
  // ✅ Capture primitive so useCallback deps match inferred deps
  const userId = user?.id;

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [walletResult, txResult, budgetsResult, goalsResult] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('savings_goals').select('*').eq('user_id', userId),
      ]);

      if (walletResult.data) setWallet(walletResult.data);
      if (txResult.data) setTransactions(txResult.data);
      if (budgetsResult.data) setBudgets(budgetsResult.data);
      if (goalsResult.data) setSavingsGoals(goalsResult.data);

      const { data: expenses } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('user_id', userId)
        .eq('type', 'expense');

      if (expenses) {
        const categoryMap: Record<string, number> = {};
        let totalExpense = 0;

        expenses.forEach((tx) => {
          const cat = tx.category || 'Others';
          const amt = Math.abs(Number(tx.amount));
          categoryMap[cat] = (categoryMap[cat] || 0) + amt;
          totalExpense += amt;
        });

        const derivedCategories = Object.keys(categoryMap)
          .map((cat) => ({
            name: cat,
            amount: categoryMap[cat],
            percentage: totalExpense > 0 ? Math.round((categoryMap[cat] / totalExpense) * 100) : 0,
            color: CATEGORY_COLORS[cat] || CATEGORY_COLORS['Others'],
          }))
          .sort((a, b) => b.amount - a.amount);

        setExpenseCategories(derivedCategories);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [userId]);  // ✅ matches inferred primitive dep

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await Promise.resolve();
      if (cancelled) return;
      await fetchAllData();
    };
    void init();
    return () => { cancelled = true; };
  }, [fetchAllData]);

  // ✅ Contribute to Savings Goal (RPC)
  const contributeToGoal = useCallback(async (goalId: string, amount: number) => {
    if (!userId) throw new Error('Not authenticated');
    const idempotencyKey = crypto.randomUUID();
    const { data, error: rpcError } = await supabase.rpc('contribute_to_goal', {
      p_goal_id: goalId,
      p_amount: amount,
      p_idempotency_key: idempotencyKey,
    });
    if (rpcError) throw new Error(rpcError.message);
    await fetchAllData();
    return data as { success: boolean; new_wallet_balance: number; new_goal_amount: number };
  }, [userId, fetchAllData]);

  // ✅ Withdraw from Savings Goal (RPC)
  const withdrawFromGoal = useCallback(async (goalId: string, amount: number) => {
    if (!userId) throw new Error('Not authenticated');
    const idempotencyKey = crypto.randomUUID();
    const { data, error: rpcError } = await supabase.rpc('withdraw_from_goal', {
      p_goal_id: goalId,
      p_amount: amount,
      p_idempotency_key: idempotencyKey,
    });
    if (rpcError) throw new Error(rpcError.message);
    await fetchAllData();
    return data as { success: boolean; new_wallet_balance: number; new_goal_amount: number };
  }, [userId, fetchAllData]);

  return {
    wallet,
    transactions,
    budgets,
    savingsGoals,
    expenseCategories,
    loading,
    error,
    refresh: fetchAllData,
    contributeToGoal,
    withdrawFromGoal,
  };
}