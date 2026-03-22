import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifySepayToken, getSePayAccounts, getBankColor } from '@/lib/sepay'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { apiToken } = await req.json()
  if (!apiToken?.trim()) {
    return NextResponse.json({ error: 'API Token is required' }, { status: 400 })
  }

  // Verify token
  const verify = await verifySepayToken(apiToken.trim())
  if (!verify.valid) {
    return NextResponse.json({ error: `Invalid API token: ${verify.error}` }, { status: 400 })
  }

  // Generate a webhook API key for securing the webhook endpoint
  const webhookApikey = randomBytes(24).toString('hex')

  // Save integration
  const { error: intErr } = await supabase.from('sepay_integrations').upsert({
    user_id: user.id,
    api_token: apiToken.trim(),
    webhook_apikey: webhookApikey,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (intErr) return NextResponse.json({ error: intErr.message }, { status: 500 })

  // Fetch all bank accounts from SePay and create wallets
  const accounts = await getSePayAccounts(apiToken.trim())
  const created: { accountNumber: string; bankName: string; walletId: string }[] = []

  for (const acc of accounts) {
    // Check if wallet already exists for this account
    const { data: existing } = await supabase
      .from('sepay_bank_accounts')
      .select('wallet_id')
      .eq('user_id', user.id)
      .eq('sepay_account_id', acc.id)
      .single()

    if (existing?.wallet_id) {
      // Update balance
      await supabase.from('wallets').update({ balance: acc.accumulated }).eq('id', existing.wallet_id)
      continue
    }

    // Create wallet for this bank account
    const color = getBankColor(acc.bank_short_name)
    const { data: wallet } = await supabase.from('wallets').insert({
      user_id: user.id,
      name: `${acc.bank_short_name} ···${acc.account_number.slice(-4)}`,
      type: 'bank',
      balance: acc.accumulated ?? 0,
      color,
    }).select('id').single()

    if (!wallet) continue

    await supabase.from('sepay_bank_accounts').insert({
      user_id: user.id,
      sepay_account_id: acc.id,
      bank_short_name: acc.bank_short_name,
      bank_full_name: acc.bank_full_name,
      account_number: acc.account_number,
      account_holder_name: acc.account_holder_name,
      wallet_id: wallet.id,
      since_id: 0,
    })

    created.push({ accountNumber: acc.account_number, bankName: acc.bank_short_name, walletId: wallet.id })
  }

  return NextResponse.json({ success: true, created, totalAccounts: accounts.length, webhookApikey })
}
