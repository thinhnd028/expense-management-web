'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Debt, DebtTransaction, DebtWithTransactions } from '@/types/database'

export function useDebts() {
  const [debts, setDebts] = useState<DebtWithTransactions[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)

    const [{ data: debtData }, { data: txData }] = await Promise.all([
      supabase.from('debts').select('*').order('created_at', { ascending: false }),
      supabase.from('debt_transactions').select('*'),
    ])

    const enriched: DebtWithTransactions[] = (debtData || []).map((debt: Debt) => {
      const dts = (txData || []).filter((t: DebtTransaction) => t.debt_id === debt.id)
      const paid = dts.reduce((s, t) => s + t.amount, 0)
      return { ...debt, debt_transactions: dts, paid_amount: paid, remaining: debt.amount - paid }
    })

    setDebts(enriched)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const totalOwed = debts.filter(d => d.type === 'borrow' && d.status === 'unpaid').reduce((s, d) => s + (d.remaining || 0), 0)
  const totalLent = debts.filter(d => d.type === 'lend' && d.status === 'unpaid').reduce((s, d) => s + (d.remaining || 0), 0)

  return { debts, loading, refetch: fetch, totalOwed, totalLent }
}
