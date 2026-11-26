// src/components/transactions/TransactionFilters.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Calendar, X } from 'lucide-react';
import type { FilterType, DateRange } from '../../hooks/useTransactions';

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterType: FilterType;
  setFilterType: (t: FilterType) => void;
  dateRange: DateRange;
  setDateRange: (d: DateRange) => void;
}

const control =
  'w-full py-2.5 rounded-lg border border-white/15 bg-white/5 text-sm text-white focus:outline-none focus:border-[#FF7F50] ' +
  'focus-visible:ring-2 focus-visible:ring-[#FF7F50]/60 transition-colors';
const TYPES: FilterType[] = ['all', 'income', 'expense', 'transfer'];
const RANGES: DateRange[] = ['all', 'today', 'week', 'month'];

export function TransactionFilters({ searchQuery, setSearchQuery, filterType, setFilterType, dateRange, setDateRange }: Props) {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce typing; setState happens inside the timer callback, not synchronously in the effect body.
  useEffect(() => {
    const timer = setTimeout(() => { setSearchQuery(localSearch); }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // Keep the box in step when the parent clears the query (deferred so the effect stays rule-safe).
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      await Promise.resolve();
      if (!cancelled) setLocalSearch(searchQuery);
    };
    void sync();
    return () => { cancelled = true; };
  }, [searchQuery]);

  const hasActiveFilters = searchQuery !== '' || filterType !== 'all' || dateRange !== 'all';

  const clearFilters = () => {
    setLocalSearch('');
    setSearchQuery('');
    setFilterType('all');
    setDateRange('all');
  };

  return (
    <form role="search" aria-label={t('transactions.filters')} onSubmit={(e) => e.preventDefault()}
      className="bg-[#0d0d12] border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <label htmlFor="tx-search" className="sr-only">{t('transactions.searchLabel')}</label>
        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" aria-hidden="true" />
        <input id="tx-search" type="search" autoComplete="off" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={t('transactions.searchPlaceholder')} className={`${control} ps-10 pe-4 placeholder:text-white/50`} />
      </div>

      <div className="relative">
        <label htmlFor="tx-type" className="sr-only">{t('transactions.typeLabel')}</label>
        <Filter className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" aria-hidden="true" />
        <select id="tx-type" value={filterType} onChange={(e) => setFilterType(e.target.value as FilterType)}
          className={`${control} sm:w-44 appearance-none ps-10 pe-8 cursor-pointer`}>
          {TYPES.map((v) => <option key={v} value={v} className="bg-[#0d0d12]">{t(`transactions.type.${v}`)}</option>)}
        </select>
      </div>

      <div className="relative">
        <label htmlFor="tx-range" className="sr-only">{t('transactions.dateLabel')}</label>
        <Calendar className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" aria-hidden="true" />
        <select id="tx-range" value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)}
          className={`${control} sm:w-44 appearance-none ps-10 pe-8 cursor-pointer`}>
          {RANGES.map((v) => <option key={v} value={v} className="bg-[#0d0d12]">{t(`transactions.range.${v}`)}</option>)}
        </select>
      </div>

      {hasActiveFilters && (
        <button type="button" onClick={clearFilters}
          className="px-4 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300">
          <X className="w-4 h-4" aria-hidden="true" /> {t('transactions.clear')}
        </button>
      )}
    </form>
  );
}
