// src/hooks/useInsights.ts
// Real dashboard data (cash-flow, closing balance per month, spending by category) from the server.
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export interface CashflowMonth {
  month: string;            // "YYYY-MM" (Asia/Karachi)
  income: number;
  expenses: number;
  net: number;
  closing_balance: number;
}
export interface CategorySpend { category: string; amount: number }
export interface Insights {
  currency: string;
  months: number;
  balance: number;
  cashflow: CashflowMonth[];
  categories: CategorySpend[];
  totals: { income: number; expenses: number; net: number; savings_rate: number | null };
  generated_at: string;
}

const num = (v: unknown) => Number(v) || 0;

export function normalizeInsights(raw: any): Insights {
  return {
    currency: raw?.currency ?? 'PKR',
    months: num(raw?.months),
    balance: num(raw?.balance),
    cashflow: (raw?.cashflow ?? []).map((m: any) => ({
      month: String(m.month), income: num(m.income), expenses: num(m.expenses),
      net: num(m.net), closing_balance: num(m.closing_balance),
    })),
    categories: (raw?.categories ?? []).map((c: any) => ({ category: String(c.category), amount: num(c.amount) })),
    totals: {
      income: num(raw?.totals?.income), expenses: num(raw?.totals?.expenses), net: num(raw?.totals?.net),
      savings_rate: raw?.totals?.savings_rate === null || raw?.totals?.savings_rate === undefined
        ? null : num(raw.totals.savings_rate),
    },
    generated_at: String(raw?.generated_at ?? ''),
  };
}

export function useInsights(months = 6) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['insights', user?.id, months],
    enabled: Boolean(user?.id),
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_insights', { p_months: months });
      if (error) throw new Error(error.message);
      return normalizeInsights(data);
    },
  });
}
