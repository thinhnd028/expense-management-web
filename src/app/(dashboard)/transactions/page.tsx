'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTransactions, useMonthlyStats } from '@/hooks/useTransactions'
import TransactionForm from '@/components/transactions/TransactionForm'
import EmptyState from '@/components/ui/EmptyState'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Plus, ReceiptText, TrendingUp, TrendingDown, Calendar, Tag, Layers, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'
import { TransactionWithDetails } from '@/types/database'
import { useCurrency } from '@/contexts/CurrencyContext'
import DynamicIcon from '@/components/ui/DynamicIcon'
import { cn } from '@/lib/utils'

type TypeFilter = 'all' | 'income' | 'expense' | 'transfer'

export default function TransactionsPage() {
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [month, setMonth] = useState(new Date())
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const { transactions, loading, refetch } = useTransactions({ month })
  const { stats } = useMonthlyStats(month)
  const { formatAmount } = useCurrency()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || ''))
  }, [])

  async function handleDelete(id: string) {
    await supabase.rpc('delete_transaction', { p_transaction_id: id })
    refetch()
  }

  const filtered = transactions.filter(tx => typeFilter === 'all' || tx.type === typeFilter)

  const monthStr = month.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })

  function changeMonth(delta: number) {
    setMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const net = stats.income - stats.expense

  // Most-spent category from filtered expense transactions
  const topCategory = (() => {
    const expenses = filtered.filter(tx => tx.type === 'expense')
    if (!expenses.length) return null
    const totals: Record<string, { name: string; amount: number }> = {}
    for (const tx of expenses) {
      const key = tx.categories?.name || 'Khác'
      totals[key] = { name: key, amount: (totals[key]?.amount || 0) + tx.amount }
    }
    return Object.values(totals).sort((a, b) => b.amount - a.amount)[0]
  })()

  return (
    <div className="space-y-8 pb-20 sm:pb-8">

      {/* ── Hero Section ── */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-1">
          <p className="text-xs text-[#454652] uppercase tracking-widest font-semibold">Tổng quan tháng</p>
          <h3 className="font-headline text-[3.5rem] font-bold leading-tight tracking-tight tabular-nums text-[#0e1c2b]">
            {formatAmount(stats.income)}
          </h3>
          <div className="flex flex-wrap items-center gap-4 mt-1">
            <span className="flex items-center gap-1 text-sm font-semibold text-[#3f6653]">
              <TrendingUp className="w-3.5 h-3.5" /> {formatAmount(stats.income)} thu
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-[#ba1a1a]">
              <TrendingDown className="w-3.5 h-3.5" /> {formatAmount(stats.expense)} chi
            </span>
            <span className={`text-sm font-bold tabular-nums ${net >= 0 ? 'text-[#3f6653]' : 'text-[#ba1a1a]'}`}>
              = {net >= 0 ? '+' : ''}{formatAmount(net)}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="hero-gradient text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity active:scale-[0.98] self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Thêm giao dịch
        </button>
      </section>

      {/* ── Advanced Filters ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Month picker */}
        <div className="bg-white p-4 rounded-xl flex items-center gap-3 shadow-sm border border-[#f3f4f5]">
          <div className="w-10 h-10 rounded-full bg-[#0e1c2b]/5 flex items-center justify-center text-[#0e1c2b] shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-bold text-[#454652] tracking-wider">Tháng</p>
            <div className="flex items-center gap-1 mt-0.5">
              <button onClick={() => changeMonth(-1)} className="text-[#454652] hover:text-[#0e1c2b]">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-[#191c1d] capitalize flex-1 text-center">{monthStr}</span>
              <button onClick={() => changeMonth(1)} disabled={month >= new Date()} className="text-[#454652] hover:text-[#0e1c2b] disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Type filter */}
        <div className="bg-white p-4 rounded-xl flex items-center gap-3 shadow-sm border border-[#f3f4f5]">
          <div className="w-10 h-10 rounded-full bg-[#0e1c2b]/5 flex items-center justify-center text-[#0e1c2b] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-bold text-[#454652] tracking-wider">Loại</p>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as TypeFilter)}
              className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#191c1d] focus:ring-0 cursor-pointer outline-none mt-0.5"
            >
              <option value="all">Tất cả</option>
              <option value="income">Thu nhập</option>
              <option value="expense">Chi tiêu</option>
              <option value="transfer">Chuyển khoản</option>
            </select>
          </div>
        </div>

        {/* Category filter placeholder */}
        <div className="bg-white p-4 rounded-xl flex items-center gap-3 shadow-sm border border-[#f3f4f5]">
          <div className="w-10 h-10 rounded-full bg-[#0e1c2b]/5 flex items-center justify-center text-[#0e1c2b] shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-bold text-[#454652] tracking-wider">Danh mục</p>
            <select className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#191c1d] focus:ring-0 cursor-pointer outline-none mt-0.5">
              <option>Tất cả danh mục</option>
            </select>
          </div>
        </div>

        {/* Stats summary */}
        <div className="bg-white p-4 rounded-xl flex items-center gap-3 shadow-sm border border-[#f3f4f5]">
          <div className="w-10 h-10 rounded-full bg-[#beead1]/50 flex items-center justify-center text-[#3f6653] shrink-0">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#454652] tracking-wider">Số giao dịch</p>
            <p className="text-sm font-bold text-[#191c1d] mt-0.5">{filtered.length} giao dịch</p>
          </div>
        </div>
      </section>

      {/* ── Transaction Ledger (Table) ── */}
      <section className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#f3f4f5]">
        <div className="px-6 py-5 border-b border-[#f3f4f5] flex justify-between items-center">
          <h4 className="font-headline font-bold text-[#0e1c2b]">Chi tiết giao dịch</h4>
          <span className="text-xs font-medium text-[#454652]">{filtered.length} giao dịch</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-[#edeeef] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ReceiptText}
              title="Chưa có giao dịch"
              description="Chưa có giao dịch nào trong tháng này."
              action={
                <button
                  onClick={() => setShowForm(true)}
                  className="hero-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" /> Thêm giao dịch
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f3f4f5]/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#454652]">Ngày</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#454652]">Mô tả</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#454652] hidden sm:table-cell">Danh mục</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#454652] hidden md:table-cell">Ví</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#454652] text-right">Số tiền</th>
                  <th className="px-4 py-4 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {filtered.map(tx => (
                  <TransactionTableRow key={tx.id} transaction={tx} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Bottom Insights ── */}
      {!loading && filtered.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 hero-gradient p-8 rounded-xl relative overflow-hidden text-white">
            <div className="relative z-10 space-y-4">
              <h5 className="text-xl font-bold font-headline">Xu hướng chi tiêu</h5>
              <p className="text-[#8b99ac] text-sm max-w-md">
                Theo dõi và phân tích chi tiêu của bạn để tối ưu ngân sách hàng tháng.
              </p>
              <div className="flex items-end gap-2 h-16 pt-4">
                <div className="w-full bg-white/10 rounded-full h-1 relative">
                  <div className="absolute inset-0 rounded-full bg-[#3f6653]" style={{ width: `${Math.min((stats.expense / (stats.income || 1)) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
            <div className="absolute right-6 bottom-4 opacity-10">
              <TrendingUp className="w-32 h-32" strokeWidth={0.5} />
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl flex flex-col justify-center gap-6 border border-[#f3f4f5]">
            <div>
              <p className="text-xs font-bold text-[#454652] uppercase tracking-widest">Danh mục chi nhiều nhất</p>
              {topCategory ? (
                <>
                  <p className="text-xl font-bold text-[#0e1c2b] mt-1">{topCategory.name}</p>
                  <p className="text-2xl font-bold tabular-nums text-[#ba1a1a] mt-0.5">{formatAmount(topCategory.amount)}</p>
                </>
              ) : (
                <p className="text-sm text-[#454652] mt-1">Chưa có dữ liệu</p>
              )}
            </div>
            <div className="h-px bg-[#f3f4f5] w-full" />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-[#454652]">Thu nhập</p>
                <p className="text-xl font-bold tabular-nums text-[#3f6653]">{formatAmount(stats.income)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#454652]">Còn lại</p>
                <p className={cn('text-xl font-bold tabular-nums', net >= 0 ? 'text-[#3f6653]' : 'text-[#ba1a1a]')}>{formatAmount(Math.abs(net))}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Add Form */}
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

// ── Inline table row component ──────────────────────────────────────────────
function TransactionTableRow({
  transaction: tx,
  onDelete,
}: {
  transaction: TransactionWithDetails
  onDelete: (id: string) => void
}) {
  const isIncome = tx.type === 'income'
  const isTransfer = tx.type === 'transfer'
  const { formatAmount } = useCurrency()

  const fallbackIcon = isTransfer ? 'ArrowLeftRight' : isIncome ? 'TrendingUp' : 'TrendingDown'
  const iconName = tx.categories?.icon || fallbackIcon
  const categoryName = tx.categories?.name || (isTransfer ? 'Chuyển khoản' : isIncome ? 'Thu nhập' : 'Chi tiêu')

  const amountColor = isIncome ? 'text-[#3f6653]' : isTransfer ? 'text-[#0e1c2b]' : 'text-[#ba1a1a]'
  const amountPrefix = isIncome ? '+' : isTransfer ? '' : '-'
  const categoryBg = isIncome ? 'bg-[#beead1] text-[#436b58]' : isTransfer ? 'bg-[#e7e8e9] text-[#454652]' : 'bg-[#f3f4f5] text-[#454652]'

  return (
    <tr className="hover:bg-[#f3f4f5] transition-colors cursor-pointer group">
      <td className="px-6 py-5 text-sm font-medium text-[#454652] tabular-nums whitespace-nowrap">
        {formatDateShort(tx.date)}
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#e7e8e9] flex items-center justify-center shrink-0">
            <DynamicIcon name={iconName} className="w-4 h-4 text-[#454652]" />
          </div>
          <span className="font-semibold text-[#191c1d] text-sm truncate max-w-[200px]">
            {tx.note || categoryName}
          </span>
        </div>
      </td>
      <td className="px-6 py-5 hidden sm:table-cell">
        <Badge className={`border-none ${categoryBg}`}>{categoryName}</Badge>
      </td>
      <td className="px-6 py-5 text-sm text-[#454652] hidden md:table-cell">
        {(tx.wallets as { name: string } | null)?.name}
      </td>
      <td className={`px-6 py-5 text-right font-bold tabular-nums text-sm ${amountColor}`}>
        {amountPrefix}{formatAmount(tx.amount)}
      </td>
      <td className="px-4 py-5">
        <button
          onClick={() => onDelete(tx.id)}
          className="p-1.5 rounded-lg text-[#454652]/30 hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  )
}
