// src/app/components/SavingsGoalModal.tsx
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, AlertCircle, Loader2 } from 'lucide-react';
import { formatMoney, safeParseMoney } from '../../utils/money';
import { Modal } from '../../components/Modal';
import { errorKey, errorParams, type RpcFailure } from '../../lib/rpc';
import type { GoalMoveResult } from '../../hooks/useSupabaseData';

interface SavingsGoalModalProps {
  goal: any;
  walletBalance: number;
  onClose: () => void;
  onSuccess: () => void;
  contributeFn: (goalId: string, amount: number, idempotencyKey: string) => Promise<GoalMoveResult>;
  withdrawFn: (goalId: string, amount: number, idempotencyKey: string) => Promise<GoalMoveResult>;
}

export default function SavingsGoalModal({ goal, walletBalance, onClose, onSuccess, contributeFn, withdrawFn }: SavingsGoalModalProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'contribute' | 'withdraw'>('contribute');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  // one key per attempt: reused if the request is retried, replaced as soon as the inputs change
  const attemptKey = useRef(crypto.randomUUID());
  const saved = Number(goal.current_amount ?? goal.current ?? 0);

  const edit = (fn: () => void) => { attemptKey.current = crypto.randomUUID(); setError(''); fn(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = safeParseMoney(amount);
    if (!(value > 0)) { setError(t('savings.invalidAmount')); return; }
    if (action === 'contribute' && value > walletBalance) { setError(t('savings.insufficientFunds')); return; }
    if (action === 'withdraw' && value > saved) { setError(t('savings.exceedsGoalAmount')); return; }

    setIsProcessing(true);
    setError('');
    const result = await (action === 'contribute' ? contributeFn : withdrawFn)(goal.id, value, attemptKey.current);
    setIsProcessing(false);

    if (result.success) { onSuccess(); return; }
    const failure = result as RpcFailure;
    setError(t(errorKey(failure.code), errorParams(failure)));
  };

  return (
    <Modal open onClose={onClose} title={goal.name}>
      <div className="relative w-full bg-[#0D0D12] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-1" aria-hidden="true">{goal.name}</h2>
        <p className="text-sm text-white/70 mb-6">
          {t('savings.currentBalance')}: <bdi dir="ltr">Rs. {formatMoney(saved)}</bdi>
        </p>

        <div role="group" aria-label={t('savings.action')} className="flex bg-white/5 p-1 rounded-xl mb-6">
          {([['contribute', Plus, t('dashboard.contribute')], ['withdraw', Minus, t('dashboard.withdrawGoal')]] as const).map(([id, Icon, label]) => (
            <button key={id} type="button" aria-pressed={action === id} onClick={() => edit(() => setAction(id))}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                action === id ? 'bg-[#FF7F50] text-black shadow-md' : 'text-white/80 hover:text-white'}`}>
              <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="goal-amount" className="text-xs uppercase tracking-wider text-white/70 mb-1.5 block">
              {t('common.amount')} (Rs.)
            </label>
            <input id="goal-amount" type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={amount}
              aria-invalid={error ? true : undefined} aria-describedby={error ? 'goal-error goal-help' : 'goal-help'}
              onChange={(e) => edit(() => setAmount(e.target.value.replace(/[^\d.,]/g, '')))}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF7F50] focus-visible:ring-2 focus-visible:ring-[#FF7F50]/60 text-lg font-semibold" />
            <p id="goal-help" className="text-xs text-white/70 mt-1.5">
              {action === 'contribute'
                ? <>{t('transfer.availableBalance')}: <bdi dir="ltr">Rs. {formatMoney(walletBalance)}</bdi></>
                : <>{t('savings.savedInGoal')}: <bdi dir="ltr">Rs. {formatMoney(saved)}</bdi></>}
            </p>
          </div>

          {error && (
            <p id="goal-error" role="alert" className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 p-2.5 rounded-lg border border-red-500/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" /> {error}
            </p>
          )}

          <button type="submit" disabled={isProcessing || !amount} aria-busy={isProcessing}
            className="w-full py-3 rounded-xl bg-[#FF7F50] hover:bg-[#ff8f66] text-black font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> {t('transfer.processing')}</> : t('common.confirm')}
          </button>
        </form>
      </div>
    </Modal>
  );
}
