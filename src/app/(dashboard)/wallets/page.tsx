'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useWallets } from '@/hooks/useWallets'
import { Wallet as WalletType } from '@/types/database'
import WalletForm from '@/components/wallets/WalletForm'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Plus, AlertTriangle } from 'lucide-react'
import { getColumns } from './columns'
import { DataTable } from './data-table'

export default function WalletsPage() {
  const { wallets, loading, refetch } = useWallets()
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

  const columns = useMemo(() => getColumns({
    onEdit: (w) => { setEditWallet(w); setShowForm(true) },
    onDelete: setDeleteWallet,
    formatAmount,
  }), [formatAmount])

  return (
    <div className="space-y-6 pb-20 sm:pb-8">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Ví của tôi</h1>
        <Button onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Thêm ví
        </Button>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-14 border-b border-border animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={wallets} />
      )}

      {/* ── Create/Edit Form ── */}
      <Sheet open={showForm} onOpenChange={v => { if (!v) { setShowForm(false); setEditWallet(null) } }}>
        <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl px-6 pb-8">
          <SheetHeader className="px-0 pb-4">
            <SheetTitle>{editWallet ? 'Sửa ví' : 'Thêm ví mới'}</SheetTitle>
          </SheetHeader>
          <WalletForm
            wallet={editWallet || undefined}
            userId={userId}
            onSuccess={() => { setShowForm(false); setEditWallet(null); refetch() }}
            onCancel={() => { setShowForm(false); setEditWallet(null) }}
          />
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirm ── */}
      <Sheet open={!!deleteWallet} onOpenChange={v => { if (!v) setDeleteWallet(null) }}>
        <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl px-6 pb-8">
          <SheetHeader className="px-0 pb-4">
            <SheetTitle>Xóa ví</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                Bạn có chắc muốn xóa ví <strong>{deleteWallet?.name}</strong>? Tất cả giao dịch liên quan cũng sẽ bị xóa.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteWallet(null)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                loading={deleting}
                className="flex-1"
              >
                Xóa ví
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
