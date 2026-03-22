import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyMomoCredentials, MOMO_COLOR } from '@/lib/momo'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { partnerCode, accessKey, secretKey, phone, isTest } = await req.json()

  if (!partnerCode || !accessKey || !secretKey || !phone) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  // Verify credentials
  const verify = await verifyMomoCredentials(partnerCode, accessKey, secretKey, isTest ?? false)
  if (!verify.valid) {
    return NextResponse.json({
      error: `Invalid credentials (code: ${verify.resultCode}). Please check your Partner Code, Access Key, and Secret Key.`,
    }, { status: 400 })
  }

  // Create or get existing MoMo wallet
  const { data: existingIntegration } = await supabase
    .from('momo_integrations')
    .select('wallet_id')
    .eq('user_id', user.id)
    .single()

  let walletId = existingIntegration?.wallet_id

  if (!walletId) {
    // Create a new wallet for MoMo
    const { data: wallet, error: walletErr } = await supabase
      .from('wallets')
      .insert({
        user_id: user.id,
        name: 'MoMo',
        type: 'e-wallet',
        balance: 0,
        color: MOMO_COLOR,
      })
      .select('id')
      .single()

    if (walletErr || !wallet) {
      return NextResponse.json({ error: 'Failed to create MoMo wallet' }, { status: 500 })
    }
    walletId = wallet.id
  }

  // Save/update MoMo integration
  const { error } = await supabase.from('momo_integrations').upsert({
    user_id: user.id,
    partner_code: partnerCode,
    access_key: accessKey,
    secret_key: secretKey,
    phone,
    is_test: isTest ?? false,
    wallet_id: walletId,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, walletId })
}
