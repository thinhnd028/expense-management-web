import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAccessToken, getShopInfo } from '@/lib/shopee'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const shopId = searchParams.get('shop_id')

  if (!code || !shopId) {
    return NextResponse.redirect(new URL('/shopee?error=missing_params', req.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', req.url))

  // Get stored credentials
  const { data: integration } = await supabase
    .from('shopee_integrations')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!integration) {
    return NextResponse.redirect(new URL('/settings?error=no_credentials', req.url))
  }

  const partnerId = Number(integration.partner_id)
  const partnerKey = integration.partner_key
  const isSandbox = integration.is_sandbox

  // Exchange code for token
  const tokenData = await getAccessToken(partnerId, partnerKey, code, Number(shopId), isSandbox)

  if (tokenData.error) {
    return NextResponse.redirect(new URL(`/shopee?error=${tokenData.error}`, req.url))
  }

  const { access_token, refresh_token, expire_in } = tokenData
  const expiresAt = new Date(Date.now() + (expire_in || 3600) * 1000).toISOString()

  // Get shop info
  const shopInfo = await getShopInfo(partnerId, partnerKey, access_token, Number(shopId), isSandbox)
  const shopName = shopInfo?.response?.shop_name || 'My Shop'
  const shopLogo = shopInfo?.response?.shop_logo || null

  // Update integration record
  await supabase.from('shopee_integrations').update({
    shop_id: Number(shopId),
    shop_name: shopName,
    shop_logo: shopLogo,
    access_token,
    refresh_token,
    token_expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  }).eq('user_id', user.id)

  return NextResponse.redirect(new URL('/shopee', req.url))
}
