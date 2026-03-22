'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types/database'

export function useCategories(type?: 'income' | 'expense') {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('categories').select('*').order('name')
    if (type) query = query.eq('type', type)
    const { data } = await query
    setCategories(data || [])
    setLoading(false)
  }, [type])

  useEffect(() => { fetch() }, [fetch])

  return { categories, loading, refetch: fetch }
}
