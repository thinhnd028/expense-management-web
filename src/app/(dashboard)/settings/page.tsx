'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CURRENCIES } from '@/lib/currency'
import { useCurrency } from '@/contexts/CurrencyContext'
import {
  Check, ExternalLink, Unlink, Store, AlertCircle, Wallet,
  RefreshCw, Copy, Building2, ChevronRight, Lock, Eye, EyeOff,
  ShieldCheck, Globe, Plug, User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import ShopeeLogo from '@/components/logos/ShopeeLogo'

type Tab = 'general' | 'integrations' | 'security'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'security', label: 'Security', icon: ShieldCheck },
]

export default function SettingsPage() {
  const { currency } = useCurrency()
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('general')

  /* ─── Currency ─── */
  const [selected, setSelected] = useState(currency.code)
  const [savingCurrency, setSavingCurrency] = useState(false)
  const [savedCurrency, setSavedCurrency] = useState(false)

  /* ─── SePay ─── */
  const [sepayConnected, setSepayConnected] = useState(false)
  const [sepayAccountCount, setSepayAccountCount] = useState(0)
  const [sepayToken, setSepayToken] = useState('')
  const [connectingSepay, setConnectingSepay] = useState(false)
  const [disconnectingSepay, setDisconnectingSepay] = useState(false)
  const [sepayError, setSepayError] = useState('')

  /* ─── Shopee ─── */
  const [shopeeConnected, setShopeeConnected] = useState(false)
  const [shopName, setShopName] = useState('')
  const [partnerId, setPartnerId] = useState('')
  const [partnerKey, setPartnerKey] = useState('')
  const [isSandbox, setIsSandbox] = useState(false)
  const [connectingShopee, setConnectingShopee] = useState(false)
  const [disconnectingShopee, setDisconnectingShopee] = useState(false)
  const [shopeeError, setShopeeError] = useState('')

  /* ─── MoMo ─── */
  const [momoConnected, setMomoConnected] = useState(false)
  const [momoPhone, setMomoPhone] = useState('')
  const [momoWalletBalance, setMomoWalletBalance] = useState(0)
  const [momoPartnerCode, setMomoPartnerCode] = useState('')
  const [momoAccessKey, setMomoAccessKey] = useState('')
  const [momoSecretKey, setMomoSecretKey] = useState('')
  const [momoPhone2, setMomoPhone2] = useState('')
  const [momoIsTest, setMomoIsTest] = useState(false)
  const [connectingMomo, setConnectingMomo] = useState(false)
  const [disconnectingMomo, setDisconnectingMomo] = useState(false)
  const [momoError, setMomoError] = useState('')
  const [syncingBalance, setSyncingBalance] = useState(false)
  const [syncBalance, setSyncBalance] = useState('')
  const [showSyncForm, setShowSyncForm] = useState(false)
  const [webhookCopied, setWebhookCopied] = useState(false)

  /* ─── Password ─── */
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/momo/webhook`
    : '/api/momo/webhook'

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email)
    })
    fetch('/api/sepay/accounts').then(r => r.json()).then(data => {
      if (data.bankAccounts?.length > 0) { setSepayConnected(true); setSepayAccountCount(data.bankAccounts.length) }
    })
    supabase.from('shopee_integrations').select('partner_id, shop_name, access_token, is_sandbox').single().then(({ data }) => {
      if (data) {
        setPartnerId(data.partner_id || '')
        setIsSandbox(data.is_sandbox || false)
        if (data.access_token) { setShopeeConnected(true); setShopName(data.shop_name || 'My Shop') }
      }
    })
    supabase.from('momo_integrations').select('partner_code, phone, wallet_id, is_test').single().then(async ({ data }) => {
      if (data) {
        setMomoConnected(true); setMomoPhone(data.phone || ''); setMomoIsTest(data.is_test || false)
        if (data.wallet_id) {
          const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', data.wallet_id).single()
          if (wallet) setMomoWalletBalance(wallet.balance)
        }
      }
    })
  }, [])

  async function handleSaveCurrency() {
    setSavingCurrency(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ currency: selected }).eq('id', user.id)
    setSavingCurrency(false); setSavedCurrency(true)
    setTimeout(() => setSavedCurrency(false), 2000)
    router.refresh()
  }

  async function handleConnectSepay() {
    if (!sepayToken.trim()) { setSepayError('API Token is required'); return }
    setConnectingSepay(true); setSepayError('')
    try {
      const res = await fetch('/api/sepay/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiToken: sepayToken }) })
      const data = await res.json()
      if (data.error) { setSepayError(data.error); return }
      setSepayConnected(true); setSepayAccountCount(data.totalAccounts)
    } catch { setSepayError('Connection failed. Please try again.') }
    finally { setConnectingSepay(false) }
  }

  async function handleDisconnectSepay(deleteWallets: boolean) {
    setDisconnectingSepay(true)
    await fetch('/api/sepay/disconnect', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deleteWallets }) })
    setSepayConnected(false); setSepayAccountCount(0); setDisconnectingSepay(false)
  }

  async function handleConnectShopee() {
    if (!partnerId.trim() || !partnerKey.trim()) { setShopeeError('Partner ID and Partner Key are required'); return }
    setConnectingShopee(true); setShopeeError('')
    try {
      const res = await fetch('/api/shopee/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partnerId: Number(partnerId), partnerKey, isSandbox }) })
      const data = await res.json()
      if (data.error) { setShopeeError(data.error); return }
      window.location.href = data.authUrl
    } catch { setShopeeError('Connection failed.') }
    finally { setConnectingShopee(false) }
  }

  async function handleDisconnectShopee() {
    setDisconnectingShopee(true)
    await fetch('/api/shopee/disconnect', { method: 'DELETE' })
    setShopeeConnected(false); setShopName(''); setDisconnectingShopee(false)
  }

  async function handleConnectMomo() {
    if (!momoPartnerCode || !momoAccessKey || !momoSecretKey || !momoPhone2) { setMomoError('All fields are required'); return }
    setConnectingMomo(true); setMomoError('')
    try {
      const res = await fetch('/api/momo/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partnerCode: momoPartnerCode, accessKey: momoAccessKey, secretKey: momoSecretKey, phone: momoPhone2, isTest: momoIsTest }) })
      const data = await res.json()
      if (data.error) { setMomoError(data.error); return }
      setMomoConnected(true); setMomoPhone(momoPhone2)
    } catch { setMomoError('Connection failed. Please try again.') }
    finally { setConnectingMomo(false) }
  }

  async function handleDisconnectMomo(deleteWallet: boolean) {
    setDisconnectingMomo(true)
    await fetch('/api/momo/disconnect', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deleteWallet }) })
    setMomoConnected(false); setMomoPhone(''); setMomoWalletBalance(0); setDisconnectingMomo(false)
  }

  async function handleSyncBalance() {
    const num = parseFloat(syncBalance)
    if (!num || num < 0) return
    setSyncingBalance(true)
    const res = await fetch('/api/momo/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balance: num }) })
    const data = await res.json()
    if (data.success) { setMomoWalletBalance(data.balance); setShowSyncForm(false); setSyncBalance('') }
    setSyncingBalance(false)
  }

  function copyWebhook() {
    navigator.clipboard.writeText(webhookUrl)
    setWebhookCopied(true); setTimeout(() => setWebhookCopied(false), 2000)
  }

  async function handleSetPassword() {
    setPasswordError('')
    if (newPassword.length < 8) { setPasswordError('Mật khẩu phải có ít nhất 8 ký tự'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Mật khẩu nhập lại không khớp'); return }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) { setPasswordError(error.message); return }
    setPasswordSuccess(true); setNewPassword(''); setConfirmPassword('')
    setTimeout(() => setPasswordSuccess(false), 3000)
  }

  const { formatAmount } = useCurrency()

  return (
    <div className="max-w-3xl">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your preferences & integrations</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              tab === t.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ TAB: GENERAL ══════════════════ */}
      {tab === 'general' && (
        <div className="space-y-4">
          {/* Currency */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">Display Currency</h2>
              <p className="text-sm text-gray-400 mt-0.5">Đơn vị tiền hiển thị trong toàn bộ ứng dụng</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                {CURRENCIES.map((c) => (
                  <button key={c.code} onClick={() => setSelected(c.code)}
                    className={cn(
                      'relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all text-center',
                      selected === c.code
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-white'
                    )}>
                    {selected === c.code && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                    <span className="text-xl font-bold text-gray-700">{c.symbol}</span>
                    <span className="text-xs font-semibold text-gray-800">{c.code}</span>
                    <span className="text-[10px] text-gray-400 leading-tight">{c.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={handleSaveCurrency} disabled={savingCurrency || selected === currency.code}
                className={cn(
                  'w-full py-2.5 rounded-xl font-semibold text-sm transition-all',
                  savedCurrency ? 'bg-emerald-500 text-white'
                  : selected === currency.code ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
                )}>
                {savedCurrency ? '✓ Saved!' : savingCurrency ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: INTEGRATIONS ══════════════════ */}
      {tab === 'integrations' && (
        <div className="space-y-3">

          {/* ── MoMo ── */}
          <IntegrationCard
            logo={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="https://homepage.momocdn.net/fileuploads/svg/momo-file-240411162904.svg" alt="MoMo" className="h-8 w-auto" />
            }
            subtitle="E-Wallet · Payment Platform"
            connected={momoConnected}
          >
            {momoConnected ? (
              <div className="space-y-3">
                {/* Balance strip */}
                <div className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: 'linear-gradient(135deg,#AE2070,#d63384)' }}>
                  <div>
                    <p className="text-xs text-pink-200 mb-0.5">Số dư ví MoMo</p>
                    <p className="text-lg font-bold text-white">{formatAmount(momoWalletBalance)}</p>
                  </div>
                  <div className="text-right">
                    <Wallet className="w-7 h-7 text-pink-300/60 ml-auto mb-1" />
                    <p className="text-xs text-pink-200">{momoPhone}</p>
                  </div>
                </div>

                {/* Sync */}
                {showSyncForm ? (
                  <div className="flex gap-2">
                    <input type="number" value={syncBalance} onChange={e => setSyncBalance(e.target.value)}
                      placeholder="Nhập số dư hiện tại" autoFocus
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
                    <button onClick={handleSyncBalance} disabled={syncingBalance}
                      className="px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60"
                      style={{ background: '#AE2070' }}>{syncingBalance ? '...' : 'Cập nhật'}</button>
                    <button onClick={() => setShowSyncForm(false)} className="px-3 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm">✕</button>
                  </div>
                ) : (
                  <button onClick={() => setShowSyncForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-pink-200 text-pink-700 text-sm font-medium hover:bg-pink-50 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Cập nhật số dư
                  </button>
                )}

                {/* Webhook */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-gray-600">IPN Webhook URL</p>
                    <button onClick={copyWebhook} className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                      <Copy className="w-3 h-3" />{webhookCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono break-all">{webhookUrl}</p>
                </div>

                <DisconnectRow
                  onKeep={() => handleDisconnectMomo(false)}
                  onDelete={() => handleDisconnectMomo(true)}
                  loading={disconnectingMomo}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <InfoAlert href="https://business.momo.vn" linkText="business.momo.vn">
                  Cần tài khoản MoMo Business/Partner để lấy credentials.
                </InfoAlert>
                {[
                  { label: 'Partner Code', value: momoPartnerCode, set: setMomoPartnerCode, placeholder: 'MOMO1234' },
                  { label: 'Access Key', value: momoAccessKey, set: setMomoAccessKey, placeholder: 'Your access key' },
                  { label: 'Secret Key', value: momoSecretKey, set: setMomoSecretKey, placeholder: '••••••••', type: 'password' },
                  { label: 'Phone', value: momoPhone2, set: setMomoPhone2, placeholder: '0901234567' },
                ].map(f => <FormField key={f.label} {...f} accentColor="ring-pink-400" />)}
                <Toggle value={momoIsTest} onChange={setMomoIsTest} color="bg-pink-500" label="Môi trường Test" />
                <ErrorMsg msg={momoError} />
                <ConnectBtn onClick={handleConnectMomo} loading={connectingMomo}
                  label="Kết nối MoMo" loadingLabel="Đang xác minh..."
                  style={{ background: 'linear-gradient(135deg,#AE2070,#d63384)' }} />
              </div>
            )}
          </IntegrationCard>

          {/* ── SePay ── */}
          <IntegrationCard
            logo={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="https://sepay.vn//assets/img/logo/sepay-blue-154x50.png" alt="SePay" className="h-6 w-auto" />
            }
            subtitle="Bank Transfer · Auto-sync"
            connected={sepayConnected}
          >
            {sepayConnected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{sepayAccountCount} tài khoản ngân hàng</p>
                    <p className="text-xs text-gray-400">Mỗi tài khoản = 1 ví</p>
                  </div>
                  <a href="/sepay" className="flex items-center gap-0.5 text-xs text-blue-600 font-semibold hover:text-blue-700">
                    Quản lý <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
                <DisconnectRow
                  onKeep={() => handleDisconnectSepay(false)}
                  onDelete={() => handleDisconnectSepay(true)}
                  loading={disconnectingSepay}
                  deleteLabel="Xoá cả ví"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <InfoAlert href="https://my.sepay.vn" linkText="my.sepay.vn">
                  Lấy API token tại SePay → Company Settings → API Access.
                </InfoAlert>
                <FormField label="API Token" value={sepayToken} set={setSepayToken}
                  placeholder="Dán token vào đây" type="password" accentColor="ring-blue-500" />
                <ErrorMsg msg={sepayError} />
                <ConnectBtn onClick={handleConnectSepay} loading={connectingSepay}
                  label="Kết nối SePay" loadingLabel="Đang xác minh..." className="bg-blue-600 hover:bg-blue-700 text-white" />
              </div>
            )}
          </IntegrationCard>

          {/* ── Shopee ── */}
          <IntegrationCard
            logo={<ShopeeLogo className="h-6 w-auto text-[#ee4d2d]" />}
            subtitle="Seller · Order analytics"
            connected={shopeeConnected}
          >
            {shopeeConnected ? (
              <div className="space-y-3">
                <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ background: 'linear-gradient(135deg,#ee4d2d,#ff7337)' }}>
                  <Store className="w-7 h-7 text-orange-200/70 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{shopName}</p>
                    <p className="text-xs text-orange-200">Shopee Shop</p>
                  </div>
                  <a href="/shopee" className="flex items-center gap-0.5 text-xs text-white font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                    Analytics <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
                <button onClick={handleDisconnectShopee} disabled={disconnectingShopee}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
                  <Unlink className="w-3.5 h-3.5" />
                  {disconnectingShopee ? 'Đang ngắt...' : 'Ngắt kết nối Shopee'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <InfoAlert href="https://open.shopee.com" linkText="open.shopee.com">
                  Đăng ký Shopee Open Platform để lấy Partner credentials.
                </InfoAlert>
                {[
                  { label: 'Partner ID', value: partnerId, set: setPartnerId, placeholder: '1234567' },
                  { label: 'Partner Key', value: partnerKey, set: setPartnerKey, placeholder: 'Secret key', type: 'password' },
                ].map(f => <FormField key={f.label} {...f} accentColor="ring-orange-400" />)}
                <Toggle value={isSandbox} onChange={setIsSandbox} color="bg-orange-500" label="Sandbox environment" />
                <ErrorMsg msg={shopeeError} />
                <ConnectBtn onClick={handleConnectShopee} loading={connectingShopee}
                  label="Kết nối Shopee" loadingLabel="Đang chuyển hướng..."
                  style={{ background: 'linear-gradient(135deg,#ee4d2d,#ff7337)' }} />
              </div>
            )}
          </IntegrationCard>
        </div>
      )}

      {/* ══════════════════ TAB: SECURITY ══════════════════ */}
      {tab === 'security' && (
        <div className="space-y-4">
          {/* Account info */}
          {userEmail && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{userEmail}</p>
                <p className="text-xs text-gray-400 mt-0.5">Tài khoản hiện tại</p>
              </div>
            </div>
          )}

          {/* Set password */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Lock className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Set / Change Password</h2>
                <p className="text-sm text-gray-400 mt-0.5">Đăng nhập bằng Email & mật khẩu — không cần Google</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
                Sau khi đặt mật khẩu, bạn có thể đăng nhập tại{' '}
                <span className="font-semibold">Email → Sign in</span> mà không cần qua Google OAuth.
                Tài khoản Google vẫn hoạt động bình thường.
              </div>

              <div className="grid gap-4">
                {/* New password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Mật khẩu mới</label>
                  <div className="relative">
                    <input type={showNewPass ? 'text' : 'password'} value={newPassword}
                      onChange={e => setNewPassword(e.target.value)} placeholder="Ít nhất 8 ký tự"
                      autoComplete="new-password"
                      className="w-full px-4 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    <button type="button" onClick={() => setShowNewPass(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Nhập lại mật khẩu</label>
                  <div className="relative">
                    <input type={showConfirmPass ? 'text' : 'password'} value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSetPassword()}
                      placeholder="Nhập lại mật khẩu mới"
                      autoComplete="new-password"
                      className="w-full px-4 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    <button type="button" onClick={() => setShowConfirmPass(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{passwordError}
                </div>
              )}

              <button onClick={handleSetPassword} disabled={savingPassword || !newPassword || !confirmPassword}
                className={cn(
                  'w-full py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50',
                  passwordSuccess ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                )}>
                {passwordSuccess ? '✓ Đã lưu mật khẩu!' : savingPassword ? 'Đang lưu...' : 'Lưu mật khẩu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Shared sub-components ─── */

function IntegrationCard({
  logo, subtitle, connected, children,
}: {
  logo: React.ReactNode
  subtitle: string
  connected: boolean
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-4 border-b border-gray-50">
        <div className="flex-1 flex items-center gap-3">
          {logo}
          <span className="text-xs text-gray-400">{subtitle}</span>
        </div>
        {connected ? (
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Connected
          </span>
        ) : (
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">Not connected</span>
        )}
      </div>
      {/* Body */}
      <div className="p-5">{children}</div>
    </div>
  )
}

function FormField({ label, value, set, placeholder, type = 'text', accentColor }: {
  label: string; value: string; set: (v: string) => void; placeholder: string; type?: string; accentColor: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${accentColor} focus:border-transparent`} />
    </div>
  )
}

function Toggle({ value, onChange, color, label }: { value: boolean; onChange: (v: boolean) => void; color: string; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer py-0.5">
      <div onClick={() => onChange(!value)} className={cn('w-9 h-5 rounded-full transition-colors relative flex-shrink-0', value ? color : 'bg-gray-200')}>
        <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', value ? 'translate-x-4' : 'translate-x-0.5')} />
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </label>
  )
}

function InfoAlert({ href, linkText, children }: { href: string; linkText: string; children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2.5">
      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="text-xs text-amber-700">
        <p>{children}</p>
        <a href={href} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-1 font-bold text-amber-800 hover:underline">
          {linkText} <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <p className="flex items-center gap-1.5 text-sm text-red-500">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />{msg}
    </p>
  )
}

function ConnectBtn({ onClick, loading, label, loadingLabel, className, style }: {
  onClick: () => void; loading: boolean; label: string; loadingLabel: string; className?: string; style?: React.CSSProperties
}) {
  return (
    <button onClick={onClick} disabled={loading}
      className={cn('w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60', className)}
      style={style}>
      {loading ? loadingLabel : label}
    </button>
  )
}

function DisconnectRow({ onKeep, onDelete, loading, deleteLabel = 'Xoá cả ví' }: {
  onKeep: () => void; onDelete: () => void; loading: boolean; deleteLabel?: string
}) {
  return (
    <div className="flex gap-2">
      <button onClick={onKeep} disabled={loading}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors">
        <Unlink className="w-3.5 h-3.5" /> Ngắt kết nối
      </button>
      <button onClick={onDelete} disabled={loading}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-100 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors">
        <Unlink className="w-3.5 h-3.5" /> {deleteLabel}
      </button>
    </div>
  )
}
