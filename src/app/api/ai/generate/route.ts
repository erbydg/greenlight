// src/app/api/ai/generate/route.ts
// export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDealById, updateDeal } from '@/lib/supabase'
import { generateDealDocuments } from '@/lib/gemini'
import { calculateProfitability } from '@/lib/profitability'
import type { DealFormData } from '@/types/deal'

export async function POST(request: Request) {
  try {
    const { dealId } = await request.json()
    if (!dealId) return NextResponse.json({ error: 'dealId is verplicht' }, { status: 400 })

    const deal = await getDealById(dealId)
    if (!deal) return NextResponse.json({ error: 'Deal niet gevonden' }, { status: 404 })

    const formData: DealFormData = {
      client_name: deal.client_name, industry: deal.industry,
      contract_duration: deal.contract_duration, monthly_retainer: deal.monthly_retainer,
      setup_fee: deal.setup_fee, team_roles: deal.team_roles, deliverables: deal.deliverables,
      kpi_promises: deal.kpi_promises, timeline_promises: deal.timeline_promises,
      verbal_promises: deal.verbal_promises, exclusions: deal.exclusions,
    }

    const { flags } = calculateProfitability(formData)
    const documents = await generateDealDocuments(deal, flags)

    const updatedDeal = await updateDeal(dealId, {
      ai_risk_summary: documents.riskSummary,
      ai_scope_lock_doc: documents.scopeLockDoc,
      ai_handover_brief: documents.handoverBrief,
      ai_kickoff_plan: documents.kickoffPlan,
    })

    return NextResponse.json({ deal: updatedDeal, documents })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'AI generatie mislukt' }, { status: 500 })
  }
}
