'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDebts } from '@/hooks/useDebts'
import { DebtWithTransactions } from '@/types/database'
import DebtCard from '@/components/debts/DebtCard'
import DebtForm from '@/components/debts/DebtForm'
import RepaymentForm from '@/components/debts/RepaymentForm'
import BottomSheet from '@/components/ui/BottomSheet'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Plus, Handshake } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DebtsPage() {
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [repayDebt, setRepayDebt] = useState<DebtWithTransactions | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'borrow' | 'lend'>('all')
  const { debts, loading, refetch, totalOwed, totalLent } = useDebts()
  const { formatAmount } = useCurrency()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || ''))
  }, [])

  async function handleMarkPaid(debt: DebtWithTransactions) {
    await supabase.from('debts').update({ status: 'paid' }).eq('id', debt.id)
    refetch()
  }

  async function handleDelete(debt: DebtWithTransactions) {
    await supabase.from('debts').delete().eq('id', debt.id)
    refetch()
  }

  const filtered = debts.filter(d => {
    if (activeTab === 'borrow') return d.type === 'borrow'
    if (activeTab === 'lend') return d.type === 'lend'
    return true
  })

  const unpaid = filtered.filter(d => d.status === 'unpaid')
  const paid = filtered.filter(d => d.status === 'paid')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Debts</h1>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4" />
          Add Debt
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs text-amber-600 font-medium mb-1">You Owe</p>
          <p className="text-2xl font-bold text-amber-700">{formatAmount(totalOwed)}</p>
          <p className="text-xs text-amber-500 mt-0.5">{debts.filter(d => d.type === 'borrow' && d.status === 'unpaid').length} debts</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs text-blue-600 font-medium mb-1">Owed to You</p>
          <p className="text-2xl font-bold text-blue-700">{formatAmount(totalLent)}</p>
          <p className="text-xs text-blue-500 mt-0.5">{debts.filter(d => d.type === 'lend' && d.status === 'unpaid').length} debts</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-muted rounded-2xl p-1">
        {(['all', 'borrow', 'lend'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-medium transition-all capitalize',
              activeTab === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >
            {tab === 'all' ? 'All' : tab === 'borrow' ? 'I Owe' : 'Owed to Me'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No debts"
          description="Track money you've borrowed or lent."
          action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />Add Debt</Button>}
        />
      ) : (
        <div className="space-y-4">
          {unpaid.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Outstanding</p>
              <div className="space-y-3">
                {unpaid.map(debt => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onRepay={setRepayDebt}
                    onMarkPaid={handleMarkPaid}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
          {paid.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Settled</p>
              <div className="space-y-3">
                {paid.map(debt => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onRepay={setRepayDebt}
                    onMarkPaid={handleMarkPaid}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Forms */}
      <BottomSheet open={showForm} onClose={() => setShowForm(false)} title="Add Debt">
        <DebtForm
          userId={userId}
          onSuccess={() => { setShowForm(false); refetch() }}
          onCancel={() => setShowForm(false)}
        />
      </BottomSheet>

      <BottomSheet
        open={!!repayDebt}
        onClose={() => setRepayDebt(null)}
        title="Record Payment"
      >
        {repayDebt && (
          <RepaymentForm
            debt={repayDebt}
            onSuccess={() => { setRepayDebt(null); refetch() }}
            onCancel={() => setRepayDebt(null)}
          />
        )}
      </BottomSheet>
    </div>
  )
}
