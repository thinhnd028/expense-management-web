'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wallet } from '@/types/database'

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: true })
    setWallets(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

  return { wallets, loading, refetch: fetch, totalBalance }
}
