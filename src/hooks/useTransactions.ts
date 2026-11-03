// src/hooks/useTransactions.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

const PAGE_SIZE = 10; // Ek page par 10 transactions

export function useTransactions(page: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', page, user?.id],
    queryFn: async () => {
      if (!user) return { data: [], count: 0 };

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // ✅ Supabase range query for pagination
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' }) // Count exact rows for pagination
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    enabled: !!user,
    // Keeps previous data visible while fetching new page to avoid UI flicker
    placeholderData: (previousData) => previousData,
  });
}