import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { queryMomoTransaction } from '@/lib/momo'

/** Query a specific MoMo transaction by orderId and optionally import it */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, importAsTransaction } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  const { data: integration } = await supabase
    .from('momo_integrations')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!integration) return NextResponse.json({ error: 'MoMo not connected' }, { status: 400 })

  const result = await queryMomoTransaction(
    integration.partner_code,
    integration.access_key,
    integration.secret_key,
    orderId,
    integration.is_test
  )

  if (result.resultCode !== 0) {
    return NextResponse.json({ error: result.message, resultCode: result.resultCode })
  }

  // Optionally import as expense transaction
  if (importAsTransaction && integration.wallet_id) {
    const amount = result.amount || 0
    if (amount > 0) {
      await supabase.rpc('create_transaction', {
        p_user_id: user.id,
        p_wallet_id: integration.wallet_id,
        p_to_wallet_id: null,
        p_amount: amount,
        p_type: 'expense',
        p_category_id: null,
        p_note: `MoMo #${result.transId} — ${result.orderInfo || orderId}`,
        p_date: new Date(result.responseTime || Date.now()).toISOString(),
      })
    }
  }

  return NextResponse.json({ success: true, data: result })
}
