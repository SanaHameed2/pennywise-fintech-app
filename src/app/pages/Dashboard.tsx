// src/app/pages/Dashboard.tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, TrendingDown, ArrowUpRight,
  Eye, EyeOff, Settings, Send, Plus, Minus, CreditCard,
  Wallet, BarChart3, Calendar, AlertCircle,
  Target, Shield, ChevronRight, Zap, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import SavingsGoalModal from '../components/SavingsGoalModal';
import { NotificationPanel } from '../components/NotificationPanel';
import { useAuth } from '../../hooks/useAuth';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { useInsights } from '../../hooks/useInsights';
import { absAmount, directionOf } from '../../utils/transactions';
import { categoryLabel } from '../../utils/categories';
import { formatMoney } from '../../utils/money';
import { formatDate } from '../../utils/date';

const DashboardCharts = lazy(() => import('./DashboardCharts'));
const CategoryDonut = lazy(() => import('./CategoryDonut'));

const ChartSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 bg-[#0D0D12] border border-white/5 rounded-[24px] p-6 animate-pulse">
      <div className="h-64 bg-white/5 rounded-lg" />
    </div>
    <div className="bg-[#0D0D12] border border-white/5 rounded-[24px] p-6 animate-pulse">
      <div className="h-64 bg-white/5 rounded-lg" />
    </div>
  </div>
);

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1
    }
  }
};

const CATEGORY_PALETTE = ['#FF7F50', '#A78BFA', '#34D399', '#F59E0B', '#3B82F6', '#EF4444', '#10B981', '#6B7280'];

/** "2026-11" -> "Nov" / "نومبر" in the active language (months are Asia/Karachi buckets). */
const monthLabel = (ym: string, lang: string, style: 'short' | 'long' = 'short') => {
  const [y, m] = ym.split('-').map(Number);
  return new Intl.DateTimeFormat(lang === 'ur' ? 'ur-PK' : 'en-PK', { month: style, timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, 15)));
};

const pctChange = (current: number, previous: number): number | null =>
  previous > 0 ? ((current - previous) / previous) * 100 : null;

const formatChange = (v: number | null): string | undefined =>
  v === null ? undefined : `${v >= 0 ? '+' : '-'}${Math.abs(v).toFixed(1)}%`;

const QuickActionCard = React.memo(({ icon: Icon, label, hint, to, color = '#FF7F50', gradient = false }: any) => {
  return (
    <Link
      to={to}
      className={`group bg-[#0D0D12] border border-white/5 rounded-2xl p-5 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]
        hover:border-[#FF7F50]/30 transition-all duration-300 hover:-translate-y-1.5 
        hover:shadow-lg hover:shadow-[#FF7F50]/10 relative overflow-hidden`}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF7F50]/5 to-[#A78BFA]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 
        group-hover:scale-110 transition-all duration-300"
        style={{ background: `${color}15`, borderColor: `${color}30`, border: '1px solid' }}
      >
        <Icon className="w-5 h-5" style={{ color }} aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
        {label}
      </p>
      <p className="text-[11px] text-white/70 mt-1 group-hover:text-white/90 transition-colors">{hint}</p>
    </Link>
  );
});
QuickActionCard.displayName = 'QuickActionCard';

const MetricCard = React.memo(({ label, value, icon: Icon, change, tone = 'good', showBalance = true, changeHint }: any) => {
  const isUp = typeof change === 'string' && change.startsWith('+');
  return (
    <motion.div
      variants={fadeIn}
      className="bg-[#0D0D12] border border-white/5 rounded-2xl p-5 hover:border-[#FF7F50]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#FF7F50]/5"
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-[#FF7F50]" aria-hidden="true" />
        <p className="text-[11px] uppercase tracking-wider text-white/70">{label}</p>
      </div>
      <p className="text-xl font-bold text-white">{showBalance === false ? '•••••' : value}</p>
      {change && showBalance !== false && (
        <p className={`text-xs flex items-center gap-1 mt-1.5 ${tone === 'good' ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" aria-hidden="true" /> : <TrendingDown className="w-3 h-3" aria-hidden="true" />}
          <bdi dir="ltr">{change}</bdi>
          {changeHint && <span className="text-white/60">{changeHint}</span>}
        </p>
      )}
    </motion.div>
  );
});
MetricCard.displayName = 'MetricCard';

const TransactionItem = React.memo(({ transaction, index }: { transaction: any; index: number }) => {
  const { t } = useTranslation();
  const isIncome = directionOf(transaction.amount) === 'in';
  const Icon = isIncome ? TrendingUp : TrendingDown;
  const iconColor = isIncome ? '#34D399' : '#EF4444';
  const bgColor = isIncome ? 'bg-[#34D399]/10 border-[#34D399]/20' : 'bg-[#EF4444]/10 border-[#EF4444]/20';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/5 group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} border`}>
          <Icon className="w-4 h-4" style={{ color: iconColor }} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white/80 group-hover:text-white transition">
            {transaction.description || transaction.category || t('common.transaction', 'Transaction')}
          </p>
          <p className="text-xs text-white/60">
            {transaction.created_at ? formatDate(transaction.created_at) : t('common.recent', 'Recent')}
          </p>
        </div>
      </div>
      <span className={`text-sm font-bold ${isIncome ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
        <span className="sr-only">{isIncome ? t('dashboard.moneyIn') : t('dashboard.moneyOut')}: </span>
        <bdi dir="ltr">{isIncome ? '+' : '−'} Rs. {formatMoney(absAmount(transaction.amount))}</bdi>
      </span>
    </motion.div>
  );
});
TransactionItem.displayName = 'TransactionItem';

const SavingsGoalItem = React.memo(({ goal, onAction }: {
  goal: any;
  onAction: (action: 'contribute' | 'withdraw', goal: any) => void;
}) => {
  const { t } = useTranslation();
  const current = Number(goal.current_amount ?? goal.current ?? 0);
  const target = Number(goal.target_amount ?? goal.target ?? 0);
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const color = goal.color || '#FF7F50';

  return (
    <div className="group rounded-xl p-3 transition-colors -mx-3 hover:bg-white/5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-white/80">{goal.name}</span>
        <span className="text-xs font-bold text-white/60">
          Rs. {formatMoney(current)}
          <span className="text-white/60"> / </span>
          Rs. {formatMoney(target)}
        </span>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(percentage, 100)}%`, background: color }}
          />
        </div>
        <span className="text-xs font-bold text-white/50 w-10 text-end">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAction('contribute', goal)}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3" aria-hidden="true" /> {t('dashboard.contribute', 'Contribute')}
        </button>
        <button
          onClick={() => onAction('withdraw', goal)}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition flex items-center justify-center gap-1"
        >
          <Minus className="w-3 h-3" aria-hidden="true" /> {t('dashboard.withdrawGoal', 'Withdraw')}
        </button>
      </div>
    </div>
  );
});
SavingsGoalItem.displayName = 'SavingsGoalItem';

const ExpenseCategoryItem = React.memo(({ category }: { category: any }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: category.color }} aria-hidden="true" />
      <div className="flex-1">
        <div className="flex justify-between text-xs">
          <span className="text-white/70">{categoryLabel(t, category.name)}</span>
          <span className="text-white/80 font-medium">Rs. {formatMoney(category.amount)}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/5 mt-1 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${category.percentage}%`, background: category.color }}
          />
        </div>
      </div>
      <span className="text-[11px] text-white/60 w-8 text-end">{category.percentage}%</span>
    </div>
  );
});
ExpenseCategoryItem.displayName = 'ExpenseCategoryItem';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { data: insights } = useInsights(6);

  const {
    wallet,
    transactions: rawTransactions,
    savingsGoals,
    loading,
    contributeToGoal,
    withdrawFromGoal,
  } = useSupabaseData();

  const [showBalance, setShowBalance] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);

  const rawName = user?.email?.split('@')[0] || 'User';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = displayName.substring(0, 2).toUpperCase();

  const pkrBalance = wallet?.balance || 0;
  const liveTransactions = useMemo(() => rawTransactions || [], [rawTransactions]);

  // Everything below comes from the ledger on the server (not from the last 10 rows, and not hard-coded)
  const cashflow = useMemo(() => insights?.cashflow ?? [], [insights]);
  const thisMonth = cashflow[cashflow.length - 1];
  const lastMonth = cashflow.length > 1 ? cashflow[cashflow.length - 2] : undefined;
  const totalIncome = thisMonth?.income ?? 0;
  const totalExpense = thisMonth?.expenses ?? 0;
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : null;
  const incomeChange = lastMonth ? pctChange(totalIncome, lastMonth.income) : null;
  const expenseChange = lastMonth ? pctChange(totalExpense, lastMonth.expenses) : null;
  const balanceChange = lastMonth ? pctChange(pkrBalance, lastMonth.closing_balance) : null;
  const monthName = thisMonth ? monthLabel(thisMonth.month, i18n.language, 'long') : '';

  const chartData = useMemo(
    () => cashflow.map((m) => ({
      month: monthLabel(m.month, i18n.language),
      balance: m.closing_balance,
      spending: m.expenses,
      income: m.income,
    })),
    [cashflow, i18n.language],
  );

  const displayCategories = useMemo(() => {
    const cats = insights?.categories ?? [];
    const total = cats.reduce((sum, c) => sum + c.amount, 0);
    return cats.map((c, i) => ({
      name: c.category,
      amount: c.amount,
      percentage: total > 0 ? Math.round((c.amount / total) * 100) : 0,
      color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
    }));
  }, [insights]);

  // A real, data-driven sentence (replaces a hard-coded "12% / Rs. 8,500" placeholder).
  const insightText = useMemo(() => {
    if (!insights || (totalExpense === 0 && displayCategories.length === 0)) return t('dashboard.insight.empty');
    const parts: string[] = [];
    if (expenseChange !== null) {
      const pct = Math.abs(expenseChange).toFixed(0);
      parts.push(expenseChange <= -1 ? t('dashboard.insight.down', { pct }) : expenseChange >= 1 ? t('dashboard.insight.up', { pct }) : t('dashboard.insight.same'));
    }
    const top = displayCategories[0];
    if (top) parts.push(t('dashboard.insight.top', { name: categoryLabel(t, top.name), pct: top.percentage }));
    return parts.join(' ');
  }, [insights, totalExpense, expenseChange, displayCategories, t]);

  const totalExpenses = useMemo(
    () => displayCategories.reduce((sum, cat) => sum + cat.amount, 0),
    [displayCategories],
  );

  const totalSaved = useMemo(
    () => (savingsGoals || []).reduce((sum, g: any) => sum + Number(g.current_amount ?? g.current ?? 0), 0),
    [savingsGoals]
  );

  const handleToggleBalance = useCallback(() => {
    setShowBalance(prev => !prev);
  }, []);

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleGoalAction = useCallback((_action: 'contribute' | 'withdraw', goal: any) => {
    setSelectedGoal(goal);
  }, []);

  const transactionList = useMemo(() => {
    return liveTransactions.slice(0, 5).map((tx, idx) => (
      <TransactionItem key={tx.id || idx} transaction={tx} index={idx} />
    ));
  }, [liveTransactions]);

  const savingsGoalList = useMemo(() => {
    return (savingsGoals || []).map((goal: any) => (
      <SavingsGoalItem key={goal.id} goal={goal} onAction={handleGoalAction} />
    ));
  }, [savingsGoals, handleGoalAction]);

  const expenseCategoryList = useMemo(() => {
    return displayCategories.map((cat) => (
      <ExpenseCategoryItem key={cat.name} category={cat} />
    ));
  }, [displayCategories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF7F50] border-t-transparent rounded-full animate-spin" aria-label="Loading dashboard" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] overflow-x-hidden font-sans">

      {/* ─── TOP BAR ─── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#070707]/80 backdrop-blur-xl px-4 sm:px-6 md:px-8 py-3"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-[#FF7F50] flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Pennywise<span className="text-[#FF7F50]">.</span>
            </span>
            <span className="hidden sm:inline text-[11px] font-medium uppercase tracking-wider text-[#FF7F50] bg-[#FF7F50]/10 px-2.5 py-1 rounded-full border border-[#FF7F50]/20">
              {t('dashboard.financeHub', 'Finance Hub')}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <NotificationPanel />
            
            <button
              onClick={() => handleNavigate('/settings')}
              aria-label="Open settings"
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <Settings className="w-5 h-5 text-white/60 hover:text-white/90 transition" aria-hidden="true" />
            </button>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FF7F50] flex items-center justify-center text-black font-semibold text-xs">
                {initials}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-white/90">{displayName}</p>
                <p className="text-[11px] text-[#FF7F50]">{t('dashboard.sandboxChip')}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-16 pt-4 space-y-8">

        {/* ─── GREETING ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {new Date().getHours() < 12 ? t('dashboard.greetingMorning') :
               new Date().getHours() < 18 ? t('dashboard.greetingAfternoon') :
               t('dashboard.greetingEvening')}, {displayName}
              <span className="inline-block ms-2 animate-pulse" aria-hidden="true">👋</span>
            </h1>
            <p className="text-sm text-white/60 flex items-center gap-2 mt-0.5">
              {t('dashboard.glance')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-white/50 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-[#FF7F50]" aria-hidden="true" /> {t('dashboard.bankGrade')}
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-[#FF7F50]/10 text-[#FF7F50] border border-[#FF7F50]/20 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" aria-hidden="true" /> {t('dashboard.sandboxChip')}
            </span>
          </div>
        </motion.div>

        {/* ─── QUICK STATS ROW ─── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          <motion.div
            variants={fadeIn}
            className="bg-gradient-to-br from-[#0D0D12] to-[#1A1A24] border border-white/5 rounded-[24px] p-6 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute -top-20 -end-20 w-40 h-40 bg-[#FF7F50]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" aria-hidden="true" />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                    {t('dashboard.totalBalance')}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-3xl font-black text-white tracking-tight">
                      {showBalance ? `Rs. ${formatMoney(pkrBalance)}` : '••••••••'}
                    </p>
                    <button
                      onClick={handleToggleBalance}
                      aria-label={showBalance ? t('dashboard.hideBalance') : t('dashboard.showBalance')}
                      aria-pressed={!showBalance}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {showBalance ? <Eye className="w-3.5 h-3.5 text-white/60" aria-hidden="true" /> : <EyeOff className="w-3.5 h-3.5 text-white/60" aria-hidden="true" />}
                    </button>
                  </div>
                  {showBalance && balanceChange !== null && (
                    <p className={`text-sm flex items-center gap-1.5 mt-1 ${balanceChange >= 0 ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                      {balanceChange >= 0 ? <TrendingUp className="w-4 h-4" aria-hidden="true" /> : <TrendingDown className="w-4 h-4" aria-hidden="true" />}
                      <bdi dir="ltr">{formatChange(balanceChange)}</bdi> <span className="text-white/70 text-xs">{t('dashboard.vsLastMonth')}</span>
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#FF7F50]/10 border border-[#FF7F50]/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-[#FF7F50]" aria-hidden="true" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="bg-[#0D0D12] border border-white/5 rounded-[24px] p-6 shadow-2xl hover:border-[#A78BFA]/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                  {t('dashboard.netCashFlow')}
                </p>
                <p className="text-3xl font-black text-white tracking-tight mt-1.5">
                  Rs. {formatMoney(totalIncome - totalExpense)}
                </p>
                <p className="text-xs text-white/70 mt-2">{monthName}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#A78BFA]/10 border border-[#A78BFA]/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#A78BFA]" aria-hidden="true" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="bg-[#0D0D12] border border-white/5 rounded-[24px] p-6 shadow-2xl">
            <dl className="space-y-2.5">
              {([
                [t('dashboard.income'), totalIncome, 'text-[#34D399]'],
                [t('dashboard.expenses'), totalExpense, 'text-[#F87171]'],
                [t('dashboard.savings'), savings, 'text-[#F59E0B]'],
              ] as const).map(([label, value, color]) => (
                <div key={label} className="flex items-baseline justify-between gap-3">
                  <dt className="text-[11px] uppercase tracking-[0.15em] text-white/70">{label}</dt>
                  <dd className={`text-base font-bold ${color} whitespace-nowrap`}><bdi dir="ltr">Rs. {formatMoney(value)}</bdi></dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </motion.div>

        {/* ─── QUICK ACTIONS ─── */}
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" /> {t('dashboard.quickActions')}
          </h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <QuickActionCard icon={Send} label={t('nav.transfer')} hint={t('dashboard.qa.transfer')} to="/transfer" gradient />
            <QuickActionCard icon={Calendar} label={t('nav.transactions')} hint={t('dashboard.qa.transactions')} to="/transactions" color="#34D399" />
            <QuickActionCard icon={CreditCard} label={t('nav.cards')} hint={t('dashboard.qa.cards')} to="/cards" color="#A78BFA" />
            <QuickActionCard icon={Shield} label={t('nav.security')} hint={t('dashboard.qa.security')} to="/settings" color="#F59E0B" />
          </motion.div>
        </div>

        {/* ─── METRICS ROW ─── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <MetricCard label={t('dashboard.income')} value={`Rs. ${formatMoney(totalIncome)}`} icon={TrendingUp}
            change={formatChange(incomeChange)} tone={incomeChange !== null && incomeChange >= 0 ? 'good' : 'bad'}
            changeHint={t('dashboard.vsLastMonth')} showBalance={showBalance} />
          <MetricCard label={t('dashboard.expenses')} value={`Rs. ${formatMoney(totalExpense)}`} icon={TrendingDown}
            change={formatChange(expenseChange)} tone={expenseChange !== null && expenseChange <= 0 ? 'good' : 'bad'}
            changeHint={t('dashboard.vsLastMonth')} showBalance={showBalance} />
          <MetricCard label={t('dashboard.savings')} value={`Rs. ${formatMoney(savings)}`} icon={Wallet} showBalance={showBalance} />
          <MetricCard label={t('dashboard.savingsRate')} value={savingsRate === null ? '—' : `${savingsRate.toFixed(1)}%`} icon={BarChart3} showBalance={showBalance} />
        </motion.div>

        {/* ─── CHARTS SECTION ─── */}
        <Suspense fallback={<ChartSkeleton />}>
          <DashboardCharts data={chartData} />
        </Suspense>

        {/* ─── FINANCIAL INSIGHT ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#FF7F50]/5 via-[#A78BFA]/5 to-transparent border border-[#FF7F50]/10 rounded-[24px] shadow-2xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 end-0 w-64 h-64 bg-[#FF7F50]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" aria-hidden="true" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7F50]/10 border border-[#FF7F50]/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#FF7F50]" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold">
                {t('dashboard.financialInsight')}
              </p>
              <p className="text-white/80 text-sm mt-0.5">{insightText}</p>
            </div>
            <Link to="/transactions" className="text-sm text-[#FF7F50] hover:text-[#ff8f66] transition flex items-center gap-1.5 font-medium whitespace-nowrap rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]">
              {t('dashboard.viewTransactions')}
              <ChevronRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>

        {/* ─── EXPENSES + SAVINGS GOALS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Categories — REAL DATA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="bg-[#0D0D12] border border-white/5 rounded-[24px] shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold">
                {t('dashboard.expenseCategories')}
              </h2>
              <span className="text-xs text-white/60 font-bold">Rs. {formatMoney(totalExpenses)}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-40 h-40 flex-shrink-0">
                {displayCategories.length > 0 ? (
                  <Suspense fallback={<div aria-hidden="true" className="w-full h-full rounded-full bg-white/5 animate-pulse" />}>
                    <CategoryDonut data={displayCategories} />
                  </Suspense>
                ) : (
                  <div className="w-full h-full rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                    <span className="text-xs text-white/60 text-center px-2">
                      {t('dashboard.noExpensesShort', 'No expenses')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2.5">
                {displayCategories.length > 0 ? expenseCategoryList : (
                  <p className="text-white/60 text-sm text-center py-4">
                    {t('dashboard.noExpenses')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Savings Goals — REAL DATA with actions */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="bg-[#0D0D12] border border-white/5 rounded-[24px] shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold flex items-center gap-2">
                <Target className="w-3.5 h-3.5" aria-hidden="true" /> {t('dashboard.savingsGoals')}
              </h2>
              <span className="text-xs text-white/60">
                {t('dashboard.trackProgress', 'Track your progress')}
              </span>
            </div>

            <div className="space-y-5">
              {savingsGoalList.length > 0 ? savingsGoalList : (
                <p className="text-white/60 text-sm text-center py-6">
                  {t('dashboard.noGoals', 'No goals yet. Create one to start saving.')}
                </p>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">{t('dashboard.totalSaved')}</span>
                <span className="text-white font-bold">
                  Rs. {formatMoney(totalSaved)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── RECENT TRANSACTIONS ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="bg-[#0D0D12] border border-white/5 rounded-[24px] shadow-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" /> {t('dashboard.recentTransactions')}
            </h2>
            <Link to="/transactions" className="text-xs text-[#FF7F50] hover:text-[#FF7F50]/80 transition flex items-center gap-1 font-medium">
              {t('dashboard.viewAll')} 
              <ArrowUpRight size={14} className="rtl:-scale-x-100" aria-hidden="true" />
            </Link>
          </div>

          <div className="space-y-2">
            {liveTransactions.length > 0 ? transactionList : (
              <p className="text-white/60 text-sm text-center py-4">
                {t('dashboard.noTransactions')}
              </p>
            )}
          </div>
        </motion.div>

        {/* ─── SECURITY BANNER ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#0D0D12] to-[#1A1A24] border border-white/5 rounded-[24px] p-6 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7F50]/10 border border-[#FF7F50]/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-[#FF7F50]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {t('dashboard.secureEncrypted')}
              </p>
              <p className="text-xs text-white/60">
                {t('dashboard.dataProtected')}
              </p>
            </div>
          </div>
          <Link to="/about#security" className="text-sm rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50] text-[#FF7F50] hover:text-[#FF7F50]/80 transition flex items-center gap-1.5 font-medium">
            {t('dashboard.learnMore')} 
            <ChevronRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </motion.div>

      </div>

      {/* ✅ Savings Goal Modal */}
      <AnimatePresence>
        {selectedGoal && (
          <SavingsGoalModal
            goal={selectedGoal}
            walletBalance={pkrBalance}
            onClose={() => setSelectedGoal(null)}
            onSuccess={() => setSelectedGoal(null)}
            contributeFn={contributeToGoal}
            withdrawFn={withdrawFromGoal}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}