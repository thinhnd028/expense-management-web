'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DebtWithTransactions } from '@/types/database'
import { useCurrency } from '@/contexts/CurrencyContext'
import Button from '@/components/ui/Button'
import NumericKeypad from '@/components/ui/NumericKeypad'

interface RepaymentFormProps {
  debt: DebtWithTransactions
  onSuccess: () => void
  onCancel: () => void
}

export default function RepaymentForm({ debt, onSuccess, onCancel }: RepaymentFormProps) {
  const [amount, setAmount] = useState('0')
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

      <div className="text-center py-3">
        <p className="text-xs text-muted-foreground mb-1">Payment amount</p>
        <p className="text-4xl font-bold text-primary">
          {formatAmount(parseFloat(amount) || 0)}
        </p>
      </div>

      <NumericKeypad value={amount} onChange={setAmount} />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Note (optional)</label>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. Cash payment"
          className="w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex gap-2">
        {[{ label: '25%', val: remaining / 4 }, { label: '50%', val: remaining / 2 }].map(({ label, val }) => (
          <button
            key={label}
            onClick={() => setAmount(String(val))}
            className="flex-1 py-2 rounded-xl bg-muted text-xs font-medium text-muted-foreground hover:bg-muted/70 transition-colors"
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setAmount(String(remaining))}
          className="flex-1 py-2 rounded-xl bg-primary/10 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
        >
          Full
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">Record Payment</Button>
      </div>
    </div>
  )
}
