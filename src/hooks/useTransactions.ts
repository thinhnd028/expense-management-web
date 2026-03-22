'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TransactionWithDetails } from '@/types/database'

interface UseTransactionsOptions {
  limit?: number
  month?: Date
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('transactions')
      .select(`
        *,
        wallets:wallet_id(id, name, type, color),
        to_wallet:to_wallet_id(id, name, type, color),
        categories:category_id(id, name, icon, color)
      `)
      .order('date', { ascending: false })

    if (options.month) {
      const start = new Date(options.month.getFullYear(), options.month.getMonth(), 1)
      const end = new Date(options.month.getFullYear(), options.month.getMonth() + 1, 0, 23, 59, 59)
      query = query.gte('date', start.toISOString()).lte('date', end.toISOString())
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data } = await query
    setTransactions((data as TransactionWithDetails[]) || [])
    setLoading(false)
  }, [options.limit, options.month?.toISOString()])

  useEffect(() => { fetch() }, [fetch])

  return { transactions, loading, refetch: fetch }
}

export function useMonthlyStats(month = new Date()) {
  const [stats, setStats] = useState({ income: 0, expense: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const start = new Date(month.getFullYear(), month.getMonth(), 1)
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59)

    const { data } = await supabase
      .from('transactions')
      .select('type, amount')
      .in('type', ['income', 'expense'])
      .gte('date', start.toISOString())
      .lte('date', end.toISOString())

    const income = data?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0
    const expense = data?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0

    setStats({ income, expense })
    setLoading(false)
  }, [month.getFullYear(), month.getMonth()])

  useEffect(() => { fetch() }, [fetch])

  return { stats, loading, refetch: fetch }
}
