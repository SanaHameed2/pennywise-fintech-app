// src/app/pages/Save.tsx
import React, { useMemo } from 'react';
import { Target, PiggyBank, Plus, TrendingUp, Shield, Lock, CheckCircle2 } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: GoalCard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GoalCard = React.memo(({ 
  goal 
}: { 
  goal: { name: string; current: number; target: number; color: string } 
}) => {
  const progress = Math.min((goal.current / goal.target) * 100, 100);
  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-500 to-emerald-400',
    blue: 'from-blue-500 to-blue-400',
    purple: 'from-purple-500 to-purple-400',
  };
  const colorClass = colorMap[goal.color] || 'from-emerald-500 to-emerald-400';
  
  return (
    <div className="bg-[#0d0d12] border border-white/[0.06] rounded-xl p-5 hover:border-white/10 transition-all">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
            <Target className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-white">{goal.name}</h3>
        </div>
        <p className="text-sm text-gray-400 font-mono">${goal.current} / ${goal.target}</p>
      </div>
      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
        <div 
          className={`bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-3">
        <p className="text-sm text-gray-500 font-mono">{progress.toFixed(0)}% completed</p>
        <button className="text-[#FF7F50] text-sm hover:text-[#ff8f66] transition font-medium">
          Add Money →
        </button>
      </div>
    </div>
  );
});

GoalCard.displayName = 'GoalCard';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: TrustBadge
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TrustBadge = React.memo(({ icon: Icon, label }: { icon: React.ElementType; label: string }) => {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-[#FF7F50]" />
      <span>{label}</span>
    </div>
  );
});

TrustBadge.displayName = 'TrustBadge';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Main Save Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Save() {
  // ✅ useMemo: Goals data
  const goals = useMemo(() => [
    { name: "Emergency Fund", current: 5000, target: 10000, color: "emerald" },
    { name: "Vacation", current: 1200, target: 3000, color: "blue" },
    { name: "New Laptop", current: 800, target: 1500, color: "purple" },
  ], []);

  // ✅ useMemo: Calculate total savings
  const totalSaved = useMemo(() => {
    return goals.reduce((sum, goal) => sum + goal.current, 0);
  }, [goals]);

  // ✅ useMemo: Memoize goal list
  const goalList = useMemo(() => {
    return goals.map((goal, i) => (
      <GoalCard key={i} goal={goal} />
    ));
  }, [goals]);

  // ✅ useMemo: Trust badges
  const trustBadges = useMemo(() => [
    { icon: Shield, label: 'FDIC insured' },
    { icon: Lock, label: '256-bit encryption' },
    { icon: CheckCircle2, label: 'Bank-grade security' },
  ], []);

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative selection:bg-[#FF7F50]/20 antialiased font-sans">
      {/* Background Glows - Pennywise theme */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#FF7F50]/10 to-transparent blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-[#FF7F50]/4 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-[#FF7F50]/3 blur-[160px] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10 pt-28 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Savings Goals</h1>
            <p className="text-gray-400 mt-1">Track your progress and reach your targets</p>
          </div>
          <button className="bg-[#FF7F50] hover:bg-[#ff8f66] text-black font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_4px_20px_rgba(255,127,80,0.2)] text-xs uppercase font-mono tracking-wider">
            <Plus className="w-4 h-4" /> New Goal
          </button>
        </div>

        {/* Total Savings Summary */}
        <div className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-mono">Total Saved</p>
              <p className="text-3xl font-bold text-white">${totalSaved.toLocaleString()}</p>
              <p className="text-emerald-400 text-sm mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> +35% from last month
              </p>
            </div>
            <div className="bg-[#FF7F50]/10 rounded-full p-4 border border-[#FF7F50]/20">
              <PiggyBank className="w-8 h-8 text-[#FF7F50]" />
            </div>
          </div>
        </div>

        {/* Savings Goals */}
        <h2 className="text-lg font-semibold text-white mb-4">Your Goals</h2>
        <div className="space-y-4">
          {goalList}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-r from-[#FF7F50]/10 to-[#E05A2B]/10 border border-[#FF7F50]/20 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl">💡</span> Savings Tip
          </h3>
          <p className="text-gray-300">Save 20% of your monthly income to reach your goals faster!</p>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 font-mono">
          {trustBadges.map((badge, idx) => (
            <React.Fragment key={idx}>
              <TrustBadge icon={badge.icon} label={badge.label} />
              {idx < trustBadges.length - 1 && <span className="text-gray-700">•</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}