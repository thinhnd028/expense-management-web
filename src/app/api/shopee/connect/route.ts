import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUrl } from '@/lib/shopee'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { partnerId, partnerKey, isSandbox } = await req.json()
  if (!partnerId || !partnerKey) {
    return NextResponse.json({ error: 'Partner ID and Partner Key are required' }, { status: 400 })
  }

  // Save credentials first
  await supabase.from('shopee_integrations').upsert({
    user_id: user.id,
    partner_id: String(partnerId),
    partner_key: partnerKey,
    is_sandbox: isSandbox ?? false,
  }, { onConflict: 'user_id' })

  const redirectUri = `${req.nextUrl.origin}/api/shopee/callback`
  const authUrl = getAuthUrl(Number(partnerId), partnerKey, redirectUri, isSandbox ?? false)

  return NextResponse.json({ authUrl })
}
