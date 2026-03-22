'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, Wallet, BarChart2, Smartphone, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const features = [
  { icon: Wallet, label: 'Multi-wallet' },
  { icon: BarChart2, label: 'Analytics' },
  { icon: Smartphone, label: 'Mobile PWA' },
]

type Mode = 'choose' | 'signin' | 'signup'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [mode, setMode] = useState<Mode>('choose')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleEmailSignIn() {
    if (!email || !password) { setError('Email và mật khẩu không được để trống'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/')
    router.refresh()
  }

  async function handleEmailSignUp() {
    if (!email || !password) { setError('Email và mật khẩu không được để trống'); return }
    if (password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSuccessMsg('Kiểm tra email của bạn để xác nhận tài khoản!')
  }

  const isEmail = mode === 'signin' || mode === 'signup'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ExpenseFlow</h1>
          <p className="text-gray-500 mt-2">Smart expense management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 p-8">
          {mode === 'choose' && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Welcome back</h2>
              <p className="text-gray-500 text-sm mb-7">
                Sign in to manage your finances across all devices.
              </p>

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Email options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setMode('signin'); setError('') }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Sign in
                </button>
                <button
                  onClick={() => { setMode('signup'); setError('') }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Sign up
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </>
          )}

          {isEmail && (
            <>
              <button
                onClick={() => { setMode('choose'); setError(''); setSuccessMsg('') }}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-5 -mt-1 transition-colors"
              >
                ← Back
              </button>

              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                {mode === 'signin' ? 'Sign in with Email' : 'Create Account'}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {mode === 'signin'
                  ? 'Use your email and password to sign in.'
                  : 'Create a new account with email and password.'}
              </p>

              {successMsg ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <p className="text-emerald-700 font-medium text-sm">{successMsg}</p>
                  <p className="text-emerald-600 text-xs mt-1">Check your inbox and confirm your email to continue.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (mode === 'signin' ? handleEmailSignIn() : handleEmailSignUp())}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (mode === 'signin' ? handleEmailSignIn() : handleEmailSignUp())}
                        placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                        className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp}
                    disabled={loading}
                    className={cn(
                      'w-full py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-60',
                      'bg-indigo-600 hover:bg-indigo-700 text-white'
                    )}
                  >
                    {loading
                      ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                      : (mode === 'signin' ? 'Sign in' : 'Create Account')}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    {mode === 'signin' ? (
                      <>Don&apos;t have an account?{' '}
                        <button onClick={() => { setMode('signup'); setError('') }} className="text-indigo-600 font-semibold hover:underline">
                          Sign up
                        </button>
                      </>
                    ) : (
                      <>Already have an account?{' '}
                        <button onClick={() => { setMode('signin'); setError('') }} className="text-indigo-600 font-semibold hover:underline">
                          Sign in
                        </button>
                      </>
                    )}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8 text-center">
          {features.map((f) => (
            <div key={f.label} className="bg-white/60 rounded-2xl p-3">
              <div className="flex justify-center mb-1.5">
                <f.icon className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-xs text-gray-500 font-medium">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
