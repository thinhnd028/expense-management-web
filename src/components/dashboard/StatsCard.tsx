import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  color: 'primary' | 'emerald' | 'red' | 'amber' | 'blue'
  trend?: { value: string; up: boolean }
}

const colorMap = {
  primary: { iconBg: 'bg-primary/10', icon: 'text-primary' },
  emerald: { iconBg: 'bg-emerald-100', icon: 'text-emerald-600' },
  red:     { iconBg: 'bg-red-100',     icon: 'text-red-500'    },
  amber:   { iconBg: 'bg-amber-100',   icon: 'text-amber-600'  },
  blue:    { iconBg: 'bg-blue-100',    icon: 'text-blue-600'   },
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color, trend }: StatsCardProps) {
  const colors = colorMap[color]
  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
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
      <p className="text-xs text-muted-foreground font-medium">{title}</p>
      <p className="text-xl font-bold text-card-foreground mt-0.5">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  )
}
