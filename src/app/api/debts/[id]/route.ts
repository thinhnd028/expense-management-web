import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PUT /api/debts/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { name, amount, type, status, note, due_date } = body

  const updates: Record<string, unknown> = {}
  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
    updates.name = name.trim()
  }
  if (amount !== undefined) {
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }
    updates.amount = amount
  }
  if (type !== undefined) {
    if (!['borrow', 'lend'].includes(type)) {
      return NextResponse.json({ error: 'Type must be borrow or lend' }, { status: 400 })
    }
    updates.type = type
  }
  if (status !== undefined) {
    if (!['unpaid', 'paid'].includes(status)) {
      return NextResponse.json({ error: 'Status must be unpaid or paid' }, { status: 400 })
    }
    updates.status = status
  }
  if (note !== undefined) updates.note = note?.trim() || null
  if (due_date !== undefined) updates.due_date = due_date || null

  const { data, error } = await supabase
    .from('debts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Debt not found' }, { status: 404 })

  return NextResponse.json(data)
}

// DELETE /api/debts/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
