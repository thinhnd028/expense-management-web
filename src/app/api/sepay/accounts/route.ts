import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** GET all SePay-linked bank accounts with wallet info */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: bankAccounts } = await supabase
    .from('sepay_bank_accounts')
    .select('*, wallets(id, name, balance, color)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const { data: integration } = await supabase
    .from('sepay_integrations')
    .select('webhook_apikey, created_at')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ bankAccounts: bankAccounts ?? [], integration })
}
