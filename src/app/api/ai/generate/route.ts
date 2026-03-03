import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateDealDocuments } from '@/lib/gemini'
import { calculateProfitability } from '@/lib/profitability'
import type { DealFormData } from '@/types/deal'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const { dealId } = await request.json()
    if (!dealId) return NextResponse.json({ error: 'dealId is verplicht' }, { status: 400 })

    const { data: deal, error } = await getServiceClient()
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single()

    if (error || !deal) return NextResponse.json({ error: 'Deal niet gevonden' }, { status: 404 })

    const formData: DealFormData = {
      client_name: deal.client_name, industry: deal.industry,
      contract_duration: deal.contract_duration, monthly_retainer: deal.monthly_retainer,
      setup_fee: deal.setup_fee, ad_spend: deal.ad_spend || 0, ad_spend_through_agency: deal.ad_spend_through_agency || false,
      team_roles: deal.team_roles, deliverables: deal.deliverables,
      kpi_promises: deal.kpi_promises, timeline_promises: deal.timeline_promises,
      verbal_promises: deal.verbal_promises, exclusions: deal.exclusions,
    }

    const { flags } = calculateProfitability(formData)
    const documents = await generateDealDocuments(deal, flags)

    const { data: updatedDeal, error: updateError } = await getServiceClient()
      .from('deals')
      .update({
        ai_risk_summary: documents.riskSummary,
        ai_scope_lock_doc: documents.scopeLockDoc,
        ai_handover_brief: documents.handoverBrief,
        ai_kickoff_plan: documents.kickoffPlan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dealId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ deal: updatedDeal, documents })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'AI generatie mislukt' }, { status: 500 })
  }
}
