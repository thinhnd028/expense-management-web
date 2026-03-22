import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Manually sync MoMo wallet balance (user-provided amount from MoMo app) */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { balance } = await req.json()
  if (typeof balance !== 'number' || balance < 0) {
    return NextResponse.json({ error: 'Invalid balance' }, { status: 400 })
  }

  const { data: integration } = await supabase
    .from('momo_integrations')
    .select('wallet_id')
    .eq('user_id', user.id)
    .single()

  if (!integration?.wallet_id) {
    return NextResponse.json({ error: 'MoMo not connected' }, { status: 400 })
  }

  await supabase
    .from('wallets')
    .update({ balance })
    .eq('id', integration.wallet_id)

  await supabase
    .from('momo_integrations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('user_id', user.id)

  return NextResponse.json({ success: true, balance })
}
