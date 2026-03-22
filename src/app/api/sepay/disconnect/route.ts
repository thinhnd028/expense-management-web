import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { deleteWallets } = await req.json().catch(() => ({ deleteWallets: false }))

  if (deleteWallets) {
    // Get all wallet IDs linked to SePay
    const { data: bankAccounts } = await supabase
      .from('sepay_bank_accounts')
      .select('wallet_id')
      .eq('user_id', user.id)

    for (const acc of bankAccounts ?? []) {
      if (acc.wallet_id) {
        await supabase.from('wallets').delete().eq('id', acc.wallet_id)
      }
    }
  }

  await supabase.from('sepay_bank_accounts').delete().eq('user_id', user.id)
  await supabase.from('sepay_integrations').delete().eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
