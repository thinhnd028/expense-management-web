'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDebts } from '@/hooks/useDebts'
import { DebtWithTransactions } from '@/types/database'
import DebtForm from '@/components/debts/DebtForm'
import RepaymentForm from '@/components/debts/RepaymentForm'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getColumns } from './columns'
import { DataTable } from './data-table'

type TypeFilter = 'all' | 'borrow' | 'lend'

export default function DebtsPage() {
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [repayDebt, setRepayDebt] = useState<DebtWithTransactions | null>(null)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const { debts, loading, refetch } = useDebts()
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

  const filtered = useMemo<DebtWithTransactions[]>(() =>
    typeFilter === 'all' ? debts : debts.filter(d => d.type === typeFilter),
    [debts, typeFilter]
  )

  const columns = useMemo(() => getColumns({
    onRepay: setRepayDebt,
    onMarkPaid: handleMarkPaid,
    onDelete: handleDelete,
    formatAmount,
  }), [formatAmount])

  return (
    <div className="space-y-6 pb-20 sm:pb-8">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Công nợ</h1>
        <Button onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Thêm công nợ
        </Button>
      </div>

      {/* ── Type tabs ── */}
      <div className="flex items-center gap-4">
        <div className="flex bg-muted rounded-lg p-1 gap-0.5">
          {(['all', 'borrow', 'lend'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                typeFilter === tab ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab === 'all' ? 'Tất cả' : tab === 'borrow' ? 'Tôi đang nợ' : 'Người nợ tôi'}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} khoản
        </span>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 border-b border-border animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyText="Chưa có công nợ nào."
        />
      )}

      {/* ── Add Form ── */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl px-6 pb-8">
          <SheetHeader className="px-0 pb-4">
            <SheetTitle>Thêm công nợ</SheetTitle>
          </SheetHeader>
          <DebtForm
            userId={userId}
            onSuccess={() => { setShowForm(false); refetch() }}
            onCancel={() => setShowForm(false)}
          />
        </SheetContent>
      </Sheet>

      {/* ── Repayment Form ── */}
      <Sheet open={!!repayDebt} onOpenChange={v => { if (!v) setRepayDebt(null) }}>
        <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl px-6 pb-8">
          <SheetHeader className="px-0 pb-4">
            <SheetTitle>Ghi nhận thanh toán</SheetTitle>
          </SheetHeader>
          {repayDebt && (
            <RepaymentForm
              debt={repayDebt}
              onSuccess={() => { setRepayDebt(null); refetch() }}
              onCancel={() => setRepayDebt(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
