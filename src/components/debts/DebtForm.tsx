'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Handshake, ArrowUpFromLine } from 'lucide-react'

interface DebtFormProps {
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function DebtForm({ userId, onSuccess, onCancel }: DebtFormProps) {
  const [type, setType] = useState<'borrow' | 'lend'>('borrow')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    const num = parseFloat(amount)
    if (!num || num <= 0) { setError('Enter a valid amount'); return }

    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('debts').insert({
      user_id: userId,
      name: name.trim(),
      amount: num,
      type,
      note: note.trim() || null,
      due_date: dueDate || null,
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Toggle */}
      <div className="flex bg-muted rounded-2xl p-1">
        {(['borrow', 'lend'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
              type === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >
            <span className="flex items-center justify-center gap-1.5">
              {t === 'borrow' ? <Handshake className="w-4 h-4" /> : <ArrowUpFromLine className="w-4 h-4" />}
              {t === 'borrow' ? 'I Borrowed' : 'I Lent'}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {type === 'borrow' ? 'You owe someone money' : 'Someone owes you money'}
      </p>

      <div className="space-y-1">
        <Label>Person's Name</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" autoFocus />
      </div>
      <div className="space-y-1">
        <Label>Amount</Label>
        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" />
      </div>
      <div className="space-y-1">
        <Label>Note (optional)</Label>
        <Input value={note} onChange={e => setNote(e.target.value)} placeholder="What is this for?" />
      </div>
      <div className="space-y-1">
        <Label>Due Date (optional)</Label>
        <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1">Add Debt</Button>
      </div>
    </form>
  )
}
