'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useWallets } from '@/hooks/useWallets'
import { Wallet as WalletType } from '@/types/database'
import WalletCard from '@/components/wallets/WalletCard'
import WalletForm from '@/components/wallets/WalletForm'
import BottomSheet from '@/components/ui/BottomSheet'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Plus, AlertTriangle, Wallet } from 'lucide-react'
import { useEffect } from 'react'

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallets</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Total: <span className="font-semibold text-indigo-600">{formatAmount(totalBalance)}</span>
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4" />
          Add Wallet
        </Button>
      </div>

      {/* Wallets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No wallets yet"
          description="Create your first wallet to start tracking your money."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" />
              Create Wallet
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wallets.map(w => (
            <WalletCard
              key={w.id}
              wallet={w}
              onEdit={w => { setEditWallet(w); setShowForm(true) }}
              onDelete={setDeleteWallet}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Form */}
      <BottomSheet
        open={showForm}
        onClose={() => { setShowForm(false); setEditWallet(null) }}
        title={editWallet ? 'Edit Wallet' : 'New Wallet'}
      >
        <WalletForm
          wallet={editWallet || undefined}
          userId={userId}
          onSuccess={() => { setShowForm(false); setEditWallet(null); refetch() }}
          onCancel={() => { setShowForm(false); setEditWallet(null) }}
        />
      </BottomSheet>

      {/* Delete Confirm */}
      <BottomSheet
        open={!!deleteWallet}
        onClose={() => setDeleteWallet(null)}
        title="Delete Wallet"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              Are you sure you want to delete <strong>{deleteWallet?.name}</strong>? All associated transactions will also be deleted.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteWallet(null)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
