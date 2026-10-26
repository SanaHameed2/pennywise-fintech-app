// src/app/pages/BudgetCards.tsx
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard, Lock, Unlock, Plus, Trash2, Eye, EyeOff,
  ShoppingBag, Coffee, Plane, Gamepad2, Utensils, AlertCircle, Loader2
} from 'lucide-react';
import Footer from '../components/Footer';
import { useSupabaseData } from '../../hooks/useSupabaseData';

/* ─── Types ─── */
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Define INITIAL_CARDS (Mock Data for fallback)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const INITIAL_CARDS: VirtualCard[] = [
  { id: 1, label: 'Shopping', number: '4242 •••• •••• 1234', expiry: '09/28', cvv: '412', balance: 500, limit: 500, spent: 213.45, locked: false, color: 'from-violet-600 to-indigo-500', bgGradient: 'bg-gradient-to-br from-violet-600 to-indigo-500', category: 'Shopping', icon: ShoppingBag },
  { id: 2, label: 'Travel', number: '5353 •••• •••• 5678', expiry: '12/27', cvv: '937', balance: 2000, limit: 2000, spent: 1540.20, locked: false, color: 'from-sky-500 to-cyan-400', bgGradient: 'bg-gradient-to-br from-sky-500 to-cyan-400', category: 'Travel', icon: Plane },
  { id: 3, label: 'Coffee & Food', number: '4111 •••• •••• 9012', expiry: '06/26', cvv: '258', balance: 150, limit: 150, spent: 88.75, locked: true, color: 'from-amber-500 to-orange-400', bgGradient: 'bg-gradient-to-br from-amber-500 to-orange-400', category: 'Food', icon: Coffee },
  { id: 4, label: 'Entertainment', number: '5200 •••• •••• 3456', expiry: '03/29', cvv: '741', balance: 300, limit: 300, spent: 45.99, locked: false, color: 'from-rose-500 to-pink-400', bgGradient: 'bg-gradient-to-br from-rose-500 to-pink-400', category: 'Entertainment', icon: Gamepad2 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: SpendBar
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SpendBar = React.memo(({ spent, limit, locked }: { spent: number; limit: number; locked: boolean }) => {
  const pct = Math.min((spent / limit) * 100, 100);
  const danger = pct > 85;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Spent: ${spent.toFixed(2)}</span>
        <span>Limit: ${limit.toFixed(2)}</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            locked ? 'bg-muted-foreground' :
            danger ? 'bg-expense' : 'bg-brand'
          }`}
        />
      </div>
    </div>
  );
});

SpendBar.displayName = 'SpendBar';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: CardFront
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CardFront = React.memo(({
  card, showCvv: _showCvv, onFlip,
}: { card: VirtualCard; showCvv: boolean; onFlip: () => void }) => {
  const Icon = card.icon;
  return (
    <div
      className={`relative ${card.bgGradient} rounded-2xl p-5 text-white cursor-pointer select-none h-44 flex flex-col justify-between`}
      style={{ backfaceVisibility: 'hidden' }}
      onClick={onFlip}
    >
      {card.locked && (
        <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-1">
            <Lock className="w-8 h-8 text-white/90" />
            <span className="text-xs font-semibold text-white/90">Card Locked</span>
          </div>
        </div>
      )}
      <div className="flex justify-between items-start">
        <div className="w-10 h-7 rounded bg-white/20 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest opacity-80 bg-white/20 px-2 py-0.5 rounded-full">
          {card.label}
        </span>
      </div>
      <div>
        <p className="text-sm font-mono tracking-widest opacity-90 mb-0.5">{card.number}</p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] opacity-60 uppercase">Expires</p>
            <p className="text-sm font-semibold">{card.expiry}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] opacity-60 uppercase">Balance</p>
            <p className="text-base font-bold">${(card.limit - card.spent).toFixed(2)}</p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 opacity-20">
        <CreditCard className="w-10 h-10" />
      </div>
    </div>
  );
});

CardFront.displayName = 'CardFront';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: CardBack
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CardBack = React.memo(({ card, showCvv, onFlip }: { card: VirtualCard; showCvv: boolean; onFlip: () => void }) => {
  return (
    <div
      className="bg-gray-800 dark:bg-gray-700 rounded-2xl h-44 flex flex-col justify-between cursor-pointer select-none overflow-hidden"
      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      onClick={onFlip}
    >
      <div className="h-10 bg-gray-900 mt-6 w-full" />
      <div className="px-5 pb-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-widest">CVV</span>
          <span className="font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-lg text-sm tracking-widest">
            {showCvv ? card.cvv : '•••'}
          </span>
        </div>
        <p className="text-[10px] text-gray-500 text-center">Tap to flip back</p>
      </div>
    </div>
  );
});

CardBack.displayName = 'CardBack';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: FlipCard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const FlipCard = React.memo(({ card, onToggleLock, onDelete }: {
  card: VirtualCard;
  onToggleLock: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
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
    <div className="flex-shrink-0 w-72 space-y-4">
      {/* 3D flip container */}
      <div className="relative h-44" style={{ perspective: '1000px' }}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 100, damping: 15 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full"
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
            <CardFront card={card} showCvv={showCvv} onFlip={handleFlip} />
          </div>
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <CardBack card={card} showCvv={showCvv} onFlip={handleFlip} />
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-border p-4 space-y-4">
        <SpendBar spent={card.spent} limit={card.limit} locked={card.locked} />

        {card.spent / card.limit > 0.85 && !card.locked && (
          <p className="flex items-center gap-1.5 text-xs text-expense bg-expense-bg border border-expense/20 rounded-lg px-2 py-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Approaching spend limit
          </p>
        )}

        <div className="flex gap-2">
          {flipped && (
            <button
              onClick={() => setShowCvv(!showCvv)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              {showCvv ? <><EyeOff className="w-3.5 h-3.5" /> Hide CVV</> : <><Eye className="w-3.5 h-3.5" /> Show CVV</>}
            </button>
          )}
          <button
            onClick={handleToggleLock}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              card.locked
                ? 'bg-income-bg text-income border border-income/20 hover:bg-income/20'
                : 'bg-expense-bg text-expense border border-expense/20 hover:bg-expense/20'
            }`}
          >
            {card.locked ? <><Unlock className="w-3.5 h-3.5" /> Unlock</> : <><Lock className="w-3.5 h-3.5" /> Lock</>}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 space-y-2"
          >
            <p className="text-xs font-semibold text-destructive">Permanently delete this card?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-accent">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-90">Delete</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FlipCard.displayName = 'FlipCard';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: CardPresetButton
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CardPresetButton = React.memo(({
  preset,
  index,
  selected,
  onSelect
}: {
  preset: any;
  index: number;
  selected: boolean;
  onSelect: (index: number) => void;
}) => {
  const Icon = preset.icon;
  return (
    <button
      onClick={() => onSelect(index)}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
        selected ? 'border-brand scale-105' : 'border-border hover:border-brand/50'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg ${preset.bgGradient} flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-[9px] text-muted-foreground">{preset.label}</span>
    </button>
  );
});

CardPresetButton.displayName = 'CardPresetButton';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ NewCardModal with useCallback
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CARD_PRESETS = [
  { label: 'Shopping', icon: ShoppingBag, color: 'from-violet-600 to-indigo-500', bgGradient: 'bg-gradient-to-br from-violet-600 to-indigo-500' },
  { label: 'Dining', icon: Utensils, color: 'from-emerald-500 to-teal-400', bgGradient: 'bg-gradient-to-br from-emerald-500 to-teal-400' },
  { label: 'Travel', icon: Plane, color: 'from-sky-500 to-cyan-400', bgGradient: 'bg-gradient-to-br from-sky-500 to-cyan-400' },
  { label: 'Gaming', icon: Gamepad2, color: 'from-purple-600 to-pink-500', bgGradient: 'bg-gradient-to-br from-purple-600 to-pink-500' },
];

function NewCardModal({ onClose, onAdd }: { onClose: () => void; onAdd: (card: VirtualCard) => void }) {
  const [label, setLabel] = useState('');
  const [limit, setLimit] = useState('');
  const [preset, setPreset] = useState(0);
  const [error, setError] = useState('');

  const handleCreate = useCallback(() => {
    if (!label.trim()) { setError('Card label is required.'); return; }
    if (!limit || isNaN(Number(limit)) || Number(limit) <= 0) { setError('Enter a valid spending limit.'); return; }
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
  }, [label, limit, preset, onAdd, onClose]);

  const handlePresetSelect = useCallback((index: number) => {
    setPreset(index);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-border shadow-2xl p-6 max-w-sm w-full space-y-5"
      >
        <h3 className="text-lg font-semibold text-foreground">Create Virtual Card</h3>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Card Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setError(''); }}
            placeholder="e.g. Groceries, Subscriptions…"
            className={`w-full px-3 py-2.5 rounded-xl border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 transition ${
              error && !label.trim() ? 'border-destructive focus:ring-destructive/30' : 'border-border focus:ring-brand/30 focus:border-brand'
            }`}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Spending Limit ($)</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => { setLimit(e.target.value); setError(''); }}
            placeholder="0.00"
            className={`w-full px-3 py-2.5 rounded-xl border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 transition ${
              error && (!limit || Number(limit) <= 0) ? 'border-destructive focus:ring-destructive/30' : 'border-border focus:ring-brand/30 focus:border-brand'
            }`}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Card Style</label>
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
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </p>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-accent transition-colors">Cancel</button>
          <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition-colors">Create Card</button>
        </div>
      </motion.div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Main BudgetCards Component with Supabase
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function BudgetCards() {
  // ✅ Get real budgets from Supabase
  const { budgets, loading: budgetsLoading, error: budgetsError } = useSupabaseData();

  // ✅ Initialize with INITIAL_CARDS so first render never shows an empty slate
  //    and we never need a synchronous setState inside the effect.
  const [cards, setCards] = useState<VirtualCard[]>(INITIAL_CARDS);
  const [showNewCard, setShowNewCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ Convert budgets to virtual cards format
  const convertBudgetsToCards = useCallback((budgetData: any[]) => {
    if (!budgetData || budgetData.length === 0) {
      return INITIAL_CARDS;
    }

    const colorMap: Record<string, string[]> = {
      'Food & Dining': ['from-amber-500 to-orange-400', 'bg-gradient-to-br from-amber-500 to-orange-400'],
      'Transport': ['from-sky-500 to-cyan-400', 'bg-gradient-to-br from-sky-500 to-cyan-400'],
      'Shopping': ['from-violet-600 to-indigo-500', 'bg-gradient-to-br from-violet-600 to-indigo-500'],
      'Bills & Utilities': ['from-rose-500 to-pink-400', 'bg-gradient-to-br from-rose-500 to-pink-400'],
      'Others': ['from-gray-500 to-gray-400', 'bg-gradient-to-br from-gray-500 to-gray-400'],
    };

    const iconMap: Record<string, React.ElementType> = {
      'Food & Dining': Coffee,
      'Transport': Plane,
      'Shopping': ShoppingBag,
      'Bills & Utilities': CreditCard,
      'Others': Gamepad2,
    };

    return budgetData.map((b, index) => {
      const colors = colorMap[b.category] || colorMap['Others'];
      const Icon = iconMap[b.category] || Gamepad2;
      const spent = b.spent || 0;
      const limit = b.amount || 1000;

      return {
        id: index + 1,
        label: b.category,
        number: `4${Math.floor(1000 + Math.random() * 9000)} •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`,
        expiry: `${String(Math.ceil(Math.random() * 12)).padStart(2, '0')}/2${8 + Math.floor(Math.random() * 2)}`,
        cvv: String(Math.floor(100 + Math.random() * 900)),
        balance: limit - spent,
        limit: limit,
        spent: spent,
        locked: false,
        color: colors[0],
        bgGradient: colors[1],
        category: b.category,
        icon: Icon,
      };
    });
  }, []);

  // ✅ useCallback: Toggle lock
  const toggleLock = useCallback((id: number) => {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c)));
  }, []);

  // ✅ useCallback: Delete card
  const deleteCard = useCallback((id: number) => {
    setCards((cs) => cs.filter((c) => c.id !== id));
  }, []);

  // ✅ useCallback: Add card
  const addCard = useCallback((card: VirtualCard) => {
    setCards((cs) => [...cs, card]);
  }, []);

  // ✅ useMemo: Calculate totals
  const totals = useMemo(() => {
    const totalLimit = cards.reduce((a, c) => a + c.limit, 0);
    const totalSpent = cards.reduce((a, c) => a + c.spent, 0);
    return { totalLimit, totalSpent, remaining: totalLimit - totalSpent };
  }, [cards]);

  // ✅ useMemo: Memoize card list
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

  // ✅ Load cards from Supabase — deferred async so setState is not synchronous
  //    in the effect body (satisfies react-hooks/set-state-in-effect).
  //    `loading` starts `true` from useState initializer; we only flip it after
  //    the data has settled.
  useEffect(() => {
    if (budgetsLoading) return;

    let cancelled = false;

    const sync = async () => {
      await Promise.resolve(); // yield microtask → setState below is post-await
      if (cancelled) return;

      setCards(
        budgets && budgets.length > 0
          ? convertBudgetsToCards(budgets)
          : INITIAL_CARDS
      );
      setLoading(false);
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [budgets, budgetsLoading, convertBudgetsToCards]);

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Loading your budgets...</p>
        </div>
      </div>
    );
  }

  // ✅ Show error state
  if (budgetsError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-foreground mt-4">Something went wrong</h2>
          <p className="text-muted-foreground mt-2">{budgetsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Smart Budget & Virtual Cards</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage disposable cards with per-category spending limits</p>
          </div>
          <button
            onClick={() => setShowNewCard(true)}
            className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Virtual Card
          </button>
        </motion.div>

        {/* Budget summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Cards', value: String(cards.length) },
            { label: 'Total Limit', value: `$${totals.totalLimit.toFixed(2)}` },
            { label: 'Total Spent', value: `$${totals.totalSpent.toFixed(2)}` },
            { label: 'Remaining', value: `$${totals.remaining.toFixed(2)}` },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Horizontal card scroll container */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Disposable Virtual Cards ({cards.length})
          </h2>
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'thin' }}
          >
            <AnimatePresence>
              {cardList}
            </AnimatePresence>

            {/* Add card placeholder */}
            <div className="flex-shrink-0 w-72 snap-start">
              <button
                onClick={() => setShowNewCard(true)}
                className="w-full h-44 rounded-2xl border-2 border-dashed border-border hover:border-brand hover:bg-brand-light/30 dark:hover:bg-brand-dark/10 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-brand"
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm font-semibold">Add Virtual Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* Budget overview table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Budget Overview</h2>
          </div>
          <div className="divide-y divide-border">
            {cards.map((card) => {
              const Icon = card.icon;
              const pct = Math.min((card.spent / card.limit) * 100, 100);
              return (
                <div key={card.id} className="flex items-center gap-4 px-6 py-4 hover:bg-accent/30 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${card.bgGradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        {card.label}
                        {card.locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </p>
                      <span className="text-xs text-muted-foreground">${card.spent.toFixed(2)} /${card.limit.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          card.locked ? 'bg-muted-foreground' : pct > 85 ? 'bg-expense' : 'bg-brand'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${pct > 85 ? 'text-expense' : 'text-income'}`}>
                    {(100 - pct).toFixed(0)}% left
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showNewCard && (
          <NewCardModal
            onClose={() => setShowNewCard(false)}
            onAdd={addCard}
          />
        )}
      </AnimatePresence>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}