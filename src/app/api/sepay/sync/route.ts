import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSePayTransactions, getSePayAccountDetails } from '@/lib/sepay'

/** Sync transactions for a specific SePay bank account */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sepayAccountId } = await req.json()

  // Get integration token
  const { data: integration } = await supabase
    .from('sepay_integrations')
    .select('api_token')
    .eq('user_id', user.id)
    .single()

  if (!integration) return NextResponse.json({ error: 'SePay not connected' }, { status: 400 })

  // Get bank account record
  const query = supabase
    .from('sepay_bank_accounts')
    .select('*')
    .eq('user_id', user.id)

  if (sepayAccountId) query.eq('sepay_account_id', sepayAccountId)

  const { data: bankAccounts } = await query
  if (!bankAccounts?.length) return NextResponse.json({ error: 'No bank accounts found' }, { status: 400 })

  let totalImported = 0

  for (const bankAcc of bankAccounts) {
    // Refresh balance from SePay
    try {
      const details = await getSePayAccountDetails(integration.api_token, bankAcc.sepay_account_id)
      if (bankAcc.wallet_id) {
        await supabase.from('wallets').update({ balance: details.accumulated }).eq('id', bankAcc.wallet_id)
      }
    } catch { /* ignore balance refresh errors */ }

    // Fetch new transactions since last sync
    const transactions = await getSePayTransactions(
      integration.api_token,
      bankAcc.account_number,
      bankAcc.since_id ?? 0,
      undefined, undefined, 500
    )

    if (!transactions.length) continue

    let maxId = bankAcc.since_id ?? 0

    for (const tx of transactions) {
      if (tx.id <= (bankAcc.since_id ?? 0)) continue

      const amount = tx.amount_in > 0 ? tx.amount_in : tx.amount_out
      if (amount <= 0) continue

      if (!bankAcc.wallet_id) continue
      const type = tx.amount_in > 0 ? 'income' : 'expense'
      const note = [tx.transaction_content, tx.reference_number]
        .filter(Boolean).join(' · ') || `SePay #${tx.id}`

      await supabase.rpc('create_transaction', {
        p_user_id: user.id,
        p_wallet_id: bankAcc.wallet_id,
        p_to_wallet_id: null,
        p_amount: amount,
        p_type: type,
        p_category_id: null,
        p_note: note,
        p_date: new Date(tx.transaction_date).toISOString(),
      })

      if (tx.id > maxId) maxId = tx.id
      totalImported++
    }

    // Update since_id and last_synced_at
    if (maxId > (bankAcc.since_id ?? 0)) {
      await supabase.from('sepay_bank_accounts').update({
        since_id: maxId,
        last_synced_at: new Date().toISOString(),
      }).eq('id', bankAcc.id)
    }
  }

  return NextResponse.json({ success: true, imported: totalImported })
}
