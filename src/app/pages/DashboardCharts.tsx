// src/app/pages/DashboardCharts.tsx
// Charts are drawn from real server data (get_insights). Each chart is decorative for assistive tech;
// the same numbers are available to screen readers through the visually-hidden table below.
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatMoney } from '../../utils/money';

export interface ChartPoint {
  month: string;
  balance: number;
  spending: number;
  income: number;
}

interface DashboardChartsProps {
  data: ChartPoint[];
}

const compact = new Intl.NumberFormat('en-PK', { notation: 'compact', maximumFractionDigits: 1 });
const tick = { fontSize: 11, fill: 'rgba(255,255,255,0.7)' };

const ChartTooltip = React.memo(({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-white/70 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: <bdi dir="ltr">Rs. {formatMoney(entry.value)}</bdi>
        </p>
      ))}
    </div>
  );
});
ChartTooltip.displayName = 'ChartTooltip';

const BalanceChart = React.memo(({ data }: { data: ChartPoint[] }) => {
  const { t } = useTranslation();
  return (
    <div className="lg:col-span-2 bg-[#0D0D12] border border-white/5 rounded-[24px] shadow-2xl p-6">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold">{t('dashboard.financialOverview')}</h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-white/70"><span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#FF7F50]" /> {t('dashboard.balanceLegend')}</span>
          <span className="flex items-center gap-1.5 text-white/70"><span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#A78BFA]" /> {t('dashboard.income')}</span>
        </div>
      </div>
      <div className="h-64" aria-hidden="true" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} accessibilityLayer={false}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={tick} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={tick} tickFormatter={(v: number) => compact.format(v)} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="balance" name={t('dashboard.balanceLegend')} stroke="#FF7F50" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBalance)" />
            <Area type="monotone" dataKey="income" name={t('dashboard.income')} stroke="#A78BFA" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
BalanceChart.displayName = 'BalanceChart';

const SpendingChart = React.memo(({ data }: { data: ChartPoint[] }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-[#0D0D12] border border-white/5 rounded-[24px] shadow-2xl p-6">
      <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#FF7F50] font-semibold mb-4">{t('dashboard.spendingTrend')}</h2>
      <div className="h-64" aria-hidden="true" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} accessibilityLayer={false}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ ...tick, fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ ...tick, fontSize: 10 }} tickFormatter={(v: number) => compact.format(v)} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="spending" name={t('dashboard.expenses')} stroke="#FF7F50" strokeWidth={3}
              dot={{ fill: '#FF7F50', r: 4, strokeWidth: 2, stroke: '#0D0D12' }} activeDot={{ r: 6, stroke: '#FF7F50', strokeWidth: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
SpendingChart.displayName = 'SpendingChart';

const DashboardCharts = memo(({ data }: DashboardChartsProps) => {
  const { t } = useTranslation();
  return (
    <section aria-label={t('dashboard.financialOverview')}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BalanceChart data={data} />
        <SpendingChart data={data} />
      </div>
      <table className="sr-only">
        <caption>{t('dashboard.chartTableCaption')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('dashboard.month')}</th>
            <th scope="col">{t('dashboard.closingBalance')}</th>
            <th scope="col">{t('dashboard.income')}</th>
            <th scope="col">{t('dashboard.expenses')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.month}>
              <th scope="row">{p.month}</th>
              <td>Rs. {formatMoney(p.balance)}</td>
              <td>Rs. {formatMoney(p.income)}</td>
              <td>Rs. {formatMoney(p.spending)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
});
DashboardCharts.displayName = 'DashboardCharts';

export default DashboardCharts;
