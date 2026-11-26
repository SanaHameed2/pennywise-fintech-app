import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '../../utils/money';
import { absAmount, directionOf, signSymbol } from '../../utils/transactions';
import { categoryLabel } from '../../utils/categories';
import type { Transaction } from '../../hooks/useTransactions';

// Direction (and therefore colour and sign) comes from the SIGN of the amount; `type` only picks the icon.
const style = {
  in:  { color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  out: { color: 'text-red-300',     bg: 'bg-red-500/10 border-red-500/20' },
} as const;

export function TransactionRow({ tx }: { tx: Transaction }) {
  const { t, i18n } = useTranslation();
  const dir = directionOf(tx.amount);
  const Icon = tx.type === 'transfer' ? ArrowRightLeft : dir === 'in' ? TrendingUp : TrendingDown;
  const { color, bg } = style[dir];
  const date = new Intl.DateTimeFormat(i18n.language.startsWith('ur') ? 'ur-PK' : 'en-PK', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(tx.created_at));
  const currency = tx.currency === 'PKR' || !tx.currency ? 'Rs.' : tx.currency;

  return (
    <div className="flex items-center justify-between gap-3 p-5 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <div aria-hidden="true" className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{tx.description || (tx.category ? categoryLabel(t, tx.category) : t('common.transaction'))}</p>
          <p className="text-xs text-white/70">{date}</p>
        </div>
      </div>
      <div className="text-end flex-shrink-0">
        <p className={`font-bold ${color}`}>
          <span className="sr-only">{dir === 'in' ? t('dashboard.moneyIn') : t('dashboard.moneyOut')}: </span>
          <bdi dir="ltr">{signSymbol(tx.amount)} {currency} {formatMoney(absAmount(tx.amount))}</bdi>
        </p>
        <p className="text-xs text-white/70 capitalize">{t(`common.${tx.status}`, { defaultValue: tx.status })}</p>
      </div>
    </div>
  );
}
