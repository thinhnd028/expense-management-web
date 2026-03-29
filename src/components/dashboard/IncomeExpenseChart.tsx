'use client'

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useCurrency } from '@/contexts/CurrencyContext'

const chartConfig = {
  income: { label: 'Thu nhập', color: 'oklch(0.648 0.2 131.684)' },
  expense: { label: 'Chi tiêu', color: 'oklch(0.577 0.245 27.325)' },
} satisfies ChartConfig

interface ChartData {
  month: string
  income: number
  expense: number
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; fill: string }>
  label?: string
}) {
  const { formatAmount } = useCurrency()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2 shadow-xl text-xs min-w-37.5">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: p.fill }} />
            <span className="text-muted-foreground">
              {chartConfig[p.dataKey as keyof typeof chartConfig]?.label}
            </span>
          </div>
          <span className="font-semibold text-foreground">{formatAmount(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function IncomeExpenseChart({ data }: { data: ChartData[] }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-45 text-muted-foreground text-sm">
      Chưa có dữ liệu
    </div>
  )

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-50 w-full">
      <BarChart data={data} barCategoryGap="35%" barGap={3}>
        <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--color-border)" opacity={0.5} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} dy={4} />
        <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="income" fill="var(--color-income)" radius={[5, 5, 0, 0]} maxBarSize={22} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={[5, 5, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ChartContainer>
  )
}
