'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { TransactionType } from '@/types/database'
import NumericKeypad from '@/components/ui/NumericKeypad'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TransactionFormProps {
  userId: string
  onSuccess: () => void
  onCancel: () => void
  defaultType?: TransactionType
}

const TABS: { label: string; value: TransactionType }[] = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
  { label: 'Transfer', value: 'transfer' },
]

export default function TransactionForm({ userId, onSuccess, onCancel, defaultType = 'expense' }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(defaultType)
  const [amount, setAmount] = useState('0')
  const [walletId, setWalletId] = useState('')
  const [toWalletId, setToWalletId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { wallets } = useWallets()
  const { categories } = useCategories(type === 'transfer' ? undefined : type)
  const supabase = createClient()

  // Set defaults when data loads
  useEffect(() => {
    if (wallets.length > 0 && !walletId) setWalletId(wallets[0].id)
  }, [wallets])

  useEffect(() => {
    if (categories.length > 0 && type !== 'transfer') setCategoryId(categories[0].id)
    if (type === 'transfer') setCategoryId('')
  }, [categories, type])

  async function handleSubmit() {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) { setError('Enter a valid amount'); return }
    if (!walletId) { setError('Select a wallet'); return }
    if (type === 'transfer' && !toWalletId) { setError('Select destination wallet'); return }
    if (type === 'transfer' && walletId === toWalletId) { setError('Cannot transfer to same wallet'); return }

    setLoading(true)
    setError('')

    const { error: err } = await supabase.rpc('create_transaction', {
      p_user_id: userId,
      p_wallet_id: walletId,
      p_to_wallet_id: type === 'transfer' ? toWalletId : null,
      p_amount: numAmount,
      p_type: type,
      p_category_id: categoryId || null,
      p_note: note.trim() || null,
      p_date: new Date(date + 'T00:00:00').toISOString(),
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    onSuccess()
  }

  const selectedWallet = wallets.find(w => w.id === walletId)

  return (
    <div className="space-y-4">
      {/* Type Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setType(tab.value)}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
              type === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Amount Display */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400 mb-1">
          {selectedWallet ? `From: ${selectedWallet.name}` : 'Select wallet'}
        </p>
        <p className={cn(
          'text-4xl font-bold',
          type === 'income' ? 'text-emerald-600' : type === 'transfer' ? 'text-blue-600' : 'text-red-500'
        )}>
          {formatCurrency(parseFloat(amount) || 0)}
        </p>
      </div>

      {/* Numeric Keypad */}
      <NumericKeypad value={amount} onChange={setAmount} />

      {/* Details */}
      <div className="space-y-3 pt-2">
        <Select value={walletId} onChange={e => setWalletId(e.target.value)} label={type === 'transfer' ? 'From Wallet' : 'Wallet'}>
          <option value="">Select wallet</option>
          {wallets.map(w => (
            <option key={w.id} value={w.id}>
              {w.name} ({formatCurrency(w.balance)})
            </option>
          ))}
        </Select>

        {type === 'transfer' && (
          <Select value={toWalletId} onChange={e => setToWalletId(e.target.value)} label="To Wallet">
            <option value="">Select destination</option>
            {wallets.filter(w => w.id !== walletId).map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({formatCurrency(w.balance)})
              </option>
            ))}
          </Select>
        )}

        {type !== 'transfer' && (
          <Select value={categoryId} onChange={e => setCategoryId(e.target.value)} label="Category">
            <option value="">No category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </Select>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          Save Transaction
        </Button>
      </div>
    </div>
  )
}
