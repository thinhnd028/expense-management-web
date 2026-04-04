'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { TransactionType } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const [amount, setAmount] = useState('')
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

      <div className="space-y-3">
        {/* Amount */}
        <div className="space-y-1">
          <Label>
            Amount
            {selectedWallet && (
              <span className="ml-1 font-normal text-muted-foreground">
                — {selectedWallet.name} ({formatCurrency(selectedWallet.balance)})
              </span>
            )}
          </Label>
          <Input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="any"
            className={cn(
              'text-lg font-semibold',
              type === 'income' ? 'text-emerald-600' : type === 'transfer' ? 'text-blue-600' : 'text-destructive'
            )}
          />
        </div>

        {/* Wallet */}
        <div className="space-y-1">
          <Label>{type === 'transfer' ? 'From Wallet' : 'Wallet'}</Label>
          <select
            value={walletId}
            onChange={e => setWalletId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 transition-colors appearance-none cursor-pointer"
          >
            <option value="">Select wallet</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>
            ))}
          </select>
        </div>

        {type === 'transfer' && (
          <div className="space-y-1">
            <Label>To Wallet</Label>
            <select
              value={toWalletId}
              onChange={e => setToWalletId(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 transition-colors appearance-none cursor-pointer"
            >
              <option value="">Select destination</option>
              {wallets.filter(w => w.id !== walletId).map(w => (
                <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>
              ))}
            </select>
          </div>
        )}

        {type !== 'transfer' && (
          <div className="space-y-1">
            <Label>Category</Label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 transition-colors appearance-none cursor-pointer"
            >
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <Label>Note (optional)</Label>
          <Input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note..."
          />
        </div>

        <div className="space-y-1">
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
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
