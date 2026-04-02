'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { TransactionType } from '@/types/database'
import NumericKeypad from '@/components/common/NumericKeypad'
import Button from '@/components/common/Button'
import Select from '@/components/common/Select'
import { Label } from '@/components/ui/label'
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
      <div className="flex bg-muted rounded-2xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setType(tab.value)}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
              type === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Amount Display */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground mb-1">
          {selectedWallet ? `From: ${selectedWallet.name}` : 'Select wallet'}
        </p>
        <p className={cn(
          'text-4xl font-bold',
          type === 'income' ? 'text-emerald-600' : type === 'transfer' ? 'text-blue-600' : 'text-destructive'
        )}>
          {formatCurrency(parseFloat(amount) || 0)}
        </p>
      </div>

      <NumericKeypad value={amount} onChange={setAmount} />

      <div className="space-y-3 pt-2">
        <Select value={walletId} onChange={e => setWalletId(e.target.value)} label={type === 'transfer' ? 'From Wallet' : 'Wallet'}>
          <option value="">Select wallet</option>
          {wallets.map(w => (
            <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>
          ))}
        </Select>

        {type === 'transfer' && (
          <Select value={toWalletId} onChange={e => setToWalletId(e.target.value)} label="To Wallet">
            <option value="">Select destination</option>
            {wallets.filter(w => w.id !== walletId).map(w => (
              <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>
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
          <Label className="block mb-1.5">Note (optional)</Label>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note..."
            className="w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <Label className="block mb-1.5">Date</Label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">Save Transaction</Button>
      </div>
    </div>
  )
}
