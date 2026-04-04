import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/debts?status=unpaid&type=borrow
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  let query = supabase
    .from('debts')
    .select('*, debt_transactions(id,amount,note,created_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (status && ['unpaid', 'paid'].includes(status)) query = query.eq('status', status as 'unpaid' | 'paid')
  if (type && ['borrow', 'lend'].includes(type)) query = query.eq('type', type as 'borrow' | 'lend')

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with paid_amount and remaining
  const enriched = (data ?? []).map(debt => {
    const payments = (debt.debt_transactions as unknown as Array<{ id: string; amount: number; note: string | null; created_at: string }> | null) ?? []
    const paid_amount = payments.reduce((sum, t) => sum + t.amount, 0)
    return { ...debt, paid_amount, remaining: debt.amount - paid_amount }
  })

  return NextResponse.json(enriched)
}

// POST /api/debts
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, amount, type, note, due_date } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
  }
  if (!['borrow', 'lend'].includes(type)) {
    return NextResponse.json({ error: 'Type must be borrow or lend' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('debts')
    .insert({
      user_id: user.id,
      name: name.trim(),
      amount,
      type,
      status: 'unpaid',
      note: note?.trim() || null,
      due_date: due_date || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
