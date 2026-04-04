import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/export?format=csv&from=2024-01-01&to=2024-12-31
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') ?? 'csv'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!['csv'].includes(format)) {
    return NextResponse.json({ error: 'Only csv format is supported' }, { status: 400 })
  }

  let query = supabase
    .from('transactions')
    .select('date, type, amount, note, wallets!wallet_id(name), to_wallet:wallets!to_wallet_id(name), categories(name)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (from) query = query.gte('date', new Date(from).toISOString())
  if (to) query = query.lte('date', new Date(to).toISOString())

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Build CSV
  const rows = [
    ['Date', 'Type', 'Amount', 'Wallet', 'To Wallet', 'Category', 'Note'],
    ...(data ?? []).map((tx: {
      date: string
      type: string
      amount: number
      note: string | null
      wallets: { name: string } | null
      to_wallet: { name: string } | null
      categories: { name: string } | null
    }) => [
      new Date(tx.date).toLocaleDateString('vi-VN'),
      tx.type,
      tx.amount,
      tx.wallets?.name ?? '',
      tx.to_wallet?.name ?? '',
      tx.categories?.name ?? '',
      tx.note ?? '',
    ]),
  ]

  const csv = rows
    .map(row =>
      row.map(cell => {
        const str = String(cell)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    )
    .join('\n')

  const filename = `transactions-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
