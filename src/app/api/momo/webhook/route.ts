import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyMomoWebhook, MomoIpnPayload } from '@/lib/momo'

/**
 * MoMo IPN (Instant Payment Notification) webhook endpoint.
 * Configure this URL in MoMo Partner Portal as ipnUrl:
 * https://your-domain.com/api/momo/webhook
 *
 * MoMo sends this when a payment is completed.
 * We auto-create an income transaction on the MoMo wallet.
 */
export async function POST(req: NextRequest) {
  const payload = await req.json() as MomoIpnPayload

  // Only process successful payments
  if (payload.resultCode !== 0) {
    return NextResponse.json({ message: 'ignored non-success' })
  }

  const supabase = await createClient()

  // Find integration by partnerCode
  const { data: integration } = await supabase
    .from('momo_integrations')
    .select('user_id, wallet_id, secret_key')
    .eq('partner_code', payload.partnerCode)
    .single()

  if (!integration?.wallet_id) {
    return NextResponse.json({ message: 'integration not found' }, { status: 404 })
  }

  // Verify signature
  const isValid = verifyMomoWebhook(payload as unknown as Record<string, string | number>, integration.secret_key)
  if (!isValid) {
    return NextResponse.json({ message: 'invalid signature' }, { status: 401 })
  }

  // Check for duplicate (idempotency)
  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('note', `MoMo #${payload.transId}`)
    .eq('user_id', integration.user_id)
    .single()

  if (existing) {
    return NextResponse.json({ message: 'already processed' })
  }

  // Auto-create income transaction on MoMo wallet
  const amountInBaseCurrency = payload.amount / 100 // MoMo sends in VND paise? Actually MoMo sends VND directly
  const amount = payload.amount

  await supabase.rpc('create_transaction', {
    p_user_id: integration.user_id,
    p_wallet_id: integration.wallet_id,
    p_to_wallet_id: null,
    p_amount: amount,
    p_type: 'income',
    p_category_id: null,
    p_note: `MoMo #${payload.transId} — ${payload.orderInfo}`,
    p_date: new Date(payload.responseTime).toISOString(),
  })

  return NextResponse.json({ message: 'processed' })
}
