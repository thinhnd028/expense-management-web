'use client'

import { DebtWithTransactions } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/CurrencyContext'
import { cn } from '@/lib/utils'
import { Check, Plus, Trash2, Calendar } from 'lucide-react'

interface DebtCardProps {
  debt: DebtWithTransactions
  onRepay: (debt: DebtWithTransactions) => void
  onMarkPaid: (debt: DebtWithTransactions) => void
  onDelete: (debt: DebtWithTransactions) => void
}

export default function DebtCard({ debt, onRepay, onMarkPaid, onDelete }: DebtCardProps) {
  const { formatAmount } = useCurrency()
  const isBorrow = debt.type === 'borrow'
  const isPaid = debt.status === 'paid'
  const remaining = debt.remaining || 0
  const paidAmount = debt.paid_amount || 0
  const progress = debt.amount > 0 ? (paidAmount / debt.amount) * 100 : 0

  return (
    <div className={cn(
      'bg-white rounded-2xl p-4 border shadow-sm transition-all',
      isPaid ? 'border-gray-100 opacity-60' : isBorrow ? 'border-amber-100' : 'border-blue-100'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold',
            isBorrow ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
          )}>
            {debt.name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{debt.name}</p>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              isBorrow ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
            )}>
              {isBorrow ? 'You owe' : 'Owes you'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">{formatAmount(debt.amount)}</p>
          {!isPaid && <p className="text-xs text-gray-400">Remaining: {formatAmount(remaining)}</p>}
        </div>
      </div>

      {!isPaid && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Paid: {formatAmount(paidAmount)}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', isBorrow ? 'bg-amber-400' : 'bg-blue-400')}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {(debt.note || debt.due_date) && (
        <div className="mb-3 space-y-1">
          {debt.note && <p className="text-xs text-gray-500 truncate">{debt.note}</p>}
          {debt.due_date && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              Due: {formatDate(debt.due_date)}
            </div>
          )}
        </div>
      )}

      {isPaid ? (
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
          <Check className="w-4 h-4" />
          Fully paid
        </div>
      ) : (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onRepay(debt)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Payment
          </button>
          <button
            onClick={() => onMarkPaid(debt)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Mark Paid
          </button>
          <button
            onClick={() => onDelete(debt)}
            className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
