'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { useCurrency } from '@/contexts/CurrencyContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface ChartData {
  month: string
  income: number
  expense: number
}

export default function IncomeExpenseChart({ data }: { data: ChartData[] }) {
  const { formatAmount } = useCurrency()

  if (!data.length) return (
    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No data yet</div>
  )

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: data.map(d => d.income),
        backgroundColor: '#10b981',
        borderRadius: 6,
        borderSkipped: false as const,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
      {
        label: 'Expense',
        data: data.map(d => d.expense),
        backgroundColor: '#f87171',
        borderRadius: 6,
        borderSkipped: false as const,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label: string }; raw: unknown }) =>
            ` ${ctx.dataset.label}: ${formatAmount(ctx.raw as number)}`,
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
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        border: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          maxTicksLimit: 5,
          callback: (v: number | string) =>
            typeof v === 'number' && v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v,
        },
      },
    },
    animation: { duration: 400 },
  }

  return (
    <div className="h-[200px]">
      <Bar data={chartData} options={options} />
    </div>
  )
}
