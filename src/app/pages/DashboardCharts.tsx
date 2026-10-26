// src/app/pages/DashboardCharts.tsx
import React, { memo } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface DashboardChartsProps {
  data: Array<{
    month: string;
    balance: number;
    spending: number;
    income: number;
  }>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: ChartTooltip
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ChartTooltip = React.memo(({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-[#0D0D12] border border-white/[0.06] rounded-xl p-3 shadow-xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
});

ChartTooltip.displayName = 'ChartTooltip';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: BalanceChart
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BalanceChart = React.memo(({ data }: { data: DashboardChartsProps['data'] }) => {
  return (
    <div className="lg:col-span-2 bg-[#0D0D12] border border-white/5 rounded-[24px] shadow-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold">Financial Overview</h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-white/40">
            <span className="w-2 h-2 rounded-full bg-[#FF7F50]" /> Balance
          </span>
          <span className="flex items-center gap-1.5 text-white/40">
            <span className="w-2 h-2 rounded-full bg-[#A78BFA]" /> Income
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF7F50" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF7F50" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="month" 
              stroke="rgba(255,255,255,0.2)" 
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} 
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} 
            />
            <Tooltip content={<ChartTooltip />} />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#FF7F50" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorBalance)" 
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#A78BFA" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorIncome)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

BalanceChart.displayName = 'BalanceChart';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: SpendingChart
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SpendingChart = React.memo(({ data }: { data: DashboardChartsProps['data'] }) => {
  return (
    <div className="bg-[#0D0D12] border border-white/5 rounded-[24px] shadow-2xl p-6">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold mb-4">Spending Trend</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="month" 
              stroke="rgba(255,255,255,0.2)" 
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} 
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} 
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="spending"
              stroke="#FF7F50"
              strokeWidth={3}
              dot={{ fill: '#FF7F50', r: 4, strokeWidth: 2, stroke: '#0D0D12' }}
              activeDot={{ r: 6, stroke: '#FF7F50', strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

SpendingChart.displayName = 'SpendingChart';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Main DashboardCharts Component (memoized)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DashboardCharts = memo(({ data }: DashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BalanceChart data={data} />
      <SpendingChart data={data} />
    </div>
  );
});

DashboardCharts.displayName = 'DashboardCharts';

export default DashboardCharts;