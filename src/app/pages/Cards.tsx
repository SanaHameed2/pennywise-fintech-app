// src/app/pages/Cards.tsx
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  CreditCard, Lock, Unlock, Plus, Trash2,
  ShoppingBag, Coffee, Plane, Gamepad2, Utensils, AlertCircle,
  DollarSign, TrendingUp,
  ArrowUpRight, ArrowDownRight,
  Shield, Wallet,
  ChevronRight
} from 'lucide-react';
import { formatMoney } from '../../utils/money';

interface VirtualCard {
  id: number;
  label: string;
  number: string;
  expiry: string;
  cvv: string;
  balance: number;
  limit: number;
  spent: number;
  locked: boolean;
  color: string;
  bgGradient: string;
  category: string;
  icon: React.ElementType;
}

interface CardPreset {
  label: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
}

const INITIAL_CARDS: VirtualCard[] = [
  { id: 1, label: 'shopping', number: '4242 •••• •••• 1234', expiry: '09/28', cvv: '412', balance: 500, limit: 500, spent: 213.45, locked: false, color: 'from-violet-600 to-indigo-500', bgGradient: 'bg-gradient-to-br from-violet-600 to-indigo-500', category: 'shopping', icon: ShoppingBag },
  { id: 2, label: 'travel', number: '5353 •••• •••• 5678', expiry: '12/27', cvv: '937', balance: 2000, limit: 2000, spent: 1540.20, locked: false, color: 'from-sky-500 to-cyan-400', bgGradient: 'bg-gradient-to-br from-sky-500 to-cyan-400', category: 'travel', icon: Plane },
  { id: 3, label: 'dining', number: '4111 •••• •••• 9012', expiry: '06/26', cvv: '258', balance: 150, limit: 150, spent: 88.75, locked: true, color: 'from-amber-500 to-orange-400', bgGradient: 'bg-gradient-to-br from-amber-500 to-orange-400', category: 'dining', icon: Coffee },
  { id: 4, label: 'gaming', number: '5200 •••• •••• 3456', expiry: '03/29', cvv: '741', balance: 300, limit: 300, spent: 45.99, locked: false, color: 'from-rose-500 to-pink-400', bgGradient: 'bg-gradient-to-br from-rose-500 to-pink-400', category: 'gaming', icon: Gamepad2 },
];

const RECENT_TRANSACTIONS = [
  { id: 1, merchant: 'Amazon.in', date: 'Jun 21, 2025', amount: -42.99, time: '10:42 AM', category: 'Shopping' },
  { id: 2, merchant: 'Flipkart', date: 'Jun 25, 2025', amount: -129.50, time: '04:15 PM', category: 'Shopping' },
  { id: 3, merchant: 'Zara', date: 'Jun 23, 2025', amount: -89.75, time: '11:30 AM', category: 'Shopping' },
  { id: 4, merchant: 'Myntra', date: 'Jun 21, 2025', amount: -56.20, time: '09:18 PM', category: 'Shopping' },
  { id: 5, merchant: 'Refund from Amazon', date: 'Jun 20, 2025', amount: 42.99, time: '02:33 PM', category: 'Refund' },
];

const SpendBar = React.memo(({ spent, limit, locked }: { spent: number; limit: number; locked: boolean }) => {
  const { t } = useTranslation();
  const pct = Math.min((spent / limit) * 100, 100);
  const danger = pct > 85;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{t('cards.spent')}: Rs. {formatMoney(spent)}</span>
        <span>{t('cards.limit')}: Rs. {formatMoney(limit)}</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            locked ? 'bg-white/20' :
            danger ? 'bg-red-500' : 'bg-[#FF7F50]'
          }`}
        />
      </div>
    </div>
  );
});
SpendBar.displayName = 'SpendBar';

const CardFront = React.memo(({ card, onFlip }: { card: VirtualCard; onFlip: () => void }) => {
  const { t } = useTranslation();
  const Icon = card.icon;
  return (
    <div
      className={`relative ${card.bgGradient} rounded-2xl p-5 text-white cursor-pointer select-none h-44 flex flex-col justify-between shadow-xl`}
      onClick={onFlip}
    >
      {card.locked && (
        <div className="absolute inset-0 rounded-2xl bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-1">
            <Lock className="w-8 h-8 text-white/90" />
            <span className="text-xs font-semibold text-white/90">{t('cards.cardLocked')}</span>
          </div>
        </div>
      )}
      <div className="flex justify-between items-start">
        <div className="w-10 h-7 rounded bg-white/20 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest opacity-80 bg-white/20 px-2 py-0.5 rounded-full">
          {t(`cards.${card.label}`)}
        </span>
      </div>
      <div>
        <p className="text-sm font-mono tracking-widest opacity-90 mb-0.5" dir="ltr">{card.number}</p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] opacity-60 uppercase">{t('cards.expires')}</p>
            <p className="text-sm font-semibold" dir="ltr">{card.expiry}</p>
          </div>
          <div className="text-end">
            <p className="text-[10px] opacity-60 uppercase">{t('cards.balance')}</p>
            <p className="text-base font-bold" dir="ltr">Rs. {formatMoney(card.limit - card.spent)}</p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 end-4 opacity-20">
        <CreditCard className="w-10 h-10" />
      </div>
    </div>
  );
});
CardFront.displayName = 'CardFront';

const CardBack = React.memo(({
  card, showCvv, onFlip, setShowCvv
}: {
  card: VirtualCard;
  showCvv: boolean;
  onFlip: () => void;
  setShowCvv: (val: boolean) => void;
}) => {
  const { t } = useTranslation();
  const handleToggleCvv = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCvv(!showCvv);
  }, [showCvv, setShowCvv]);

  return (
    <div
      className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl h-44 flex flex-col justify-between cursor-pointer select-none overflow-hidden"
      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      onClick={onFlip}
    >
      <div className="h-10 bg-black/30 mt-6 w-full" />
      <div className="px-5 pb-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-widest">{t('cards.cvv')}</span>
          <span className="font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-lg text-sm tracking-widest" dir="ltr">
            {showCvv ? card.cvv : '•••'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleToggleCvv}
            className="text-[10px] text-gray-500 hover:text-white transition-colors"
          >
            {showCvv ? t('cards.hideCvv') : t('cards.showCvv')}
          </button>
          <p className="text-[10px] text-gray-500">{t('cards.tapFlip')}</p>
        </div>
      </div>
    </div>
  );
});
CardBack.displayName = 'CardBack';

const FlipCard = React.memo(({
  card, onToggleLock, onDelete
}: {
  card: VirtualCard;
  onToggleLock: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleToggleLock = useCallback(() => {
    onToggleLock(card.id);
  }, [card.id, onToggleLock]);

  const handleDelete = useCallback(() => {
    onDelete(card.id);
    setConfirmDelete(false);
  }, [card.id, onDelete]);

  const handleFlip = useCallback(() => {
    setFlipped(prev => !prev);
  }, []);

  return (
    <div className="flex-shrink-0 w-72 space-y-3">
      <div className="relative h-44" style={{ perspective: '1000px' }}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 100, damping: 15 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full"
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
            <CardFront card={card} onFlip={handleFlip} />
          </div>
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <CardBack card={card} showCvv={showCvv} onFlip={handleFlip} setShowCvv={setShowCvv} />
          </div>
        </motion.div>
      </div>

      <div className="bg-[#0d0d12] rounded-xl border border-white/[0.06] p-3 space-y-3">
        <SpendBar spent={card.spent} limit={card.limit} locked={card.locked} />

        {card.spent / card.limit > 0.85 && !card.locked && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> {t('cards.approachingLimit')}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleToggleLock}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              card.locked
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-[#FF7F50]/10 text-[#FF7F50] border border-[#FF7F50]/20 hover:bg-[#FF7F50]/20'
            }`}
          >
            {card.locked ? <><Unlock className="w-3.5 h-3.5" /> {t('cards.unlock')}</> : <><Lock className="w-3.5 h-3.5" /> {t('cards.lock')}</>}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="p-2 rounded-lg border border-white/10 text-gray-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 space-y-2"
          >
            <p className="text-xs font-semibold text-red-400">{t('cards.deleteConfirm')}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-white hover:bg-white/5">{t('cards.cancel')}</button>
              <button type="button" onClick={handleDelete} className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600">{t('cards.delete')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
FlipCard.displayName = 'FlipCard';

const StatCard = React.memo(({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) => {
  return (
    <div className="bg-[#0d0d12] rounded-xl border border-white/[0.06] p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-[#FF7F50]" />
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">{label}</p>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
});
StatCard.displayName = 'StatCard';

const TransactionItem = React.memo(({ transaction }: { transaction: typeof RECENT_TRANSACTIONS[0] }) => {
  const isPositive = transaction.amount > 0;
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#FF7F50]/10 text-[#FF7F50]'
        }`}>
          {isPositive ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{transaction.merchant}</p>
          <p className="text-xs text-gray-500">{transaction.date} • {transaction.time}</p>
        </div>
      </div>
      <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-white'}`}>
        {isPositive ? '+' : ''} Rs. {formatMoney(Math.abs(transaction.amount))}
      </span>
    </div>
  );
});
TransactionItem.displayName = 'TransactionItem';

const BudgetItem = React.memo(({ card }: { card: VirtualCard }) => {
  const { t } = useTranslation();
  const Icon = card.icon;
  const pct = Math.min((card.spent / card.limit) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg ${card.bgGradient} flex items-center justify-center`}>
            <Icon className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-medium text-white">{t(`cards.${card.label}`)}</span>
          {card.locked && <Lock className="w-3 h-3 text-gray-500" />}
        </div>
        <span className="text-xs text-gray-400">Rs. {formatMoney(card.spent)} / Rs. {formatMoney(card.limit)}</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            card.locked ? 'bg-white/20' : pct > 85 ? 'bg-red-500' : 'bg-[#FF7F50]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
});
BudgetItem.displayName = 'BudgetItem';

const CARD_PRESETS: CardPreset[] = [
  { label: 'shopping', icon: ShoppingBag, color: 'from-violet-600 to-indigo-500', bgGradient: 'bg-gradient-to-br from-violet-600 to-indigo-500' },
  { label: 'dining', icon: Utensils, color: 'from-emerald-500 to-teal-400', bgGradient: 'bg-gradient-to-br from-emerald-500 to-teal-400' },
  { label: 'travel', icon: Plane, color: 'from-sky-500 to-cyan-400', bgGradient: 'bg-gradient-to-br from-sky-500 to-cyan-400' },
  { label: 'gaming', icon: Gamepad2, color: 'from-purple-600 to-pink-500', bgGradient: 'bg-gradient-to-br from-purple-600 to-pink-500' },
];

const CardPresetButton = React.memo(({
  preset,
  index,
  selected,
  onSelect
}: {
  preset: CardPreset;
  index: number;
  selected: boolean;
  onSelect: (index: number) => void;
}) => {
  const { t } = useTranslation();
  const Icon = preset.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
        selected ? 'border-[#FF7F50] scale-105' : 'border-white/10 hover:border-[#FF7F50]/50'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg ${preset.bgGradient} flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-[9px] text-gray-400">{t(`cards.${preset.label}`)}</span>
    </button>
  );
});
CardPresetButton.displayName = 'CardPresetButton';

function NewCardModal({ onClose, onAdd }: { onClose: () => void; onAdd: (card: VirtualCard) => void }) {
  const { t } = useTranslation();
  const [label, setLabel] = useState('');
  const [limit, setLimit] = useState('');
  const [preset, setPreset] = useState(0);
  const [error, setError] = useState('');

  const handleCreate = useCallback(() => {
    if (!label.trim()) { setError(t('cards.cardLabelError')); return; }
    if (!limit || isNaN(Number(limit)) || Number(limit) <= 0) { setError(t('cards.limitError')); return; }
    const p = CARD_PRESETS[preset];
    const Icon = p.icon;
    const newCard: VirtualCard = {
      id: Date.now(),
      label: label.trim(),
      number: `4000 •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`,
      expiry: `${String(Math.ceil(Math.random() * 12)).padStart(2, '0')}/2${8 + Math.floor(Math.random() * 2)}`,
      cvv: String(Math.floor(100 + Math.random() * 900)),
      balance: Number(limit),
      limit: Number(limit),
      spent: 0,
      locked: false,
      color: p.color,
      bgGradient: p.bgGradient,
      category: p.label,
      icon: Icon,
    };
    onAdd(newCard);
    onClose();
  }, [label, limit, preset, onAdd, onClose, t]);

  const handlePresetSelect = useCallback((index: number) => {
    setPreset(index);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-5 text-white"
      >
        <h3 className="text-lg font-semibold text-white">{t('cards.createCardTitle')}</h3>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('cards.cardLabel')}</label>
          <input
            type="text"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setError(''); }}
            placeholder="e.g. Groceries, Subscriptions…"
            className={`w-full px-3 py-2.5 rounded-xl border bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF7F50]/20 transition ${
              error && !label.trim() ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-[#FF7F50]'
            }`}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('cards.spendingLimit')}</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => { setLimit(e.target.value); setError(''); }}
            placeholder="0.00"
            className={`w-full px-3 py-2.5 rounded-xl border bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF7F50]/20 transition ${
              error && (!limit || Number(limit) <= 0) ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-[#FF7F50]'
            }`}
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Card Style</label>
          <div className="grid grid-cols-4 gap-2">
            {CARD_PRESETS.map((p, i) => (
              <CardPresetButton
                key={i}
                preset={p}
                index={i}
                selected={preset === i}
                onSelect={handlePresetSelect}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </p>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white hover:bg-white/5 transition-colors">{t('cards.cancel')}</button>
          <button type="button" onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-[#FF7F50] text-black text-sm font-semibold transition-colors hover:bg-[#ff8f66]">{t('cards.createCard')}</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Cards() {
  const { t } = useTranslation();
  const [cards, setCards] = useState<VirtualCard[]>(INITIAL_CARDS);
  const [showNewCard, setShowNewCard] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleLock = useCallback((id: number) => {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c)));
  }, []);

  const deleteCard = useCallback((id: number) => {
    setCards((cs) => cs.filter((c) => c.id !== id));
  }, []);

  const addCard = useCallback((card: VirtualCard) => {
    setCards((cs) => [...cs, card]);
  }, []);

  const totals = useMemo(() => {
    const totalLimit = cards.reduce((a, c) => a + c.limit, 0);
    const totalSpent = cards.reduce((a, c) => a + c.spent, 0);
    return { totalLimit, totalSpent, remaining: totalLimit - totalSpent };
  }, [cards]);

  const cardList = useMemo(() => {
    return cards.map((card) => (
      <motion.div
        key={card.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85, x: -20 }}
        transition={{ duration: 0.25 }}
        className="snap-start"
      >
        <FlipCard card={card} onToggleLock={toggleLock} onDelete={deleteCard} />
      </motion.div>
    ));
  }, [cards, toggleLock, deleteCard]);

  const statCards = useMemo(() => {
    return [
      { label: t('cards.totalCards'), value: String(cards.length), icon: CreditCard },
      { label: t('cards.totalLimit'), value: `Rs. ${formatMoney(totals.totalLimit)}`, icon: DollarSign },
      { label: t('cards.totalSpent'), value: `Rs. ${formatMoney(totals.totalSpent)}`, icon: TrendingUp },
      { label: t('cards.remaining'), value: `Rs. ${formatMoney(totals.remaining)}`, icon: Wallet },
    ];
  }, [cards.length, totals, t]);

  const transactionList = useMemo(() => {
    return RECENT_TRANSACTIONS.map((tx) => (
      <TransactionItem key={tx.id} transaction={tx} />
    ));
  }, []);

  const budgetItems = useMemo(() => {
    return cards.map((card) => (
      <BudgetItem key={card.id} card={card} />
    ));
  }, [cards]);

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative selection:bg-[#FF7F50]/20 antialiased font-sans">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#FF7F50]/10 to-transparent blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-[#FF7F50]/4 blur-[160px] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10 pt-28 pb-12">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{t('cards.title')}</h1>
            <p className="text-gray-400 mt-1">{t('cards.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewCard(true)}
            className="flex items-center gap-2 bg-[#FF7F50] text-black px-5 py-2.5 rounded-xl font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-[0_4px_20px_rgba(255,127,80,0.2)] hover:bg-[#ff8f66]"
          >
            <Plus className="w-4 h-4" /> {t('cards.newCard')}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
          ))}
        </motion.div>

        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 font-mono">
            {t('cards.virtualCards')} ({cards.length})
          </h2>
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
          >
            <AnimatePresence>
              {cardList}
            </AnimatePresence>

            <div className="flex-shrink-0 w-72 snap-start">
              <button
                type="button"
                onClick={() => setShowNewCard(true)}
                className="w-full h-44 rounded-xl border-2 border-dashed border-white/10 hover:border-[#FF7F50] hover:bg-[#FF7F50]/5 transition-all flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#FF7F50]"
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm font-semibold">{t('cards.addVirtualCard')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-[#0d0d12] rounded-xl border border-white/[0.06] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">{t('cards.recentTx')}</h3>
              <button className="text-xs text-gray-500 hover:text-[#FF7F50] transition-colors flex items-center gap-1">
                {t('cards.viewAll')} <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
            <div className="space-y-3">
              {transactionList}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0d0d12] rounded-xl border border-white/[0.06] p-6"
          >
            <h3 className="text-sm font-semibold text-white mb-4">{t('cards.budgetOverview')}</h3>
            <div className="space-y-4">
              {budgetItems}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500 font-mono text-center"
        >
          <Shield className="w-4 h-4 text-[#FF7F50]" />
          <span>{t('cards.securityMsg')}</span>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline">{t('cards.securitySub')}</span>
        </motion.div>

      </div>

      <AnimatePresence>
        {showNewCard && (
          <NewCardModal
            onClose={() => setShowNewCard(false)}
            onAdd={addCard}
          />
        )}
      </AnimatePresence>
    </div>
  );
}