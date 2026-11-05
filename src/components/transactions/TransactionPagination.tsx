import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function TransactionPagination({ page, totalPages, isFetching, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-between p-4 border-t border-white/[0.06] bg-white/[0.01]">
      <button
        onClick={onPrev}
        disabled={page === 0 || isFetching}
        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" /> Previous
      </button>
      <span className="text-sm text-white/40 font-mono">
        Page {page + 1} / {totalPages || 1}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages - 1 || isFetching}
        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}