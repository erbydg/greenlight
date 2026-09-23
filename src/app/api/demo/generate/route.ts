export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateProfitability } from '@/lib/profitability'
import { generateDealDocuments } from '@/lib/gemini'
import { parseLocale } from '@/lib/i18n/translations'
import type { DealFormData, Deal } from '@/types/deal'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const DAILY_LIMIT = 5

async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip))
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('cf-connecting-ip')
      || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || 'unknown'
    const ipHash = await hashIp(ip)

    const client = getServiceClient()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await client
      .from('demo_generation_log')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since)

    if ((count ?? 0) >= DAILY_LIMIT) {
      return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 })
    }

    const body = await request.json()
    const formData = body.form as DealFormData
    const locale = parseLocale(body.locale)

    if (!formData?.client_name || !formData?.monthly_retainer) {
      return NextResponse.json({ error: 'Ongeldige data' }, { status: 400 })
    }

    const profitability = calculateProfitability(formData)

    const dealLike: Deal = {
      id: 'demo', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), agency_id: 'demo',
      status: 'DRAFT',
      client_name: formData.client_name, industry: formData.industry,
      contract_duration: formData.contract_duration, monthly_retainer: formData.monthly_retainer, setup_fee: formData.setup_fee || 0,
      ad_spend: formData.ad_spend || 0, ad_spend_through_agency: formData.ad_spend_through_agency || false,
      team_roles: formData.team_roles, deliverables: formData.deliverables,
      kpi_promises: formData.kpi_promises, timeline_promises: formData.timeline_promises,
      verbal_promises: formData.verbal_promises, exclusions: formData.exclusions,
      total_monthly_cost: profitability.total_monthly_cost, gross_margin: profitability.gross_margin,
      margin_percent: profitability.margin_percent, projected_contract_value: profitability.projected_contract_value,
      total_projected_profit: profitability.total_projected_profit, margin_score: profitability.margin_score,
      scope_risk_level: profitability.scope_risk_level,
      ai_risk_summary: null, ai_scope_lock_doc: null, ai_handover_brief: null, ai_kickoff_plan: null,
      scope_share_token: null, handover_share_token: null,
    }

    const documents = await generateDealDocuments(dealLike, profitability.flags, locale, 'Greenlight')

    await client.from('demo_generation_log').insert({ ip_hash: ipHash })

    return NextResponse.json({ documents, profitability })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Kon documenten niet genereren' }, { status: 500 })
  }
}
