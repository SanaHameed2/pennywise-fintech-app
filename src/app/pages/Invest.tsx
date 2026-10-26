// src/app/pages/Invest.tsx
import React, { useMemo } from 'react';
import { TrendingUp, ArrowRight, Bitcoin, DollarSign, Shield, Sparkles } from 'lucide-react';
// ✅ Removed: BarChart3 (not used)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: InvestmentItem
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const InvestmentItem = React.memo(({ 
  investment 
}: { 
  investment: { name: string; returns: string; amount: number; positive: boolean } 
}) => {
  const Icon = investment.name === "Bitcoin" ? Bitcoin : DollarSign;
  
  return (
    <div className="bg-[#0d0d12] border border-white/[0.06] rounded-xl p-4 flex justify-between items-center hover:border-white/10 transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${investment.positive ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          <Icon className={`w-6 h-6 ${investment.positive ? 'text-emerald-400' : 'text-red-400'}`} />
        </div>
        <div>
          <p className="font-medium text-white">{investment.name}</p>
          <p className="text-sm text-gray-500 font-mono">${investment.amount.toLocaleString()}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${investment.positive ? 'text-emerald-400' : 'text-red-400'}`}>{investment.returns}</p>
        <button className="text-[#FF7F50] text-xs hover:text-[#ff8f66] transition-colors font-mono">
          View Details
        </button>
      </div>
    </div>
  );
});

InvestmentItem.displayName = 'InvestmentItem';

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
// ✅ Main Invest Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Invest() {
  // ✅ useMemo: Static investments data
  const investments = useMemo(() => [
    { name: "S&P 500 ETF", returns: "+12.5%", amount: 5000, positive: true },
    { name: "Bitcoin", returns: "-3.2%", amount: 2000, positive: false },
    { name: "Tech Growth Fund", returns: "+8.7%", amount: 3500, positive: true },
  ], []);

  // ✅ useMemo: Memoize investment list
  const investmentList = useMemo(() => {
    return investments.map((inv, i) => (
      <InvestmentItem key={i} investment={inv} />
    ));
  }, [investments]);

  // ✅ useMemo: Trust badges
  const trustBadges = useMemo(() => [
    { icon: Shield, label: '256-bit encryption' },
    { icon: Sparkles, label: 'AI-powered insights' },
  ], []);

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative selection:bg-[#FF7F50]/20 antialiased font-sans">
      {/* Background Glows - Pennywise theme */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#FF7F50]/10 to-transparent blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-[#FF7F50]/4 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-[#FF7F50]/3 blur-[160px] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10 pt-28 pb-12">
        <h1 className="text-3xl font-bold text-white mb-2">Investments</h1>
        <p className="text-gray-400 mb-8">Grow your wealth with smart investments</p>

        {/* Portfolio Summary */}
        <div className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-mono">Total Portfolio Value</p>
              <p className="text-3xl font-bold text-white mt-1">$10,500</p>
              <p className="text-emerald-400 text-sm mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> +8.2% from last month
              </p>
            </div>
            <div className="bg-emerald-500/10 rounded-full p-4 border border-emerald-500/20">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Investment List */}
        <h2 className="text-lg font-semibold text-white mb-4">Your Investments</h2>
        <div className="space-y-3">
          {investmentList}
        </div>

        {/* Recommended */}
        <div className="mt-8 bg-gradient-to-r from-[#FF7F50]/20 to-[#E05A2B]/20 border border-[#FF7F50]/20 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">AI Investment Recommendation</h3>
              <p className="text-gray-400 text-sm mt-1">Based on your risk profile</p>
            </div>
            <button className="bg-[#FF7F50] text-black px-5 py-2.5 rounded-xl font-bold text-xs uppercase font-mono tracking-wider hover:bg-[#ff8f66] transition-all shadow-[0_4px_20px_rgba(255,127,80,0.2)] flex items-center gap-2">
              Explore <ArrowRight className="w-4 h-4" />
            </button>
          </div>
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