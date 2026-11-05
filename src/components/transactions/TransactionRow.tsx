import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';

import { formatMoney } from '../../utils/money';
import { Transaction } from '../../hooks/useTransactions';

const transactionConfig = {
  income: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', sign: '+' },
  expense: { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', sign: '-' },
  transfer: { icon: ArrowRightLeft, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', sign: '' },
} as const;

export function TransactionRow({ tx }: { tx: Transaction }) {
  const config = transactionConfig[tx.type] || transactionConfig.expense;
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${config.bg}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <p className="font-semibold text-white">{tx.description || tx.category || 'Transaction'}</p>
          <p className="text-xs text-white/40">
            {new Date(tx.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${config.color}`}>
          {config.sign} {tx.currency === 'PKR' ? 'Rs.' : tx.currency} {formatMoney(tx.amount)}
        </p>
        <p className="text-xs text-white/30 capitalize">{tx.status}</p>
      </div>
    </div>
  );
}