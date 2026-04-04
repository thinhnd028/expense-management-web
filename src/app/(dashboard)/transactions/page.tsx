'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTransactions } from '@/hooks/useTransactions'
import TransactionForm from '@/components/transactions/TransactionForm'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getColumns } from './columns'
import { DataTable } from './data-table'
import { TransactionWithDetails } from '@/types/database'

type TypeFilter = 'all' | 'income' | 'expense' | 'transfer'

const TYPE_TABS: { label: string; value: TypeFilter }[] = [
  { label: 'Tất cả',      value: 'all' },
  { label: 'Thu nhập',    value: 'income' },
  { label: 'Chi tiêu',    value: 'expense' },
  { label: 'Chuyển khoản', value: 'transfer' },
]

export default function TransactionsPage() {
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [month, setMonth] = useState(new Date())
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const { transactions, loading, refetch } = useTransactions({ month })
  const { formatAmount } = useCurrency()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || ''))
  }, [])

  async function handleDelete(id: string) {
    await supabase.rpc('delete_transaction', { p_transaction_id: id })
    refetch()
  }

  function changeMonth(delta: number) {
    setMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const filtered = useMemo<TransactionWithDetails[]>(() =>
    typeFilter === 'all' ? transactions : transactions.filter(tx => tx.type === typeFilter),
    [transactions, typeFilter]
  )

  const columns = useMemo(() => getColumns({ onDelete: handleDelete, formatAmount }), [formatAmount])

  const monthStr = month.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 pb-20 sm:pb-8">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Giao dịch</h1>
        <Button onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Thêm giao dịch
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Month navigator */}
        <div className="flex items-center gap-0.5 bg-muted rounded-lg px-1.5 py-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => changeMonth(-1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-foreground capitalize min-w-30 text-center px-1">
            {monthStr}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => changeMonth(1)}
            disabled={month >= new Date()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Type tabs */}
        <div className="flex bg-muted rounded-lg p-1 gap-0.5">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                typeFilter === tab.value
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} giao dịch
        </span>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 border-b border-border animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyText="Chưa có giao dịch nào trong tháng này."
        />
      )}

      {/* ── Form Sheet ── */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl px-6 pb-8">
          <SheetHeader className="px-0 pb-4">
            <SheetTitle>Giao dịch mới</SheetTitle>
          </SheetHeader>
          <TransactionForm
            userId={userId}
            onSuccess={() => { setShowForm(false); refetch() }}
            onCancel={() => setShowForm(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
