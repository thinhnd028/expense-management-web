export interface CurrencyConfig {
  code: string
  symbol: string
  locale: string
  name: string
  decimals: number
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'VND', symbol: 'đ',  locale: 'vi-VN', name: 'Việt Nam Đồng', decimals: 0 },
  { code: 'USD', symbol: '$',  locale: 'en-US', name: 'US Dollar',      decimals: 2 },
  { code: 'EUR', symbol: '€',  locale: 'de-DE', name: 'Euro',           decimals: 2 },
  { code: 'GBP', symbol: '£',  locale: 'en-GB', name: 'British Pound',  decimals: 2 },
  { code: 'JPY', symbol: '¥',  locale: 'ja-JP', name: 'Japanese Yen',   decimals: 0 },
  { code: 'SGD', symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar', decimals: 2 },
  { code: 'THB', symbol: '฿',  locale: 'th-TH', name: 'Thai Baht',      decimals: 2 },
  { code: 'IDR', symbol: 'Rp', locale: 'id-ID', name: 'Indonesian Rupiah', decimals: 0 },
]

export const DEFAULT_CURRENCY = 'VND'

export function getCurrencyConfig(code: string): CurrencyConfig {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0]
}

export function formatAmount(amount: number, currency: CurrencyConfig): string {
  const formatted = new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: currency.decimals,
  }).format(amount)

  // Prepend or append symbol based on convention
  if (['$', '£', '€', 'S$', 'Rp'].includes(currency.symbol)) {
    return `${currency.symbol}${formatted}`
  }
  return `${formatted}${currency.symbol}`
}
