'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CURRENCIES } from '@/lib/currency'
import { useCurrency } from '@/contexts/CurrencyContext'
import {
  Check, AlertCircle,
  Eye, EyeOff,
  ShieldCheck, Globe, User, Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type Tab = 'general' | 'security'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Globe },
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

  /* ─── Password ─── */
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email)
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

  return (
    <div className="max-w-3xl">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your preferences & account</p>
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
