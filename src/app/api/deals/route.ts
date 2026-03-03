export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateProfitability } from '@/lib/profitability'
import { getAgencyId } from '@/lib/supabase-server'
import type { Deal, DealFormData } from '@/types/deal'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  try {
    const agencyId = await getAgencyId()
    if (!agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data, error } = await getServiceClient()
      .from('deals')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Kon deals niet ophalen' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const agencyId = await getAgencyId()
    if (!agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check trial limit
    const { data: agency } = await getServiceClient()
      .from('agencies')
      .select('plan')
      .eq('id', agencyId)
      .single()

    if (agency?.plan === 'trial') {
      const { count } = await getServiceClient()
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', agencyId)
      if ((count ?? 0) >= 1) {
        return NextResponse.json({ error: 'TRIAL_LIMIT', message: 'Trial limit reached' }, { status: 403 })
      }
    }
    const body: DealFormData = await request.json()
    const profitability = calculateProfitability(body)
    const { data: deal, error } = await getServiceClient()
      .from('deals')
      .insert({
        agency_id: agencyId,
      ad_spend: body.ad_spend || 0,
      ad_spend_through_agency: body.ad_spend_through_agency || false,
        client_name: body.client_name,
        industry: body.industry,
        contract_duration: body.contract_duration,
        monthly_retainer: body.monthly_retainer,
        setup_fee: body.setup_fee || 0,
        team_roles: body.team_roles,
        deliverables: body.deliverables,
        kpi_promises: body.kpi_promises,
        timeline_promises: body.timeline_promises,
        verbal_promises: body.verbal_promises,
        exclusions: body.exclusions,
        total_monthly_cost: profitability.total_monthly_cost,
        gross_margin: profitability.gross_margin,
        margin_percent: profitability.margin_percent,
        projected_contract_value: profitability.projected_contract_value,
        total_projected_profit: profitability.total_projected_profit,
        margin_score: profitability.margin_score,
        scope_risk_level: profitability.scope_risk_level,
        status: 'DRAFT',
      })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ deal, flags: profitability.flags }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Kon deal niet aanmaken' }, { status: 500 })
  }
}
