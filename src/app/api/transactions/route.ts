import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/transactions?month=2024-01&limit=50
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')
  const limit = searchParams.get('limit')

  let query = supabase
    .from('transactions')
    .select('*, wallets!wallet_id(id,name,type,color), to_wallet:wallets!to_wallet_id(id,name,type,color), categories(id,name,icon,color,type)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (month) {
    const [year, mon] = month.split('-').map(Number)
    const start = new Date(year, mon - 1, 1).toISOString()
    const end = new Date(year, mon, 1).toISOString()
    query = query.gte('date', start).lt('date', end)
  }

  if (limit) query = query.limit(parseInt(limit))

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// POST /api/transactions
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { wallet_id, to_wallet_id, amount, type, category_id, note, date } = body

  if (!wallet_id || !amount || !type) {
    return NextResponse.json({ error: 'Missing required fields: wallet_id, amount, type' }, { status: 400 })
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
  }
  if (!['income', 'expense', 'transfer'].includes(type)) {
    return NextResponse.json({ error: 'Type must be income, expense, or transfer' }, { status: 400 })
  }
  if (type === 'transfer' && !to_wallet_id) {
    return NextResponse.json({ error: 'to_wallet_id is required for transfers' }, { status: 400 })
  }
  if (type === 'transfer' && wallet_id === to_wallet_id) {
    return NextResponse.json({ error: 'Cannot transfer to the same wallet' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('create_transaction', {
    p_user_id: user.id,
    p_wallet_id: wallet_id,
    p_to_wallet_id: to_wallet_id ?? null,
    p_amount: amount,
    p_type: type,
    p_category_id: category_id ?? null,
    p_note: note?.trim() || null,
    p_date: date ? new Date(date).toISOString() : new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data }, { status: 201 })
}
