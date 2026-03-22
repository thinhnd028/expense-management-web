'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTransactions } from '@/hooks/useTransactions'
import TransactionItem from '@/components/transactions/TransactionItem'
import TransactionForm from '@/components/transactions/TransactionForm'
import BottomSheet from '@/components/ui/BottomSheet'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { Plus, Filter, ReceiptText } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { TransactionWithDetails } from '@/types/database'

export default function TransactionsPage() {
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [month, setMonth] = useState(new Date())
  const { transactions, loading, refetch } = useTransactions({ month })
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || ''))
  }, [])

  async function handleDelete(id: string) {
    await supabase.rpc('delete_transaction', { p_transaction_id: id })
    refetch()
  }

  // Group by date
  const grouped = transactions.reduce((acc: Record<string, TransactionWithDetails[]>, tx) => {
    const key = formatDate(tx.date)
    if (!acc[key]) acc[key] = []
    acc[key].push(tx)
    return acc
  }, {})

  const monthStr = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function changeMonth(delta: number) {
    setMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-gray-100">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        >
          ‹
        </button>
        <span className="font-medium text-gray-800 text-sm">{monthStr}</span>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          disabled={month >= new Date()}
        >
          ›
        </button>
      </div>

      {/* Transactions */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No transactions"
          description="No transactions found for this month."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, txs]) => (
            <Card key={date}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{date}</p>
              <div className="divide-y divide-gray-50">
                {txs.map(tx => (
                  <TransactionItem key={tx.id} transaction={tx} onDelete={handleDelete} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Form */}
      <BottomSheet open={showForm} onClose={() => setShowForm(false)} title="New Transaction">
        <TransactionForm
          userId={userId}
          onSuccess={() => { setShowForm(false); refetch() }}
          onCancel={() => setShowForm(false)}
        />
      </BottomSheet>
    </div>
  )
}
