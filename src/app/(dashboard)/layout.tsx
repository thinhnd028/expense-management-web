import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import MobileHeader from '@/components/layout/MobileHeader'
import BottomNav from '@/components/layout/BottomNav'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { DEFAULT_CURRENCY } from '@/lib/currency'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <CurrencyProvider currencyCode={profile?.currency ?? DEFAULT_CURRENCY}>
      <div className="flex h-screen bg-[#f3f4f5] overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 sm:ml-64 overflow-hidden">
          <MobileHeader profile={profile} />
          <main className="flex-1 overflow-y-auto p-6 sm:p-8">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </CurrencyProvider>
  )
}
