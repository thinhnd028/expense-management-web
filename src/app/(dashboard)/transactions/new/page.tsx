'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TransactionForm from '@/components/transactions/TransactionForm'

export default function NewTransactionPage() {
  const [userId, setUserId] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || ''))
  }, [])

  return (
    <div className="max-w-md mx-auto">
      <TransactionForm
        userId={userId}
        onSuccess={() => router.push('/transactions')}
        onCancel={() => router.back()}
      />
    </div>
  )
}
