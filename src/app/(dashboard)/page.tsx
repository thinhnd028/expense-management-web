'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useWallets } from '@/hooks/useWallets'
import { useTransactions, useMonthlyStats } from '@/hooks/useTransactions'
import { useDebts } from '@/hooks/useDebts'
import StatsCard from '@/components/dashboard/StatsCard'
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart'
import CategoryPieChart from '@/components/dashboard/CategoryPieChart'
import TransactionItem from '@/components/transactions/TransactionItem'
import TransactionForm from '@/components/transactions/TransactionForm'
import BottomSheet from '@/components/ui/BottomSheet'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Wallet, TrendingUp, TrendingDown, Users, Plus, ArrowRight, Banknote, Building2, Smartphone } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import Link from 'next/link'

const WALLET_ICONS_MAP = { cash: Banknote, bank: Building2, 'e-wallet': Smartphone } as const

export default function DashboardPage() {
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [chartData, setChartData] = useState<Array<{ month: string; income: number; expense: number }>>([])
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; color: string; icon: string }>>([])

  const { wallets, totalBalance } = useWallets()
  const { transactions, refetch: refetchTx } = useTransactions({ limit: 5 })
  const { stats } = useMonthlyStats()
  const { totalOwed, totalLent } = useDebts()
  const { formatAmount } = useCurrency()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || '')
      setUserName(data.user?.user_metadata?.full_name?.split(' ')[0] || 'there')
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
      months.push({
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        income,
        expense,
      })
    }
    setChartData(months)
  }

  async function loadCategoryData() {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const { data } = await supabase
      .from('transactions')
      .select('amount, categories:category_id(name, icon, color)')
      .eq('type', 'expense')
      .gte('date', start.toISOString())
      .lte('date', end.toISOString())

    const grouped: Record<string, { name: string; value: number; color: string; icon: string }> = {}
    data?.forEach((tx: { amount: number; categories: { name: string; icon: string; color: string } | null }) => {
      const cat = tx.categories
      const key = cat?.name || 'Other'
      if (!grouped[key]) grouped[key] = { name: key, value: 0, color: cat?.color || '#6366f1', icon: cat?.icon || 'CreditCard' }
      grouped[key].value += tx.amount
    })

    setCategoryData(Object.values(grouped).sort((a, b) => b.value - a.value))
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{greeting()},</p>
          <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Total Balance Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/10 translate-x-16 -translate-y-16" />
        <div className="absolute left-0 bottom-0 w-32 h-32 rounded-full bg-white/10 -translate-x-10 translate-y-10" />
        <div className="relative">
          <p className="text-indigo-200 text-sm font-medium">Total Balance</p>
          <p className="text-4xl font-bold mt-1 mb-4">{formatAmount(totalBalance)}</p>
          <div className="flex gap-4">
            <div>
              <p className="text-indigo-200 text-xs">Monthly Income</p>
              <p className="font-semibold text-emerald-300">{formatAmount(stats.income)}</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-indigo-200 text-xs">Monthly Expense</p>
              <p className="font-semibold text-red-300">{formatAmount(stats.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard title="Income" value={formatAmount(stats.income)} icon={TrendingUp} color="emerald" />
        <StatsCard title="Expense" value={formatAmount(stats.expense)} icon={TrendingDown} color="red" />
        <StatsCard title="You Owe" value={formatAmount(totalOwed)} icon={Users} color="amber" />
        <StatsCard title="Owed to You" value={formatAmount(totalLent)} icon={Wallet} color="blue" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Income vs Expense Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expense</CardTitle>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </CardHeader>
          <IncomeExpenseChart data={chartData} />
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <span className="text-xs text-gray-400">This month</span>
          </CardHeader>
          <CategoryPieChart data={categoryData} />
        </Card>
      </div>

      {/* Wallets Mini */}
      {wallets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Wallets</CardTitle>
            <Link href="/wallets" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {wallets.map(w => {
              const WIcon = WALLET_ICONS_MAP[w.type] ?? Banknote
              return (
                <div key={w.id} className="rounded-xl p-3 border border-gray-100 bg-gray-50">
                  <div
                    className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                    style={{ backgroundColor: w.color + '22' }}
                  >
                    <WIcon className="w-4 h-4" style={{ color: w.color }} />
                  </div>
                  <p className="text-xs text-gray-500 truncate">{w.name}</p>
                  <p className="font-bold text-gray-900 text-sm">{formatAmount(w.balance)}</p>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <Link href="/transactions" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No transactions yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map(tx => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </Card>

      {/* Add Transaction Sheet */}
      <BottomSheet open={showForm} onClose={() => setShowForm(false)} title="New Transaction">
        <TransactionForm
          userId={userId}
          onSuccess={() => { setShowForm(false); refetchTx(); loadChartData(); loadCategoryData() }}
          onCancel={() => setShowForm(false)}
        />
      </BottomSheet>
    </div>
  )
}
