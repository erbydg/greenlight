export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAgencyId } from '@/lib/supabase-server'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const agencyId = await getAgencyId()
  if (!agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await getServiceClient()
    .from('plan_interest')
    .select('plan')
    .eq('agency_id', agencyId)
  if (error) return NextResponse.json({ error: 'Kon interesse niet ophalen' }, { status: 500 })

  return NextResponse.json({ plans: (data ?? []).map(row => row.plan) })
}

export async function POST(request: Request) {
  try {
    const agencyId = await getAgencyId()
    if (!agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await request.json()
    if (typeof plan !== 'string' || !plan.trim()) {
      return NextResponse.json({ error: 'Ongeldig plan' }, { status: 400 })
    }

    const { error } = await getServiceClient()
      .from('plan_interest')
      .upsert({ agency_id: agencyId, plan: plan.trim() }, { onConflict: 'agency_id,plan', ignoreDuplicates: true })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Kon interesse niet opslaan' }, { status: 500 })
  }
}
