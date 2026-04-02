'use client'

import { TransactionWithDetails } from '@/types/database'
import { formatDateShort } from '@/lib/utils'
import { ArrowRight, Trash2 } from 'lucide-react'
import DynamicIcon from '@/components/common/DynamicIcon'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Badge } from '@/components/ui/badge'

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
  const categoryName = transaction.categories?.name || (isTransfer ? 'Chuyển khoản' : isIncome ? 'Thu nhập' : 'Chi tiêu')

  const amountColor = isIncome ? 'text-[#3f6653]' : isTransfer ? 'text-[#0e1c2b]' : 'text-[#ba1a1a]'
  const amountPrefix = isIncome ? '+' : isTransfer ? '' : '-'

  const categoryBg = isIncome
    ? 'bg-[#beead1] text-[#436b58]'
    : isTransfer
    ? 'bg-[#e7e8e9] text-[#454652]'
    : 'bg-[#f3f4f5] text-[#454652]'

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-[#e7e8e9] transition-colors cursor-pointer group">
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-[#e7e8e9] flex items-center justify-center shrink-0">
        <DynamicIcon name={iconName} className="w-4 h-4 text-[#454652]" />
      </div>

      {/* Description + wallet */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#191c1d] truncate">
          {transaction.note || categoryName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-[#454652]">
            {(transaction.wallets as { name: string } | null)?.name}
          </span>
          {isTransfer && (
            <>
              <ArrowRight className="w-3 h-3 text-[#454652]" />
              <span className="text-xs text-[#454652]">
                {(transaction.to_wallet as { name: string } | null)?.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Category chip */}
      <Badge className={`hidden sm:inline-flex uppercase tracking-wide shrink-0 border-none ${categoryBg}`}>
        {categoryName}
      </Badge>

      {/* Date */}
      <span className="hidden md:block text-xs text-[#454652] shrink-0 tabular-nums">
        {formatDateShort(transaction.date)}
      </span>

      {/* Amount */}
      <p className={`font-bold text-sm tabular-nums shrink-0 ${amountColor}`}>
        {amountPrefix}{formatAmount(transaction.amount)}
      </p>

      {/* Delete */}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(transaction.id) }}
          className="p-1.5 rounded-lg text-[#454652]/40 hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
