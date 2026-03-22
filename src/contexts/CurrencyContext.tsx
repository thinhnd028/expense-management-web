'use client'

import { createContext, useContext } from 'react'
import { CurrencyConfig, getCurrencyConfig, formatAmount as _formatAmount, DEFAULT_CURRENCY } from '@/lib/currency'

interface CurrencyContextValue {
  currency: CurrencyConfig
  formatAmount: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: getCurrencyConfig(DEFAULT_CURRENCY),
  formatAmount: (n) => _formatAmount(n, getCurrencyConfig(DEFAULT_CURRENCY)),
})

export function CurrencyProvider({
  currencyCode,
  children,
}: {
  currencyCode: string
  children: React.ReactNode
}) {
  const currency = getCurrencyConfig(currencyCode)
  const formatAmount = (amount: number) => _formatAmount(amount, currency)

  return (
    <CurrencyContext.Provider value={{ currency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
