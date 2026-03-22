export const SEPAY_BASE = 'https://my.sepay.vn/userapi'

/** Bank brand → color mapping */
const BANK_COLORS: Record<string, string> = {
  vietcombank: '#007B5E',
  vcb: '#007B5E',
  mbbank: '#7B2D8B',
  mb: '#7B2D8B',
  techcombank: '#E31837',
  tcb: '#E31837',
  vietinbank: '#003087',
  ctg: '#003087',
  bidv: '#005BAC',
  vpbank: '#00843D',
  acb: '#009FDA',
  sacombank: '#005BAC',
  stb: '#005BAC',
  tpbank: '#F58634',
  hdbank: '#0066CC',
  msb: '#E00000',
  ocb: '#FF6B00',
  shb: '#C8102E',
  seabank: '#0090D4',
  vib: '#009CDE',
  abbank: '#E30613',
  namabank: '#006DAE',
  agribank: '#C8102E',
  agr: '#C8102E',
}

export function getBankColor(bankShortName: string): string {
  const key = bankShortName.toLowerCase().replace(/\s/g, '')
  return BANK_COLORS[key] ?? '#6366f1'
}

export interface SepayBankAccount {
  id: number
  account_holder_name: string
  account_number: string
  accumulated: number
  last_transaction: string | null
  label: string | null
  active: 0 | 1
  bank_short_name: string
  bank_full_name: string
  bank_bin: string
  bank_code: string
}

export interface SepayTransaction {
  id: number
  transaction_date: string
  account_number: string
  sub_account: string | null
  amount_in: number
  amount_out: number
  accumulated: number
  code: string | null
  transaction_content: string | null
  reference_number: string | null
  bank_brand_name: string
  bank_account_id: number
}

export interface SepayWebhookPayload {
  id: number
  gateway: string
  transactionDate: string
  accountNumber: string
  code: string | null
  content: string
  transferType: 'in' | 'out'
  referenceCode: string | null
  transferAmount: number
  accumulated: number
  subAccount: string | null
  description: string
}

function sepayHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

/** Get all bank accounts */
export async function getSePayAccounts(token: string): Promise<SepayBankAccount[]> {
  const res = await fetch(`${SEPAY_BASE}/bankaccounts/list`, {
    headers: sepayHeaders(token),
  })
  const data = await res.json()
  if (data.status !== 200) throw new Error(data.error || 'Failed to fetch accounts')
  return data.bankaccounts ?? []
}

/** Get single bank account details */
export async function getSePayAccountDetails(token: string, accountId: number): Promise<SepayBankAccount> {
  const res = await fetch(`${SEPAY_BASE}/bankaccounts/details/${accountId}`, {
    headers: sepayHeaders(token),
  })
  const data = await res.json()
  if (data.status !== 200) throw new Error(data.error || 'Account not found')
  return data.bankaccount
}

/** Get transactions for an account since a given transaction ID */
export async function getSePayTransactions(
  token: string,
  accountNumber: string,
  sinceId = 0,
  dateMin?: string,
  dateMax?: string,
  limit = 100
): Promise<SepayTransaction[]> {
  const params = new URLSearchParams({
    account_number: accountNumber,
    limit: String(limit),
  })
  if (sinceId > 0) params.set('since_id', String(sinceId))
  if (dateMin) params.set('transaction_date_min', dateMin)
  if (dateMax) params.set('transaction_date_max', dateMax)

  const res = await fetch(`${SEPAY_BASE}/transactions/list?${params}`, {
    headers: sepayHeaders(token),
  })
  const data = await res.json()
  if (data.status !== 200) throw new Error(data.error || 'Failed to fetch transactions')
  return data.transactions ?? []
}

/** Verify token by attempting to list accounts */
export async function verifySepayToken(token: string): Promise<{ valid: boolean; accountCount?: number; error?: string }> {
  try {
    const accounts = await getSePayAccounts(token)
    return { valid: true, accountCount: accounts.length }
  } catch (e) {
    return { valid: false, error: String(e) }
  }
}
