'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useWallets } from '@/hooks/useWallets'
import { Wallet as WalletType } from '@/types/database'
import WalletCard from '@/components/wallets/WalletCard'
import WalletForm from '@/components/wallets/WalletForm'
import BottomSheet from '@/components/common/BottomSheet'
import { useCurrency } from '@/contexts/CurrencyContext'
import {
  Plus, AlertTriangle, TrendingUp,
  Banknote, Smartphone, CreditCard, LineChart,
  ArrowLeftRight,
} from 'lucide-react'

const WALLET_GROUPS = [
  {
    key: 'cash-bank',
    label: 'Tiền mặt & Ngân hàng',
    iconName: 'bank',
    types: ['cash', 'bank'] as WalletType['type'][],
    addLabel: 'Thêm ví ngân hàng',
    Icon: Banknote,
    iconColor: '#3f6653',
  },
  {
    key: 'ewallet',
    label: 'Ví điện tử',
    iconName: 'ewallet',
    types: ['e-wallet'] as WalletType['type'][],
    addLabel: 'Kết nối ví điện tử',
    Icon: Smartphone,
    iconColor: '#3f6653',
  },
]

export default function WalletsPage() {
  const { wallets, loading, refetch, totalBalance } = useWallets()
  const { formatAmount } = useCurrency()
  const [userId, setUserId] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editWallet, setEditWallet] = useState<WalletType | null>(null)
  const [deleteWallet, setDeleteWallet] = useState<WalletType | null>(null)
  const [deleting, setDeleting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || ''))
  }, [])

  async function handleDelete() {
    if (!deleteWallet) return
    setDeleting(true)
    await supabase.from('wallets').delete().eq('id', deleteWallet.id)
    setDeleting(false)
    setDeleteWallet(null)
    refetch()
  }

  // Derived stats
  const cashBankBalance = wallets
    .filter(w => w.type === 'cash' || w.type === 'bank')
    .reduce((s, w) => s + w.balance, 0)

  return (
    <div className="space-y-12 pb-20 sm:pb-8">

      {/* ── Header Card ── */}
      <header className="bg-white border border-[#c6c5d4]/30 rounded-2xl p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <span className="text-sm font-bold text-[#454652] tracking-widest uppercase">Tổng quan tài sản</span>
          <div className="flex items-baseline gap-3 mt-1">
            <h1 className="font-headline text-5xl font-extrabold text-[#0e1c2b] tabular-nums">
              {formatAmount(totalBalance)}
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <span className="px-3 py-1.5 bg-[#beead1] text-[#436b58] text-sm font-bold rounded-lg flex items-center gap-1.5 shadow-sm">
              <TrendingUp className="w-4 h-4" />
              {wallets.length} ví
            </span>
            <p className="text-sm text-[#454652] font-medium">Tổng số dư tất cả ví</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1 px-6 py-4 bg-[#f3f4f5] rounded-xl">
            <span className="text-xs font-bold text-[#454652] uppercase">Tiền mặt &amp; Ngân hàng</span>
            <span className="text-xl font-extrabold text-[#0e1c2b] tabular-nums">{formatAmount(cashBankBalance)}</span>
          </div>
          <div className="flex flex-col gap-1 px-6 py-4 bg-[#f3f4f5] rounded-xl">
            <span className="text-xs font-bold text-[#454652] uppercase">Số ví</span>
            <span className="text-xl font-extrabold text-[#0e1c2b] tabular-nums">{wallets.length} ví</span>
          </div>
        </div>
      </header>

      {/* ── Wallet Groups ── */}
      {loading ? (
        <div className="space-y-12">
          {[3, 2].map((count, gi) => (
            <section key={gi}>
              <div className="h-7 w-48 bg-[#e7e8e9] rounded animate-pulse mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: count }).map((_, i) => (
                  <div key={i} className="h-56 bg-[#e7e8e9] rounded-xl animate-pulse" />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-12">

          {WALLET_GROUPS.map(group => {
            const groupWallets = wallets.filter(w => group.types.includes(w.type))

            return (
              <section key={group.key}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline text-xl font-extrabold text-[#0e1c2b] flex items-center gap-2">
                    <group.Icon className="w-5 h-5" style={{ color: group.iconColor }} />
                    {group.label}
                  </h2>
                  {groupWallets.length > 0 && (
                    <span className="px-2 py-0.5 bg-[#e7e8e9] rounded text-xs font-bold text-[#454652]">
                      {groupWallets.length} Ví
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupWallets.map(w => (
                    <WalletCard
                      key={w.id}
                      wallet={w}
                      onEdit={w => { setEditWallet(w); setShowForm(true) }}
                      onDelete={setDeleteWallet}
                    />
                  ))}

                  {/* Add new placeholder */}
                  <button
                    onClick={() => setShowForm(true)}
                    className="border-2 border-dashed border-[#c6c5d4]/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 group hover:border-[#0e1c2b]/40 hover:bg-[#0e1c2b]/5 transition-all min-h-[250px]"
                  >
                    <div className="w-12 h-12 bg-[#e7e8e9] rounded-full flex items-center justify-center text-[#454652] group-hover:text-[#0e1c2b] transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-[#454652] group-hover:text-[#0e1c2b] transition-colors">
                      {group.addLabel}
                    </span>
                  </button>
                </div>
              </section>
            )
          })}

          {/* ── Credit Card Section ── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-xl font-extrabold text-[#0e1c2b] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#bac8dc]" />
                Thẻ tín dụng
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add placeholder */}
              <button
                onClick={() => setShowForm(true)}
                className="border-2 border-dashed border-[#c6c5d4]/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 group hover:border-[#0e1c2b]/40 hover:bg-[#0e1c2b]/5 transition-all"
              >
                <div className="w-12 h-12 bg-[#e7e8e9] rounded-full flex items-center justify-center text-[#454652] group-hover:text-[#0e1c2b] transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-[#454652] group-hover:text-[#0e1c2b] transition-colors">
                  Thêm thẻ tín dụng
                </span>
              </button>
            </div>
          </section>

          {/* ── Investment Section (Empty State) ── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-xl font-extrabold text-[#0e1c2b] flex items-center gap-2">
                <LineChart className="w-5 h-5 text-[#400007]" />
                Đầu tư
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-full border-2 border-dashed border-[#c6c5d4]/30 rounded-2xl p-12 flex flex-col items-center justify-center bg-[#f3f4f5]/30 group hover:border-[#0e1c2b]/40 transition-colors">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#454652] mb-6 shadow-sm group-hover:text-[#0e1c2b] transition-colors">
                  <LineChart className="w-8 h-8" />
                </div>
                <h4 className="font-headline text-lg font-bold text-[#0e1c2b] mb-2">Chưa có tài khoản đầu tư</h4>
                <p className="text-sm text-[#454652] mb-8 text-center max-w-sm">
                  Kết nối với tài khoản chứng khoán hoặc Crypto để quản lý tổng tài sản của bạn tại một nơi.
                </p>
                <button className="px-8 py-3 bg-[#0e1c2b] text-white font-bold rounded-xl shadow-lg hover:shadow-[#0e1c2b]/20 transition-all flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Kết nối danh mục đầu tư
                </button>
              </div>
            </div>
          </section>

        </div>
      )}

      {/* ── Quick Actions Bar ── */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowForm(true)}
          className="hero-gradient text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm ví mới
        </button>
        <button className="px-6 py-3 bg-white border border-[#c6c5d4]/30 text-[#0e1c2b] font-semibold rounded-xl hover:bg-[#f3f4f5] transition-colors flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4" />
          Chuyển tiền
        </button>
      </div>

      {/* ── Create/Edit Form ── */}
      <BottomSheet
        open={showForm}
        onClose={() => { setShowForm(false); setEditWallet(null) }}
        title={editWallet ? 'Sửa ví' : 'Thêm ví mới'}
      >
        <WalletForm
          wallet={editWallet || undefined}
          userId={userId}
          onSuccess={() => { setShowForm(false); setEditWallet(null); refetch() }}
          onCancel={() => { setShowForm(false); setEditWallet(null) }}
        />
      </BottomSheet>

      {/* ── Delete Confirm ── */}
      <BottomSheet
        open={!!deleteWallet}
        onClose={() => setDeleteWallet(null)}
        title="Xóa ví"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              Bạn có chắc muốn xóa ví <strong>{deleteWallet?.name}</strong>? Tất cả giao dịch liên quan cũng sẽ bị xóa.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteWallet(null)}
              className="flex-1 py-2.5 rounded-xl border border-[#e1e3e4] text-[#454652] font-semibold text-sm hover:bg-[#f3f4f5] transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm disabled:opacity-60 transition-colors"
            >
              {deleting ? 'Đang xóa...' : 'Xóa ví'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
