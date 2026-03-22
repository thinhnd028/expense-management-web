import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SepayWebhookPayload } from '@/lib/sepay'

/**
 * SePay Webhook endpoint.
 * Configure in SePay dashboard → Webhooks → Add URL:
 *   URL: https://your-domain.com/api/sepay/webhook
 *   Auth: Apikey YOUR_WEBHOOK_APIKEY (from settings)
 *
 * SePay sends POST when bank receives a transfer.
 * Must respond: { "success": true } with HTTP 200.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Verify API key from header
  const authHeader = req.headers.get('Authorization') ?? ''
  const incomingKey = authHeader.replace('Apikey ', '').replace('Bearer ', '').trim()

  const payload = await req.json() as SepayWebhookPayload

  // Find integration by account number
  const { data: bankAcc } = await supabase
    .from('sepay_bank_accounts')
    .select('user_id, wallet_id, since_id, sepay_integrations(webhook_apikey)')
    .eq('account_number', payload.accountNumber)
    .single() as { data: {
      user_id: string
      wallet_id: string
      since_id: number
      sepay_integrations: { webhook_apikey: string } | null
    } | null }

  if (!bankAcc?.wallet_id) {
    // Respond success anyway to prevent SePay retries for unconfigured accounts
    return NextResponse.json({ success: true })
  }

  // Verify webhook API key
  const expectedKey = bankAcc.sepay_integrations?.webhook_apikey
  if (expectedKey && incomingKey !== expectedKey) {
    return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 })
  }

  // Deduplication: check if already processed
  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', bankAcc.user_id)
    .ilike('note', `%SePay #${payload.id}%`)
    .single()

  if (existing) return NextResponse.json({ success: true })

  // Only process success transactions
  if (!payload.transferAmount || payload.transferAmount <= 0) {
    return NextResponse.json({ success: true })
  }

  const type = payload.transferType === 'in' ? 'income' : 'expense'
  const noteParts = [
    `SePay #${payload.id}`,
    payload.content,
    payload.referenceCode,
  ].filter(Boolean)
  const note = noteParts.join(' · ')

  // Create transaction (atomic with wallet balance update)
  await supabase.rpc('create_transaction', {
    p_user_id: bankAcc.user_id,
    p_wallet_id: bankAcc.wallet_id,
    p_to_wallet_id: null,
    p_amount: payload.transferAmount,
    p_type: type,
    p_category_id: null,
    p_note: note,
    p_date: new Date(payload.transactionDate).toISOString(),
  })

  // Sync wallet balance with accumulated value from SePay
  if (payload.accumulated > 0) {
    await supabase.from('wallets').update({ balance: payload.accumulated }).eq('id', bankAcc.wallet_id)
  }

  // Update since_id
  if (payload.id > (bankAcc.since_id ?? 0)) {
    await supabase.from('sepay_bank_accounts')
      .update({ since_id: payload.id, last_synced_at: new Date().toISOString() })
      .eq('account_number', payload.accountNumber)
      .eq('user_id', bankAcc.user_id)
  }

  return NextResponse.json({ success: true })
}
