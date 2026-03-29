'use client'

import { Wallet } from '@/types/database'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Pencil, Trash2, Banknote, Building2, Smartphone, ArrowLeftRight } from 'lucide-react'

const WALLET_ICONS = {
  cash: Banknote,
  bank: Building2,
  'e-wallet': Smartphone,
}

interface WalletCardProps {
  wallet: Wallet
  onEdit?: (wallet: Wallet) => void
  onDelete?: (wallet: Wallet) => void
}

export default function WalletCard({ wallet, onEdit, onDelete }: WalletCardProps) {
  const WalletIcon = WALLET_ICONS[wallet.type] ?? Banknote
  const { formatAmount } = useCurrency()

  return (
    <div className="group bg-white border border-[#c6c5d4]/30 rounded-xl p-6 hover:shadow-xl hover:shadow-[#0e1c2b]/5 transition-all duration-300">
      {/* Top row: icon + action buttons */}
      <div className="flex justify-between items-start mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: wallet.color + '18' }}
        >
          <WalletIcon className="w-6 h-6" style={{ color: wallet.color }} />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(wallet)}
              className="p-1.5 hover:bg-[#e7e8e9] rounded-md text-[#454652] transition-colors"
              title="Sửa"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(wallet)}
              className="p-1.5 hover:bg-[#ffdad6] rounded-md text-[#ba1a1a] transition-colors"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Name + type */}
      <h3 className="text-lg font-bold text-[#0e1c2b] mb-1">{wallet.name}</h3>
      <p className="text-xs text-[#454652] font-medium mb-4 uppercase tracking-tighter">
        {wallet.type === 'cash' ? 'Tiền mặt' : wallet.type === 'bank' ? 'Ngân hàng' : 'Ví điện tử'}
      </p>

      {/* Balance */}
      <div className="text-2xl font-bold text-[#0e1c2b] tabular-nums mb-6">
        {formatAmount(wallet.balance)}
      </div>

      {/* Action button */}
      <button className="w-full py-2.5 bg-[#f3f4f5] hover:bg-[#0e1c2b] hover:text-white text-[#0e1c2b] font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
        <ArrowLeftRight className="w-4 h-4" />
        Chuyển tiền
      </button>
    </div>
  )
}
