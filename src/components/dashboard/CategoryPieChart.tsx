'use client'

import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { useCurrency } from '@/contexts/CurrencyContext'
import DynamicIcon from '@/components/ui/DynamicIcon'

ChartJS.register(ArcElement, Tooltip)

interface CategoryData {
  name: string
  value: number
  color: string
  icon: string
}

export default function CategoryPieChart({ data }: { data: CategoryData[] }) {
  const { formatAmount } = useCurrency()

  if (!data.length) return (
    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No expense data</div>
  )

  const total = data.reduce((s, x) => s + x.value, 0)

  const chartData = {
    labels: data.map(d => d.name),
    datasets: [{
      data: data.map(d => d.value),
      backgroundColor: data.map(d => d.color),
      borderWidth: 2,
      borderColor: '#fff',
      hoverBorderWidth: 0,
    }],
  }

  const options = {
    cutout: '64%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => ` ${formatAmount(ctx.raw as number)}`,
        },
        backgroundColor: '#fff',
        titleColor: '#374151',
        bodyColor: '#6b7280',
        borderColor: '#f3f4f6',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
      },
    },
    animation: { duration: 400 },
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="relative w-40 h-40 shrink-0">
        <Doughnut data={chartData} options={options} />
      </div>

      <div className="flex-1 space-y-2 w-full">
        {data.slice(0, 5).map((d, i) => {
          const pct = total ? Math.round((d.value / total) * 100) : 0
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: d.color + '20' }}>
                <DynamicIcon name={d.icon} className="w-3 h-3" style={{ color: d.color }} />
              </div>
              <span className="text-xs text-muted-foreground flex-1 truncate">{d.name}</span>
              <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
              <span className="text-xs font-semibold text-foreground">{formatAmount(d.value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
