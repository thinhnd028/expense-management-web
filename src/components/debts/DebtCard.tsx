'use client'

import { DebtWithTransactions } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Check, Plus, Trash2, Calendar, User } from 'lucide-react'

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
    <div className="bg-white rounded-xl p-6 transition-all hover:bg-[#e7e8e9] border border-transparent hover:border-[#c6c5d4]/20 group">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Avatar icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 ${isBorrow ? 'bg-[#233141]' : 'bg-[#3f6653]'}`}>
          {debt.name[0].toUpperCase()}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-[#0e1c2b] text-base truncate">{debt.name}</h3>
            <span className={`ml-2 shrink-0 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight rounded-full ${isBorrow ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#beead1] text-[#274e3d]'}`}>
              {isBorrow ? 'Tôi đang nợ' : 'Người nợ tôi'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#454652]">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{isBorrow ? 'Khoản vay' : 'Cho vay'}</span>
            </div>
            {debt.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Hạn: {formatDate(debt.due_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="sm:text-right shrink-0">
          <p className="font-headline text-lg font-bold text-[#0e1c2b] tabular-nums">{formatAmount(debt.amount)}</p>
          {!isPaid && remaining < debt.amount && (
            <p className="text-xs text-[#454652]">Còn: {formatAmount(remaining)}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!isPaid && (
        <div className="mt-5">
          <div className="flex justify-between text-[10px] font-bold text-[#454652] uppercase tracking-widest mb-2">
            <span>Tiến độ thanh toán</span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#edeeef] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-[#0e1c2b]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {debt.note && (
        <p className="mt-3 text-xs text-[#454652] truncate">{debt.note}</p>
      )}

      {/* Actions */}
      {isPaid ? (
        <div className="mt-4 flex items-center gap-2 text-xs text-[#3f6653] font-bold">
          <Check className="w-4 h-4" />
          Đã thanh toán xong
        </div>
      ) : (
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => onRepay(debt)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#f3f4f5] text-[#0e1c2b] text-xs font-bold hover:bg-[#e7e8e9] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ghi nhận
          </button>
          <button
            onClick={() => onMarkPaid(debt)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#beead1] text-[#274e3d] text-xs font-bold hover:bg-[#a5d0b9] transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Đã xong
          </button>
          <button
            onClick={() => onDelete(debt)}
            className="p-2 rounded-lg bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb3b1] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
