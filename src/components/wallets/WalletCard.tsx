'use client'

import { Wallet } from '@/types/database'
import { WALLET_TYPE_LABELS } from '@/lib/utils'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Pencil, Trash2, Banknote, Building2, Smartphone } from 'lucide-react'

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
    <div
      className="relative rounded-2xl p-5 text-white overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${wallet.color}, ${wallet.color}cc)` }}
    >
      {/* Decorative circles */}
      <div className="absolute right-0 top-0 w-32 h-32 rounded-full opacity-10 bg-white translate-x-10 -translate-y-10" />
      <div className="absolute right-0 bottom-0 w-20 h-20 rounded-full opacity-10 bg-white translate-x-5 translate-y-5" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-white/70 text-xs font-medium uppercase tracking-wider">
              <WalletIcon className="w-3.5 h-3.5" />
              {WALLET_TYPE_LABELS[wallet.type]}
            </div>
            <p className="font-semibold text-lg mt-0.5">{wallet.name}</p>
          </div>

          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(wallet)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(wallet)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <p className="text-2xl font-bold">{formatAmount(wallet.balance)}</p>
      </div>
    </div>
  )
}
