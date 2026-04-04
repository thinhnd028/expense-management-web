'use client'

import { TransactionWithDetails } from '@/types/database'
import { formatDateShort } from '@/lib/utils'
import {
  ArrowRight, Trash2,
  Briefcase, Laptop, TrendingUp, TrendingDown, Gift, DollarSign,
  Utensils, Car, ShoppingBag, Gamepad2, HeartPulse, BookOpen,
  Zap, Home, CreditCard, Circle, Banknote, Building2, Smartphone,
  ArrowLeftRight, Wallet, Users, LayoutDashboard, Plus, Minus,
  type LucideProps,
} from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Badge } from '@/components/ui/badge'

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Briefcase, Laptop, TrendingUp, TrendingDown, Gift, DollarSign,
  Utensils, Car, ShoppingBag, Gamepad2, HeartPulse, BookOpen,
  Zap, Home, CreditCard, Circle, Banknote, Building2, Smartphone,
  ArrowLeftRight, Wallet, Users, LayoutDashboard, Plus, Minus,
}

interface TransactionItemProps {
  transaction: TransactionWithDetails
  onDelete?: (id: string) => void
}

export default function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === 'income'
  const isTransfer = transaction.type === 'transfer'
  const { formatAmount } = useCurrency()

  const fallbackIcon = isTransfer ? 'ArrowLeftRight' : isIncome ? 'TrendingUp' : 'TrendingDown'
  const iconName = transaction.categories?.icon || fallbackIcon
  const Icon = ICON_MAP[iconName] ?? Circle
  const categoryName = transaction.categories?.name || (isTransfer ? 'Chuyển khoản' : isIncome ? 'Thu nhập' : 'Chi tiêu')

  const amountColor = isIncome ? 'text-emerald-700' : isTransfer ? 'text-foreground' : 'text-destructive'
  const amountPrefix = isIncome ? '+' : isTransfer ? '' : '-'

  const categoryBg = isIncome
    ? 'bg-emerald-100 text-emerald-700'
    : isTransfer
    ? 'bg-muted text-muted-foreground'
    : 'bg-muted text-muted-foreground'

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-muted/60 transition-colors cursor-pointer group">
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Description + wallet */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {transaction.note || categoryName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {(transaction.wallets as { name: string } | null)?.name}
          </span>
          {isTransfer && (
            <>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {(transaction.to_wallet as { name: string } | null)?.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Category chip */}
      <Badge className={`hidden sm:inline-flex uppercase tracking-wide shrink-0 border-none text-xs font-medium ${categoryBg}`}>
        {categoryName}
      </Badge>

      {/* Date */}
      <span className="hidden md:block text-xs text-muted-foreground shrink-0 tabular-nums">
        {formatDateShort(transaction.date)}
      </span>

      {/* Amount */}
      <p className={`font-semibold text-sm tabular-nums shrink-0 ${amountColor}`}>
        {amountPrefix}{formatAmount(transaction.amount)}
      </p>

      {/* Delete */}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(transaction.id) }}
          className="p-1.5 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
