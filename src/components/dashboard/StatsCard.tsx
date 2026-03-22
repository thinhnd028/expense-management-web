import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  color: 'indigo' | 'emerald' | 'red' | 'amber' | 'blue'
  trend?: { value: string; up: boolean }
}

const colorMap = {
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', iconBg: 'bg-indigo-100', text: 'text-indigo-700' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', iconBg: 'bg-emerald-100', text: 'text-emerald-700' },
  red: { bg: 'bg-red-50', icon: 'text-red-500', iconBg: 'bg-red-100', text: 'text-red-600' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', iconBg: 'bg-amber-100', text: 'text-amber-700' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', iconBg: 'bg-blue-100', text: 'text-blue-700' },
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color, trend }: StatsCardProps) {
  const colors = colorMap[color]
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors.iconBg)}>
          <Icon className={cn('w-5 h-5', colors.icon)} />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            trend.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          )}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 font-medium">{title}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}
