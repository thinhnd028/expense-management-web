'use client'

import { TransactionWithDetails } from '@/types/database'
import { formatDateShort, TRANSACTION_TYPE_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ArrowRight, Trash2 } from 'lucide-react'
import DynamicIcon from '@/components/ui/DynamicIcon'
import { useCurrency } from '@/contexts/CurrencyContext'

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
  const iconColor = transaction.categories?.color || (isTransfer ? '#3b82f6' : isIncome ? '#10b981' : '#ef4444')

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${iconColor}18` }}
      >
        <DynamicIcon name={iconName} className="w-5 h-5" style={{ color: iconColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {transaction.categories?.name || (isTransfer ? 'Transfer' : transaction.note || 'Transaction')}
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
          <span className="text-xs text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground">{formatDateShort(transaction.date)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className={cn('font-semibold text-sm', TRANSACTION_TYPE_COLORS[transaction.type])}>
          {isIncome ? '+' : isTransfer ? '' : '-'}{formatAmount(transaction.amount)}
        </p>
        {onDelete && (
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
