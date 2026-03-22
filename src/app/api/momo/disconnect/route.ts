import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { deleteWallet } = await req.json().catch(() => ({ deleteWallet: false }))

  const { data: integration } = await supabase
    .from('momo_integrations')
    .select('wallet_id')
    .eq('user_id', user.id)
    .single()

  // Remove integration record
  await supabase.from('momo_integrations').delete().eq('user_id', user.id)

  // Optionally delete the MoMo wallet (user can choose to keep it)
  if (deleteWallet && integration?.wallet_id) {
    await supabase.from('wallets').delete().eq('id', integration.wallet_id)
  }

  return NextResponse.json({ success: true })
}
