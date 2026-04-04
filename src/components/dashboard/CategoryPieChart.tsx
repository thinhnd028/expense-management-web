'use client'

import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import {
  Briefcase, Laptop, TrendingUp, TrendingDown, Gift, DollarSign,
  Utensils, Car, ShoppingBag, Gamepad2, HeartPulse, BookOpen,
  Zap, Home, CreditCard, Circle, Banknote, Building2, Smartphone,
  ArrowLeftRight, Wallet, Users, LayoutDashboard, Plus, Minus,
  type LucideProps,
} from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Briefcase, Laptop, TrendingUp, TrendingDown, Gift, DollarSign,
  Utensils, Car, ShoppingBag, Gamepad2, HeartPulse, BookOpen,
  Zap, Home, CreditCard, Circle, Banknote, Building2, Smartphone,
  ArrowLeftRight, Wallet, Users, LayoutDashboard, Plus, Minus,
}

interface CategoryData {
  name: string
  value: number
  color: string
  icon: string
}

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: CategoryData }>
}) {
  const { formatAmount } = useCurrency()
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground">{item.name}</p>
      <p className="text-muted-foreground mt-0.5">{formatAmount(item.value)}</p>
    </div>
  )
}

export default function CategoryPieChart({ data }: { data: CategoryData[] }) {
  const { formatAmount } = useCurrency()

  if (!data.length) return (
    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
      Chưa có chi tiêu
    </div>
  )

  const total = data.reduce((s, x) => s + x.value, 0)

  return (
    <div className="flex items-center gap-4">
      <ChartContainer config={{} as ChartConfig} className="aspect-square w-36 h-36 shrink-0">
        <PieChart>
          <Tooltip cursor={false} content={<CustomTooltip />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={66}
            dataKey="value"
            nameKey="name"
            strokeWidth={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="var(--background)" />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="flex-1 space-y-2.5 min-w-0">
        {data.slice(0, 5).map((d, i) => {
          const pct = total ? Math.round((d.value / total) * 100) : 0
          const Icon = ICON_MAP[d.icon] ?? Circle
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: d.color + '20' }}
              >
                <Icon className="w-3 h-3" style={{ color: d.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs text-foreground font-medium truncate">{d.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: d.color }}
                  />
                </div>
              </div>
            </div>
          )
        })}
        <p className="text-xs text-muted-foreground pt-1">
          Tổng: <span className="font-semibold text-foreground">{formatAmount(total)}</span>
        </p>
      </div>
    </div>
  )
}
