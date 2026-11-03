// src/app/pages/Dashboard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  TrendingUp, TrendingDown, ArrowUpRight,
  Eye, EyeOff, Bell, Settings, Send, Plus, Minus, CreditCard,
  Wallet, BarChart3, Calendar, AlertCircle,
  Target, Shield, ChevronRight, Zap, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { formatMoney } from '../../utils/money';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Lazy load charts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DashboardCharts = lazy(() => import('./DashboardCharts'));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Loading skeleton for charts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Animation Variants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Mock Data for Charts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const generateChartData = (currentBalance: number) => [
  { month: 'Jan', balance: currentBalance * 0.65, spending: 45000, income: 52000 },
  { month: 'Feb', balance: currentBalance * 0.72, spending: 38000, income: 48000 },
  { month: 'Mar', balance: currentBalance * 0.80, spending: 52000, income: 55000 },
  { month: 'Apr', balance: currentBalance * 0.87, spending: 29000, income: 61000 },
  { month: 'May', balance: currentBalance * 0.94, spending: 61000, income: 58000 },
  { month: 'Jun', balance: currentBalance, spending: 42000, income: 65000 },
];

const expenseCategories = [
  { name: 'Food & Dining', amount: 14620, percentage: 34, color: '#FF7F50' },
  { name: 'Transport', amount: 8950, percentage: 21, color: '#A78BFA' },
  { name: 'Shopping', amount: 7880, percentage: 18, color: '#34D399' },
  { name: 'Bills & Utilities', amount: 6430, percentage: 15, color: '#F59E0B' },
  { name: 'Others', amount: 4800, percentage: 12, color: '#EF4444' },
];

const savingsGoals = [
  { name: 'Emergency Fund', current: 72000, target: 100000, color: '#FF7F50' },
  { name: 'Vacation Trip', current: 45000, target: 100000, color: '#A78BFA' },
  { name: 'New Laptop', current: 90000, target: 100000, color: '#34D399' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Quick Action Card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const QuickActionCard = React.memo(({ icon: Icon, label, to, color = '#FF7F50', gradient = false }: any) => {
  return (
    <Link
      to={to}
      className={`group bg-[#0D0D12] border border-white/5 rounded-2xl p-5 text-center 
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
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
        {label}
      </p>
      <p className="text-[10px] text-white/30 mt-1 group-hover:text-white/50 transition-colors">
        Click to proceed →
      </p>
    </Link>
  );
});

QuickActionCard.displayName = 'QuickActionCard';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Metric Card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MetricCard = React.memo(({ label, value, icon: Icon, change, changeType = 'up', showBalance = true }: any) => {
  return (
    <motion.div
      variants={fadeIn}
      className="bg-[#0D0D12] border border-white/5 rounded-2xl p-5 
        hover:border-[#FF7F50]/20 transition-all duration-300 hover:-translate-y-1 
        hover:shadow-xl hover:shadow-[#FF7F50]/5"
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-[#FF7F50]" />
        <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
      </div>
      <p className="text-xl font-bold text-white">
        {showBalance === false ? '•••••' : value}
      </p>
      {change && (
        <p className={`text-xs flex items-center gap-1 mt-1.5 ${
          changeType === 'up' ? 'text-[#34D399]' : 'text-[#EF4444]'
        }`}>
          {changeType === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </p>
      )}
    </motion.div>
  );
});

MetricCard.displayName = 'MetricCard';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Transaction Item
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TransactionItem = React.memo(({ transaction, index }: { transaction: any; index: number }) => {
  const isIncome = transaction.type === 'income';
  const Icon = isIncome ? TrendingUp : TrendingDown;
  const iconColor = isIncome ? '#34D399' : '#EF4444';
  const bgColor = isIncome ? 'bg-[#34D399]/10 border-[#34D399]/20' : 'bg-[#EF4444]/10 border-[#EF4444]/20';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/5 cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} border`}>
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white/80 group-hover:text-white transition">
            {transaction.description || transaction.category || 'Transaction'}
          </p>
          <p className="text-xs text-white/30">
            {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Recent'}
          </p>
        </div>
      </div>
      <span className={`text-sm font-bold ${isIncome ? 'text-[#34D399]' : 'text-[#EF4444]'}`}>
        {isIncome ? '+' : '-'} Rs. {formatMoney(transaction.amount)}
      </span>
    </motion.div>
  );
});

TransactionItem.displayName = 'TransactionItem';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Savings Goal Item
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SavingsGoalItem = React.memo(({ goal }: { goal: any }) => {
  const percentage = (goal.current / goal.target) * 100;

  return (
    <div className="group hover:bg-white/5 rounded-xl p-3 transition-colors -mx-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-white/80">{goal.name}</span>
        <span className="text-xs font-bold text-white/60">
          Rs. {goal.current.toLocaleString()} <span className="text-white/30">/</span> Rs. {goal.target.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(percentage, 100)}%`, background: goal.color }}
          />
        </div>
        <span className="text-xs font-bold text-white/50 w-10 text-right">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
});

SavingsGoalItem.displayName = 'SavingsGoalItem';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Expense Category Item
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ExpenseCategoryItem = React.memo(({ category }: { category: any }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: category.color }} />
      <div className="flex-1">
        <div className="flex justify-between text-xs">
          <span className="text-white/60">{category.name}</span>
          <span className="text-white/80 font-medium">Rs. {category.amount.toLocaleString()}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/5 mt-1 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${category.percentage}%`, background: category.color }}
          />
        </div>
      </div>
      <span className="text-[10px] text-white/30 w-8 text-right">{category.percentage}%</span>
    </div>
  );
});

ExpenseCategoryItem.displayName = 'ExpenseCategoryItem';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Main Dashboard Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { wallet, transactions: rawTransactions, loading } = useSupabaseData();
  
  const [showBalance, setShowBalance] = useState(true);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ Dynamic User Data
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const rawName = user?.email?.split('@')[0] || 'User';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = displayName.substring(0, 2).toUpperCase();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ Dynamic Financial Data
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const pkrBalance = wallet?.balance || 0;
  
  const liveTransactions = useMemo(() => rawTransactions || [], [rawTransactions]);

  const totalIncome = useMemo(() => 
    liveTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
  , [liveTransactions]);

  const totalExpense = useMemo(() => 
    liveTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
  , [liveTransactions]);

  const dynamicChartData = useMemo(() => generateChartData(pkrBalance), [pkrBalance]);
  const savings = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);
  
  const growth = useMemo(() => {
    if (totalIncome === 0) return '0.0';
    const netSavings = totalIncome - totalExpense;
    return ((netSavings / totalIncome) * 100).toFixed(1);
  }, [totalIncome, totalExpense]);

  const totalExpenses = useMemo(() => expenseCategories.reduce((sum, cat) => sum + cat.amount, 0), []);

  const handleToggleBalance = useCallback(() => {
    setShowBalance(prev => !prev);
  }, []);

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const transactionList = useMemo(() => {
    return liveTransactions.slice(0, 5).map((tx, idx) => (
      <TransactionItem key={tx.id || idx} transaction={tx} index={idx} />
    ));
  }, [liveTransactions]);

  const savingsGoalList = useMemo(() => {
    return savingsGoals.map((goal) => (
      <SavingsGoalItem key={goal.name} goal={goal} />
    ));
  }, []);

  const expenseCategoryList = useMemo(() => {
    return expenseCategories.map((cat) => (
      <ExpenseCategoryItem key={cat.name} category={cat} />
    ));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF7F50] border-t-transparent rounded-full animate-spin" />
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
            <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-wider text-[#FF7F50] bg-[#FF7F50]/10 px-2.5 py-1 rounded-full border border-[#FF7F50]/20">
              Finance Hub
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-white/60 hover:text-white/90 transition" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF7F50] rounded-full ring-2 ring-[#070707] animate-pulse" />
            </button>
            <button
              onClick={() => handleNavigate('/settings')}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <Settings className="w-5 h-5 text-white/60 hover:text-white/90 transition" />
            </button>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FF7F50] flex items-center justify-center text-white font-semibold text-xs">
                {initials}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-white/90">{displayName}</p>
                <p className="text-[10px] text-[#FF7F50]">Premium</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-16 pt-24 space-y-8">

        {/* ─── GREETING ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {displayName}
              <span className="inline-block ml-2 animate-pulse">👋</span>
            </h1>
            <p className="text-sm text-white/40 flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              Your financial system is operating normally.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-white/50 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-[#FF7F50]" /> Bank-grade
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-[#FF7F50]/10 text-[#FF7F50] border border-[#FF7F50]/20 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Premium
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
          {/* Total Balance */}
          <motion.div
            variants={fadeIn}
            className="bg-gradient-to-br from-[#0D0D12] to-[#1A1A24] border border-white/5 rounded-[24px] p-6 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF7F50]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Total balance</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-3xl font-black text-white tracking-tight">
                      {showBalance ? `Rs. ${formatMoney(pkrBalance)}` : '••••••••'}
                    </p>
                    <button
                      onClick={handleToggleBalance}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {showBalance ? <Eye className="w-3.5 h-3.5 text-white/40" /> : <EyeOff className="w-3.5 h-3.5 text-white/40" />}
                    </button>
                  </div>
                  <p className="text-sm text-[#34D399] flex items-center gap-1.5 mt-1">
                    <TrendingUp className="w-4 h-4" /> ↑ {growth}% <span className="text-white/30 text-xs">vs last month</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#FF7F50]/10 border border-[#FF7F50]/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-[#FF7F50]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Net Cash Flow */}
          <motion.div
            variants={fadeIn}
            className="bg-[#0D0D12] border border-white/5 rounded-[24px] p-6 shadow-2xl hover:border-[#A78BFA]/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Net Cash Flow</p>
                <p className="text-3xl font-black text-white tracking-tight mt-1.5">
                  Rs. {formatMoney(totalIncome - totalExpense)}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-white/30">01 Jun</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-12 h-1 rounded-full bg-[#34D399]/30 overflow-hidden">
                      <span className="block h-full w-3/4 bg-[#34D399] rounded-full" />
                    </span>
                    <span className="text-[10px] text-white/30">30 Jun</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#A78BFA]/10 border border-[#A78BFA]/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#A78BFA]" />
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={fadeIn}
            className="bg-[#0D0D12] border border-white/5 rounded-[24px] p-6 shadow-2xl flex items-center justify-between"
          >
            <div className="flex gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Income</p>
                <p className="text-lg font-bold text-[#34D399]">Rs. {formatMoney(totalIncome)}</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Expenses</p>
                <p className="text-lg font-bold text-[#EF4444]">Rs. {formatMoney(totalExpense)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Savings</p>
              <p className="text-lg font-bold text-[#F59E0B]">Rs. {formatMoney(savings)}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ─── QUICK ACTIONS ─── */}
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Quick Actions
          </h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <QuickActionCard icon={Send} label="Transfer" to="/transfer" />
            <QuickActionCard icon={Plus} label="Add Money" to="/transfer" gradient />
            <QuickActionCard icon={Minus} label="Withdraw" to="/transfer" color="#EF4444" />
            <QuickActionCard icon={CreditCard} label="Cards" to="/cards" color="#A78BFA" />
          </motion.div>
        </div>

        {/* ─── METRICS ROW ─── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <MetricCard label="Income" value={`Rs. ${formatMoney(totalIncome)}`} icon={TrendingUp} change="+12.5%" changeType="up" showBalance={showBalance} />
          <MetricCard label="Expenses" value={`Rs. ${formatMoney(totalExpense)}`} icon={TrendingDown} change="-8.3%" changeType="down" showBalance={showBalance} />
          <MetricCard label="Savings" value={`Rs. ${formatMoney(savings)}`} icon={Wallet} showBalance={showBalance} />
          <MetricCard label="Growth" value={`${growth}%`} icon={BarChart3} change="↑ 2.1%" changeType="up" showBalance={true} />
        </motion.div>

        {/* ─── CHARTS SECTION ─── */}
        <Suspense fallback={<ChartSkeleton />}>
          <DashboardCharts data={dynamicChartData} />
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7F50]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7F50]/10 border border-[#FF7F50]/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#FF7F50]" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold">Financial Insight</p>
              <p className="text-white/70 text-sm mt-0.5">
                Your spending decreased 12% compared to last month. Potential monthly savings:{' '}
                <span className="text-white font-bold">Rs. 8,500</span>
              </p>
            </div>
            <button className="text-sm text-[#FF7F50] hover:text-[#FF7F50]/80 transition flex items-center gap-1.5 font-medium whitespace-nowrap">
              View Report <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* ─── EXPENSES + SAVINGS GOALS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Categories */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="bg-[#0D0D12] border border-white/5 rounded-[24px] shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold">Expense Categories</h2>
              <span className="text-xs text-white/40 font-bold">Rs. {formatMoney(totalExpenses)}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 w-full space-y-2.5">
                {expenseCategoryList}
              </div>
            </div>
          </motion.div>

          {/* Savings Goals */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="bg-[#0D0D12] border border-white/5 rounded-[24px] shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> Savings Goals
              </h2>
              <span className="text-xs text-white/40">Track your progress</span>
            </div>

            <div className="space-y-5">
              {savingsGoalList}
            </div>

            <div className="mt-5 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">Total Saved</span>
                <span className="text-white font-bold">
                  Rs. {(savingsGoals.reduce((sum, g) => sum + g.current, 0)).toLocaleString()}
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
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Recent transactions
            </h2>
            {/* ✅ Yahan link change kiya gaya hai */}
            <Link to="/transactions" className="text-xs text-[#FF7F50] hover:text-[#FF7F50]/80 transition flex items-center gap-1 font-medium">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-2">
            {liveTransactions.length > 0 ? transactionList : (
              <p className="text-white/40 text-sm text-center py-4">No transactions to show yet.</p>
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
              <Shield className="w-5 h-5 text-[#FF7F50]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Secure. Encrypted. Built for you.</p>
              <p className="text-xs text-white/40">Your data is protected with bank-grade security.</p>
            </div>
          </div>
          <button className="text-sm text-[#FF7F50] hover:text-[#FF7F50]/80 transition flex items-center gap-1.5 font-medium">
            Learn more <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

      </div>

      <Footer />
    </div>
  );
}