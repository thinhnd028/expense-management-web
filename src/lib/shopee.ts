import crypto from 'crypto'

export const SHOPEE_BASE_URL = 'https://partner.shopeemobile.com'
export const SHOPEE_SANDBOX_URL = 'https://partner.test-stable.shopeemobile.com'

export function getBaseUrl(isSandbox: boolean) {
  return isSandbox ? SHOPEE_SANDBOX_URL : SHOPEE_BASE_URL
}

/** Generate HMAC-SHA256 signature for Shopee Open Platform v2 */
export function generateSignature(
  partnerId: number,
  apiPath: string,
  timestamp: number,
  partnerKey: string,
  accessToken = '',
  shopId = 0
): string {
  const base = accessToken && shopId
    ? `${partnerId}${apiPath}${timestamp}${accessToken}${shopId}`
    : `${partnerId}${apiPath}${timestamp}`
  return crypto.createHmac('sha256', partnerKey).update(base).digest('hex')
}

/** Build query string for Shopee API calls */
export function buildShopeeParams(
  partnerId: number,
  partnerKey: string,
  apiPath: string,
  extra: Record<string, string | number> = {},
  accessToken = '',
  shopId = 0
): URLSearchParams {
  const timestamp = Math.floor(Date.now() / 1000)
  const sign = generateSignature(partnerId, apiPath, timestamp, partnerKey, accessToken, shopId)
  const params = new URLSearchParams({
    partner_id: String(partnerId),
    timestamp: String(timestamp),
    sign,
    ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])),
  })
  if (accessToken) params.set('access_token', accessToken)
  if (shopId) params.set('shop_id', String(shopId))
  return params
}

/** Generate the Shopee OAuth authorization URL */
export function getAuthUrl(
  partnerId: number,
  partnerKey: string,
  redirectUri: string,
  isSandbox: boolean
): string {
  const path = '/api/v2/shop/auth_partner'
  const timestamp = Math.floor(Date.now() / 1000)
  const sign = generateSignature(partnerId, path, timestamp, partnerKey)
  const base = getBaseUrl(isSandbox)
  return `${base}${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}&redirect=${encodeURIComponent(redirectUri)}`
}

/** Exchange authorization code for access token */
export async function getAccessToken(
  partnerId: number,
  partnerKey: string,
  code: string,
  shopId: number,
  isSandbox: boolean
) {
  const path = '/api/v2/auth/token/get'
  const timestamp = Math.floor(Date.now() / 1000)
  const sign = generateSignature(partnerId, path, timestamp, partnerKey)
  const base = getBaseUrl(isSandbox)

  const res = await fetch(
    `${base}${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, shop_id: shopId, partner_id: partnerId }),
    }
  )
  return res.json()
}

/** Refresh access token */
export async function refreshAccessToken(
  partnerId: number,
  partnerKey: string,
  refreshToken: string,
  shopId: number,
  isSandbox: boolean
) {
  const path = '/api/v2/auth/access_token/get'
  const timestamp = Math.floor(Date.now() / 1000)
  const sign = generateSignature(partnerId, path, timestamp, partnerKey)
  const base = getBaseUrl(isSandbox)

  const res = await fetch(
    `${base}${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken, shop_id: shopId, partner_id: partnerId }),
    }
  )
  return res.json()
}

/** Get shop info */
export async function getShopInfo(
  partnerId: number,
  partnerKey: string,
  accessToken: string,
  shopId: number,
  isSandbox: boolean
) {
  const path = '/api/v2/shop/get_shop_info'
  const params = buildShopeeParams(partnerId, partnerKey, path, {}, accessToken, shopId)
  const base = getBaseUrl(isSandbox)
  const res = await fetch(`${base}${path}?${params}`)
  return res.json()
}

/** Fetch orders list with pagination */
export async function getOrderList(
  partnerId: number,
  partnerKey: string,
  accessToken: string,
  shopId: number,
  isSandbox: boolean,
  timeFrom: number,
  timeTo: number,
  cursor = '',
  pageSize = 100
) {
  const path = '/api/v2/order/get_order_list'
  const extra: Record<string, string | number> = {
    time_range_field: 'create_time',
    time_from: timeFrom,
    time_to: timeTo,
    page_size: pageSize,
    order_status: 'COMPLETED',
  }
  if (cursor) extra.cursor = cursor
  const params = buildShopeeParams(partnerId, partnerKey, path, extra, accessToken, shopId)
  const base = getBaseUrl(isSandbox)
  const res = await fetch(`${base}${path}?${params}`)
  return res.json()
}

/** Fetch order details (batch) */
export async function getOrderDetail(
  partnerId: number,
  partnerKey: string,
  accessToken: string,
  shopId: number,
  isSandbox: boolean,
  orderSnList: string[]
) {
  const path = '/api/v2/order/get_order_detail'
  const params = buildShopeeParams(
    partnerId, partnerKey, path,
    { order_sn_list: orderSnList.join(','), response_optional_fields: 'item_list,total_amount' },
    accessToken, shopId
  )
  const base = getBaseUrl(isSandbox)
  const res = await fetch(`${base}${path}?${params}`)
  return res.json()
}

/** Fetch ALL orders for a year (paginated) */
export async function getAllOrdersForYear(
  partnerId: number,
  partnerKey: string,
  accessToken: string,
  shopId: number,
  isSandbox: boolean,
  year: number
) {
  const timeFrom = Math.floor(new Date(year, 0, 1).getTime() / 1000)
  const timeTo = Math.floor(new Date(year, 11, 31, 23, 59, 59).getTime() / 1000)

  const allOrders: ShopeeOrder[] = []
  let cursor = ''
  let hasMore = true

  while (hasMore) {
    const data = await getOrderList(
      partnerId, partnerKey, accessToken, shopId, isSandbox,
      timeFrom, timeTo, cursor
    )

    if (data.error || !data.response) break

    const { order_list = [], next_cursor, more } = data.response
    allOrders.push(...order_list)
    cursor = next_cursor || ''
    hasMore = !!more
  }

  return allOrders
}

export interface ShopeeOrder {
  order_sn: string
  order_status: string
  total_amount?: number
  create_time: number
  update_time?: number
  currency?: string
}

/** Build yearly stats from order list */
export function buildYearlyStats(orders: ShopeeOrder[]) {
  const monthly: Record<number, { orders: number; revenue: number }> = {}
  for (let m = 0; m < 12; m++) monthly[m] = { orders: 0, revenue: 0 }

  let totalRevenue = 0
  let totalOrders = 0

  for (const order of orders) {
    const month = new Date(order.create_time * 1000).getMonth()
    const amount = order.total_amount || 0
    monthly[month].orders++
    monthly[month].revenue += amount
    totalRevenue += amount
    totalOrders++
  }

  return {
    totalOrders,
    totalRevenue,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    monthly: Object.entries(monthly).map(([m, v]) => ({
      month: new Date(2000, Number(m), 1).toLocaleString('en', { month: 'short' }),
      monthIndex: Number(m),
      orders: v.orders,
      revenue: v.revenue,
    })),
  }
}
