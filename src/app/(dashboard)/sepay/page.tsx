'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { createClient } from '@/lib/supabase/client'
import {
  Building2, RefreshCw, Copy, Check, AlertCircle,
  ExternalLink, Unlink, Wifi, WifiOff, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface BankAccount {
  id: string
  sepay_account_id: number
  bank_short_name: string
  bank_full_name: string
  account_number: string
  account_holder_name: string
  wallet_id: string
  last_synced_at: string | null
  since_id: number
  wallets: { id: string; name: string; balance: number; color: string } | null
}

interface RecentTx {
  id: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  note: string | null
  date: string
}

export default function SepayPage() {
  const { formatAmount } = useCurrency()
  const supabase = createClient()

  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [webhookApikey, setWebhookApikey] = useState('')
  const [syncing, setSyncing] = useState<Record<string, boolean>>({})
  const [syncResult, setSyncResult] = useState<Record<string, string>>({})
  const [recentTxByAccount, setRecentTxByAccount] = useState<Record<string, RecentTx[]>>({})
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/sepay/webhook`
    : '/api/sepay/webhook'

  const loadData = useCallback(async () => {
    const res = await fetch('/api/sepay/accounts')
    const data = await res.json()
    if (data.error || !data.bankAccounts?.length) { setIsConnected(false); return }
    setIsConnected(true)
    setBankAccounts(data.bankAccounts)
    setWebhookApikey(data.integration?.webhook_apikey || '')

    // Load recent transactions for each account
    for (const acc of data.bankAccounts as BankAccount[]) {
      if (!acc.wallet_id) continue
      const { data: txs } = await supabase
        .from('transactions')
        .select('id, amount, type, note, date')
        .eq('wallet_id', acc.wallet_id)
        .order('date', { ascending: false })
        .limit(5)
      if (txs) setRecentTxByAccount(prev => ({ ...prev, [acc.wallet_id]: txs as RecentTx[] }))
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleSync(sepayAccountId: number, label: string) {
    setSyncing(prev => ({ ...prev, [label]: true }))
    setSyncResult(prev => ({ ...prev, [label]: '' }))
    try {
      const res = await fetch('/api/sepay/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sepayAccountId }),
      })
      const data = await res.json()
      setSyncResult(prev => ({
        ...prev,
        [label]: data.success ? `✓ Imported ${data.imported} transactions` : `✗ ${data.error}`,
      }))
      loadData()
    } catch {
      setSyncResult(prev => ({ ...prev, [label]: '✗ Network error' }))
    } finally {
      setSyncing(prev => ({ ...prev, [label]: false }))
    }
  }

  async function handleSyncAll() {
    const res = await fetch('/api/sepay/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const data = await res.json()
    if (data.success) loadData()
  }

  async function handleDisconnect(deleteWallets: boolean) {
    setDisconnecting(true)
    await fetch('/api/sepay/disconnect', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleteWallets }),
    })
    setIsConnected(false); setBankAccounts([])
    setDisconnecting(false)
  }

  function copy(text: string, setCopied: (v: boolean) => void) {
    navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (isConnected === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto mt-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SePay Integration</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Connect to auto-sync bank transfers as wallet transactions
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-4">Go to <strong>Settings → Integrations</strong> to enter your SePay API token.</p>
          <Link href="/settings" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors">
            <Building2 className="w-4 h-4" />
            Connect in Settings
          </Link>
        </div>
      </div>
    )
  }

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + (acc.wallets?.balance ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SePay</h1>
          <p className="text-gray-400 text-sm">{bankAccounts.length} bank account{bankAccounts.length !== 1 ? 's' : ''} connected</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSyncAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Sync All
          </button>
        </div>
      </div>

      {/* Total balance hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/10 translate-x-16 -translate-y-16" />
        <p className="text-indigo-200 text-sm font-medium">Total SePay Balance</p>
        <p className="text-4xl font-bold mt-1">{formatAmount(totalBalance)}</p>
        <p className="text-indigo-200 text-sm mt-3">{bankAccounts.length} accounts · auto-synced via SePay</p>
      </div>

      {/* Bank accounts */}
      {bankAccounts.map(acc => (
        <div key={acc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Account header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: acc.wallets?.color || '#6366f1' }}>
                {acc.bank_short_name.slice(0, 3).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{acc.wallets?.name || acc.bank_short_name}</p>
                <p className="text-xs text-gray-400">{acc.account_holder_name} · ···{acc.account_number.slice(-4)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">{formatAmount(acc.wallets?.balance ?? 0)}</p>
              {acc.last_synced_at && (
                <p className="text-xs text-gray-400">
                  {new Date(acc.last_synced_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>

          {/* Recent transactions */}
          <div>
            {(recentTxByAccount[acc.wallet_id] ?? []).slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-2.5 hover:bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center',
                    tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50')}>
                    {tx.type === 'income'
                      ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                      : <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 truncate max-w-[180px]">{tx.note || 'Transaction'}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <p className={cn('text-sm font-semibold',
                  tx.type === 'income' ? 'text-emerald-600' : 'text-red-500')}>
                  {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                </p>
              </div>
            ))}
          </div>

          {/* Sync button */}
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
            {syncResult[acc.account_number] && (
              <p className={cn('text-xs', syncResult[acc.account_number].startsWith('✓') ? 'text-emerald-600' : 'text-red-500')}>
                {syncResult[acc.account_number]}
              </p>
            )}
            <button
              onClick={() => handleSync(acc.sepay_account_id, acc.account_number)}
              disabled={syncing[acc.account_number]}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-3 h-3', syncing[acc.account_number] && 'animate-spin')} />
              {syncing[acc.account_number] ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>
      ))}

      {/* Webhook config */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="w-4 h-4 text-indigo-500" />
          <h3 className="font-semibold text-gray-800">Webhook Configuration</h3>
          <a href="https://my.sepay.vn" target="_blank" rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700">
            SePay Dashboard <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-500">Webhook URL</p>
              <button onClick={() => copy(webhookUrl, setCopiedUrl)}
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700">
                {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedUrl ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs font-mono text-gray-600 break-all">{webhookUrl}</p>
          </div>

          {webhookApikey && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500">API Key (Authorization: Apikey)</p>
                <button onClick={() => copy(webhookApikey, setCopiedKey)}
                  className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700">
                  {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedKey ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs font-mono text-gray-600 break-all">{webhookApikey}</p>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 space-y-1">
            <p className="font-medium">Setup steps in SePay Dashboard:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-600">
              <li>Go to <strong>Webhooks</strong> → Add new webhook</li>
              <li>Paste the <strong>Webhook URL</strong> above</li>
              <li>Set Auth type: <strong>Apikey</strong></li>
              <li>Paste the <strong>API Key</strong> above</li>
              <li>Set Content-Type: <strong>application/json</strong></li>
            </ol>
          </div>
        </div>
      </div>

      {/* Disconnect */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Disconnect SePay</h3>
        <div className="flex gap-2">
          <button onClick={() => handleDisconnect(false)} disabled={disconnecting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
            <Unlink className="w-4 h-4" />
            Keep wallets
          </button>
          <button onClick={() => handleDisconnect(true)} disabled={disconnecting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-100 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
            <Unlink className="w-4 h-4" />
            Delete wallets too
          </button>
        </div>
      </div>
    </div>
  )
}
