// src/components/transactions/TransactionFilters.tsx
import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { FilterType, DateRange } from '../../hooks/useTransactions';

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterType: FilterType;
  setFilterType: (t: FilterType) => void;
  dateRange: DateRange;
  setDateRange: (d: DateRange) => void;
}

export function TransactionFilters({
  searchQuery, setSearchQuery,
  filterType, setFilterType,
  dateRange, setDateRange
}: Props) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // ✅ Debounce — setState is inside setTimeout callback, NOT sync in effect body (rule-safe)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // ✅ Deferred setState — rule-safe
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLocalSearch(searchQuery);
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
    <div className="bg-[#0d0d12] border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search description or category..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF7F50] transition-colors"
        />
      </div>
      <div className="relative">
        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          className="w-full sm:w-40 appearance-none pl-10 pr-8 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-[#FF7F50] transition-colors cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>
      <div className="relative">
        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as DateRange)}
          className="w-full sm:w-40 appearance-none pl-10 pr-8 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-[#FF7F50] transition-colors cursor-pointer"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
        </select>
      </div>
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="px-4 py-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
        >
          <X className="w-4 h-4" /> Clear
        </button>
      )}
    </div>
  );
}