// src/app/pages/CategoryDonut.tsx
// Decorative: the same figures are listed as text beside the chart, so it is hidden from assistive tech.
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export interface DonutSlice { name: string; amount: number; color: string }

export default function CategoryDonut({ data }: { data: DonutSlice[] }) {
  return (
    <div className="w-full h-full" aria-hidden="true" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart accessibilityLayer={false} tabIndex={-1}>
          <Pie rootTabIndex={-1} data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="amount" isAnimationActive={false}>
            {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
