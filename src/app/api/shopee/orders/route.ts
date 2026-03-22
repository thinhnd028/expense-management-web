import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllOrdersForYear, buildYearlyStats, refreshAccessToken } from '@/lib/shopee'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const year = Number(req.nextUrl.searchParams.get('year')) || new Date().getFullYear()

  const { data: integration } = await supabase
    .from('shopee_integrations')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!integration || !integration.access_token) {
    return NextResponse.json({ error: 'not_connected' }, { status: 400 })
  }

  const partnerId = Number(integration.partner_id)
  const partnerKey = integration.partner_key
  const shopId = Number(integration.shop_id)
  const isSandbox = integration.is_sandbox

  // Refresh token if expired
  let accessToken = integration.access_token
  const expiresAt = integration.token_expires_at ? new Date(integration.token_expires_at) : new Date(0)
  if (expiresAt <= new Date()) {
    const refreshed = await refreshAccessToken(partnerId, partnerKey, integration.refresh_token ?? '', shopId, isSandbox)
    if (!refreshed.error) {
      accessToken = refreshed.access_token
      await supabase.from('shopee_integrations').update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token || integration.refresh_token,
        token_expires_at: new Date(Date.now() + (refreshed.expire_in || 3600) * 1000).toISOString(),
      }).eq('user_id', user.id)
    }
  }

  try {
    const orders = await getAllOrdersForYear(partnerId, partnerKey, accessToken, shopId, isSandbox, year)
    const stats = buildYearlyStats(orders)

    return NextResponse.json({
      year,
      shopName: integration.shop_name,
      shopLogo: integration.shop_logo,
      ...stats,
      orders: orders.slice(0, 50), // return latest 50 for preview
    })
  } catch {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 })
  }
}
