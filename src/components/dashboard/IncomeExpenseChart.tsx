'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useCurrency } from '@/contexts/CurrencyContext'

interface ChartData {
  month: string
  income: number
  expense: number
}

interface IncomeExpenseChartProps {
  data: ChartData[]
}

function CustomTooltip({ active, payload, label, formatAmount }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string; formatAmount: (n: number) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-medium">{formatAmount(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const { formatAmount } = useCurrency()
  if (!data.length) return (
    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
      No data yet
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barGap={4} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          width={40}
        />
        <Tooltip content={<CustomTooltip formatAmount={formatAmount} />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="income" name="income" fill="#10b981" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" name="expense" fill="#f87171" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
