// src/app/pages/TransactionHistory.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { formatMoney } from '../../utils/money';
import Footer from '../components/Footer';

const PAGE_SIZE = 10;

export default function TransactionHistory() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching } = useTransactions(page);

  const transactions = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#050507] text-white pt-28 pb-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-6">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-7 h-7 text-[#FF7F50]" /> Transaction History
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Showing page {page + 1} of {totalPages || 1} ({totalCount} total transactions)
          </p>
        </motion.div>

        {/* List */}
        <div className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#FF7F50]" />
              <p>Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <Calendar className="w-12 h-12 mb-4 opacity-50" />
              <p>No transactions found.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {transactions.map((tx: any) => {
                const isIncome = tx.type === 'income';
                const Icon = isIncome ? TrendingUp : TrendingDown;

                return (
                  <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        isIncome ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
                      }`}>
                        <Icon className={`w-5 h-5 ${isIncome ? 'text-emerald-400' : 'text-red-400'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{tx.description || tx.category}</p>
                        <p className="text-xs text-white/40">
                          {new Date(tx.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isIncome ? '+' : '-'} Rs. {formatMoney(tx.amount)}
                      </p>
                      <p className="text-xs text-white/30 capitalize">{tx.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t border-white/[0.06] bg-white/[0.01]">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || isFetching}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            
            <span className="text-sm text-white/40 font-mono">
              Page {page + 1} / {totalPages || 1}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isFetching}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}