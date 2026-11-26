// src/hooks/useTransactions.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export const PAGE_SIZE = 10;

export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  created_at: string;
  description: string | null;
  category: string | null;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  wallet_id: string | null;
  user_id: string;
}

export type FilterType = 'all' | 'income' | 'expense' | 'transfer';
export type DateRange = 'all' | 'today' | 'week' | 'month';

interface UseTransactionsProps {
  page: number;
  searchQuery?: string;
  filterType?: FilterType;
  dateRange?: DateRange;
}

export function applyFilters(
  query: any,
  searchQuery: string,
  filterType: FilterType,
  dateRange: DateRange
) {
  let q = query;
  if (searchQuery.trim()) {
    q = q.or(`description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
  }
  if (filterType !== 'all') {
    q = q.eq('type', filterType);
  }
  if (dateRange !== 'all') {
    const now = new Date();
    const startDate = new Date();
    if (dateRange === 'today') startDate.setHours(0, 0, 0, 0);
    else if (dateRange === 'week') startDate.setDate(now.getDate() - 7);
    else if (dateRange === 'month') startDate.setMonth(now.getMonth() - 1);
    q = q.gte('created_at', startDate.toISOString());
  }
  return q;
}

export function useTransactions({
  page,
  searchQuery = '',
  filterType = 'all',
  dateRange = 'all',
}: UseTransactionsProps) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', page, user?.id, searchQuery, filterType, dateRange],
    queryFn: async () => {
      if (!user) return { data: [], count: 0 };

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      query = applyFilters(query, searchQuery, filterType, dateRange);

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: (data || []) as Transaction[], count: count || 0 };
    },
    enabled: !!user,
    placeholderData: (previousData) => previousData,
  });
}

export async function fetchAllForExport(
  userId: string,
  searchQuery: string,
  filterType: FilterType,
  dateRange: DateRange
): Promise<Transaction[]> {
  let allData: Transaction[] = [];
  let from = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    query = applyFilters(query, searchQuery, filterType, dateRange);

    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0) {
      allData = [...allData, ...(data as Transaction[])];
      from += limit;
      if (data.length < limit) hasMore = false;
    } else {
      hasMore = false;
    }
  }
  return allData;
}