'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CURRENCIES } from '@/lib/currency'
import { useCurrency } from '@/contexts/CurrencyContext'
import {
  Check, AlertCircle,
  Eye, EyeOff,
  User, Lock, Key, Bell, Download,
  CheckCircle, Smartphone, ChevronRight,
  Sun, Moon, Monitor, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'

export default function SettingsPage() {
  const { currency } = useCurrency()
  const router = useRouter()
  const supabase = createClient()

  /* ─── Profile ─── */
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

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

  /* ─── Theme ─── */
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email)
    })
    supabase.from('profiles').select('full_name').single().then(({ data }) => {
      if (data?.full_name) setUserName(data.full_name)
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
    <div className="space-y-16 pb-20 sm:pb-8">

      {/* ── Page header ── */}
      <div>
        <h1 className="font-headline text-3xl font-bold text-[#0e1c2b]">Cài đặt</h1>
        <p className="text-sm text-[#8b99ac] mt-1">Quản lý tài khoản và tùy chọn của bạn</p>
      </div>

      {/* ── ROW 1: Personal Info (col-8) + Interface (col-4) ── */}
      <div className="grid grid-cols-12 gap-8">

        {/* Personal Information */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold font-headline text-[#0e1c2b] flex items-center gap-2">
              <User className="w-5 h-5 text-[#8b99ac]" />
              Thông tin cá nhân
            </h3>
            <button className="text-[#0e1c2b] font-bold text-sm hover:underline">Cập nhật</button>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm space-y-8">
            {/* Avatar row */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="h-20 w-20 rounded-2xl bg-[#e7e8e9] flex items-center justify-center overflow-hidden">
                  <span className="text-3xl font-bold text-[#0e1c2b]">
                    {(userName || userEmail)?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <button className="absolute -bottom-2 -right-2 p-1.5 bg-[#0e1c2b] text-white rounded-lg shadow-lg hover:scale-105 transition-transform">
                  <User className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#191c1d]">{userName || 'Người dùng'}</h4>
                <p className="text-[#454652] text-sm">Thành viên Premium</p>
              </div>
            </div>
            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#454652] uppercase tracking-wider">Họ và tên</label>
                <input
                  type="text"
                  defaultValue={userName}
                  placeholder="Nhập họ và tên"
                  className="w-full bg-[#f3f4f5] border-none rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e1c2b]/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#454652] uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  defaultValue={userEmail}
                  className="w-full bg-[#f3f4f5] border-none rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e1c2b]/20 transition-all"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#454652] uppercase tracking-wider">Đơn vị tiền tệ</label>
                <select
                  value={selected}
                  onChange={e => setSelected(e.target.value)}
                  className="w-full bg-[#f3f4f5] border-none rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e1c2b]/20 transition-all cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSaveCurrency}
                  disabled={savingCurrency || selected === currency.code}
                  className={cn(
                    'w-full py-3 rounded-lg font-semibold text-sm transition-all',
                    savedCurrency ? 'bg-[#beead1] text-[#274e3d]'
                    : selected === currency.code ? 'bg-[#edeeef] text-[#454652] cursor-not-allowed'
                    : 'hero-gradient text-white hover:opacity-90'
                  )}
                >
                  {savedCurrency ? '✓ Đã lưu!' : savingCurrency ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Interface Preferences */}
        <section className="col-span-12 lg:col-span-4 space-y-6">
          <h3 className="text-xl font-semibold font-headline text-[#0e1c2b] flex items-center gap-2">
            <Monitor className="w-5 h-5 text-[#8b99ac]" />
            Giao diện
          </h3>
          <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between h-[calc(100%-3.5rem)]">
            <p className="text-sm text-[#454652] mb-6">Tùy chỉnh trải nghiệm thị giác của bạn.</p>
            <div className="space-y-3">
              {([
                { id: 'light', label: 'Chế độ Sáng', icon: Sun },
                { id: 'dark', label: 'Chế độ Tối', icon: Moon },
                { id: 'system', label: 'Theo hệ thống', icon: Monitor },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-lg transition-all',
                    theme === id
                      ? 'bg-[#0e1c2b] text-white'
                      : 'bg-[#f3f4f5] text-[#191c1d] hover:bg-[#e7e8e9]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                  {theme === id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── ROW 2: Security (col-7) + Notifications + Data (col-5) ── */}
      <div className="grid grid-cols-12 gap-8">

        {/* Security section */}
        <section className="col-span-12 lg:col-span-7 space-y-6">
          <h3 className="text-xl font-semibold font-headline text-[#0e1c2b] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#8b99ac]" />
            Bảo mật
          </h3>

          {/* Security rows */}
          <div className="bg-white rounded-xl shadow-sm divide-y divide-[#f3f4f5]">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[#f3f4f5] flex items-center justify-center text-[#0e1c2b]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-[#191c1d] text-sm">Mật khẩu</p>
                  <p className="text-xs text-[#454652]">Thay đổi mật khẩu định kỳ để bảo mật hơn</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[#e7e8e9] text-[#0e1c2b] text-sm font-bold rounded-lg hover:bg-[#0e1c2b] hover:text-white transition-all">
                Thay đổi
              </button>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[#beead1]/30 flex items-center justify-center text-[#3f6653]">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-[#191c1d] text-sm">Xác thực 2 yếu tố (2FA)</p>
                  <p className="text-xs text-[#454652]">Đang tắt — Nên bật để tăng cường bảo mật</p>
                </div>
              </div>
              <Checkbox
                className="h-6 w-11 rounded-full border-[#e1e3e4] bg-[#e1e3e4] relative
                  data-[state=checked]:bg-[#3f6653] data-[state=checked]:border-[#3f6653]
                  after:content-[''] after:absolute after:top-0.5 after:left-0.5
                  after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all
                  data-[state=checked]:after:translate-x-5"
              />
            </div>
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[#f3f4f5] flex items-center justify-center text-[#0e1c2b]">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-[#191c1d] text-sm">Thiết bị đang đăng nhập</p>
                  <p className="text-xs text-[#454652]">Quản lý các phiên đang hoạt động</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#454652] cursor-pointer hover:text-[#0e1c2b]" />
            </div>
          </div>

          {/* Change password form */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#f3f4f5] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#d6e4f9] flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#0e1c2b]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#191c1d] text-sm">Đặt / Đổi mật khẩu</h4>
                <p className="text-xs text-[#454652]">Đăng nhập bằng Email mà không cần Google</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                Sau khi đặt mật khẩu, bạn có thể đăng nhập tại <span className="font-semibold">Email → Sign in</span>.
              </p>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#454652] uppercase tracking-wider">Mật khẩu mới</label>
                <div className="relative">
                  <input type={showNewPass ? 'text' : 'password'} value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} placeholder="Ít nhất 8 ký tự"
                    autoComplete="new-password"
                    className="w-full px-4 pr-11 py-3 bg-[#f3f4f5] border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0e1c2b]/20" />
                  <button type="button" onClick={() => setShowNewPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#454652] hover:text-[#191c1d]">
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#454652] uppercase tracking-wider">Nhập lại mật khẩu</label>
                <div className="relative">
                  <input type={showConfirmPass ? 'text' : 'password'} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSetPassword()}
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                    className="w-full px-4 pr-11 py-3 bg-[#f3f4f5] border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0e1c2b]/20" />
                  <button type="button" onClick={() => setShowConfirmPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#454652] hover:text-[#191c1d]">
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {passwordError && (
                <div className="flex items-center gap-2 text-sm text-[#ba1a1a] bg-[#ffdad6] rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />{passwordError}
                </div>
              )}
              <button onClick={handleSetPassword} disabled={savingPassword || !newPassword || !confirmPassword}
                className={cn(
                  'w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50',
                  passwordSuccess ? 'bg-[#beead1] text-[#274e3d]' : 'hero-gradient text-white hover:opacity-90'
                )}>
                {passwordSuccess ? '✓ Đã lưu mật khẩu!' : savingPassword ? 'Đang lưu...' : 'Lưu mật khẩu'}
              </button>
            </div>
          </div>
        </section>

        {/* Notifications + Data Export */}
        <section className="col-span-12 lg:col-span-5 space-y-8">
          {/* Notifications */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold font-headline text-[#0e1c2b] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#8b99ac]" />
              Thông báo
            </h3>
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
              {[
                { label: 'Báo cáo chi tiêu tuần', checked: true },
                { label: 'Cảnh báo vượt hạn mức', checked: true },
                { label: 'Khuyến mãi & Cập nhật', checked: false },
              ].map(({ label, checked }, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#191c1d]">{label}</span>
                  <Checkbox defaultChecked={checked} />
                </div>
              ))}
            </div>
          </div>

          {/* Data Export */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold font-headline text-[#0e1c2b] flex items-center gap-2">
              <Download className="w-5 h-5 text-[#8b99ac]" />
              Dữ liệu
            </h3>
            <div className="bg-[#233141] text-white p-6 rounded-xl flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold">Xuất báo cáo tài chính</p>
                <p className="text-[11px] text-[#8b99ac] mt-0.5">Tải xuống toàn bộ lịch sử giao dịch dưới định dạng .CSV hoặc .PDF</p>
              </div>
              <button className="bg-white text-[#0e1c2b] px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-transform shrink-0">
                Xuất ngay
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="pt-8 border-t border-[#f3f4f5] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 text-[#454652] text-xs">
          <span>© 2024 ExpenseFlow</span>
          <span className="h-1 w-1 bg-[#c6c5d4] rounded-full" />
          <button className="hover:text-[#0e1c2b] transition-colors">Chính sách bảo mật</button>
          <span className="h-1 w-1 bg-[#c6c5d4] rounded-full" />
          <button className="hover:text-[#0e1c2b] transition-colors">Điều khoản dịch vụ</button>
        </div>
        <div className="flex items-center gap-2 text-[#3f6653] text-xs font-semibold">
          <span className="h-2 w-2 bg-[#3f6653] rounded-full animate-pulse" />
          Hệ thống hoạt động ổn định
        </div>
      </footer>
    </div>
  )
}
