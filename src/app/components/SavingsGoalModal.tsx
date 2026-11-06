import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Plus, Minus, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
// ✅ FIXED PATH BELOW
import { formatMoney, safeParseMoney } from '../../utils/money'; 

interface SavingsGoalModalProps {
  goal: any;
  walletBalance: number;
  onClose: () => void;
  onSuccess: () => void;
  contributeFn: (goalId: string, amount: number) => Promise<any>;
  withdrawFn: (goalId: string, amount: number) => Promise<any>;
}

export default function SavingsGoalModal({
  goal,
  walletBalance,
  onClose,
  onSuccess,
  contributeFn,
  withdrawFn,
}: SavingsGoalModalProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'contribute' | 'withdraw'>('contribute');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = safeParseMoney(amount) || Number(amount);

    if (!numAmount || numAmount <= 0) {
      setError(t('savings.invalidAmount', 'Please enter a valid amount.'));
      return;
    }

    if (action === 'contribute' && numAmount > walletBalance) {
      setError(t('savings.insufficientFunds', 'Insufficient wallet balance.'));
      return;
    }

    if (action === 'withdraw') {
      const currentAmount = Number(goal.current_amount ?? goal.current ?? 0);
      if (numAmount > currentAmount) {
        setError(t('savings.exceedsGoalAmount', 'Amount exceeds goal balance.'));
        return;
      }
    }

    setIsProcessing(true);
    setError('');

    try {
      if (action === 'contribute') {
        await contributeFn(goal.id, numAmount);
      } else {
        await withdrawFn(goal.id, numAmount);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || t('savings.transactionFailed', 'Transaction failed. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm bg-[#0D0D12] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white bg-white/5 rounded-lg transition-colors rtl:left-4 rtl:right-auto"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">
          {goal.name}
        </h2>
        <p className="text-xs text-white/50 mb-6">
          {t('savings.currentBalance', 'Current Balance')}: Rs. {formatMoney(Number(goal.current_amount ?? goal.current ?? 0))}
        </p>

        <div className="flex bg-white/5 p-1 rounded-xl mb-6">
          <button
            onClick={() => { setAction('contribute'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              action === 'contribute' ? 'bg-[#FF7F50] text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> {t('dashboard.contribute', 'Contribute')}
          </button>
          <button
            onClick={() => { setAction('withdraw'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              action === 'withdraw' ? 'bg-[#FF7F50] text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <Minus className="w-3.5 h-3.5" /> {t('dashboard.withdrawGoal', 'Withdraw')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">
              {t('common.amount', 'Amount')} (Rs.)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF7F50] focus:ring-1 focus:ring-[#FF7F50] transition-all text-lg font-semibold"
            />
            {action === 'contribute' && (
              <p className="text-[10px] text-white/40 mt-1.5">
                {t('transfer.availableBalance', 'Available Balance')}: Rs. {formatMoney(walletBalance)}
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing || !amount}
            className="w-full py-3 rounded-xl bg-[#FF7F50] hover:bg-[#ff8f66] text-black font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t('transfer.processing', 'Processing…')}
              </>
            ) : (
              t('common.confirm', 'Confirm')
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}