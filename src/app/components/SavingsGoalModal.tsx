// src/components/SavingsGoalModal.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatMoney, safeParseMoney } from '../utils/money';

type Action = 'contribute' | 'withdraw';

interface SavingsGoal {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number;
}

interface Props {
  goal: SavingsGoal;
  walletBalance: number;
  onClose: () => void;
  onSuccess: () => void;
  contributeFn: (goalId: string, amount: number) => Promise<any>;
  withdrawFn: (goalId: string, amount: number) => Promise<any>;
  initialMode?: Action;   // ✅ new — passed from Dashboard's Contribute/Withdraw buttons
}

export function SavingsGoalModal({
  goal,
  walletBalance,
  onClose,
  onSuccess,
  contributeFn,
  withdrawFn,
  initialMode = 'contribute',
}: Props) {
  const [action, setAction] = useState<Action>(initialMode);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ Coerce DB numerics (Supabase returns NUMERIC as string) to real numbers
  const currentAmount = Number(goal.current_amount ?? 0);
  const targetAmount = Number(goal.target_amount ?? 0);
  const wallet = Number(walletBalance ?? 0);

  const maxAvailable = action === 'contribute' ? wallet : currentAmount;
  const goalFull = currentAmount >= targetAmount;

  const handleSubmit = async () => {
    setError('');
    const num = safeParseMoney(amount);

    if (!amount || isNaN(num) || num <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }
    if (num > maxAvailable) {
      setError(`Amount exceeds available Rs. ${formatMoney(maxAvailable)}.`);
      return;
    }

    setLoading(true);
    try {
      if (action === 'contribute') {
        await contributeFn(goal.id, num);
      } else {
        await withdrawFn(goal.id, num);
      }
      setSuccess(action === 'contribute' ? 'Contribution successful!' : 'Withdrawal successful!');
      setTimeout(() => {
        onSuccess();
        // onClose is called inside Dashboard's onSuccess → setSelectedGoal(null),
        // so we don't strictly need it here. Kept for safety.
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-6 w-full max-w-sm space-y-5 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-white/50"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <h3 className="text-lg font-semibold text-white">{goal.name}</h3>
          <p className="text-xs text-white/40 mt-1">
            Saved: Rs. {formatMoney(currentAmount)} / Rs. {formatMoney(targetAmount)}
          </p>
        </div>

        {/* Action toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl">
          <button
            onClick={() => { setAction('contribute'); setAmount(''); setError(''); }}
            disabled={goalFull}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${
              action === 'contribute' ? 'bg-emerald-500 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" /> Contribute
          </button>
          <button
            onClick={() => { setAction('withdraw'); setAmount(''); setError(''); }}
            disabled={currentAmount <= 0}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${
              action === 'withdraw' ? 'bg-orange-500 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            <Minus className="w-4 h-4" /> Withdraw
          </button>
        </div>

        {/* Amount input */}
        <div>
          <label className="text-xs text-white/50 mb-1.5 block">
            Amount (Available: Rs. {formatMoney(maxAvailable)})
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">Rs.</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#FF7F50] text-lg font-semibold"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {success}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#FF7F50] hover:bg-[#ff8f66] disabled:opacity-50 text-black font-bold py-3 rounded-xl transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Processing...' : action === 'contribute' ? 'Contribute' : 'Withdraw'}
        </button>
      </motion.div>
    </div>
  );
}