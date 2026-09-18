export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendResultEmail } from '@/lib/email'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 })
    }

    const num = (v: unknown) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }

    const locale = typeof body.locale === 'string' ? body.locale : null
    const totalMonthlyCost = num(body.total_monthly_cost)
    const grossMargin = num(body.gross_margin)
    const marginPercent = num(body.margin_percent)
    const marginScore = num(body.margin_score)
    const totalProfit = num(body.total_profit)

    const { error } = await getServiceClient().from('free_check_leads').insert({
      email,
      monthly_retainer: num(body.monthly_retainer),
      contract_duration: num(body.contract_duration),
      setup_fee: num(body.setup_fee),
      hours: num(body.hours),
      hourly_rate: num(body.hourly_rate),
      ad_spend: num(body.ad_spend),
      ad_through_agency: !!body.ad_through_agency,
      total_monthly_cost: totalMonthlyCost,
      gross_margin: grossMargin,
      margin_percent: marginPercent,
      margin_score: marginScore,
      total_profit: totalProfit,
      locale,
    })
    if (error) throw error

    await sendResultEmail({
      to: email,
      locale,
      appUrl: new URL(request.url).origin,
      totalMonthlyCost, grossMargin, marginPercent, marginScore, totalProfit,
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Kon niet opslaan' }, { status: 500 })
  }
}
