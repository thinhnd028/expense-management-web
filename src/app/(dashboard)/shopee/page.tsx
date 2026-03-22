'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/contexts/CurrencyContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import StatsCard from '@/components/dashboard/StatsCard'
import { ShoppingBag, TrendingUp, Package, BarChart2, ChevronLeft, ChevronRight, Store, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

interface YearlyStats {
  year: number
  shopName: string
  shopLogo?: string
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  monthly: Array<{ month: string; monthIndex: number; orders: number; revenue: number }>
  orders: Array<{ order_sn: string; order_status: string; total_amount: number; create_time: number }>
}

export default function ShopeePage() {
  const { formatAmount } = useCurrency()
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [shopName, setShopName] = useState('')
  const [shopLogo, setShopLogo] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [stats, setStats] = useState<YearlyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState<'revenue' | 'orders'>('revenue')

  const supabase = createClient()

  // Check connection status
  useEffect(() => {
    supabase.from('shopee_integrations').select('shop_name, shop_logo, access_token').single().then(({ data }) => {
      if (data?.access_token) {
        setIsConnected(true)
        setShopName(data.shop_name || 'My Shop')
        setShopLogo(data.shop_logo || '')
      } else {
        setIsConnected(false)
      }
    })
  }, [])

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/shopee/orders?year=${year}`)
      const data = await res.json()
      if (data.error === 'not_connected') { setIsConnected(false); return }
      if (data.error) { setError('Failed to fetch orders. Please try again.'); return }
      setStats(data)
      setShopName(data.shopName || shopName)
      setShopLogo(data.shopLogo || shopLogo)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    if (isConnected) fetchStats()
  }, [isConnected, year, fetchStats])

  if (isConnected === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="space-y-6 max-w-lg mx-auto mt-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4"
            style={{ background: 'linear-gradient(135deg, #ee4d2d, #ff7337)' }}>
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Shopee Integration</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Connect your Shopee seller account to track orders and view yearly revenue statistics
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            <p className="font-medium mb-1">Shopee Open Platform for Sellers</p>
            <p>This integration uses the Shopee Open Platform API. You need to register as a Shopee Partner to get your Partner ID and Partner Key.</p>
            <a
              href="https://open.shopee.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 font-medium text-amber-800 hover:text-amber-900"
            >
              Get credentials at open.shopee.com <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-4">
            Go to <strong>Settings → Integrations</strong> to enter your Shopee Partner credentials and connect your shop.
          </p>
          <Link
            href="/settings"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ee4d2d, #ff7337)' }}
          >
            <Store className="w-4 h-4" />
            Go to Settings
          </Link>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(...(stats?.monthly.map(m => m.revenue) ?? [1]))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {shopLogo ? (
            <img src={shopLogo} alt="" className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ee4d2d, #ff7337)' }}>
              <Store className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{shopName}</h1>
            <p className="text-xs text-gray-400">Shopee Seller Dashboard</p>
          </div>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Year Selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setYear(y => y - 1)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 w-16 text-center">{year}</h2>
        <button
          onClick={() => setYear(y => Math.min(y + 1, new Date().getFullYear()))}
          disabled={year >= new Date().getFullYear()}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 h-24 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatsCard
              title="Total Revenue"
              value={formatAmount(stats.totalRevenue)}
              icon={TrendingUp}
              color="emerald"
            />
            <StatsCard
              title="Total Orders"
              value={String(stats.totalOrders)}
              icon={ShoppingBag}
              color="indigo"
            />
            <StatsCard
              title="Avg Order Value"
              value={formatAmount(stats.avgOrderValue)}
              icon={BarChart2}
              color="blue"
            />
            <StatsCard
              title="Best Month"
              value={stats.monthly.reduce((a, b) => b.revenue > a.revenue ? b : a, stats.monthly[0])?.month || '-'}
              icon={Package}
              color="amber"
            />
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Monthly Performance {year}</h3>
              <div className="flex bg-gray-100 rounded-xl p-0.5 text-xs">
                <button
                  onClick={() => setView('revenue')}
                  className={cn('px-3 py-1.5 rounded-lg font-medium transition-all', view === 'revenue' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400')}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setView('orders')}
                  className={cn('px-3 py-1.5 rounded-lg font-medium transition-all', view === 'orders' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400')}
                >
                  Orders
                </button>
              </div>
            </div>

            {stats.totalOrders === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                No orders in {year}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.monthly} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    width={45}
                    tickFormatter={v =>
                      view === 'revenue'
                        ? v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                        : String(v)
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 text-xs">
                          <p className="font-semibold text-gray-700 mb-1">{label} {year}</p>
                          <p className="text-gray-500">Revenue: <span className="font-medium text-gray-800">{formatAmount(d.revenue)}</span></p>
                          <p className="text-gray-500">Orders: <span className="font-medium text-gray-800">{d.orders}</span></p>
                        </div>
                      )
                    }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar
                    dataKey={view === 'revenue' ? 'revenue' : 'orders'}
                    fill="#ee4d2d"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-800">Monthly Breakdown</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {[...stats.monthly].reverse().map(m => (
                <div key={m.monthIndex} className="flex items-center px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="w-12 text-sm font-medium text-gray-600">{m.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: maxRevenue > 0 ? `${(m.revenue / maxRevenue) * 100}%` : '0%',
                          background: 'linear-gradient(90deg, #ee4d2d, #ff7337)'
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatAmount(m.revenue)}</p>
                    <p className="text-xs text-gray-400">{m.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          {stats.orders.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-800">Recent Orders</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {stats.orders.slice(0, 10).map(order => (
                  <div key={order.order_sn} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800 font-mono">#{order.order_sn}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.create_time * 1000).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatAmount(order.total_amount || 0)}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
