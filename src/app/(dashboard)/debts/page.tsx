'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDebts } from '@/hooks/useDebts'
import { DebtWithTransactions } from '@/types/database'
import DebtCard from '@/components/debts/DebtCard'
import DebtForm from '@/components/debts/DebtForm'
import RepaymentForm from '@/components/debts/RepaymentForm'
import BottomSheet from '@/components/ui/BottomSheet'
import EmptyState from '@/components/ui/EmptyState'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Plus, Handshake, ArrowUpRight, ArrowDownLeft, Calendar, TrendingDown, CheckCircle } from 'lucide-react'
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

  const totalNet = totalLent - totalOwed
  const borrowCount = debts.filter(d => d.type === 'borrow' && d.status === 'unpaid').length
  const lendCount = debts.filter(d => d.type === 'lend' && d.status === 'unpaid').length

  return (
    <div className="space-y-8 pb-20 sm:pb-8">

      {/* ── Hero Section: Debt Overview ── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Summary Card */}
        <div className="col-span-12 lg:col-span-8 bg-[#f3f4f5] rounded-xl p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h1 className="font-headline text-4xl lg:text-5xl font-bold text-[#0e1c2b] tracking-tight">Công nợ</h1>
                <p className="text-[#454652] font-medium mt-1">Theo dõi khoản vay và cho vay của bạn</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="hero-gradient text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> Thêm
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-rose-600 uppercase tracking-widest font-bold mb-2">Đang nợ</p>
                <p className="font-headline text-3xl font-bold text-[#0e1c2b] tabular-nums">
                  {formatAmount(totalOwed)}
                </p>
                <div className="flex items-center gap-2 mt-2 text-rose-500">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-semibold">{borrowCount} khoản chưa trả</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-amber-600 uppercase tracking-widest font-bold mb-2">Cho vay</p>
                <p className="font-headline text-3xl font-bold text-[#0e1c2b] tabular-nums">
                  {formatAmount(totalLent)}
                </p>
                <div className="flex items-center gap-2 mt-2 text-amber-500">
                  <ArrowDownLeft className="w-4 h-4" />
                  <span className="text-sm font-semibold">{lendCount} khoản chờ thu</span>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-5 pointer-events-none select-none flex items-center justify-end pr-8">
            <Handshake className="w-48 h-48 text-[#0e1c2b]" strokeWidth={0.5} />
          </div>
        </div>

        {/* Ratio / Quick Stats */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-8 shadow-sm border border-gray-100/80 flex flex-col justify-between">
          <h3 className="font-headline font-semibold text-[#0e1c2b] mb-6">Tổng kết</h3>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-rose-500" />
                </div>
                <span className="text-sm font-medium text-[#454652]">Đang nợ</span>
              </div>
              <span className="font-headline font-bold text-[#ba1a1a] tabular-nums text-sm">{formatAmount(totalOwed)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-sm font-medium text-[#454652]">Cho vay</span>
              </div>
              <span className="font-headline font-bold text-amber-600 tabular-nums text-sm">{formatAmount(totalLent)}</span>
            </div>

            <div className="pt-4 border-t border-[#f3f4f5]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#454652] uppercase tracking-wider">Số dư ròng</span>
                <span className={`font-headline font-bold tabular-nums ${totalNet >= 0 ? 'text-[#3f6653]' : 'text-[#ba1a1a]'}`}>
                  {totalNet >= 0 ? '+' : ''}{formatAmount(totalNet)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Insight Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#233141] text-white p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
          <TrendingDown className="w-7 h-7 text-[#8b99ac]" />
          <div>
            <p className="text-[#8b99ac] text-xs font-bold uppercase tracking-widest mb-1">Tổng nợ chưa trả</p>
            <p className="font-headline text-2xl font-bold tabular-nums">{formatAmount(totalOwed)}</p>
          </div>
        </div>
        <div className="bg-[#beead1] p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
          <CheckCircle className="w-7 h-7 text-[#3f6653]" />
          <div>
            <p className="text-[#274e3d] text-xs font-bold uppercase tracking-widest mb-1">Đã thanh toán</p>
            <p className="font-headline text-2xl font-bold text-[#0e1c2b]">{paid.length} khoản</p>
          </div>
        </div>
        <div className="bg-[#f3f4f5] p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
          <Calendar className="w-7 h-7 text-[#0e1c2b]" />
          <div>
            <p className="text-[#454652] text-xs font-bold uppercase tracking-widest mb-1">Còn lại</p>
            <p className="font-headline text-2xl font-bold text-[#0e1c2b]">{unpaid.length} khoản</p>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex bg-[#edeeef] rounded-2xl p-1 w-fit">
        {(['all', 'borrow', 'lend'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-semibold transition-all',
              activeTab === tab ? 'bg-white text-[#191c1d] shadow-sm' : 'text-[#454652] hover:text-[#191c1d]'
            )}
          >
            {tab === 'all' ? 'Tất cả' : tab === 'borrow' ? 'Tôi đang nợ' : 'Người nợ tôi'}
          </button>
        ))}
      </div>

      {/* ── Debt List ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-[#edeeef] rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="Không có công nợ"
          description="Theo dõi tiền bạn vay hoặc cho vay."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="hero-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Thêm công nợ
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {unpaid.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#454652] uppercase tracking-widest mb-4">Chưa thanh toán</p>
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
              <p className="text-xs font-bold text-[#454652] uppercase tracking-widest mb-4">Đã thanh toán</p>
              <div className="space-y-3 opacity-60">
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
      <BottomSheet open={showForm} onClose={() => setShowForm(false)} title="Thêm công nợ">
        <DebtForm
          userId={userId}
          onSuccess={() => { setShowForm(false); refetch() }}
          onCancel={() => setShowForm(false)}
        />
      </BottomSheet>

      <BottomSheet
        open={!!repayDebt}
        onClose={() => setRepayDebt(null)}
        title="Ghi nhận thanh toán"
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
