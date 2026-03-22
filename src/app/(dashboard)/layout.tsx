import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import MobileHeader from '@/components/layout/MobileHeader'
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
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <MobileHeader profile={profile} />
          <div className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 pb-24 sm:pb-8">
            {children}
          </div>
        </div>
        <BottomNav />
      </main>
    </CurrencyProvider>
  )
}
