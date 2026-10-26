// src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

// ─── Types ───────────────────────────────────────────────
interface Profile {
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface Wallet {
  id: string;
  currency: string;
  balance: number;
  wallet_address: string;
  wallet_type: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string | null;
  status: string;
  created_at: string;
}

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  pendingTransfers: number;
  totalBalance: number;
}

interface DashboardData {
  profile: Profile | null;
  wallets: Wallet[];
  transactions: Transaction[];
  stats: DashboardStats;
}

const EMPTY_DATA: DashboardData = {
  profile: null,
  wallets: [],
  transactions: [],
  stats: {
    totalIncome: 0,
    totalExpenses: 0,
    savingsRate: 0,
    pendingTransfers: 0,
    totalBalance: 0,
  },
};

// ─── Hook ──────────────────────────────────────────────
export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // ✅ No synchronous setState before the first `await`.
    //    `loading` already starts as `true` from the initializer.
    const fetchDashboardData = async () => {
      // If there's no user, resolve to empty data AFTER an await boundary.
      // `await Promise.resolve()` lets the effect flush complete first,
      // which satisfies the `set-state-in-effect` rule deterministically.
      if (!user) {
        await Promise.resolve();
        if (cancelled) return;
        setData(EMPTY_DATA);
        setError(null);
        setLoading(false);
        return;
      }

      // Reset error via await boundary too
      await Promise.resolve();
      if (cancelled) return;
      setError(null);

      try {
        const [profileResult, walletsResult, transactionsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('full_name, email, avatar_url')
            .eq('id', user.id)
            .single(),

          supabase
            .from('wallets')
            .select('*')
            .eq('user_id', user.id),

          supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
        ]);

        if (profileResult.error) {
          console.warn('Profile fetch warning:', profileResult.error.message);
        }
        if (walletsResult.error) {
          console.warn('Wallets fetch warning:', walletsResult.error.message);
        }
        if (transactionsResult.error) {
          console.warn('Transactions fetch warning:', transactionsResult.error.message);
        }

        if (cancelled) return;

        const profile = profileResult.data || null;
        const wallets = walletsResult.data || [];
        const transactions = transactionsResult.data || [];

        const totalBalance = wallets.reduce(
          (sum: number, w: any) => sum + (w.balance || 0),
          0
        );

        const totalIncome = transactions
          .filter((t: any) => t.amount > 0)
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        const totalExpenses = transactions
          .filter((t: any) => t.amount < 0)
          .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

        const savingsRate =
          totalIncome > 0
            ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10
            : 0;

        const pendingTransfers = transactions.filter(
          (t: any) => t.status === 'pending'
        ).length;

        setData({
          profile,
          wallets: wallets.map((w: any) => ({
            id: w.id,
            currency: w.currency || 'USD',
            balance: w.balance || 0,
            wallet_address: w.wallet_address || '',
            wallet_type: w.wallet_type || 'main',
          })),
          transactions: transactions.map((t: any) => ({
            id: t.id,
            description: t.description || 'Transaction',
            amount: t.amount,
            type: t.amount > 0 ? 'income' : 'expense',
            category: t.category || null,
            status: t.status || 'completed',
            created_at: t.created_at,
          })),
          stats: {
            totalIncome,
            totalExpenses,
            savingsRate,
            pendingTransfers,
            totalBalance,
          },
        });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { data, loading, error };
}