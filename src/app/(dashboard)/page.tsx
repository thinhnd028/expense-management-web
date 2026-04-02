'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useWallets } from '@/hooks/useWallets'
import { useTransactions, useMonthlyStats } from '@/hooks/useTransactions'
import { useDebts } from '@/hooks/useDebts'
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart'
import TransactionItem from '@/components/transactions/TransactionItem'
import TransactionForm from '@/components/transactions/TransactionForm'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  TrendingUp, TrendingDown, Wallet,
  Plus, ArrowRight, Banknote, Building2, Smartphone,
  ShoppingCart, Zap, ArrowDownLeft, ArrowUpRight,
  MoreHorizontal,
} from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import Link from 'next/link'

const WALLET_ICONS_MAP = { cash: Banknote, bank: Building2, 'e-wallet': Smartphone } as const

export default function DashboardPage() {
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [chartData, setChartData] = useState<Array<{ month: string; income: number; expense: number }>>([])
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; color: string; icon: string }>>([])

  const { wallets, totalBalance } = useWallets()
  const { transactions, refetch: refetchTx } = useTransactions({ limit: 7 })
  const { stats } = useMonthlyStats()
  const { totalOwed, totalLent } = useDebts()
  const { formatAmount } = useCurrency()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || '')
    })
    loadChartData()
    loadCategoryData()
  }, [])

  async function loadChartData() {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const { data } = await supabase
        .from('transactions')
        .select('type, amount')
        .in('type', ['income', 'expense'])
        .gte('date', start.toISOString())
        .lte('date', end.toISOString())
      const income = data?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0
      const expense = data?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0
      months.push({ month: d.toLocaleDateString('en-US', { month: 'short' }), income, expense })
    }
    setChartData(months)
  }

  async function loadCategoryData() {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const [{ data: allCats }, { data: txData }] = await Promise.all([
      supabase.from('categories').select('name, icon, color').eq('type', 'expense').order('name'),
      supabase
        .from('transactions')
        .select('amount, categories:category_id(name, icon, color)')
        .eq('type', 'expense')
        .gte('date', start.toISOString())
        .lte('date', end.toISOString()),
    ])

    const grouped: Record<string, { name: string; value: number; color: string; icon: string }> = {}

    allCats?.forEach((cat: { name: string; icon: string; color: string }) => {
      grouped[cat.name] = { name: cat.name, value: 0, color: cat.color || '#6366f1', icon: cat.icon || 'CreditCard' }
    })

    txData?.forEach((tx: { amount: number; categories: { name: string; icon: string; color: string } | null }) => {
      const cat = tx.categories
      const key = cat?.name || 'Khác'
      if (!grouped[key]) grouped[key] = { name: key, value: 0, color: cat?.color || '#6366f1', icon: cat?.icon || 'CreditCard' }
      grouped[key].value += tx.amount
    })

    setCategoryData(Object.values(grouped).sort((a, b) => b.value - a.value))
  }

  const savingsRate = stats.income > 0
    ? Math.round(((stats.income - stats.expense) / stats.income) * 100)
    : 0

  const categoryTotal = categoryData.reduce((s, x) => s + x.value, 0)

  return (
    <div className="space-y-6 pb-20 sm:pb-8">

      {/* ── ROW 1: Hero (7/12) + Stats (5/12) ── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Main Balance Hero */}
        <div className="col-span-12 lg:col-span-7 hero-gradient rounded-xl p-8 text-white relative overflow-hidden shadow-lg min-h-[280px] flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-[10px] text-white/40 uppercase tracking-[0.18em] mb-3">Tổng số dư</p>
            <p className="font-headline text-5xl font-bold tabular-nums text-white leading-none break-all">
              {formatAmount(totalBalance)}
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4 mt-auto pt-8 border-t border-white/10">
            <div>
              <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Ví tiền</p>
              <p className="font-headline text-lg font-bold text-white">
                {wallets.length} Wallet{wallets.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Tiết kiệm</p>
              <p className={`font-headline text-lg font-bold ${savingsRate > 0 ? 'text-emerald-300' : 'text-white/60'}`}>
                {savingsRate > 0 ? `+${savingsRate}%` : '—'}
              </p>
            </div>
            {totalOwed > 0 && (
              <div>
                <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Đang nợ</p>
                <p className="font-headline text-lg font-bold text-rose-300">{formatAmount(totalOwed)}</p>
              </div>
            )}
            {totalLent > 0 && (
              <div>
                <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Cho vay</p>
                <p className="font-headline text-lg font-bold text-amber-300">{formatAmount(totalLent)}</p>
              </div>
            )}
          </div>

          {/* Decorative elements */}
          <div className="absolute right-[-10%] bottom-[-20%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-8 top-8 opacity-10 pointer-events-none">
            <Wallet className="w-28 h-28 text-white" strokeWidth={0.75} />
          </div>
        </div>

        {/* Secondary Stats Stack */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 flex items-center justify-between flex-1 hover:bg-[#f3f4f5] transition-colors shadow-sm border border-gray-100/80">
            <div>
              <p className="text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1">Thu nhập tháng</p>
              <p className="font-headline text-3xl font-bold text-[#3f6653] tabular-nums mt-1">
                {formatAmount(stats.income)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#3f6653]" />
                <span className="text-xs text-[#3f6653] font-medium">Tháng này</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-6 h-6 text-[#3f6653]" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 flex items-center justify-between flex-1 hover:bg-[#f3f4f5] transition-colors shadow-sm border border-gray-100/80">
            <div>
              <p className="text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1">Chi tiêu tháng</p>
              <p className="font-headline text-3xl font-bold text-[#ba1a1a] tabular-nums mt-1">
                {formatAmount(stats.expense)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="w-3.5 h-3.5 text-[#ba1a1a]" />
                <span className="text-xs text-[#ba1a1a] font-medium">Tháng này</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-6 h-6 text-[#ba1a1a]" />
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Category Breakdown (4/12) + Recent Transactions (8/12) ── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Category Breakdown */}
        <div className="col-span-12 lg:col-span-4 bg-[#f3f4f5] rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline text-lg font-bold text-[#191c1d]">Danh mục chi tiêu</h3>
            <button
              onClick={() => setShowForm(true)}
              className="p-1.5 rounded-lg hover:bg-[#edeeef] transition-colors text-[#454652]"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {categoryData.length === 0 ? (
            <p className="text-sm text-[#454652] text-center py-8 flex-1">Chưa có chi tiêu tháng này</p>
          ) : (
            <div className="space-y-5 flex-1">
              {categoryData.slice(0, 6).map((cat, i) => {
                const pct = categoryTotal ? Math.round((cat.value / categoryTotal) * 100) : 0
                const isEmpty = cat.value === 0
                return (
                  <div key={i} className={isEmpty ? 'opacity-35' : ''}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-[#191c1d]">{cat.name}</span>
                      {!isEmpty && (
                        <span className="text-sm font-bold tabular-nums text-[#454652]">
                          {pct}%
                        </span>
                      )}
                    </div>
                    <div className="h-2 w-full bg-[#e1e3e4] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#c6c5d4]/20">
            <Link
              href="/transactions"
              className="w-full py-3 bg-[#e7e8e9] hover:bg-[#e1e3e4] text-[#0e1c2b] font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Xem báo cáo đầy đủ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl p-6 flex flex-col shadow-sm border border-gray-100/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-headline text-lg font-bold text-[#191c1d]">Giao dịch gần đây</h3>
              <p className="text-xs text-[#454652] font-medium mt-0.5">7 ngày gần nhất</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-[#f3f4f5] rounded-lg text-xs font-bold hover:bg-[#e7e8e9] transition-all text-[#454652]"
              >
                + Thêm
              </button>
              <Link
                href="/transactions"
                className="px-4 py-2 bg-[#0e1c2b] text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all"
              >
                Xem tất cả
              </Link>
            </div>
          </div>

          <div className="mt-4">
            {transactions.length === 0 ? (
              <p className="text-sm text-[#454652] text-center py-8">Chưa có giao dịch</p>
            ) : (
              <div>
                {transactions.map(tx => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Chart (6/12) + Wallets (3/12) + Quick Stats (3/12) ── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Income & Expense Chart */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-xl p-6 flex flex-col shadow-sm border border-gray-100/80">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline text-lg font-bold text-[#191c1d]">Thu nhập & Chi tiêu</h3>
            <span className="text-[10px] text-[#454652] uppercase tracking-widest font-semibold">6 THÁNG</span>
          </div>
          <IncomeExpenseChart data={chartData} />
        </div>

        {/* Wallets */}
        <div className="col-span-12 lg:col-span-3 bg-[#f3f4f5] rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-headline text-base font-bold text-[#191c1d]">Ví tiền</h3>
            <Link
              href="/wallets"
              className="text-xs text-[#0e1c2b] font-bold flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              Tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {wallets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-[#454652] mb-4">Chưa có ví nào</p>
              <Link
                href="/wallets"
                className="hero-gradient text-white rounded-xl px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" /> Tạo ví
              </Link>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {wallets.slice(0, 4).map(w => {
                const WIcon = WALLET_ICONS_MAP[w.type] ?? Banknote
                return (
                  <div key={w.id} className="flex items-center gap-3 py-2.5 px-2 hover:bg-[#e7e8e9] rounded-xl transition-colors cursor-pointer">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: w.color + '20' }}
                    >
                      <WIcon className="w-4 h-4" style={{ color: w.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#191c1d] truncate">{w.name}</p>
                      <p className="text-xs text-[#454652] capitalize">{w.type}</p>
                    </div>
                    <p className="font-headline text-sm font-bold tabular-nums text-[#0e1c2b] shrink-0">
                      {formatAmount(w.balance)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Insights */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* Savings rate card */}
          <div className="glass-panel rounded-xl p-5 border border-white/40 shadow-sm flex-1">
            <p className="text-[10px] font-bold text-[#3f6653] uppercase tracking-widest mb-1">Tiết kiệm tháng</p>
            <p className="font-headline text-2xl font-bold text-[#191c1d]">
              {savingsRate > 0 ? `+${savingsRate}%` : '—'}
            </p>
            <p className="text-xs text-[#454652] mt-1">
              {formatAmount(Math.max(0, stats.income - stats.expense))} còn lại
            </p>
            {savingsRate > 0 && (
              <div className="mt-4 h-1.5 w-full bg-[#e7e8e9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3f6653] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(savingsRate, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Debt summary card */}
          {(totalOwed > 0 || totalLent > 0) ? (
            <div className="glass-panel rounded-xl p-5 border border-white/40 shadow-sm flex-1">
              <p className="text-[10px] font-bold text-[#ff6367] uppercase tracking-widest mb-1">Công nợ</p>
              {totalOwed > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-[#454652]">Đang nợ</p>
                  <p className="font-headline text-base font-bold text-rose-500 tabular-nums">{formatAmount(totalOwed)}</p>
                </div>
              )}
              {totalLent > 0 && (
                <div>
                  <p className="text-xs text-[#454652]">Cho vay</p>
                  <p className="font-headline text-base font-bold text-amber-500 tabular-nums">{formatAmount(totalLent)}</p>
                </div>
              )}
              <Link
                href="/debts"
                className="mt-3 text-xs font-bold text-[#0e1c2b] flex items-center gap-1 hover:underline"
              >
                Quản lý <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="hero-gradient rounded-xl p-5 flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-[-15%] bottom-[-20%] w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <p className="text-white font-headline text-base font-bold">Tài chính tốt!</p>
                <p className="text-white/60 text-xs mt-1">Không có công nợ</p>
              </div>
              <Link
                href="/debts"
                className="relative z-10 mt-4 text-xs font-bold text-white/80 flex items-center gap-1 hover:text-white transition-colors"
              >
                Xem công nợ <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── FAB ── */}
      <div className="fixed bottom-8 right-8 z-50 group">
        <button
          onClick={() => setShowForm(true)}
          className="w-14 h-14 hero-gradient text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#0e1c2b] text-white text-xs font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Thêm giao dịch
        </span>
      </div>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl px-6 pb-8">
          <SheetHeader className="px-0 pb-4">
            <SheetTitle>Thêm giao dịch</SheetTitle>
          </SheetHeader>
          <TransactionForm
            userId={userId}
            onSuccess={() => { setShowForm(false); refetchTx(); loadChartData(); loadCategoryData() }}
            onCancel={() => setShowForm(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
