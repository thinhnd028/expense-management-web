'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrency } from '@/contexts/CurrencyContext'
import DynamicIcon from '@/components/ui/DynamicIcon'

interface CategoryData {
  name: string
  value: number
  color: string
  icon: string
}

interface CategoryPieChartProps {
  data: CategoryData[]
}

function CustomTooltip({ active, payload, formatAmount }: { active?: boolean; payload?: Array<{ payload: CategoryData }>; formatAmount: (n: number) => string }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-gray-700">
        <DynamicIcon name={d.icon} className="w-3.5 h-3.5" style={{ color: d.color }} />
        {d.name}
      </div>
      <p className="text-gray-500 mt-0.5">{formatAmount(d.value)}</p>
    </div>
  )
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { formatAmount } = useCurrency()
  if (!data.length) return (
    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
      No expense data
    </div>
  )

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip formatAmount={formatAmount} />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex-1 space-y-2 w-full">
        {data.slice(0, 5).map((d, i) => {
          const total = data.reduce((s, x) => s + x.value, 0)
          const pct = total ? Math.round((d.value / total) * 100) : 0
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: d.color + '20' }}>
                <DynamicIcon name={d.icon} className="w-3 h-3" style={{ color: d.color }} />
              </div>
              <span className="text-xs text-gray-600 flex-1 truncate">{d.name}</span>
              <span className="text-xs font-medium text-gray-500">{pct}%</span>
              <span className="text-xs font-semibold text-gray-800">{formatAmount(d.value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
