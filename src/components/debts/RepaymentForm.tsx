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

    // Auto-mark as paid if fully paid
    if (num >= remaining) {
      await supabase.from('debts').update({ status: 'paid' }).eq('id', debt.id)
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-800">{debt.name}</p>
            <p className="text-xs text-gray-400">{debt.type === 'borrow' ? 'You owe' : 'They owe you'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{formatAmount(remaining)}</p>
            <p className="text-xs text-gray-400">remaining</p>
          </div>
        </div>
      </div>

      {/* Amount display */}
      <div className="text-center py-3">
        <p className="text-xs text-gray-400 mb-1">Payment amount</p>
        <p className="text-4xl font-bold text-indigo-600">
          {formatAmount(parseFloat(amount) || 0)}
        </p>
      </div>

      <NumericKeypad value={amount} onChange={setAmount} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. Cash payment"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Quick fill buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setAmount(String(remaining / 4))}
          className="flex-1 py-2 rounded-xl bg-gray-100 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
        >
          25%
        </button>
        <button
          onClick={() => setAmount(String(remaining / 2))}
          className="flex-1 py-2 rounded-xl bg-gray-100 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
        >
          50%
        </button>
        <button
          onClick={() => setAmount(String(remaining))}
          className="flex-1 py-2 rounded-xl bg-indigo-100 text-xs font-medium text-indigo-700 hover:bg-indigo-200 transition-colors"
        >
          Full
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          Record Payment
        </Button>
      </div>
    </div>
  )
}
