'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DebtWithTransactions } from '@/types/database'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RepaymentFormProps {
  debt: DebtWithTransactions
  onSuccess: () => void
  onCancel: () => void
}

export default function RepaymentForm({ debt, onSuccess, onCancel }: RepaymentFormProps) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()
  const { formatAmount } = useCurrency()
  const remaining = debt.remaining || 0

  async function handleSubmit() {
    const num = parseFloat(amount)
    if (!num || num <= 0) { setError('Enter a valid amount'); return }
    if (num > remaining) { setError(`Cannot exceed remaining amount of ${formatAmount(remaining)}`); return }

    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('debt_transactions').insert({
      debt_id: debt.id,
      amount: num,
      note: note.trim() || null,
    })

    if (err) { setError(err.message); setLoading(false); return }

    if (num >= remaining) {
      await supabase.from('debts').update({ status: 'paid' }).eq('id', debt.id)
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-foreground">{debt.name}</p>
            <p className="text-xs text-muted-foreground">{debt.type === 'borrow' ? 'You owe' : 'They owe you'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">{formatAmount(remaining)}</p>
            <p className="text-xs text-muted-foreground">remaining</p>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Payment amount</Label>
        <Input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0"
          min="0"
          max={remaining}
          step="any"
        />
      </div>

      {/* Quick amount buttons */}
      <div className="flex gap-2">
        {[{ label: '25%', val: remaining / 4 }, { label: '50%', val: remaining / 2 }].map(({ label, val }) => (
          <Button
            key={label}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setAmount(String(val))}
            className="flex-1"
          >
            {label}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAmount(String(remaining))}
          className="flex-1"
        >
          Full
        </Button>
      </div>

      <div className="space-y-1">
        <Label>Note (optional)</Label>
        <Input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. Cash payment"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">Record Payment</Button>
      </div>
    </div>
  )
}
