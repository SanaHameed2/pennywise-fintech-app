// src/app/pages/TransactionHistory.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, Search, Loader2, AlertCircle } from 'lucide-react';
import { useTransactions, PAGE_SIZE, FilterType, DateRange } from '../../hooks/useTransactions';
import { TransactionRow } from '../../components/transactions/TransactionRow';
import { TransactionFilters } from '../../components/transactions/TransactionFilters';
import { TransactionPagination } from '../../components/transactions/TransactionPagination';
import { TransactionExport } from '../../components/transactions/TransactionExport';
import Footer from '../components/Footer';

export default function TransactionHistory() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');

  const { data, isLoading, isFetching, isError, error } = useTransactions({
    page,
    searchQuery,
    filterType,
    dateRange,
  });

  useEffect(() => {
    let cancelled = false;
    const reset = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setPage(0);
    };
    void reset();
    return () => { cancelled = true; };
  }, [searchQuery, filterType, dateRange]);

  const transactions = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasActiveFilters = searchQuery !== '' || filterType !== 'all' || dateRange !== 'all';

  return (
    <div className="min-h-screen bg-[#050507] text-white pt-28 pb-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-6">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-7 h-7 text-[#FF7F50]" /> {t('transactions.title')}
            </h1>
            <p className="text-sm text-white/50 mt-1">
              {t('transactions.showing', { count: totalCount })}{' '}
              {hasActiveFilters && t('transactions.filtered')}
            </p>
          </div>
          <TransactionExport
            searchQuery={searchQuery}
            filterType={filterType}
            dateRange={dateRange}
            disabled={transactions.length === 0}
          />
        </motion.div>

        <TransactionFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <div className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#FF7F50]" />
              <p>{t('transactions.loading')}</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-400">
              <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
              <p>{t('transactions.error')}</p>
              <p className="text-xs mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p>{t('transactions.noResults')}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}

          {totalCount > PAGE_SIZE && (
            <TransactionPagination
              page={page}
              totalPages={totalPages}
              isFetching={isFetching}
              onPrev={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}