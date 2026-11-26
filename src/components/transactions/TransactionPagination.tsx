import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const btn =
  'flex items-center gap-1 px-4 py-2 rounded-lg border border-white/15 text-sm font-semibold text-white hover:bg-white/5 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]';

export function TransactionPagination({ page, totalPages, isFetching, onPrev, onNext }: Props) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t('transactions.pagination')} className="flex items-center justify-between p-4 border-t border-white/[0.06] bg-white/[0.01]">
      <button type="button" onClick={onPrev} disabled={page === 0 || isFetching} className={btn}>
        <ChevronLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" /> {t('transactions.previous')}
      </button>
      <span className="text-sm text-white/70" aria-live="polite">
        {t('transactions.pageOf', { page: page + 1, total: totalPages || 1 })}
      </span>
      <button type="button" onClick={onNext} disabled={page >= totalPages - 1 || isFetching} className={btn}>
        {t('transactions.next')} <ChevronRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
      </button>
    </nav>
  );
}
