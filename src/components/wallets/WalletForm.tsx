'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wallet } from '@/types/database'
import { WALLET_COLORS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface WalletFormProps {
  wallet?: Wallet
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function WalletForm({ wallet, userId, onSuccess, onCancel }: WalletFormProps) {
  const [name, setName] = useState(wallet?.name || '')
  const [type, setType] = useState(wallet?.type || 'cash')
  const [balance, setBalance] = useState(wallet ? String(wallet.balance) : '0')
  const [color, setColor] = useState(wallet?.color || WALLET_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }

    setLoading(true)
    setError('')

    if (wallet) {
      const { error: err } = await supabase
        .from('wallets')
        .update({ name: name.trim(), type: type as Wallet['type'], color })
        .eq('id', wallet.id)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.from('wallets').insert({
        user_id: userId,
        name: name.trim(),
        type: type as Wallet['type'],
        balance: parseFloat(balance) || 0,
        color,
      })
      if (err) { setError(err.message); setLoading(false); return }
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Wallet Name</Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. BCA Savings"
          autoFocus
        />
      </div>

      <div className="space-y-1">
        <Label>Type</Label>
        <select
          value={type}
          onChange={e => setType(e.target.value as Wallet['type'])}
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 transition-colors appearance-none cursor-pointer"
        >
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
          <option value="e-wallet">E-Wallet</option>
        </select>
      </div>

      {!wallet && (
        <div className="space-y-1">
          <Label>Initial Balance</Label>
          <Input
            type="number"
            value={balance}
            onChange={e => setBalance(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
      )}

      <div>
        <Label className="mb-2">Color</Label>
        <div className="flex flex-wrap gap-2">
          {WALLET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full transition-transform active:scale-95"
              style={{
                backgroundColor: c,
                outline: color === c ? `3px solid ${c}` : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {wallet ? 'Save Changes' : 'Create Wallet'}
        </Button>
      </div>
    </form>
  )
}
