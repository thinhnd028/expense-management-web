import crypto from 'crypto'

export const MOMO_PROD_URL = 'https://payment.momo.vn'
export const MOMO_TEST_URL = 'https://test-payment.momo.vn'
export const MOMO_COLOR = '#AE2070'

export function getMomoEndpoint(isTest: boolean) {
  return isTest ? MOMO_TEST_URL : MOMO_PROD_URL
}

/** Generate HMAC-SHA256 signature */
export function momoSign(rawSignature: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')
}

/** Verify MoMo credentials via transaction query (expects 1004 = orderId not found, not auth error) */
export async function verifyMomoCredentials(
  partnerCode: string,
  accessKey: string,
  secretKey: string,
  isTest: boolean
): Promise<{ valid: boolean; resultCode?: number; message?: string }> {
  const requestId = `verify_${Date.now()}`
  const orderId = `test_${Date.now()}`

  const rawSignature = [
    `accessKey=${accessKey}`,
    `orderId=${orderId}`,
    `partnerCode=${partnerCode}`,
    `requestId=${requestId}`,
  ].join('&')

  const signature = momoSign(rawSignature, secretKey)

  try {
    const res = await fetch(`${getMomoEndpoint(isTest)}/v2/gateway/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerCode, requestId, orderId, lang: 'vi', signature }),
    })
    const data = await res.json()
    // resultCode 1004 = order not found (credentials OK, just no such orderId)
    // resultCode 401x = auth error (wrong credentials)
    const valid = data.resultCode === 1004 || data.resultCode === 0
    return { valid, resultCode: data.resultCode, message: data.message }
  } catch {
    return { valid: false, message: 'Network error' }
  }
}

/** Query a specific MoMo transaction by orderId */
export async function queryMomoTransaction(
  partnerCode: string,
  accessKey: string,
  secretKey: string,
  orderId: string,
  isTest: boolean
) {
  const requestId = `${partnerCode}${Date.now()}`
  const rawSignature = [
    `accessKey=${accessKey}`,
    `orderId=${orderId}`,
    `partnerCode=${partnerCode}`,
    `requestId=${requestId}`,
  ].join('&')
  const signature = momoSign(rawSignature, secretKey)

  const res = await fetch(`${getMomoEndpoint(isTest)}/v2/gateway/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partnerCode, requestId, orderId, lang: 'vi', signature }),
  })
  return res.json()
}

/** Verify an IPN webhook signature from MoMo */
export function verifyMomoWebhook(payload: Record<string, string | number>, secretKey: string): boolean {
  const {
    partnerCode, orderId, requestId, amount, orderInfo,
    orderType, transId, resultCode, message, payType,
    responseTime, extraData, signature,
  } = payload as Record<string, string>

  const rawSignature = [
    `accessKey=`,  // MoMo IPN does not send accessKey in some versions
    `amount=${amount}`,
    `extraData=${extraData}`,
    `message=${message}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `orderType=${orderType}`,
    `partnerCode=${partnerCode}`,
    `payType=${payType}`,
    `requestId=${requestId}`,
    `responseTime=${responseTime}`,
    `resultCode=${resultCode}`,
    `transId=${transId}`,
  ].join('&')

  const expected = momoSign(rawSignature, secretKey)
  return expected === signature
}

export interface MomoIpnPayload {
  partnerCode: string
  orderId: string
  requestId: string
  amount: number
  orderInfo: string
  orderType: string
  transId: string
  resultCode: number
  message: string
  payType: string
  responseTime: number
  extraData: string
  signature: string
}
