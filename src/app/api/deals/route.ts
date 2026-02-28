// src/app/api/deals/route.ts
export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { createDeal, getAllDeals } from '@/lib/supabase'
import { calculateProfitability } from '@/lib/profitability'
import type { DealFormData } from '@/types/deal'

export async function GET() {
  try {
    const deals = await getAllDeals()
    return NextResponse.json(deals)
  } catch {
    return NextResponse.json({ error: 'Kon deals niet ophalen' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: DealFormData = await request.json()
    const profitability = calculateProfitability(body)
    const deal = await createDeal({
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
    return NextResponse.json({ deal, flags: profitability.flags }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Kon deal niet aanmaken' }, { status: 500 })
  }
}
